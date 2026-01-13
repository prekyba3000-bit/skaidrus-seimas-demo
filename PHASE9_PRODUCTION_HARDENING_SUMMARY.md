# Phase 9: Production Hardening - Implementation Summary

## Overview

This document summarizes the production hardening work completed in Phase 9. The Express server now has standard production defenses including security headers, rate limiting, health checks, and graceful shutdown.

## Changes Made

### 1. Security Headers (Helmet + CORS)

**Packages Installed:**

- `helmet@8.1.0` - Security headers middleware
- `cors@2.8.5` - CORS configuration

**Implementation:**

- **Helmet Configuration:**
  - Content Security Policy (CSP) with strict directives
  - HTTP Strict Transport Security (HSTS) enabled (1 year, includeSubDomains, preload)
  - Hide `X-Powered-By` header
  - XSS Protection enabled
  - No Sniff (prevent MIME type sniffing)
  - Frame Guard (deny iframe embedding)

- **CORS Configuration:**
  - Allows requests only from `CLIENT_URL` environment variable (comma-separated)
  - Development fallback: `http://localhost:5173`, `http://localhost:3000`
  - Credentials enabled for authenticated requests
  - Exposes `x-request-id` header for error correlation

**Code:**

```typescript
// Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind requires inline
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    hidePoweredBy: true,
    xssFilter: true,
    noSniff: true,
    frameguard: { action: "deny" },
  })
);

// CORS
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map(url => url.trim())
  : process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
    exposedHeaders: ["x-request-id"],
  })
);
```

### 2. Rate Limiting

**Package Installed:**

- `express-rate-limit@8.2.1` - Express rate limiting middleware

**Implementation:**

- **Global Rate Limiter:**
  - Default: 100 requests per minute per IP
  - Configurable via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` env vars
  - Excludes health check endpoints (`/health`, `/health/ready`)
  - Returns standard `RateLimit-*` headers

- **Strict Rate Limiter:**
  - Default: 5 requests per minute per IP
  - Applied to sensitive endpoints:
    - `/api/trpc/auth.login`
    - `/api/trpc/user.updateSettings`
  - Configurable via `STRICT_RATE_LIMIT_MAX` and `STRICT_RATE_LIMIT_WINDOW_MS` env vars

**Code:**

```typescript
// Global Rate Limiting
const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX || "100"), // 100 requests
  message: {
    error: "Too Many Requests",
    message: "Rate limit exceeded. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    // Skip health checks
    return req.path === "/health" || req.path === "/health/ready";
  },
});

app.use(globalRateLimiter);

// Strict Rate Limiting for sensitive endpoints
const strictRateLimiter = rateLimit({
  windowMs: parseInt(process.env.STRICT_RATE_LIMIT_WINDOW_MS || "60000"),
  max: parseInt(process.env.STRICT_RATE_LIMIT_MAX || "5"), // 5 requests
  message: {
    error: "Too Many Requests",
    message: "Rate limit exceeded for this endpoint. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/trpc/auth.login", strictRateLimiter);
app.use("/api/trpc/user.updateSettings", strictRateLimiter);
```

### 3. Health Check Endpoints

**Implementation:**

- **Light Health Check (`GET /health`):**
  - Returns 200 OK with timestamp
  - No dependencies checked
  - Used for basic liveness probes

- **Deep Health Check (`GET /health/ready`):**
  - Checks database connectivity (runs `SELECT 1`)
  - Checks Redis connectivity (pings Redis)
  - Returns 200 if all healthy, 503 if any unhealthy
  - Includes latency metrics for each check
  - Used for readiness probes (K8s, Docker Compose)

**Code:**

```typescript
// Light health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Deep health check (readiness probe)
app.get("/health/ready", async (_req, res) => {
  const checks: Record<
    string,
    { status: string; latencyMs?: number; error?: string }
  > = {};

  // Check database
  try {
    const { healthCheck } = await import("../services/database");
    const dbHealth = await healthCheck();
    checks.database = {
      status: dbHealth.status,
      latencyMs: dbHealth.latencyMs,
    };
  } catch (err: any) {
    checks.database = {
      status: "unhealthy",
      error: err.message,
    };
  }

  // Check Redis
  try {
    const start = performance.now();
    const redisHealthy = await cache.ping();
    const latencyMs = Math.round(performance.now() - start);
    checks.redis = {
      status: redisHealthy ? "healthy" : "unhealthy",
      latencyMs,
    };
  } catch (err: any) {
    checks.redis = {
      status: "unhealthy",
      error: err.message,
    };
  }

  const allHealthy = Object.values(checks).every(
    check => check.status === "healthy"
  );

  const statusCode = allHealthy ? 200 : 503;
  res.status(statusCode).json({
    status: allHealthy ? "ready" : "not ready",
    checks,
    timestamp: new Date().toISOString(),
  });
});
```

### 4. Graceful Shutdown

**Implementation:**

- Listens for `SIGTERM` and `SIGINT` signals
- Shutdown sequence:
  1. Stop accepting new HTTP connections
  2. Close database connection pool
  3. Disconnect Redis cache
  4. Close Redis BullMQ connection
  5. Exit process with code 0

- **Timeout:** 10 seconds forced shutdown if graceful shutdown doesn't complete
- **Error Handling:** Logs errors but continues shutdown sequence
- **Uncaught Exception Handling:** Triggers graceful shutdown on uncaught exceptions

**Code:**

```typescript
let httpServer: Server | null = null;
let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress");
    return;
  }

  isShuttingDown = true;
  logger.info(
    { signal },
    "Received shutdown signal, starting graceful shutdown"
  );

  // 1. Stop accepting new connections
  if (httpServer) {
    httpServer.close(() => {
      logger.info("HTTP server closed");
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  }

  // 2. Close database connection pool
  try {
    const sqlClient = getSqlClient();
    await sqlClient.end({ timeout: 5 });
    logger.info("Database connection pool closed");
  } catch (err) {
    logger.error({ err }, "Error closing database connection");
  }

  // 3. Disconnect Redis (cache service)
  try {
    await cache.disconnect();
    logger.info("Redis cache disconnected");
  } catch (err) {
    logger.error({ err }, "Error disconnecting Redis cache");
  }

  // 4. Disconnect Redis (BullMQ)
  try {
    await closeRedisConnection();
    logger.info("Redis BullMQ connection closed");
  } catch (err) {
    logger.error({ err }, "Error closing Redis BullMQ connection");
  }

  logger.info("Graceful shutdown complete");
  process.exit(0);
}

// Signal handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", err => {
  logger.error({ err }, "Uncaught exception");
  gracefulShutdown("uncaughtException");
});
```

## Files Modified

### Backend:

1. ✅ `server/_core/index.ts` - Added Helmet, CORS, rate limiting, health checks, graceful shutdown

## Environment Variables

Add these to your `.env` file:

```bash
# CORS Configuration
CLIENT_URL=http://localhost:5173,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_MAX=100              # Global limit: requests per window
RATE_LIMIT_WINDOW_MS=60000      # Global limit: window in milliseconds (1 minute)
STRICT_RATE_LIMIT_MAX=5         # Strict limit: requests per window
STRICT_RATE_LIMIT_WINDOW_MS=60000  # Strict limit: window in milliseconds (1 minute)
```

## Health Check Endpoints

### Light Health Check

**Endpoint:** `GET /health`
**Purpose:** Liveness probe
**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-11T21:00:00.000Z"
}
```

