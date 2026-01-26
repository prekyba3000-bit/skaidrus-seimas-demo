import Redis from "ioredis";
import { logger } from "../utils/logger";

let redisConnection: Redis | null = null;

// ✅ NEW: Factory for dedicated worker connections
export function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  
  const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // 👈 CRITICAL for BullMQ Workers
    enableReadyCheck: false,
    family: 0,                  // 👈 Fixes IPv6 issues on Railway
    retryStrategy(times) {
      return Math.min(times * 50, 2000);
    }
  });

  connection.on("error", (err) => {
    // Ignore harmless connection closed errors during restarts
    if (err.message !== "Connection is closed.") {
       logger.warn({ err }, "Redis Worker connection error");
    }
  });

  return connection;
}

// ✅ EXISTING: Shared singleton for API/Cache
export function getRedisConnection(): Redis {
  if (redisConnection) {
    return redisConnection;
  }

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  logger.info({ url: redisUrl.replace(/:[^:@]+@/, ":****@") }, "Initializing shared Redis connection");

  redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Good practice to keep null here too
    family: 0,                  // 👈 Fixes IPv6 issues on Railway
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
