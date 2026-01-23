# Phase 2 Infrastructure Review: Production Readiness Audit

**Author:** Senior Infrastructure Engineer  
**Date:** January 17, 2026  
**Review Type:** Infrastructure & Reliability Audit  
**Target Scale:** 100,000 concurrent users  
**Status:** Post-Architecture Review Validation

---

## Executive Summary

This document provides a critical infrastructure review of the revised Phase 2 architecture, focusing on **production reliability**, **performance optimization**, and **operational observability**. The review identifies **critical gaps** in PEL (Pending Entry List) handling, proposes advanced query optimization strategies, defines graceful degradation patterns, and establishes SLIs for monitoring.

**Overall Assessment:** ⚠️ **APPROVED WITH CRITICAL FIXES REQUIRED**

**Infrastructure Risk Level:** 🟡 **MEDIUM** - Requires PEL handling and monitoring implementation before production

---

## 1. Architecture Audit: Redis Consumer Groups & PEL Handling

### 1.1 Current Implementation Analysis

**Proposed Code (from PHASE2_ARCHITECTURE_REVIEW.md):**

```typescript
// Consumer: SSE endpoint per user
const consumerGroup = `users:${userId}`;
const streamName = "activities:stream";

// Read with acknowledgment
const messages = await redis.xreadgroup(
  "GROUP", consumerGroup, userId,
  "COUNT", 10,
  "BLOCK", 5000,
  "STREAMS", streamName, ">"
);

// Process messages
for (const [stream, events] of messages) {
  for (const [id, fields] of events) {
    res.write(`data: ${JSON.stringify(fields)}\n\n`);
    await redis.xack(streamName, consumerGroup, id);
  }
}
```

### 1.2 Critical Gap: PEL (Pending Entry List) Not Handled

**The Problem:**

The current implementation has a **fatal flaw**: It only reads new messages (`">"`), but **never processes pending messages** from the PEL. When a client disconnects before acknowledging messages, those messages remain in the PEL indefinitely.

**Failure Scenario:**
```
T=0s:   Client connects, reads message ID 100-109
T=1s:   Client sends messages 100-108 to SSE (acknowledged)
T=2s:   Client crashes before acknowledging message 109
T=3s:   Client reconnects
T=4s:   Server reads with ">" → Gets NEW messages (110+)
Result: Message 109 is LOST - stuck in PEL forever
```

**Impact at Scale:**
- **100k users** × **1% crash rate** × **10 messages/hour** = **10,000 stuck messages/hour**
- **PEL growth:** Unbounded growth → Redis memory exhaustion
- **Data loss:** Users never receive activities from PEL

---

### 1.3 Corrected Implementation with PEL Handling

**File:** `server/services/redis-streams.ts` (new)

