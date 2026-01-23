# Phase 2: Final Pre-Production SRE Review

**Author:** Lead DevOps & Site Reliability Engineer  
**Date:** January 17, 2026  
**Review Type:** Production Readiness Assessment  
**Target Scale:** 100,000 concurrent users  
**Status:** Final Pre-Production Gate

---

## Executive Summary

This document provides a comprehensive Site Reliability Engineering review of the Phase 2: Real-time Activity Feed architecture, focusing on **production resilience**, **cost optimization**, and **operational excellence**. The review identifies **critical production risks** and provides **actionable remediation** for each.

**Overall Assessment:** ⚠️ **CONDITIONALLY APPROVED** - Requires 4 critical fixes before production

**Production Risk Level:** 🟡 **MEDIUM** - After fixes, risk reduces to 🟢 **LOW**

**Go/No-Go Recommendation:** 🟡 **GO WITH FIXES** - Deploy after implementing critical remediations

---

## 1. Failure Mode Analysis: XCLAIM & DLQ Logic

### 1.1 Current Implementation Critique

**Current Logic:**
```typescript
private readonly MAX_DELIVERY_ATTEMPTS = 3;
private readonly PEL_IDLE_TIME = 60000; // 60 seconds

if (deliveryCount >= this.MAX_DELIVERY_ATTEMPTS) {
  // Move to DLQ immediately
}
```

**Critical Issues:**

1. **❌ Fixed 3-attempt threshold is too aggressive**
   - Transient network flaps (common on mobile) cause legitimate messages to hit DLQ
   - No distinction between transient vs. permanent failures
   - No exponential backoff → retries happen too quickly

2. **❌ 60-second PEL_IDLE_TIME is too short**
   - Mobile users frequently disconnect/reconnect (WiFi → cellular)
   - 60s window causes unnecessary XCLAIM operations
   - Increases Redis load and message duplication risk

3. **❌ No retry strategy differentiation**
   - Network errors (retryable) vs. validation errors (not retryable) treated the same
   - Client crashes vs. server errors handled identically

---

### 1.2 Enhanced Implementation with Exponential Backoff

**File:** `server/services/redis-streams-enhanced.ts` (revised)

