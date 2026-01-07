import {
  RateLimiterRedis,
  RateLimiterMemory,
  RateLimiterRes,
} from "rate-limiter-flexible";
import { createClient, RedisClientType } from "redis";
import { logger } from "../utils/logger";

/**
 * Rate Limiting Service using rate-limiter-flexible
 *
 * Strategy:
 * - Strict limits on write endpoints (login, voting, submissions)
 * - Generous limits on read endpoints (MPs, bills, committees)
 * - Redis-backed for distributed rate limiting
 * - Memory fallback if Redis unavailable
 */

interface RateLimitConfig {
  points: number; // Maximum requests
  duration: number; // Per X seconds
  blockDuration?: number; // Block for X seconds after limit exceeded
}

// Rate limit configurations by endpoint type
export const RATE_LIMITS = {
  // Strict limits for write operations
  AUTH_LOGIN: { points: 5, duration: 60, blockDuration: 300 }, // 5 attempts/min, block 5 min
  AUTH_REGISTER: { points: 3, duration: 60, blockDuration: 600 }, // 3 attempts/min, block 10 min
  QUIZ_SUBMIT: { points: 10, duration: 60 }, // 10 submissions/min
  FOLLOW_ACTION: { points: 20, duration: 60 }, // 20 follow/unfollow per min

  // Generous limits for read operations
  API_READ: { points: 100, duration: 60 }, // 100 reads/min
  API_SEARCH: { points: 30, duration: 60 }, // 30 searches/min
  API_EXPENSIVE: { points: 20, duration: 60 }, // 20 expensive queries/min

  // Global fallback
  GLOBAL: { points: 200, duration: 60 }, // 200 req/min total
} as const;

class RateLimitService {
  private redisClient: RedisClientType | null = null;
  private limiters: Map<string, RateLimiterRedis | RateLimiterMemory> =
    new Map();
  private isRedisAvailable = false;

  async initialize(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    try {
      this.redisClient = createClient({ url: redisUrl });
      await this.redisClient.connect();
      this.isRedisAvailable = true;
      logger.info("Rate limiter: Redis backend initialized");
    } catch (err) {
      logger.warn(
        { err },
        "Rate limiter: Redis unavailable, using memory backend"
      );
      this.isRedisAvailable = false;
    }

    // Pre-create limiters for each config
    for (const [name, config] of Object.entries(RATE_LIMITS)) {
      this.limiters.set(name, this.createLimiter(name, config));
    }

    logger.info(
      { limiters: Object.keys(RATE_LIMITS) },
      "Rate limiters configured"
    );
  }

  private createLimiter(
    keyPrefix: string,
    config: RateLimitConfig
  ): RateLimiterRedis | RateLimiterMemory {
    const baseConfig = {
      keyPrefix,
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration || 0,
    };

    if (this.isRedisAvailable && this.redisClient) {
      return new RateLimiterRedis({
        storeClient: this.redisClient,
        ...baseConfig,
      });
    }

    return new RateLimiterMemory(baseConfig);
  }

  /**
   * Check and consume rate limit
   * @returns true if allowed, false if rate limited
   */
  async consume(
    limitType: keyof typeof RATE_LIMITS,
    key: string
  ): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
    const limiter = this.limiters.get(limitType);

    if (!limiter) {
      logger.warn({ limitType }, "Unknown rate limit type");
      return { allowed: true, remaining: 999 };
    }

    try {
      const result = await limiter.consume(key);
      return {
        allowed: true,
        remaining: result.remainingPoints,
      };
    } catch (err) {
      if (err instanceof RateLimiterRes) {
        logger.warn(
          {
            limitType,
            key: key.substring(0, 20) + "...",
            retryAfter: Math.ceil(err.msBeforeNext / 1000),
          },
          "Rate limit exceeded"
        );
        return {
          allowed: false,
          remaining: 0,
          retryAfter: Math.ceil(err.msBeforeNext / 1000),
        };
      }
      // Unknown error - allow request but log
      logger.error({ err, limitType }, "Rate limit check error");
      return { allowed: true, remaining: 999 };
    }
  }

  /**
   * Express middleware factory
   */
  middleware(limitType: keyof typeof RATE_LIMITS) {
    return async (req: any, res: any, next: any) => {
      // Use IP + user ID if available for more accurate limiting
      const key = req.user?.id
        ? `user:${req.user.id}`
        : `ip:${req.ip || req.headers["x-forwarded-for"] || "unknown"}`;

      const result = await this.consume(limitType, key);

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", RATE_LIMITS[limitType].points);
      res.setHeader("X-RateLimit-Remaining", result.remaining);

      if (!result.allowed) {
        res.setHeader("Retry-After", result.retryAfter || 60);
        return res.status(429).json({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: result.retryAfter,
        });
      }

      next();
    };
  }

  /**
   * Reset rate limit for a key (e.g., after successful login)
   */
  async reset(limitType: keyof typeof RATE_LIMITS, key: string): Promise<void> {
    const limiter = this.limiters.get(limitType);
    if (limiter) {
      await limiter.delete(key);
      logger.debug({ limitType, key }, "Rate limit reset");
    }
  }

  async shutdown(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
      logger.info("Rate limiter shutdown");
    }
  }
}

// Singleton
export const rateLimiter = new RateLimitService();
export { RateLimitService };
