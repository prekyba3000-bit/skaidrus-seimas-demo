import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit Tests for Cache Service
 *
 * Tests Redis caching with stale-while-revalidate pattern
 */

// Mock redis before importing cache service
vi.mock("redis", () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    get: vi.fn(),
    setEx: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    ping: vi.fn().mockResolvedValue("PONG"),
    quit: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { CacheService, CacheOptions } from "../../services/cache";

describe("CacheService", () => {
  let cache: CacheService;
  let mockRedisClient: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    cache = new CacheService();

    // Get the mock client after connect
    await cache.connect();
  });

  describe("get() with stale-while-revalidate", () => {
    it("returns fresh data from cache (HIT)", async () => {
      const cachedValue = {
        data: { id: 1, name: "Test" },
        cachedAt: Date.now() - 1000, // 1 second ago
        ttl: 300, // 5 min TTL
      };

      // Mock cache hit
      const redis = require("redis");
      const client = redis.createClient();
      client.get.mockResolvedValue(JSON.stringify(cachedValue));

      const fetchFn = vi.fn().mockResolvedValue({ id: 2, name: "Fresh" });

      const result = await cache.get("test-key", fetchFn, { ttl: 300 });

      // Should return cached data, not fetch fresh
      expect(result).toEqual(cachedValue.data);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it("returns stale data and refreshes in background (STALE)", async () => {
      const staleValue = {
        data: { id: 1, name: "Stale" },
        cachedAt: Date.now() - 310000, // 310 seconds ago (past 300s TTL)
        ttl: 300,
      };

      const redis = require("redis");
      const client = redis.createClient();
      client.get.mockResolvedValue(JSON.stringify(staleValue));

      const fetchFn = vi.fn().mockResolvedValue({ id: 2, name: "Fresh" });

      const result = await cache.get("test-key", fetchFn, {
        ttl: 300,
        staleTolerance: 60, // Within stale tolerance
      });

      // Should return stale data immediately
      expect(result).toEqual(staleValue.data);

      // Background refresh should be triggered (async)
      // Give it time to execute
      await new Promise(r => setTimeout(r, 10));
      expect(fetchFn).toHaveBeenCalled();
    });

    it("fetches fresh data on cache miss (MISS)", async () => {
      const redis = require("redis");
      const client = redis.createClient();
      client.get.mockResolvedValue(null); // Cache miss

      const freshData = { id: 1, name: "Fresh" };
      const fetchFn = vi.fn().mockResolvedValue(freshData);

      const result = await cache.get("test-key", fetchFn, { ttl: 300 });

      expect(result).toEqual(freshData);
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it("handles cache read errors gracefully", async () => {
      const redis = require("redis");
      const client = redis.createClient();
      client.get.mockRejectedValue(new Error("Redis connection lost"));

      const freshData = { id: 1, name: "Fresh" };
      const fetchFn = vi.fn().mockResolvedValue(freshData);

      const result = await cache.get("test-key", fetchFn, { ttl: 300 });

      // Should fall back to fetching fresh data
      expect(result).toEqual(freshData);
      expect(fetchFn).toHaveBeenCalled();
    });
  });

  describe("set()", () => {
    it("stores value with correct TTL", async () => {
      const redis = require("redis");
      const client = redis.createClient();

      await cache.set("test-key", { id: 1 }, 300);

      expect(client.setEx).toHaveBeenCalledWith(
        "test-key",
        420, // TTL + 120s buffer
        expect.any(String)
      );
    });

    it("serializes data correctly", async () => {
      const redis = require("redis");
      const client = redis.createClient();

      const data = { id: 1, nested: { value: "test" } };
      await cache.set("test-key", data, 300);

      const setExCall = client.setEx.mock.calls[0];
      const storedValue = JSON.parse(setExCall[2]);

      expect(storedValue.data).toEqual(data);
      expect(storedValue.cachedAt).toBeDefined();
      expect(storedValue.ttl).toBe(300);
    });
  });

  describe("invalidate()", () => {
    it("deletes single key", async () => {
      const redis = require("redis");
      const client = redis.createClient();

      await cache.invalidate("user:123");

      expect(client.del).toHaveBeenCalledWith("user:123");
    });

    it("deletes multiple keys by pattern", async () => {
      const redis = require("redis");
      const client = redis.createClient();
      client.keys.mockResolvedValue(["mps:1", "mps:2", "mps:3"]);

      await cache.invalidate("mps:*");

      expect(client.keys).toHaveBeenCalledWith("mps:*");
      expect(client.del).toHaveBeenCalledWith(["mps:1", "mps:2", "mps:3"]);
    });
  });

  describe("ping()", () => {
    it("returns true when Redis is healthy", async () => {
      const result = await cache.ping();
      expect(result).toBe(true);
    });

    it("returns false when Redis is down", async () => {
      const redis = require("redis");
      const client = redis.createClient();
      client.ping.mockRejectedValue(new Error("Connection refused"));

      const result = await cache.ping();
      expect(result).toBe(false);
    });
  });

  describe("Key generators", () => {
    it("generates consistent MP list keys", () => {
      expect(CacheService.keys.mpList(true)).toBe("mps:list:true");
      expect(CacheService.keys.mpList(false)).toBe("mps:list:false");
    });

    it("generates consistent MP comparison keys (sorted)", () => {
      // Should always use lower ID first for consistency
      expect(CacheService.keys.mpComparison(5, 3)).toBe("mps:compare:3:5");
      expect(CacheService.keys.mpComparison(3, 5)).toBe("mps:compare:3:5");
    });

    it("generates consistent bill list keys", () => {
      expect(CacheService.keys.billsList(1)).toBe("bills:list:1:all");
      expect(CacheService.keys.billsList(2, "pending")).toBe(
        "bills:list:2:pending"
      );
    });
  });
});