```typescript
import { createClient, RedisClientType } from "redis";
import { logger } from "../utils/logger";

interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

interface FailureType {
  type: "transient" | "permanent" | "client_crash";
  retryable: boolean;
}

class EnhancedRedisStreamsService {
  private client: RedisClientType;
  
  // Different retry configs for different failure types
  private readonly RETRY_CONFIGS: Record<string, RetryConfig> = {
    transient: {
      maxAttempts: 5, // More attempts for transient failures
      baseDelayMs: 1000, // 1 second
      maxDelayMs: 30000, // 30 seconds max
      backoffMultiplier: 2, // Exponential: 1s, 2s, 4s, 8s, 16s
    },
    permanent: {
      maxAttempts: 2, // Fewer attempts for permanent failures
      baseDelayMs: 5000, // 5 seconds
      maxDelayMs: 10000,
      backoffMultiplier: 1.5,
    },
    client_crash: {
      maxAttempts: 10, // Many attempts for crashes (user will reconnect)
      baseDelayMs: 2000, // 2 seconds
      maxDelayMs: 60000, // 1 minute max
      backoffMultiplier: 1.5,
    },
  };

  // Increased PEL idle time for mobile users
  private readonly PEL_IDLE_TIME = 300000; // 5 minutes (was 60s)

  /**
   * Classify failure type to determine retry strategy
   */
  private classifyFailure(error: Error, context: any): FailureType {
    // Network errors (retryable)
    if (
      error.message.includes("ECONNRESET") ||
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ENOTFOUND") ||
      error.message.includes("network")
    ) {
      return { type: "transient", retryable: true };
    }

    // Client disconnect (user will reconnect)
    if (
      error.message.includes("client disconnected") ||
      error.message.includes("connection closed") ||
      context?.clientDisconnected
    ) {
      return { type: "client_crash", retryable: true };
    }

    // Validation errors (not retryable)
    if (
      error.message.includes("invalid") ||
      error.message.includes("validation") ||
      error.message.includes("malformed")
    ) {
      return { type: "permanent", retryable: false };
    }

    // Default: treat as transient
    return { type: "transient", retryable: true };
  }

  /**
   * Calculate next retry delay using exponential backoff
   */
  private calculateRetryDelay(
    attemptNumber: number,
    config: RetryConfig
  ): number {
    const delay = Math.min(
      config.baseDelayMs * Math.pow(config.backoffMultiplier, attemptNumber - 1),
      config.maxDelayMs
    );

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.3 * delay; // ±30% jitter
    return Math.floor(delay + jitter);
  }

  /**
   * Enhanced message handling with exponential backoff
   */
  async handleFailedMessage(
    streamName: string,
    consumerGroup: string,
    messageId: string,
    error: Error,
    context?: any
  ): Promise<{ shouldRetry: boolean; nextRetryAt?: number }> {
    const failureType = this.classifyFailure(error, context);
    const config = this.RETRY_CONFIGS[failureType.type];

    // Get current delivery count
    const deliveryCount = await this.getDeliveryCount(
      streamName,
      consumerGroup,
      messageId
    );

    // Check if retryable
    if (!failureType.retryable) {
      // Move to DLQ immediately for permanent failures
      await this.moveToDLQ(streamName, consumerGroup, messageId, error, deliveryCount);
      return { shouldRetry: false };
    }

    // Check if max attempts exceeded
    if (deliveryCount >= config.maxAttempts) {
      logger.warn(
        {
          streamName,
          consumerGroup,
          messageId,
          deliveryCount,
          failureType: failureType.type,
        },
        "Message exceeded max delivery attempts, moving to DLQ"
      );

      await this.moveToDLQ(streamName, consumerGroup, messageId, error, deliveryCount);
      return { shouldRetry: false };
    }

    // Calculate next retry delay
    const nextRetryDelay = this.calculateRetryDelay(deliveryCount + 1, config);
    const nextRetryAt = Date.now() + nextRetryDelay;

    // Store retry metadata in message fields (for visibility)
    await this.client.xadd(
      streamName,
      messageId, // Use same ID to update
      "retry_count", (deliveryCount + 1).toString(),
      "next_retry_at", nextRetryAt.toString(),
      "failure_type", failureType.type,
    );

    logger.info(
      {
        streamName,
        consumerGroup,
        messageId,
        deliveryCount: deliveryCount + 1,
        nextRetryAt: new Date(nextRetryAt).toISOString(),
        failureType: failureType.type,
      },
      "Message will be retried with exponential backoff"
    );

    return { shouldRetry: true, nextRetryAt };
  }

  /**
   * Read pending messages with retry delay awareness
   */
  private async readPendingMessages(
    streamName: string,
    consumerGroup: string,
    consumerName: string,
    count: number
  ): Promise<StreamMessage[]> {
    try {
      // Get pending messages
      const pending = await this.client.xpending(
        streamName,
        consumerGroup,
        "-",
        "+",
        count * 2, // Get 2x to filter by retry time
        consumerName
      );

      if (pending.length === 0) {
        return [];
      }

      // Filter messages that are ready for retry
      const now = Date.now();
      const readyForRetry = pending.filter((p: any) => {
        // Check if message has retry metadata
        const retryMetadata = this.getRetryMetadata(p.id);
        if (!retryMetadata) {
          // No retry metadata - use PEL idle time
          return (now - p.time) >= this.PEL_IDLE_TIME;
        }

        // Check if retry time has passed
        return now >= retryMetadata.nextRetryAt;
      });

      if (readyForRetry.length === 0) {
        return [];
      }

      // Claim ready messages
      const messageIds = readyForRetry.map((p: any) => p.id);
      const claimed = await this.client.xclaim(
        streamName,
        consumerGroup,
        consumerName,
        this.PEL_IDLE_TIME,
        ...messageIds
      );

      // Convert to StreamMessage format
      return claimed.map(([id, fields]: [string, string[]]) => {
        const fieldMap: Record<string, string> = {};
        for (let i = 0; i < fields.length; i += 2) {
          fieldMap[fields[i]] = fields[i + 1];
        }

        const pendingInfo = pending.find((p: any) => p.id === id);
        return {
          id,
          fields: fieldMap,
          deliveryCount: pendingInfo?.times || 0,
          lastDeliveryTime: pendingInfo?.time,
          retryMetadata: this.getRetryMetadata(id),
        };
      });
    } catch (err) {
      logger.error({ err }, "Error reading pending messages");
      return [];
    }
  }

  /**
   * Get retry metadata from message (stored in stream)
   */
  private async getRetryMetadata(messageId: string): Promise<{
    retryCount: number;
    nextRetryAt: number;
    failureType: string;
  } | null> {
    try {
      const message = await this.client.xrange("activities:stream", messageId, messageId);
      if (!message || message.length === 0) {
        return null;
      }

      const [, fields] = message[0];
      const fieldMap: Record<string, string> = {};
      for (let i = 0; i < fields.length; i += 2) {
        fieldMap[fields[i]] = fields[i + 1];
      }

      if (fieldMap.next_retry_at && fieldMap.retry_count) {
        return {
          retryCount: parseInt(fieldMap.retry_count),
          nextRetryAt: parseInt(fieldMap.next_retry_at),
          failureType: fieldMap.failure_type || "transient",
        };
      }

      return null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Move message to Dead Letter Queue
   */
  private async moveToDLQ(
    streamName: string,
    consumerGroup: string,
    messageId: string,
    error: Error,
    deliveryCount: number
  ): Promise<void> {
    // Get original message before deleting
    const originalMessage = await this.client.xrange(streamName, messageId, messageId);
    
    if (originalMessage && originalMessage.length > 0) {
      const [, fields] = originalMessage[0];
      
      // Publish to DLQ stream with full context
      await this.client.xadd(
        "activities:dlq",
        "*",
        "original_stream", streamName,
        "original_id", messageId,
        "original_fields", JSON.stringify(fields),
        "error_message", error.message,
        "error_stack", error.stack || "",
        "delivery_count", deliveryCount.toString(),
        "failed_at", Date.now().toString(),
        "consumer_group", consumerGroup,
      );

      // Delete from original stream
      await this.client.xdel(streamName, messageId);

      // Alert on-call
      await this.alertOnCall({
        severity: "warning",
        message: "Message moved to DLQ",
        streamName,
        messageId,
        deliveryCount,
      });
    }
  }

  /**
   * Alert on-call team (integrate with PagerDuty/Opsgenie)
   */
  private async alertOnCall(alert: any): Promise<void> {
    // Integration with alerting system
    logger.warn(alert, "DLQ alert");
    // TODO: Send to PagerDuty/Opsgenie
  }
}
```

