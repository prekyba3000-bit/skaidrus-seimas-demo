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
 * Get or create Redis connection for BullMQ
 */
export function getRedisConnection(): Redis {
  if (redisConnection) {
    return redisConnection;
  }

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  
  logger.info({ url: redisUrl.replace(/:[^:@]+@/, ":****@") }, "Initializing Redis connection for BullMQ");

  redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      logger.warn({ times, delay }, "Redis retry attempt");
      return delay;
    },
    reconnectOnError(err) {
      const targetError = "READONLY";
      if (err.message.includes(targetError)) {
        logger.error({ err: err.message }, "Redis read-only error, reconnecting");
        return true;
      }
      return false;
    },
  });

  redisConnection.on("connect", () => {
    logger.info("Redis connected (BullMQ)");
  });

  redisConnection.on("error", (err) => {
    logger.error({ err }, "Redis connection error (BullMQ)");
  });

  redisConnection.on("close", () => {
    logger.warn("Redis connection closed (BullMQ)");
  });

  redisConnection.on("reconnecting", () => {
    logger.info("Redis reconnecting (BullMQ)");
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
    logger.info("Redis connection closed (BullMQ)");
  }
}
