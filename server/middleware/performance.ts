import compression from "compression";
import { Express, Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Performance Optimization Middleware
 *
 * Implements:
 * - Response compression (gzip/brotli)
 * - ETags for caching
 * - Response time headers
 * - Keep-alive connections
 */

/**
 * Compression middleware with optimal settings
 */
export function compressionMiddleware() {
  return compression({
    // Compression level (0-9, 6 is good balance of speed/ratio)
    level: 6,

    // Minimum size to compress (skip small responses)
    threshold: 1024, // 1KB

    // Filter function - compress JSON and text
    filter: (req: Request, res: Response) => {
      const contentType = res.getHeader("Content-Type");
      if (typeof contentType === "string") {
        // Compress JSON, text, HTML, CSS, JS
        if (/json|text|javascript|css|html|xml/.test(contentType)) {
          return true;
        }
      }
      // Use default compression filter for other types
      return compression.filter(req, res);
    },
  });
}

/**
 * Response time tracking middleware
 */
export function responseTimeMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime.bigint();

    res.on("finish", () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;

      // Add header for debugging
      res.setHeader("X-Response-Time", `${durationMs.toFixed(2)}ms`);

      // Log slow requests (>500ms)
      if (durationMs > 500) {
        logger.warn(
          {
            path: req.path,
            method: req.method,
            duration: `${durationMs.toFixed(2)}ms`,
            statusCode: res.statusCode,
          },
          "Slow request detected"
        );
      }
    });

    next();
  };
}

/**
 * ETag caching middleware
 */
export function etagMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Enable weak ETags for dynamic content
    res.set("ETag", "weak");
    next();
  };
}

/**
 * Security and performance headers
 */
export function performanceHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Keep-alive for connection reuse
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Keep-Alive", "timeout=65, max=1000");

    // Cache control for static assets
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }

    // Cache control for API responses
    if (req.path.startsWith("/api/") || req.path.startsWith("/trpc/")) {
      // Short cache for API, rely on CDN/Redis
      res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");
    }

    next();
  };
}

/**
 * Apply all performance middleware to Express app
 */
export function applyPerformanceMiddleware(app: Express): void {
  // Compression (should be early in middleware chain)
  app.use(compressionMiddleware());

  // Response time tracking
  app.use(responseTimeMiddleware());

  // Performance headers
  app.use(performanceHeaders());

  logger.info("Performance middleware applied");
}