**Key Improvements:**
1. ✅ **Exponential backoff:** 1s → 2s → 4s → 8s → 16s (with jitter)
2. ✅ **Failure classification:** Transient vs. permanent vs. client crash
3. ✅ **Increased PEL idle time:** 5 minutes (was 60s) for mobile users
4. ✅ **Retry metadata:** Stored in stream for visibility
5. ✅ **Jitter:** Prevents thundering herd on retry

**Retry Schedule Example:**
```
Attempt 1: Immediate (0s)
Attempt 2: 1s + jitter
Attempt 3: 2s + jitter
Attempt 4: 4s + jitter
Attempt 5: 8s + jitter
Attempt 6: 16s + jitter
Attempt 7: 30s (max) + jitter
→ DLQ after 7 attempts
```

---

## 2. Memory/Cost Trade-off Analysis

### 2.1 Current Redis Bitmap Memory Footprint

**Assumptions:**
- 100k users
- 1M activities (30-day window)
- 1 bit per activity per user

**Memory Calculation:**
```
Per User: 1,000,000 activities × 1 bit = 125,000 bytes = 125 KB
100k Users: 125 KB × 100,000 = 12.5 GB
```

**Cost Analysis (AWS ElastiCache):**

| Instance Type | Memory | Cost/Month | Supports |
|---------------|--------|------------|----------|
| **r6g.xlarge** | 26 GB | $150 | 200k users |
| **r6g.2xlarge** | 52 GB | $300 | 400k users |
| **r6g.4xlarge** | 105 GB | $600 | 800k users |

**Current Need:** 12.5 GB → **r6g.xlarge** ($150/month)

---

### 2.2 PostgreSQL Alternative Cost

**Assumptions:**
- Read replicas for scaling
- Connection pooling (PgBouncer)
- Optimized queries (LEFT JOIN)

**Cost Analysis (AWS RDS):**

| Configuration | Cost/Month | Supports |
|---------------|------------|----------|
| **db.r6g.xlarge** (Primary) | $250 | 50k users |
| **db.r6g.xlarge** (Replica) | $250 | Additional 50k users |
| **Total** | **$500** | 100k users |

