/**
 * Performance Monitoring and Metrics
 *
 * Lightweight performance tracking for:
 * - Query execution times
 * - Cache hit/miss rates
 * - Request latency percentiles
 */

import { logger } from "../utils/logger";

interface MetricSample {
  value: number;
  timestamp: number;
}

interface MetricStats {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

class PerformanceMonitor {
  private metrics: Map<string, MetricSample[]> = new Map();
  private readonly maxSamples = 1000;
  private readonly sampleWindow = 5 * 60 * 1000; // 5 minutes

  /**
   * Record a metric sample
   */
  record(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const samples = this.metrics.get(name)!;
    samples.push({ value, timestamp: Date.now() });

    // Trim old samples
    this.trimSamples(samples);
  }

  /**
   * Get statistics for a metric
   */
  getStats(name: string): MetricStats | null {
    const samples = this.metrics.get(name);
    if (!samples || samples.length === 0) return null;

    // Filter to recent samples
    const now = Date.now();
    const recentSamples = samples.filter(
      s => now - s.timestamp < this.sampleWindow
    );

    if (recentSamples.length === 0) return null;

    const values = recentSamples.map(s => s.value).sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count,
      sum,
      min: values[0],
      max: values[count - 1],
      avg: sum / count,
      p50: this.percentile(values, 50),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
    };
  }

  /**
   * Get all metrics summary
   */
  getSummary(): Record<string, MetricStats> {
    const summary: Record<string, MetricStats> = {};

    for (const name of this.metrics.keys()) {
      const stats = this.getStats(name);
      if (stats) {
        summary[name] = stats;
      }
    }

    return summary;
  }

  /**
   * Log performance report
   */
  logReport(): void {
    const summary = this.getSummary();

    for (const [name, stats] of Object.entries(summary)) {
      logger.info(
        {
          metric: name,
          count: stats.count,
          avg: `${stats.avg.toFixed(2)}ms`,
          p50: `${stats.p50.toFixed(2)}ms`,
          p95: `${stats.p95.toFixed(2)}ms`,
          p99: `${stats.p99.toFixed(2)}ms`,
          min: `${stats.min.toFixed(2)}ms`,
          max: `${stats.max.toFixed(2)}ms`,
        },
        "Performance metric"
      );
    }
  }

  /**
   * Timer helper for measuring operations
   */
  timer(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.record(name, duration);
    };
  }

  /**
   * Async timer wrapper
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const end = this.timer(name);
    try {
      return await fn();
    } finally {
      end();
    }
  }

  private trimSamples(samples: MetricSample[]): void {
    // Remove samples older than window
    const cutoff = Date.now() - this.sampleWindow;
    while (samples.length > 0 && samples[0].timestamp < cutoff) {
      samples.shift();
    }

    // Keep only maxSamples
    while (samples.length > this.maxSamples) {
      samples.shift();
    }
  }

  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil((p / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Clear all metrics
   */
  reset(): void {
    this.metrics.clear();
  }
}

// Singleton instance
export const perfMonitor = new PerformanceMonitor();

// Pre-defined metric names for consistency
export const METRICS = {
  // Database
  DB_QUERY_MPS_LIST: "db.query.mps.list",
  DB_QUERY_MP_BY_ID: "db.query.mp.byId",
  DB_QUERY_MP_STATS: "db.query.mp.stats",
  DB_QUERY_MP_COMPARISON: "db.query.mp.comparison",
  DB_QUERY_BILLS_LIST: "db.query.bills.list",
  DB_QUERY_VOTES: "db.query.votes",

  // Cache
  CACHE_GET: "cache.get",
  CACHE_SET: "cache.set",
  CACHE_HIT: "cache.hit",
  CACHE_MISS: "cache.miss",

  // API
  API_REQUEST: "api.request",
  API_TRPC: "api.trpc",

  // External
  SEIMAS_API_CALL: "external.seimas.api",
} as const;
