import Redis from "ioredis";
import { logger } from "../utils/logger";

/**
 * Redis Connection for BullMQ
 *
 * BullMQ requires an ioredis instance, separate from the cache service.
 * This provides a dedicated connection for job queue operations.
 */

let redisConnection: Redis | null = null;

/**
 * Create a new Redis connection instance
 * specific for BullMQ usage (maxRetriesPerRequest: null)
 */
export function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  const connection = new Redis(redisUrl, {
    // CRITICAL: BullMQ requires this to be null
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = "READONLY";
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  });

  connection.on("error", err => {
    // Suppress simple connection errors to avoid log spam, 
    // but log critical ones
    if (err.message.includes("ECONNREFUSED")) {
       // connection will retry
    } else {
       logger.error({ err }, "Redis connection error (BullMQ)");
    }
  });

  return connection;
}

/**
 * Get or create the Singleton Redis connection
 * (Used for Queues/Producers, NOT for Workers)
 */
export function getRedisConnection(): Redis {
  if (redisConnection) {
    return redisConnection;
  }

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  logger.info(
    { url: redisUrl.replace(/:[^:@]+@/, ":****@") },
    "Initializing shared Redis connection for BullMQ Queues"
  );

  redisConnection = createRedisClient();

  redisConnection.on("connect", () => {
    logger.info("Shared Redis connected (BullMQ Queues)");
  });

  redisConnection.on("close", () => {
    logger.warn("Shared Redis connection closed (BullMQ Queues)");
  });

  return redisConnection;
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
    logger.info("Shared Redis connection closed (BullMQ)");
  }
}