**Performance:**
- **p95 Latency:** ~200ms (vs. 11ms with Bitmap)
- **Scaling:** Requires read replicas (more cost)

---

### 2.3 Cost-Benefit Analysis

| Metric | Redis Bitmap | PostgreSQL LEFT JOIN |
|--------|--------------|----------------------|
| **Monthly Cost** | $150 | $500 |
| **p95 Latency** | 11ms | 200ms |
| **Scalability** | Linear (memory) | Requires replicas |
| **Complexity** | Medium (TTL management) | Low (standard SQL) |
| **Data Consistency** | Eventual (Redis → PG) | Strong (ACID) |

**Verdict:** ✅ **Redis Bitmap is cost-effective** (3.3x cheaper, 18x faster)

---

### 2.4 TTL Strategy to Prevent Unbounded Growth

**Problem:** As activity history grows, bitmaps grow unbounded.

**Solution: Sliding Window with TTL**

```typescript
class ReadStatusCacheWithTTL {
  private readonly ACTIVITY_WINDOW_DAYS = 30; // Only track last 30 days
  private readonly BITMAP_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

  /**
   * Mark activity as read (with TTL)
   */
  async markAsRead(userId: string, activityId: number): Promise<void> {
    const key = `user:reads:${userId}`;
    
    // Set bit
    await this.redis.setbit(key, activityId, 1);
    
    // Refresh TTL (sliding window)
    await this.redis.expire(key, this.BITMAP_TTL_SECONDS);
    
    // Async write to PostgreSQL (eventual consistency)
    await db.markActivitiesAsRead(userId, [activityId]);
  }

  /**
   * Cleanup old activities (run daily via cron)
   */
  async cleanupOldActivities(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.ACTIVITY_WINDOW_DAYS);

    // Delete activities older than 30 days from activities table
    await db.deleteOldActivities(cutoffDate);

    // Bitmaps will auto-expire via TTL, but we can also proactively clean
    const pattern = "user:reads:*";
    const keys = await this.redis.keys(pattern);
    
    for (const key of keys) {
      // Check if bitmap has any set bits in the old range
      // If not, we can delete it early
      const lastActivityId = await this.getLastActivityId();
      const oldRangeEnd = lastActivityId - (this.ACTIVITY_WINDOW_DAYS * 1000); // Estimate
      
      // Check if any bits are set in old range
      const hasOldBits = await this.checkBitRange(key, 0, oldRangeEnd);
      
      if (!hasOldBits) {
        // No old bits - safe to delete
        await this.redis.del(key);
      }
    }
  }

  /**
   * Get unread activities (only check recent activities)
   */
  async getUnreadActivities(
    userId: string,
    limit: number = 20
  ): Promise<number[]> {
    const key = `user:reads:${userId}`;
    
    // Only check activities from last 30 days
    const recentActivities = await db.getRecentActivities(
      this.ACTIVITY_WINDOW_DAYS,
      limit * 2 // Get 2x for filtering
    );

    // Batch check read status
    const readMap = await this.batchIsRead(
      userId,
      recentActivities.map(a => a.id)
    );

    // Return unread activity IDs
    return recentActivities
      .filter(a => !readMap.get(a.id))
      .slice(0, limit)
      .map(a => a.id);
  }
}
```

**Memory Growth Prevention:**

1. **TTL on Bitmaps:** Auto-expire after 30 days
2. **Activity Cleanup:** Delete old activities from database
3. **Proactive Cleanup:** Daily job removes empty/old bitmaps
4. **Bounded Range:** Only track activities from last 30 days

**Memory Projection:**
```
Year 1: 12.5 GB (1M activities)
Year 2: 12.5 GB (still 1M activities - old ones deleted)
Year 3: 12.5 GB (stable)
```

**Cost Projection:**
- **Year 1-3:** $150/month (stable)
- **Scaling:** Add r6g.2xlarge ($300/month) at 200k users

---

## 3. Circuit Breaker Logic: Thundering Herd Prevention

### 3.1 Current Implementation Gap

**Problem:** When 100k clients simultaneously switch from SSE to polling, they all hit `/api/trpc/activities.getFeed` at once.

**Failure Scenario:**
```
T=0s:   Redis Streams fails (all 100k SSE connections drop)
T=1s:   100k clients detect failure
T=2s:   100k clients switch to polling simultaneously
T=3s:   /api/trpc/activities.getFeed receives 100k requests/sec
T=4s:   Database connection pool exhausted
T=5s:   Application servers crash
Result: Complete system outage
```