### Deep Health Check

**Endpoint:** `GET /health/ready`
**Purpose:** Readiness probe
**Response (Healthy):**

```json
{
  "status": "ready",
  "checks": {
    "database": {
      "status": "healthy",
      "latencyMs": 2
    },
    "redis": {
      "status": "healthy",
      "latencyMs": 1
    }
  },
  "timestamp": "2026-01-11T21:00:00.000Z"
}
```

**Response (Unhealthy):**

```json
{
  "status": "not ready",
  "checks": {
    "database": {
      "status": "unhealthy",
      "error": "Connection timeout"
    },
    "redis": {
      "status": "healthy",
      "latencyMs": 1
    }
  },
  "timestamp": "2026-01-11T21:00:00.000Z"
}
```

**Status Code:** 503 if any check fails

## Security Headers Applied

The following security headers are now set by Helmet:

- **Content-Security-Policy:** Restricts resource loading
- **Strict-Transport-Security:** Forces HTTPS (1 year, includeSubDomains, preload)
- **X-Content-Type-Options:** Prevents MIME type sniffing
- **X-Frame-Options:** Prevents iframe embedding
- **X-XSS-Protection:** Enables browser XSS filter
- **X-Powered-By:** Removed (hides Express version)

## Rate Limiting Behavior

### Global Limit (All Routes)

- **Default:** 100 requests per minute per IP
- **Excluded:** `/health`, `/health/ready`
- **Headers:** `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`
- **Response:** 429 Too Many Requests with JSON error message

### Strict Limit (Sensitive Endpoints)

- **Default:** 5 requests per minute per IP
- **Applied to:**
  - `/api/trpc/auth.login`
  - `/api/trpc/user.updateSettings`
- **Response:** 429 Too Many Requests with JSON error message

## Graceful Shutdown Sequence

When the server receives `SIGTERM` or `SIGINT`:

1. **Stop Accepting Connections** (immediate)
   - HTTP server stops accepting new requests
   - Existing requests are allowed to complete

2. **Close Database Pool** (5 second timeout)
   - All active connections are closed
   - Pending queries are allowed to complete

3. **Disconnect Redis Cache** (no timeout)
   - Cache service connection closed gracefully

4. **Close Redis BullMQ** (no timeout)
   - BullMQ Redis connection closed gracefully

5. **Exit Process** (code 0)
   - Clean exit if all steps complete
   - Forced exit (code 1) after 10 seconds if shutdown hangs

## Testing Recommendations

1. **Security Headers:**

   ```bash
   curl -I http://localhost:3000/health
   # Verify: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security
   ```

2. **CORS:**

   ```bash
   curl -H "Origin: http://localhost:5173" -v http://localhost:3000/health
   # Should include: Access-Control-Allow-Origin
   ```

3. **Rate Limiting:**

   ```bash
   # Make 101 requests quickly
   for i in {1..101}; do curl http://localhost:3000/api/trpc/mps.list; done
   # 101st request should return 429
   ```

4. **Health Checks:**

   ```bash
   # Light check
   curl http://localhost:3000/health

   # Deep check
   curl http://localhost:3000/health/ready
   ```

5. **Graceful Shutdown:**
   ```bash
   # Start server, then send SIGTERM
   kill -TERM <pid>
   # Verify logs show graceful shutdown sequence
   ```

## Docker/Kubernetes Integration

### Docker Compose Health Checks

```yaml
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health/ready"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s
```

### Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
```

## Next Steps

1. **Monitoring:**
   - Set up alerts for 429 responses (rate limit hits)
   - Monitor health check failures
   - Track graceful shutdown events

2. **Tuning:**
   - Adjust rate limits based on actual traffic patterns
   - Fine-tune CSP directives if needed
   - Configure CORS origins for production

3. **Additional Security:**
   - Consider adding request size limits
   - Implement IP whitelisting for admin endpoints
   - Add request timeout middleware

---

**Status:** ✅ Phase 9 Complete
**Date:** 2026-01-11
**Next Phase:** Phase 10 - Launch Preparation