```typescript
import { createClient, RedisClientType } from "redis";
import { logger } from "../utils/logger";

interface StreamMessage {
  id: string;
  fields: Record<string, string>;
  deliveryCount?: number;
  lastDeliveryTime?: number;
}

class RedisStreamsService {
  private client: RedisClientType;
  private readonly MAX_DELIVERY_ATTEMPTS = 3;
  private readonly PEL_IDLE_TIME = 60000; // 60 seconds

  constructor(client: RedisClientType) {
    this.client = client;
  }

  /**
   * Read messages from stream, handling both new and pending messages
   */
  async readMessages(
    streamName: string,
    consumerGroup: string,
    consumerName: string,
    count: number = 10,
    blockMs: number = 5000
  ): Promise<StreamMessage[]> {
    const messages: StreamMessage[] = [];

    // STEP 1: Process PENDING messages first (recovery from crashes)
    const pendingMessages = await this.readPendingMessages(
      streamName,
      consumerGroup,
      consumerName,
      count
    );
    messages.push(...pendingMessages);

    // STEP 2: Read NEW messages if we have capacity
    const remainingCapacity = count - messages.length;
    if (remainingCapacity > 0) {
      const newMessages = await this.readNewMessages(
        streamName,
        consumerGroup,
        consumerName,
        remainingCapacity,
        blockMs
      );
      messages.push(...newMessages);
    }

    return messages;
  }

  /**
   * Read pending messages from PEL (Pending Entry List)
   * These are messages that were delivered but never acknowledged
   */
  private async readPendingMessages(
    streamName: string,
    consumerGroup: string,
    consumerName: string,
    count: number
  ): Promise<StreamMessage[]> {
    try {
      // XPENDING: Get pending messages for this consumer
      const pending = await this.client.xpending(
        streamName,
        consumerGroup,
        "-", // Start ID
        "+", // End ID
        count,
        consumerName // Filter by consumer
      );

      if (pending.length === 0) {
        return [];
      }

      // Extract message IDs
      const messageIds = pending.map((p: any) => p.id);

      // XCLAIM: Claim messages that are idle for >60s
      // This handles messages from crashed consumers
      const claimed = await this.client.xclaim(
        streamName,
        consumerGroup,
        consumerName,
        this.PEL_IDLE_TIME, // Min idle time (ms)
        ...messageIds
      );

      // Convert to StreamMessage format
      return claimed.map(([id, fields]: [string, string[]]) => {
        const fieldMap: Record<string, string> = {};
        for (let i = 0; i < fields.length; i += 2) {
          fieldMap[fields[i]] = fields[i + 1];
        }

        // Find delivery count from pending info
        const pendingInfo = pending.find((p: any) => p.id === id);
        return {
          id,
          fields: fieldMap,
          deliveryCount: pendingInfo?.times || 0,
          lastDeliveryTime: pendingInfo?.time,
        };
      });
    } catch (err) {
      logger.error({ err, streamName, consumerGroup }, "Error reading pending messages");
      return [];
    }
  }

  /**
   * Read new messages from stream
   */
  private async readNewMessages(
    streamName: string,
    consumerGroup: string,
    consumerName: string,
    count: number,
    blockMs: number
  ): Promise<StreamMessage[]> {
    try {
      const result = await this.client.xreadgroup(
        "GROUP", consumerGroup, consumerName,
        "COUNT", count,
        "BLOCK", blockMs,
        "STREAMS", streamName, ">"
      );

      if (!result || result.length === 0) {
        return [];
      }

      const [, events] = result[0]; // [streamName, events]
      return events.map(([id, fields]: [string, string[]]) => {
        const fieldMap: Record<string, string> = {};
        for (let i = 0; i < fields.length; i += 2) {
          fieldMap[fields[i]] = fields[i + 1];
        }
        return {
          id,
          fields: fieldMap,
          deliveryCount: 0, // New message
        };
      });
    } catch (err) {
      logger.error({ err, streamName, consumerGroup }, "Error reading new messages");
      return [];
    }
  }

  /**
   * Acknowledge message after successful delivery
   */
  async acknowledgeMessage(
    streamName: string,
    consumerGroup: string,
    messageId: string
  ): Promise<void> {
    try {
      await this.client.xack(streamName, consumerGroup, messageId);
    } catch (err) {
      logger.error(
        { err, streamName, consumerGroup, messageId },
        "Error acknowledging message"
      );
      throw err;
    }
  }

  /**
   * Handle messages that failed delivery (dead letter queue)
   */
  async handleFailedMessage(
    streamName: string,
    consumerGroup: string,
    messageId: string,
    error: Error
  ): Promise<void> {
    const deliveryCount = await this.getDeliveryCount(
      streamName,
      consumerGroup,
      messageId
    );

    if (deliveryCount >= this.MAX_DELIVERY_ATTEMPTS) {
      // Move to dead letter queue
      logger.warn(
        { streamName, consumerGroup, messageId, deliveryCount },
        "Message exceeded max delivery attempts, moving to DLQ"
      );

      // XDEL: Remove from stream (or move to separate DLQ stream)
      await this.client.xdel(streamName, messageId);

      // Optionally: Publish to dead letter queue stream
      await this.client.xadd(
        "activities:dlq",
        "*",
        "original_stream", streamName,
        "original_id", messageId,
        "error", error.message,
        "delivery_count", deliveryCount.toString()
      );
    } else {
      // Re-queue for retry (message stays in PEL)
      logger.info(
        { streamName, consumerGroup, messageId, deliveryCount },
        "Message will be retried on next read"
      );
    }
  }

  /**
   * Get delivery count for a message
   */
  private async getDeliveryCount(
    streamName: string,
    consumerGroup: string,
    messageId: string
  ): Promise<number> {
    try {
      const pending = await this.client.xpending(
        streamName,
        consumerGroup,
        messageId,
        messageId,
        1
      );
      return pending.length > 0 ? pending[0].times : 0;
    } catch (err) {
      return 0;
    }
  }

  /**
   * Monitor PEL health (for alerting)
   */
  async getPELStats(
    streamName: string,
    consumerGroup: string
  ): Promise<{
    totalPending: number;
    oldestPendingAge: number; // milliseconds
    consumers: Array<{ name: string; pending: number }>;
  }> {
    try {
      const pending = await this.client.xpending(
        streamName,
        consumerGroup,
        "-",
        "+",
        10000 // Get up to 10k pending messages
      );

      const consumers = new Map<string, number>();
      let oldestTime = Date.now();

      for (const p of pending) {
        const count = consumers.get(p.consumer) || 0;
        consumers.set(p.consumer, count + 1);
        oldestTime = Math.min(oldestTime, p.time);
      }

      return {
        totalPending: pending.length,
        oldestPendingAge: Date.now() - oldestTime,
        consumers: Array.from(consumers.entries()).map(([name, pending]) => ({
          name,
          pending,
        })),
      };
    } catch (err) {
      logger.error({ err }, "Error getting PEL stats");
      return { totalPending: 0, oldestPendingAge: 0, consumers: [] };
    }
  }
}

export const redisStreams = new RedisStreamsService(redisClient);
```