---

### 3.2 Enhanced Circuit Breaker with Jittered Backoff

**File:** `client/src/hooks/useActivityStream.ts` (enhanced)

```typescript
interface CircuitBreakerState {
  state: "closed" | "open" | "half-open";
  failureCount: number;
  lastFailureTime: number;
  nextRetryTime: number;
}

class CircuitBreaker {
  private state: CircuitBreakerState = {
    state: "closed",
    failureCount: 0,
    lastFailureTime: 0,
    nextRetryTime: 0,
  };

  private readonly FAILURE_THRESHOLD = 3;
  private readonly TIMEOUT_MS = 60000; // 1 minute
  private readonly HALF_OPEN_MAX_REQUESTS = 5;

  /**
   * Check if request should be allowed
   */
  canExecute(): boolean {
    const now = Date.now();

    if (this.state.state === "closed") {
      return true;
    }

    if (this.state.state === "open") {
      // Check if timeout has passed
      if (now >= this.state.nextRetryTime) {
        // Transition to half-open
        this.state.state = "half-open";
        this.state.failureCount = 0;
        return true;
      }
      return false; // Still in open state
    }

    // Half-open state
    if (this.state.failureCount < this.HALF_OPEN_MAX_REQUESTS) {
      return true;
    }

    // Too many failures in half-open - back to open
    this.state.state = "open";
    this.state.nextRetryTime = now + this.TIMEOUT_MS;
    return false;
  }

  /**
   * Record success
   */
  recordSuccess(): void {
    if (this.state.state === "half-open") {
      // Transition back to closed
      this.state.state = "closed";
      this.state.failureCount = 0;
    }
  }

  /**
   * Record failure
   */
  recordFailure(): void {
    this.state.failureCount += 1;
    this.state.lastFailureTime = Date.now();

    if (this.state.failureCount >= this.FAILURE_THRESHOLD) {
      // Transition to open
      this.state.state = "open";
      
      // Exponential backoff with jitter for next retry
      const baseDelay = this.TIMEOUT_MS;
      const jitter = Math.random() * 0.5 * baseDelay; // ±50% jitter
      this.state.nextRetryTime = Date.now() + baseDelay + jitter;
    }
  }
}

export function useActivityStream(options: UseActivityStreamOptions = {}) {
  const circuitBreakerRef = useRef(new CircuitBreaker());
  const [degradationState, setDegradationState] = useState<DegradationState>({
    mode: "sse",
  });

  // Jittered backoff for polling fallback
  const getPollingInterval = useCallback(() => {
    const baseInterval = 5000; // 5 seconds
    const jitter = Math.random() * 0.3 * baseInterval; // ±30% jitter
    return baseInterval + jitter;
  }, []);

  // Staggered polling start (prevents thundering herd)
  const startPollingFallback = useCallback(() => {
    if (pollingIntervalRef.current) {
      return; // Already polling
    }

    // Calculate jittered delay before starting first poll
    const initialDelay = Math.random() * 10000; // 0-10s random delay

    setTimeout(() => {
      const poll = () => {
        if (circuitBreakerRef.current.canExecute()) {
          queryClient.invalidateQueries({ queryKey: ["activities", "getFeed"] });
          circuitBreakerRef.current.recordSuccess();
        } else {
          // Circuit breaker is open - don't poll
          logger.warn("Circuit breaker open, skipping poll");
        }

        // Schedule next poll with jitter
        const interval = getPollingInterval();
        pollingIntervalRef.current = setTimeout(poll, interval);
      };

      // Start polling
      poll();
    }, initialDelay);

    logger.info({ initialDelay }, "Started polling fallback with jittered delay");
  }, [queryClient, getPollingInterval]);

  // Enhanced error handling
  const handleSSEError = useCallback((error: Error) => {
    circuitBreakerRef.current.recordFailure();

    if (!circuitBreakerRef.current.canExecute()) {
      // Circuit breaker opened - switch to polling
      setDegradationState({
        mode: "polling",
        reason: "Circuit breaker opened after SSE failures",
        retryAfter: 60, // Retry SSE after 60s
      });

      // Start polling with staggered delay
      startPollingFallback();
    } else {
      // Still in closed/half-open - retry SSE
      // (SSE will auto-reconnect)
    }
  }, [startPollingFallback]);

  // ... rest of implementation
}
```

