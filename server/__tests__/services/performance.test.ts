import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { perfMonitor, METRICS } from "../../services/performance";

describe("PerformanceMonitor", () => {
  beforeEach(() => {
    perfMonitor.reset();
  });

  describe("record()", () => {
    it("records metric samples", () => {
      perfMonitor.record("test.metric", 100);
      perfMonitor.record("test.metric", 150);
      perfMonitor.record("test.metric", 200);

      const stats = perfMonitor.getStats("test.metric");

      expect(stats).toBeDefined();
      expect(stats?.count).toBe(3);
    });
  });

  describe("getStats()", () => {
    it("calculates correct statistics", () => {
      // Record known values
      perfMonitor.record("test.metric", 100);
      perfMonitor.record("test.metric", 200);
      perfMonitor.record("test.metric", 300);
      perfMonitor.record("test.metric", 400);
      perfMonitor.record("test.metric", 500);

      const stats = perfMonitor.getStats("test.metric");

      expect(stats?.count).toBe(5);
      expect(stats?.sum).toBe(1500);
      expect(stats?.min).toBe(100);
      expect(stats?.max).toBe(500);
      expect(stats?.avg).toBe(300);
    });

    it("calculates percentiles correctly", () => {
      // Record 100 values from 1 to 100
      for (let i = 1; i <= 100; i++) {
        perfMonitor.record("percentile.test", i);
      }

      const stats = perfMonitor.getStats("percentile.test");

      expect(stats?.p50).toBeCloseTo(50, 0);
      expect(stats?.p95).toBeCloseTo(95, 0);
      expect(stats?.p99).toBeCloseTo(99, 0);
    });

    it("returns null for unknown metric", () => {
      const stats = perfMonitor.getStats("unknown.metric");
      expect(stats).toBeNull();
    });

    it("returns null for metric with no samples", () => {
      perfMonitor.record("empty.metric", 100);
      perfMonitor.reset(); // Clear all samples

      const stats = perfMonitor.getStats("empty.metric");
      expect(stats).toBeNull();
    });
  });

  describe("getSummary()", () => {
    it("returns summary of all metrics", () => {
      perfMonitor.record("metric.a", 100);
      perfMonitor.record("metric.b", 200);
      perfMonitor.record("metric.c", 300);

      const summary = perfMonitor.getSummary();

      expect(Object.keys(summary)).toHaveLength(3);
      expect(summary["metric.a"]).toBeDefined();
      expect(summary["metric.b"]).toBeDefined();
      expect(summary["metric.c"]).toBeDefined();
    });
  });

  describe("timer()", () => {
    it("records elapsed time", async () => {
      const end = perfMonitor.timer("timer.test");

      // Simulate work
      await new Promise(r => setTimeout(r, 50));

      end();

      const stats = perfMonitor.getStats("timer.test");

      expect(stats?.count).toBe(1);
      expect(stats?.avg).toBeGreaterThanOrEqual(40); // Allow some variance
    });
  });

  describe("measure()", () => {
    it("measures async function execution", async () => {
      const result = await perfMonitor.measure("async.test", async () => {
        await new Promise(r => setTimeout(r, 20));
        return "completed";
      });

      expect(result).toBe("completed");

      const stats = perfMonitor.getStats("async.test");
      expect(stats?.count).toBe(1);
      expect(stats?.avg).toBeGreaterThanOrEqual(15);
    });

    it("records time even when function throws", async () => {
      try {
        await perfMonitor.measure("error.test", async () => {
          await new Promise(r => setTimeout(r, 10));
          throw new Error("Test error");
        });
      } catch (e) {
        // Expected
      }

      const stats = perfMonitor.getStats("error.test");
      expect(stats?.count).toBe(1);
    });
  });

  describe("reset()", () => {
    it("clears all metrics", () => {
      perfMonitor.record("reset.test", 100);
      expect(perfMonitor.getStats("reset.test")).toBeDefined();

      perfMonitor.reset();

      expect(perfMonitor.getStats("reset.test")).toBeNull();
    });
  });

  describe("METRICS constants", () => {
    it("defines consistent metric names", () => {
      expect(METRICS.DB_QUERY_MPS_LIST).toBe("db.query.mps.list");
      expect(METRICS.DB_QUERY_MP_COMPARISON).toBe("db.query.mp.comparison");
      expect(METRICS.CACHE_HIT).toBe("cache.hit");
      expect(METRICS.CACHE_MISS).toBe("cache.miss");
      expect(METRICS.API_TRPC).toBe("api.trpc");
    });
  });
});