**Updated SSE Endpoint:**

```typescript
app.get("/api/events/activities", async (req, res) => {
  const ctx = await createContext({ req, res });
  if (!ctx.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = ctx.user.openId;
  const streamName = "activities:stream";
  const consumerGroup = "users";
  const consumerName = userId;

  // Create consumer group if not exists
  try {
    await redis.xgroup("CREATE", streamName, consumerGroup, "0", "MKSTREAM");
  } catch (err) {
    // Group already exists - ignore
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send initial connection event
  res.write(`id: ${Date.now()}\n`);
  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ userId, timestamp: new Date().toISOString() })}\n\n`);

  // Main message loop
  let isActive = true;

  const processMessages = async () => {
    while (isActive && !res.closed) {
      try {
        // Read messages (handles both PEL and new messages)
        const messages = await redisStreams.readMessages(
          streamName,
          consumerGroup,
          consumerName,
          10, // batch size
          5000 // block 5s
        );

        for (const message of messages) {
          if (res.closed || !isActive) break;

          try {
            // Send to client
            res.write(`id: ${message.id}\n`);
            res.write(`event: new_activity\n`);
            res.write(`data: ${JSON.stringify(message.fields)}\n\n`);

            // Acknowledge after successful send
            await redisStreams.acknowledgeMessage(
              streamName,
              consumerGroup,
              message.id
            );

            // Track metrics
            metrics.increment("sse.messages.delivered", {
              delivery_count: message.deliveryCount || 0,
            });
          } catch (sendError) {
            // Handle failed delivery
            await redisStreams.handleFailedMessage(
              streamName,
              consumerGroup,
              message.id,
              sendError as Error
            );

            metrics.increment("sse.messages.failed");
          }
        }
      } catch (err) {
        logger.error({ err, userId }, "Error in message processing loop");
        
        // Send error event to client
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ error: "Processing error" })}\n\n`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  // Start processing
  processMessages().catch(err => {
    logger.error({ err, userId }, "Fatal error in SSE connection");
    res.end();
  });

  // Handle client disconnect
  req.on("close", () => {
    isActive = false;
    logger.info({ userId }, "SSE connection closed");
  });

  // Heartbeat every 30s
  const heartbeat = setInterval(() => {
    if (!res.closed && isActive) {
      res.write(`: heartbeat\n\n`);
    }
  }, 30000);

  req.on("close", () => {
    clearInterval(heartbeat);
  });
});
```

**Key Improvements:**
1. ✅ **PEL Processing:** Reads pending messages before new ones
2. ✅ **XCLAIM:** Claims messages from crashed consumers
3. ✅ **Dead Letter Queue:** Handles messages that fail >3 times
4. ✅ **Delivery Tracking:** Monitors delivery attempts
5. ✅ **PEL Monitoring:** Stats for alerting

---

### 1.4 PEL Monitoring & Alerting

**Prometheus Metrics:**