---

### 3.3 Server-Side Rate Limiting for Polling Endpoint

**File:** `server/routers.ts` (enhanced rate limiting)

```typescript
import rateLimit from "express-rate-limit";

// Separate rate limiter for polling endpoint (stricter)
const pollingRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 12, // 12 requests per minute (5s interval with buffer)
  message: {
    error: "Too many polling requests",
    message: "Please wait before polling again",
    retryAfter: 5, // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID for rate limiting (not IP)
  keyGenerator: (req) => {
    return (req as any).user?.openId || req.ip;
  },
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many polling requests",
      message: "Rate limit exceeded. Please use SSE for real-time updates.",
      retryAfter: 5,
      // Suggest SSE endpoint
      sseEndpoint: "/api/events/activities",
    });
  },
});

// Apply to activities.getFeed endpoint
activities: router({
  getFeed: publicProcedure
    .input(/* ... */)
    .query(async ({ input, ctx }) => {
      // Check if this is a polling request (no SSE connection)
      const isPollingRequest = !ctx.sseConnected;
      
      if (isPollingRequest) {
        // Apply stricter rate limiting for polling
        // (Rate limiter middleware should be applied at Express level)
      }

      // ... rest of implementation
    }),
}),
```

**Express Middleware:**

```typescript
// File: server/middleware/polling-rate-limit.ts

export function pollingRateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Check if request is polling (has no SSE connection header)
  const hasSSEConnection = req.headers["x-sse-connected"] === "true";
  
  if (!hasSSEConnection) {
    // This is a polling request - apply strict rate limiting
    return pollingRateLimiter(req, res, next);
  }
  
  // SSE request - use normal rate limiting
  next();
}

// Apply to activities.getFeed route
app.use("/api/trpc/activities.getFeed", pollingRateLimitMiddleware);
```

**Client-Side Request Header:**

```typescript
// File: client/src/lib/trpc.ts

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      headers: () => {
        // Indicate if SSE is connected
        const sseConnected = getSSEConnectionStatus(); // From context
        return {
          "x-sse-connected": sseConnected ? "true" : "false",
        };
      },
    }),
  ],
});
```

---

### 3.4 Distributed Rate Limiting with Redis

**For multi-server deployments:**

```typescript
// File: server/middleware/redis-rate-limit.ts

import { createClient } from "redis";

class RedisRateLimiter {
  private redis: RedisClientType;

  async checkRateLimit(
    key: string,
    windowMs: number,
    maxRequests: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const windowStart = now - (now % windowMs);
    const redisKey = `ratelimit:${key}:${windowStart}`;

    // Increment counter
    const count = await this.redis.incr(redisKey);
    await this.redis.expire(redisKey, Math.ceil(windowMs / 1000));

    const remaining = Math.max(0, maxRequests - count);
    const resetAt = windowStart + windowMs;

    return {
      allowed: count <= maxRequests,
      remaining,
      resetAt,
    };
  }
}

// Usage in middleware
const rateLimiter = new RedisRateLimiter();

app.use("/api/trpc/activities.getFeed", async (req, res, next) => {
  const userId = (req as any).user?.openId || req.ip;
  const key = `polling:${userId}`;
  
  const result = await rateLimiter.checkRateLimit(key, 60000, 12); // 12/min
  
  if (!result.allowed) {
    return res.status(429).json({
      error: "Too many polling requests",
      retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
    });
  }

  res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
  res.setHeader("X-RateLimit-Reset", new Date(result.resetAt).toISOString());
  
  next();
});
```

**Benefits:**
1. ✅ **Jittered backoff:** Prevents simultaneous requests
2. ✅ **Circuit breaker:** Prevents cascading failures
3. ✅ **Rate limiting:** Protects server from overload
4. ✅ **Distributed:** Works across multiple servers

---

## 4. Monitoring Validation: Error Budget & Alerting

### 4.1 Error Budget Policy

**SLO Definition:**

| SLI | Target | Measurement Window | Error Budget |
|-----|--------|-------------------|--------------|
| **Message Delivery Latency** | p95 <500ms | 30 days | 5% (1.5 days) |
| **Message Delivery Success Rate** | >99.9% | 30 days | 0.1% (43 minutes) |
| **PEL Health** | <10k pending, oldest <1h | 30 days | 1% (7.2 hours) |

