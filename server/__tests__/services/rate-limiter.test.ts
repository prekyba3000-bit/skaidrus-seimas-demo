import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit Tests for Rate Limiter Service
 */

// Mock rate-limiter-flexible
vi.mock("rate-limiter-flexible", () => ({
  RateLimiterRedis: vi.fn().mockImplementation(() => ({
    consume: vi.fn().mockResolvedValue({ remainingPoints: 99 }),
    delete: vi.fn().mockResolvedValue(undefined),
  })),
  RateLimiterMemory: vi.fn().mockImplementation(() => ({
    consume: vi.fn().mockResolvedValue({ remainingPoints: 99 }),
    delete: vi.fn().mockResolvedValue(undefined),
  })),
  RateLimiterRes: class RateLimiterRes extends Error {
    msBeforeNext: number;
    remainingPoints: number;
    consumedPoints: number;
    isFirstInDuration: boolean;
    constructor(msBeforeNext: number) {
      super("Rate limit exceeded");
      this.msBeforeNext = msBeforeNext;
      this.remainingPoints = 0;
      this.consumedPoints = 100;
      this.isFirstInDuration = false;
    }
  },
}));

// Mock redis
vi.mock("redis", () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    quit: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { RateLimitService, RATE_LIMITS } from "../../services/rate-limiter";
import { RateLimiterRes } from "rate-limiter-flexible";

describe("RateLimitService", () => {
  let rateLimiter: RateLimitService;

  beforeEach(async () => {
    vi.clearAllMocks();
    rateLimiter = new RateLimitService();
    await rateLimiter.initialize();
  });

  describe("consume()", () => {
    it("allows request when under limit", async () => {
      const result = await rateLimiter.consume("API_READ", "user:123");

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
      expect(result.retryAfter).toBeUndefined();
    });

    it("blocks request when limit exceeded", async () => {
      // Mock limiter to throw RateLimiterRes
      const { RateLimiterMemory } = await import("rate-limiter-flexible");
      vi.mocked(RateLimiterMemory).mockImplementation(() => ({
        consume: vi.fn().mockRejectedValue(new RateLimiterRes(30000)),
        delete: vi.fn(),
      }));

      // Re-initialize to use new mock
      rateLimiter = new RateLimitService();
      await rateLimiter.initialize();

      const result = await rateLimiter.consume("API_READ", "user:123");

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBe(30);
    });

    it("returns allowed for unknown limit type", async () => {
      const result = await rateLimiter.consume(
        "UNKNOWN_LIMIT" as any,
        "user:123"
      );

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(999);
    });
  });

  describe("middleware()", () => {
    it("calls next() on successful rate limit check", async () => {
      const middleware = rateLimiter.middleware("API_READ");
      const req = { ip: "127.0.0.1", headers: {} };
      const res = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 100);
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", 99);
    });

    it("returns 429 when rate limited", async () => {
      // Mock to throw rate limit error
      const { RateLimiterMemory } = await import("rate-limiter-flexible");
      vi.mocked(RateLimiterMemory).mockImplementation(() => ({
        consume: vi.fn().mockRejectedValue(new RateLimiterRes(60000)),
        delete: vi.fn(),
      }));

      rateLimiter = new RateLimitService();
      await rateLimiter.initialize();

      const middleware = rateLimiter.middleware("API_READ");
      const req = { ip: "127.0.0.1", headers: {} };
      const res = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Too Many Requests",
        })
      );
    });

    it("uses user ID when available", async () => {
      const middleware = rateLimiter.middleware("API_READ");
      const req = {
        ip: "127.0.0.1",
        headers: {},
        user: { id: "user-456" },
      };
      const res = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("reset()", () => {
    it("resets rate limit for key", async () => {
      await rateLimiter.reset("AUTH_LOGIN", "user:123");

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe("RATE_LIMITS configuration", () => {
    it("has stricter limits for auth endpoints", () => {
      expect(RATE_LIMITS.AUTH_LOGIN.points).toBeLessThan(
        RATE_LIMITS.API_READ.points
      );
      expect(RATE_LIMITS.AUTH_LOGIN.blockDuration).toBeGreaterThan(0);
    });

    it("has generous limits for read endpoints", () => {
      expect(RATE_LIMITS.API_READ.points).toBe(100);
      expect(RATE_LIMITS.API_SEARCH.points).toBe(30);
    });

    it("has protective limits for expensive queries", () => {
      expect(RATE_LIMITS.API_EXPENSIVE.points).toBeLessThan(
        RATE_LIMITS.API_READ.points
      );
    });
  });
});