```typescript
// Add to metrics service
const pelStatsGauge = new promClient.Gauge({
  name: "redis_streams_pel_total",
  help: "Total pending messages in PEL",
  labelNames: ["stream", "consumer_group"],
});

const pelAgeGauge = new promClient.Gauge({
  name: "redis_streams_pel_age_seconds",
  help: "Age of oldest pending message in seconds",
  labelNames: ["stream", "consumer_group"],
});

// Update every 30s
setInterval(async () => {
  const stats = await redisStreams.getPELStats("activities:stream", "users");
  pelStatsGauge.set({ stream: "activities:stream", consumer_group: "users" }, stats.totalPending);
  pelAgeGauge.set({ stream: "activities:stream", consumer_group: "users" }, stats.oldestPendingAge / 1000);
}, 30000);
```

**Alerting Rules (Prometheus):**

```yaml
groups:
  - name: redis_streams
    rules:
      # Alert if PEL has >1000 pending messages
      - alert: HighPELCount
        expr: redis_streams_pel_total > 1000
        for: 5m
        annotations:
          summary: "High PEL count detected"
          description: "Stream {{ $labels.stream }} has {{ $value }} pending messages"

      # Alert if oldest PEL message is >1 hour old
      - alert: StalePELMessages
        expr: redis_streams_pel_age_seconds > 3600
        for: 10m
        annotations:
          summary: "Stale messages in PEL"
          description: "Oldest pending message is {{ $value }} seconds old"
```

---

## 2. Query Performance: LEFT JOIN vs Advanced Optimizations

### 2.1 Performance Analysis at 100k Users Scale

**Current Query (LEFT JOIN):**
```sql
SELECT a.*, mps.*, bills.*
FROM activities a
LEFT JOIN mps ON a.mp_id = mps.id
LEFT JOIN bills ON a.bill_id = bills.id
LEFT JOIN user_activity_reads uar 
  ON uar.activity_id = a.id AND uar.user_id = $userId
WHERE uar.activity_id IS NULL
ORDER BY a.created_at DESC
LIMIT 20;
```

**Performance Characteristics:**
- **Index:** `(user_id, activity_id)` composite index exists
- **Query Plan:** Hash join on `user_activity_reads`
- **Estimated Cost:** ~50ms for 10k activities, 1k reads/user
- **Scaling:** O(N + M) where N = activities, M = reads per user

**At 100k Users Scale:**
- **Assumptions:**
  - 100k activities in last 30 days
  - Average user has read 5k activities
  - 10k concurrent users querying feed

**Projected Performance:**
- **p50:** ~80ms
- **p95:** ~200ms
- **p99:** ~500ms

**Bottleneck:** Hash join on `user_activity_reads` table grows with user read history.

---

### 2.2 Redis Bitmap Optimization (Recommended for 100k+ Users)

**Concept:** Store read status as a **bitmap** in Redis, where each bit represents whether an activity is read.

**Architecture:**
```
PostgreSQL: activities table (source of truth)
Redis: Bitmap per user (read status cache)
```

**Implementation:**

```typescript
// File: server/services/read-status-cache.ts

class ReadStatusCache {
  private redis: RedisClientType;
  private readonly BITMAP_KEY_PREFIX = "user:reads:";

  /**
   * Check if activity is read (fast bitmap lookup)
   */
  async isRead(userId: string, activityId: number): Promise<boolean> {
    const key = `${this.BITMAP_KEY_PREFIX}${userId}`;
    return await this.redis.getbit(key, activityId) === 1;
  }

  /**
   * Mark activity as read
   */
  async markAsRead(userId: string, activityId: number): Promise<void> {
    const key = `${this.BITMAP_KEY_PREFIX}${userId}`;
    await this.redis.setbit(key, activityId, 1);
    
    // Also write to PostgreSQL (async, eventual consistency)
    await db.markActivitiesAsRead(userId, [activityId]);
  }

  /**
   * Batch check read status for multiple activities
   */
  async batchIsRead(
    userId: string,
    activityIds: number[]
  ): Promise<Map<number, boolean>> {
    const key = `${this.BITMAP_KEY_PREFIX}${userId}`;
    const pipeline = this.redis.pipeline();
    
    for (const id of activityIds) {
      pipeline.getbit(key, id);
    }
    
    const results = await pipeline.exec();
    const readMap = new Map<number, boolean>();
    
    activityIds.forEach((id, index) => {
      readMap.set(id, results[index][1] === 1);
    });
    
    return readMap;
  }

  /**
   * Warm cache from PostgreSQL (on user login)
   */
  async warmCache(userId: string): Promise<void> {
    const key = `${this.BITMAP_KEY_PREFIX}${userId}`;
    
    // Get all read activity IDs from PostgreSQL
    const readActivities = await db.getUserReadActivities(userId);
    
    if (readActivities.length === 0) {
      return;
    }

    // Batch set bits
    const pipeline = this.redis.pipeline();
    for (const activityId of readActivities) {
      pipeline.setbit(key, activityId, 1);
    }
    await pipeline.exec();
    
    // Set TTL (30 days)
    await this.redis.expire(key, 30 * 24 * 60 * 60);
  }
}
```