**Error Budget Calculation:**
```
Error Budget = (100% - SLO Target) × Measurement Window

Example:
- Success Rate SLO: 99.9%
- Error Budget: 0.1% × 30 days = 43 minutes
- If we exceed 43 minutes of failures in 30 days → SLO violation
```

---

### 4.2 Enhanced Prometheus Alerts

**File:** `monitoring/prometheus/alerts.yml`

```yaml
groups:
  - name: sse_delivery
    interval: 30s
    rules:
      # SLI #1: Message Delivery Latency
      - alert: SSEDeliveryLatencyHigh
        expr: |
          histogram_quantile(0.95, 
            rate(sse_delivery_latency_ms_bucket[5m])
          ) > 500
        for: 5m
        labels:
          severity: warning
          sli: delivery_latency
        annotations:
          summary: "SSE delivery latency exceeds SLO (p95 >500ms)"
          description: |
            p95 latency is {{ $value }}ms (target: <500ms).
            This consumes {{ $value | humanizePercentage }} of error budget.
          runbook_url: "https://runbooks.example.com/sse-latency"

      - alert: SSEDeliveryLatencyCritical
        expr: |
          histogram_quantile(0.99, 
            rate(sse_delivery_latency_ms_bucket[5m])
          ) > 1000
        for: 2m
        labels:
          severity: critical
          sli: delivery_latency
        annotations:
          summary: "SSE delivery latency critical (p99 >1000ms)"
          description: "p99 latency is {{ $value }}ms - immediate investigation required"

      # SLI #2: Message Delivery Success Rate
      - alert: SSEDeliverySuccessRateLow
        expr: |
          (
            rate(sse_delivery_success_total[5m]) /
            rate(sse_delivery_attempts_total[5m])
          ) < 0.999
        for: 5m
        labels:
          severity: warning
          sli: success_rate
        annotations:
          summary: "SSE delivery success rate below SLO (<99.9%)"
          description: |
            Success rate is {{ $value | humanizePercentage }} (target: >99.9%).
            Error budget consumption: {{ (1 - $value) * 100 | humanize }}%.

      - alert: SSEDeliverySuccessRateCritical
        expr: |
          (
            rate(sse_delivery_success_total[5m]) /
            rate(sse_delivery_attempts_total[5m])
          ) < 0.99
        for: 2m
        labels:
          severity: critical
          sli: success_rate
        annotations:
          summary: "SSE delivery success rate critical (<99%)"
          description: "Success rate is {{ $value | humanizePercentage }} - immediate action required"

      # SLI #3: PEL Health (CRITICAL - Consumer Starvation Detection)
      - alert: PELCountHigh
        expr: sse_pel_total_pending > 10000
        for: 5m
        labels:
          severity: warning
          sli: pel_health
        annotations:
          summary: "High PEL count detected ({{ $value }} messages)"
          description: |
            PEL has {{ $value }} pending messages (target: <10k).
            This may indicate consumer lag or failures.
          runbook_url: "https://runbooks.example.com/pel-high"

      - alert: PELStaleMessages
        expr: sse_pel_oldest_age_seconds > 3600
        for: 10m
        labels:
          severity: warning
          sli: pel_health
        annotations:
          summary: "Stale messages in PEL ({{ $value }}s old)"
          description: |
            Oldest pending message is {{ $value | humanizeDuration }} old (target: <1h).
            Messages may not be delivered to users.
          runbook_url: "https://runbooks.example.com/pel-stale"

      # CRITICAL: Consumer Starvation (NEW)
      - alert: PELConsumerStarvation
        expr: |
          (
            sse_pel_total_pending > 5000
            AND
            rate(sse_pel_total_pending[10m]) > 100
            AND
            rate(sse_messages_delivered_total[10m]) < 10
          )
        for: 5m
        labels:
          severity: critical
          sli: pel_health
        annotations:
          summary: "CRITICAL: Consumer starvation detected"
          description: |
            PEL has {{ $value }} pending messages and is growing at 
            {{ rate(sse_pel_total_pending[10m]) }} messages/min, but only 
            {{ rate(sse_messages_delivered_total[10m]) }} messages/min are being delivered.
            
            **Impact:** Users are not receiving activity notifications.
            **Action:** 
            1. Check SSE connection health
            2. Verify consumer processes are running
            3. Check Redis Streams memory/CPU
            4. Review error logs for delivery failures
          runbook_url: "https://runbooks.example.com/pel-starvation"

      - alert: PELRapidGrowth
        expr: rate(sse_pel_total_pending[5m]) > 100
        for: 5m
        labels:
          severity: warning
          sli: pel_health
        annotations:
          summary: "Rapid PEL growth detected ({{ $value }} messages/min)"
          description: |
            PEL is growing at {{ $value }} messages/min (target: <100/min).
            This may indicate consumer lag or system overload.

      # Additional Operational Alerts
      - alert: SSEConnectionCountHigh
        expr: sse_connections_active > 50000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High SSE connection count ({{ $value }})"
          description: "Approaching server capacity limits"

      - alert: RedisStreamsMemoryHigh
        expr: redis_streams_memory_bytes / redis_maxmemory_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis Streams memory usage high ({{ $value | humanizePercentage }})"
          description: "May need to increase Redis memory or cleanup old streams"

      - alert: CircuitBreakerOpen
        expr: increase(sse_circuit_breaker_open_total[5m]) > 10
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Circuit breaker opened {{ $value }} times in 5 minutes"
          description: "High failure rate detected - system may be degraded"
```

