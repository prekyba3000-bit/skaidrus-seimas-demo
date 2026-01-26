import Redis from "ioredis";
import { logger } from "../utils/logger";

let redisConnection: Redis | null = null;

// Dedicated connection for Workers (Blocking)
export function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  
  const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // REQUIRED for BullMQ
    enableReadyCheck: false,
    family: 0,                  // 👈 REQUIRED for Railway (IPv6 support)
    retryStrategy(times) {
      return Math.min(times * 50, 2000);
    }
  });

  connection.on("error", (err) => {
    // Filter out expected connection closures to reduce noise
    if (err.message !== "Connection is closed.") {
       logger.warn({ err }, "Redis Worker connection error");
    }
  });

  return connection;
}

// Shared connection for Queues/Cache (Non-blocking)
export function getRedisConnection(): Redis {
  if (redisConnection) {
    return redisConnection;
  }

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  logger.info({ url: redisUrl.replace(/:[^:@]+@/, ":****@") }, "Initializing shared Redis connection");

  redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    family: 0,                  // 👈 REQUIRED for Railway (IPv6 support)
    retryStrategy(times) {
      return Math.min(times * 50, 2000);
    },
    reconnectOnError(err) {
      return err.message.includes("READONLY");
    },
  });

  redisConnection.on("connect", () => logger.info("Shared Redis connected"));
  redisConnection.on("error", err => logger.error({ err }, "Shared Redis connection error"));
  redisConnection.on("close", () => logger.warn("Shared Redis connection closed"));

  return redisConnection;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
    logger.info("Shared Redis connection closed");
  }
}