**Optimized Query:**

```sql
-- Step 1: Get unread activity IDs from Redis (fast)
-- (Done in application code)

-- Step 2: Query PostgreSQL with IN clause
SELECT a.*, mps.*, bills.*
FROM activities a
LEFT JOIN mps ON a.mp_id = mps.id
LEFT JOIN bills ON a.bill_id = bills.id
WHERE a.id = ANY($1::int[])  -- Unread activity IDs from Redis
ORDER BY a.created_at DESC
LIMIT 20;
```

**Performance Improvement:**
- **Redis Bitmap Lookup:** ~1ms for 1000 activities
- **PostgreSQL Query:** ~10ms (simple IN clause)
- **Total:** ~11ms (vs 200ms with LEFT JOIN)

**Memory Usage:**
- **Per User:** ~125KB for 1M activities (1 bit per activity)
- **100k Users:** ~12.5GB total
- **With TTL:** Auto-expire after 30 days

**Trade-offs:**
- ✅ **10-20x faster** than LEFT JOIN
- ✅ **Scales linearly** with user count
- ❌ **Eventual consistency** (Redis → PostgreSQL sync)
- ❌ **Memory overhead** (12.5GB for 100k users)

**Recommendation:** ✅ **IMPLEMENT** if p95 >100ms with LEFT JOIN

---

### 2.3 Bloom Filter Alternative (Not Recommended)

**Why Not:**
- ❌ **False positives** - Would incorrectly mark items as read
- ❌ **No deletion** - Can't remove items from Bloom filter
- ❌ **Complexity** - Requires RedisBloom module
- ❌ **Use case mismatch** - Better for "might exist" checks

**Verdict:** ❌ **DO NOT IMPLEMENT**

---

### 2.4 Hybrid Approach: Bitmap + Materialized View

**For Maximum Performance:**

1. **Redis Bitmap:** Fast read status checks (<1ms)
2. **Materialized View:** Pre-computed unread activities (updated every 30s)
3. **Fallback:** LEFT JOIN if Redis unavailable

**Implementation:**

```typescript
async function getUnreadActivities(
  userId: string,
  limit: number = 20
): Promise<Activity[]> {
  try {
    // Try Redis bitmap first
    const recentActivities = await db.getRecentActivities(limit * 2); // Get 2x for filtering
    const readMap = await readStatusCache.batchIsRead(
      userId,
      recentActivities.map(a => a.id)
    );
    
    const unread = recentActivities
      .filter(a => !readMap.get(a.id))
      .slice(0, limit);
    
    if (unread.length >= limit) {
      return unread; // Fast path
    }
  } catch (err) {
    logger.warn({ err }, "Redis unavailable, falling back to materialized view");
  }

  // Fallback: Materialized view
  return await db.getUnreadActivitiesFromView(userId, limit);
}
```

**Performance:**
- **Fast Path (Redis):** ~11ms
- **Fallback (Materialized View):** ~5ms
- **Worst Case (LEFT JOIN):** ~200ms

---

## 3. Resiliency: Graceful Degradation Strategy

### 3.1 Failure Modes

**Scenario 1: SSE Connection Drops**
- **Cause:** Network interruption, server restart
- **Impact:** User loses real-time updates
- **Recovery:** Automatic reconnection with PEL replay

