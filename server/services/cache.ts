import { createClient, RedisClientType } from "redis";
import { logger } from "../utils/logger";

/**
 * Redis Caching Service with Stale-While-Revalidate Pattern
 *
 * Strategy:
 * - Cache expensive SQL queries (MP voting history, stats aggregations)
 * - Serve stale data immediately while refreshing in background
 * - Graceful degradation if Redis is unavailable
 */

interface CacheOptions {
  /** Time-to-live in seconds */
  ttl: number;
  /** Stale tolerance - serve stale data for this many seconds while revalidating */
  staleTolerance?: number;
}

interface CachedValue<T> {
  data: T;
  cachedAt: number;
  ttl: number;
}

class CacheService {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  /** Default TTLs for different data types (seconds) */
  static readonly TTL = {
    MP_LIST: 300, // 5 minutes - changes rarely
    MP_PROFILE: 600, // 10 minutes
    MP_STATS: 300, // 5 minutes - calculated values
    MP_VOTING_HISTORY: 900, // 15 minutes - expensive query
    MP_COMPARISON: 600, // 10 minutes - computed
    BILLS_LIST: 180, // 3 minutes - may have new bills
    BILL_DETAIL: 600, // 10 minutes
    DASHBOARD_PULSE: 60, // 1 minute - real-time feel
    COMMITTEES: 3600, // 1 hour - changes very rarely
  } as const;

  async connect(): Promise<void> {
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = (async () => {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

      try {
        this.client = createClient({ url: redisUrl });

        this.client.on("error", err => {
          logger.error({ err }, "Redis connection error");
          this.isConnected = false;
        });

        this.client.on("connect", () => {
          logger.info("Redis connected");
          this.isConnected = true;
        });

        this.client.on("reconnecting", () => {
          logger.warn("Redis reconnecting...");
        });

        await this.client.connect();
        this.isConnected = true;
        logger.info(
          { url: redisUrl.replace(/\/\/.*@/, "//*****@") },
          "Redis cache initialized"
        );
      } catch (err) {
        logger.error({ err }, "Failed to connect to Redis - caching disabled");
        this.client = null;
        this.isConnected = false;
      }
    })();

    return this.connectionPromise;
  }

  /**
   * Get cached value with stale-while-revalidate
   * Returns stale data immediately while triggering background refresh
   */
  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    const { ttl, staleTolerance = 60 } = options;

    // Try to get from cache
    if (this.client && this.isConnected) {
      try {
        const cached = await this.client.get(key);

        if (cached) {
          const parsed: CachedValue<T> = JSON.parse(cached);
          const age = (Date.now() - parsed.cachedAt) / 1000;

          // Fresh data - return immediately
          if (age < parsed.ttl) {
            logger.debug(
              { key, age: `${age.toFixed(1)}s`, status: "HIT" },
              "Cache hit"
            );
            return parsed.data;
          }

          // Stale but within tolerance - return stale, refresh in background
          if (age < parsed.ttl + staleTolerance) {
            logger.debug(
              { key, age: `${age.toFixed(1)}s`, status: "STALE" },
              "Serving stale, revalidating"
            );

            // Background refresh (don't await)
            this.refreshInBackground(key, fetchFn, ttl);

            return parsed.data;
          }
        }
      } catch (err) {
        logger.warn({ err, key }, "Cache read error");
      }
    }

    // Cache miss or expired - fetch fresh data
    logger.debug({ key, status: "MISS" }, "Cache miss");
    const data = await fetchFn();

    // Store in cache (fire and forget)
    this.set(key, data, ttl).catch(err => {
      logger.warn({ err, key }, "Cache write error");
    });

    return data;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, data: T, ttl: number): Promise<void> {
    if (!this.client || !this.isConnected) return;

    const value: CachedValue<T> = {
      data,
      cachedAt: Date.now(),
      ttl,
    };

    try {
      // Set with expiry slightly longer than TTL + staleTolerance
      await this.client.setEx(key, ttl + 120, JSON.stringify(value));
    } catch (err) {
      logger.warn({ err, key }, "Cache set error");
    }
  }

  /**
   * Invalidate cache key or pattern
   */
  async invalidate(pattern: string): Promise<void> {
    if (!this.client || !this.isConnected) return;

    try {
      if (pattern.includes("*")) {
        // Pattern-based invalidation
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
          logger.info({ pattern, count: keys.length }, "Cache invalidated");
        }
      } else {
        await this.client.del(pattern);
        logger.debug({ key: pattern }, "Cache key deleted");
      }
    } catch (err) {
      logger.warn({ err, pattern }, "Cache invalidation error");
    }
  }

  /**
   * Background refresh for stale-while-revalidate
   */
  private async refreshInBackground<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    try {
      const data = await fetchFn();
      await this.set(key, data, ttl);
      logger.debug({ key }, "Background refresh complete");
    } catch (err) {
      logger.error({ err, key }, "Background refresh failed");
    }
  }

  /**
   * Health check for Redis connection
   */
  async ping(): Promise<boolean> {
    if (!this.client || !this.isConnected) return false;

    try {
      const result = await this.client.ping();
      return result === "PONG";
    } catch {
      return false;
    }
  }

  /**
   * Graceful shutdown
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      logger.info("Redis disconnected");
    }
  }

  /**
   * Cache key generators for consistent naming
   */
  static keys = {
    mpList: (isActive: boolean) => `mps:list:${isActive}`,
    mpById: (id: number) => `mps:${id}`,
    mpStats: (id: number) => `mps:${id}:stats`,
    mpVotingHistory: (id: number) => `mps:${id}:votes`,
    mpComparison: (id1: number, id2: number) =>
      `mps:compare:${Math.min(id1, id2)}:${Math.max(id1, id2)}`,
    billsList: (page: number, status?: string) =>
      `bills:list:${page}:${status || "all"}`,
    billById: (id: number) => `bills:${id}`,
    dashboardPulse: () => "dashboard:pulse",
    committees: () => "committees:list",
  };
}

// Singleton instance
export const cache = new CacheService();
export { CacheService, CacheOptions };