---

### 4.3 Error Budget Dashboard (Grafana)

**Query for Error Budget Consumption:**

```promql
# Error Budget Remaining (Success Rate)
(
  1 - (
    rate(sse_delivery_success_total[30d]) /
    rate(sse_delivery_attempts_total[30d])
  )
) / 0.001  # 0.1% error budget

# Error Budget Remaining (Latency)
(
  histogram_quantile(0.95, rate(sse_delivery_latency_ms_bucket[30d])) - 500
) / 500 * 100  # Percentage over SLO

# Error Budget Remaining (PEL)
(
  sse_pel_total_pending - 10000
) / 10000 * 100  # Percentage over threshold
```

**Grafana Panel:**
- **Green (0-50% consumed):** Healthy
- **Yellow (50-80% consumed):** Warning
- **Red (80-100% consumed):** Critical
- **Black (>100% consumed):** SLO violation

---

## 5. Production Readiness Checklist

### 5.1 Critical Fixes (Must Have)

- [ ] ✅ **Exponential backoff** for message retries (not fixed 3 attempts)
- [ ] ✅ **Failure classification** (transient vs. permanent)
- [ ] ✅ **Increased PEL idle time** (5 minutes, not 60s)
- [ ] ✅ **TTL strategy** for Redis Bitmaps (30-day sliding window)
- [ ] ✅ **Jittered backoff** for polling fallback (prevents thundering herd)
- [ ] ✅ **Circuit breaker** with half-open state
- [ ] ✅ **Rate limiting** for polling endpoint (12 req/min)
- [ ] ✅ **PEL Consumer Starvation alert** (catches issues before user impact)

### 5.2 High Priority (Should Have)

- [ ] 🟡 **Distributed rate limiting** (Redis-based for multi-server)
- [ ] 🟡 **Error budget dashboard** (Grafana)
- [ ] 🟡 **DLQ monitoring** (dead letter queue alerts)
- [ ] 🟡 **Automated PEL cleanup** (daily job)

### 5.3 Nice to Have

- [ ] 🟢 **DLQ replay mechanism** (manual retry of failed messages)
- [ ] 🟢 **PEL visualization** (Grafana dashboard)
- [ ] 🟢 **Cost monitoring** (Redis memory usage alerts)

---

## 6. Final Recommendation

**Production Readiness:** 🟡 **CONDITIONALLY APPROVED**

**Required Actions Before Production:**
1. Implement exponential backoff (Section 1.2)
2. Add TTL strategy for Bitmaps (Section 2.4)
3. Implement thundering herd prevention (Section 3.2-3.4)
4. Deploy PEL Consumer Starvation alert (Section 4.2)

**Timeline:**
- **Critical Fixes:** 3-5 days
- **Testing:** 2-3 days
- **Staging Validation:** 1 week
- **Production Deployment:** Ready after fixes

**Confidence Level:** 🟢 **HIGH** - After fixes, system is production-ready for 100k users.

---

**Document Version:** 1.0  
**Review Status:** ✅ **CONDITIONALLY APPROVED**  
**Production Risk:** 🟡 **MEDIUM** → 🟢 **LOW** (after fixes)