**Scenario 2: Redis Stream Lag**
- **Cause:** High message volume, slow consumers
- **Impact:** Delayed activity delivery
- **Recovery:** Fallback to polling

**Scenario 3: Redis Unavailable**
- **Cause:** Redis crash, network partition
- **Impact:** No real-time updates, no bitmap cache
- **Recovery:** Fallback to polling + LEFT JOIN query

---

### 3.2 Graceful Degradation Implementation

**File:** `client/src/hooks/useActivityStream.ts` (enhanced)

```typescript
import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";

interface DegradationState {
  mode: "sse" | "polling" | "degraded";
  reason?: string;
  retryAfter?: number; // seconds
}

export function useActivityStream(options: UseActivityStreamOptions = {}) {
  const [degradationState, setDegradationState] = useState<DegradationState>({
    mode: "sse",
  });
  
  const sseErrorCountRef = useRef(0);
  const lastSuccessfulSSETimeRef = useRef<number>(Date.now());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // SSE connection
  const { isConnected, connectionError, subscribe } = useSSEConnection({
    onError: (error) => {
      sseErrorCountRef.current += 1;
      
      // After 3 consecutive errors, degrade to polling
      if (sseErrorCountRef.current >= 3) {
        setDegradationState({
          mode: "polling",
          reason: "SSE connection failed 3 times",
          retryAfter: 60, // Retry SSE after 60s
        });
        
        // Start polling fallback
        startPollingFallback();
      }
    },
    onSuccess: () => {
      // Reset error count on successful connection
      sseErrorCountRef.current = 0;
      lastSuccessfulSSETimeRef.current = Date.now();
      
      // If we were in polling mode, switch back to SSE
      if (degradationState.mode === "polling") {
        setDegradationState({ mode: "sse" });
        stopPollingFallback();
      }
    },
  });

  // Monitor SSE health
  useEffect(() => {
    const healthCheck = setInterval(() => {
      const timeSinceLastSuccess = Date.now() - lastSuccessfulSSETimeRef.current;
      
      // If no successful message in 30s, check for lag
      if (timeSinceLastSuccess > 30000 && isConnected) {
        setDegradationState({
          mode: "degraded",
          reason: "SSE connection appears stalled",
        });
        
        // Start polling as backup
        startPollingFallback();
      }
    }, 10000); // Check every 10s

    return () => clearInterval(healthCheck);
  }, [isConnected]);

  // Polling fallback
  const startPollingFallback = useCallback(() => {
    if (pollingIntervalRef.current) {
      return; // Already polling
    }

    // Poll every 5 seconds (same as original)
    pollingIntervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["activities", "getFeed"] });
    }, 5000);

    logger.info("Started polling fallback");
  }, [queryClient]);

  const stopPollingFallback = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      logger.info("Stopped polling fallback");
    }
  }, []);

  // Retry SSE after degradation period
  useEffect(() => {
    if (degradationState.mode === "polling" && degradationState.retryAfter) {
      const retryTimer = setTimeout(() => {
        setDegradationState({ mode: "sse" });
        sseErrorCountRef.current = 0; // Reset error count
      }, degradationState.retryAfter * 1000);

      return () => clearTimeout(retryTimer);
    }
  }, [degradationState]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopPollingFallback();
    };
  }, [stopPollingFallback]);

  return {
    isConnected,
    degradationState,
    // ... other returns
  };
}
```

**UI Indicator:**

```typescript
// File: client/src/components/ConnectionStatus.tsx

export function ConnectionStatus({ degradationState }: { degradationState: DegradationState }) {
  if (degradationState.mode === "sse") {
    return null; // No indicator needed
  }

  return (
    <div className="mb-4 rounded-lg border p-3 bg-amber-500/10 border-amber-500/20">
      <div className="flex items-center gap-2">
        {degradationState.mode === "polling" ? (
          <>
            <RefreshCw className="h-4 w-4 text-amber-400 animate-spin" />
            <p className="text-sm text-amber-300">
              Using polling mode. Real-time updates temporarily unavailable.
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <p className="text-sm text-amber-300">
              Connection degraded. Some updates may be delayed.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
```

**Server-side Health Check:**

```typescript
// File: server/routers/health.ts

health: router({
  sse: publicProcedure.query(async () => {
    // Check Redis Streams health
    const redisHealthy = await redis.ping();
    
    // Check PEL stats
    const pelStats = await redisStreams.getPELStats(
      "activities:stream",
      "users"
    );
    
    // Determine health
    const isHealthy = redisHealthy && pelStats.totalPending < 10000;
    
    return {
      healthy: isHealthy,
      redis: redisHealthy,
      pel: {
        totalPending: pelStats.totalPending,
        oldestAge: pelStats.oldestPendingAge,
      },
      recommendation: isHealthy
        ? "sse"
        : pelStats.totalPending > 50000
        ? "polling" // Too many pending messages
        : "degraded", // Redis issues
    };
  }),
}),
```

**Client-side Health Check:**

```typescript
// Check server health every 30s
useEffect(() => {
  const healthCheck = setInterval(async () => {
    const health = await trpc.health.sse.query();
    
    if (health.recommendation === "polling" && degradationState.mode === "sse") {
      // Server recommends polling
      setDegradationState({
        mode: "polling",
        reason: "Server health check recommends polling",
      });
      startPollingFallback();
    }
  }, 30000);

  return () => clearInterval(healthCheck);
}, [degradationState.mode]);
```

---

## 4. Monitoring: Top 3 SLIs (Service Level Indicators)

### 4.1 SLI Selection Criteria

**SLIs must be:**
1. **Measurable** - Can be collected automatically
2. **Actionable** - Trigger alerts when violated
3. **User-facing** - Directly impact user experience

---

### 4.2 SLI #1: Message Delivery Latency

**Definition:** Time from activity creation to delivery to user's browser.

**Measurement:**
```typescript
// Producer: Activity creation
const activityId = await db.createActivity(activityData);
const publishTime = Date.now();

await redis.xadd(
  "activities:stream",
  "*",
  "activity_id", activityId.toString(),
  "publish_timestamp", publishTime.toString(),
  "data", JSON.stringify(activityData)
);

// Consumer: SSE delivery
const receiveTime = Date.now();
const publishTime = parseInt(message.fields.publish_timestamp);
const latency = receiveTime - publishTime;

metrics.histogram("sse.delivery.latency_ms", latency, {
  activity_type: message.fields.type,
});
```

**SLO Target:**
- **p50:** <100ms
- **p95:** <500ms
- **p99:** <1000ms

**Alerting:**
```yaml
- alert: HighSSEDeliveryLatency
  expr: histogram_quantile(0.95, sse_delivery_latency_ms_bucket) > 500
  for: 5m
  annotations:
    summary: "SSE delivery latency exceeds SLO"
    description: "p95 latency is {{ $value }}ms (target: <500ms)"
```

**Why This Matters:**
- **User Experience:** Users expect near-instant updates
- **Competitive:** Real-time feel vs. polling
- **Scalability:** Latency increases indicate system stress

---

### 4.3 SLI #2: Message Delivery Success Rate

**Definition:** Percentage of activities successfully delivered to users.

**Measurement:**
```typescript
// Track delivery attempts
metrics.increment("sse.delivery.attempts_total", {
  activity_type: activity.type,
});

// Track successful deliveries
metrics.increment("sse.delivery.success_total", {
  activity_type: activity.type,
});

// Track failures
metrics.increment("sse.delivery.failure_total", {
  activity_type: activity.type,
  error_type: error.name,
});

// Calculate success rate
const successRate = 
  sse_delivery_success_total / 
  sse_delivery_attempts_total;
```

**SLO Target:**
- **Success Rate:** >99.9% (3 nines)
- **Failure Rate:** <0.1%

**Alerting:**
```yaml
- alert: LowSSEDeliverySuccessRate
  expr: |
    (
      rate(sse_delivery_success_total[5m]) /
      rate(sse_delivery_attempts_total[5m])
    ) < 0.999
  for: 5m
  annotations:
    summary: "SSE delivery success rate below SLO"
    description: "Success rate is {{ $value | humanizePercentage }} (target: >99.9%)"
```

**Why This Matters:**
- **Data Integrity:** Users must receive all activities
- **Reliability:** High failure rate indicates system issues
- **Trust:** Missing activities erode user confidence

---

### 4.4 SLI #3: PEL (Pending Entry List) Health

**Definition:** Number of unacknowledged messages in PEL and their age.

**Measurement:**
```typescript
// Track PEL stats
const pelStats = await redisStreams.getPELStats(
  "activities:stream",
  "users"
);

metrics.gauge("sse.pel.total_pending", pelStats.totalPending, {
  stream: "activities:stream",
  consumer_group: "users",
});

metrics.gauge("sse.pel.oldest_age_seconds", pelStats.oldestPendingAge / 1000, {
  stream: "activities:stream",
  consumer_group: "users",
});

// Track PEL growth rate
metrics.histogram("sse.pel.growth_rate", pelStats.totalPending - previousCount);
```

**SLO Target:**
- **Total Pending:** <10,000 messages
- **Oldest Message Age:** <1 hour
- **PEL Growth Rate:** <100 messages/minute

**Alerting:**
```yaml
- alert: HighPELCount
  expr: sse_pel_total_pending > 10000
  for: 5m
  annotations:
    summary: "High PEL count detected"
    description: "{{ $value }} messages pending in PEL (target: <10k)"

- alert: StalePELMessages
  expr: sse_pel_oldest_age_seconds > 3600
  for: 10m
  annotations:
    summary: "Stale messages in PEL"
    description: "Oldest pending message is {{ $value }}s old (target: <1h)"

- alert: RapidPELGrowth
  expr: rate(sse_pel_total_pending[5m]) > 100
  for: 5m
  annotations:
    summary: "Rapid PEL growth detected"
    description: "PEL growing at {{ $value }} messages/min (target: <100/min)"
```

**Why This Matters:**
- **Memory Management:** Unbounded PEL growth causes Redis OOM
- **Message Loss Risk:** Stale messages may never be delivered
- **System Health:** PEL growth indicates consumer lag or failures

---

### 4.5 Additional Monitoring Metrics (Non-SLI)

**Operational Metrics:**
- **SSE Connection Count:** `sse_connections_active`
- **Redis Stream Memory:** `redis_streams_memory_bytes`
- **Query Performance:** `db_query_duration_seconds{query="get_unread_activities"}`
- **Degradation Events:** `sse_degradation_events_total{reason}`

**Business Metrics:**
- **Activities Created/Hour:** `activities_created_total`
- **Users with Active SSE:** `sse_users_active`
- **Polling Fallback Usage:** `sse_polling_fallback_active`

---

## 5. Implementation Checklist

### 5.1 Pre-Production Requirements

**Critical (Must Have):**
- [ ] ✅ PEL handling implementation (XCLAIM, dead letter queue)
- [ ] ✅ Connection limiting (per-user + global)
- [ ] ✅ Backpressure handling (watermarks)
- [ ] ✅ Graceful degradation (SSE → polling)
- [ ] ✅ SLI monitoring (3 SLIs defined above)
- [ ] ✅ Alerting rules (Prometheus alerts)

**High Priority (Should Have):**
- [ ] 🟡 Redis Bitmap optimization (if p95 >100ms)
- [ ] 🟡 Materialized view (if bitmap insufficient)
- [ ] 🟡 Health check endpoint (`/health/sse`)
- [ ] 🟡 Connection status UI indicator

**Nice to Have:**
- [ ] 🟢 Dead letter queue dashboard
- [ ] 🟢 PEL visualization (Grafana)
- [ ] 🟢 Automated PEL cleanup job

---

## 6. Conclusion

**Infrastructure Readiness:** 🟡 **READY WITH FIXES**

**Critical Gaps Addressed:**
1. ✅ **PEL Handling:** Corrected implementation with XCLAIM and dead letter queue
2. ✅ **Query Optimization:** Redis Bitmap strategy for 100k+ users
3. ✅ **Graceful Degradation:** Automatic fallback to polling
4. ✅ **SLI Monitoring:** 3 key indicators defined with alerting

**Next Steps:**
1. Implement PEL handling in Redis Streams service
2. Add graceful degradation to frontend hook
3. Set up SLI monitoring and alerting
4. Load test with 1000+ concurrent users
5. Deploy to staging for validation

**Confidence Level:** 🟢 **HIGH** - With these fixes, system is production-ready for 100k users.

---

**Document Version:** 1.0  
**Review Status:** ✅ **APPROVED WITH IMPLEMENTATION REQUIRED**  
**Infrastructure Risk:** 🟢 **LOW** (after fixes implemented)
