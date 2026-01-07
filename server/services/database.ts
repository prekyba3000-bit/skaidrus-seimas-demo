import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../../drizzle/schema";
import { logger } from "../utils/logger";

/**
 * Database Connection Pool Configuration
 *
 * Optimized for production workloads:
 * - Connection pooling with limits
 * - Prepared statements
 * - Connection health checks
 * - Graceful shutdown
 */

interface PoolConfig {
  /** Maximum connections in pool */
  max: number;
  /** Idle timeout in seconds */
  idle_timeout: number;
  /** Connection timeout in seconds */
  connect_timeout: number;
  /** Enable prepared statements */
  prepare: boolean;
}

const DEFAULT_POOL_CONFIG: PoolConfig = {
  max: parseInt(process.env.DB_POOL_MAX || "20"),
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: true, // Prepared statements for query performance
};

// Connection pool singleton
let sqlClient: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create database connection pool
 */
export async function getDb() {
  if (db) return db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const config = DEFAULT_POOL_CONFIG;

  logger.info(
    {
      max: config.max,
      idle_timeout: config.idle_timeout,
      prepare: config.prepare,
    },
    "Initializing database connection pool"
  );

  sqlClient = postgres(databaseUrl, {
    max: config.max,
    idle_timeout: config.idle_timeout,
    connect_timeout: config.connect_timeout,
    prepare: config.prepare,

    // Connection lifecycle hooks
    onnotice: notice => {
      logger.debug({ notice: notice.message }, "PostgreSQL notice");
    },
  });

  db = drizzle(sqlClient, { schema });

  // Test connection
  try {
    await sqlClient`SELECT 1`;
    logger.info("Database connection established");
  } catch (err) {
    logger.error({ err }, "Database connection failed");
    throw err;
  }

  return db;
}

/**
 * Get raw SQL client for direct queries
 */
export function getSqlClient() {
  if (!sqlClient) {
    throw new Error("Database not initialized. Call getDb() first.");
  }
  return sqlClient;
}

/**
 * Database health check
 */
export async function healthCheck(): Promise<{
  status: "healthy" | "unhealthy";
  latencyMs: number;
  connections?: number;
}> {
  if (!sqlClient) {
    return { status: "unhealthy", latencyMs: -1 };
  }

  const start = performance.now();

  try {
    await sqlClient`SELECT 1`;
    const latencyMs = performance.now() - start;

    return {
      status: "healthy",
      latencyMs: Math.round(latencyMs * 100) / 100,
    };
  } catch (err) {
    logger.error({ err }, "Database health check failed");
    return {
      status: "unhealthy",
      latencyMs: performance.now() - start,
    };
  }
}

/**
 * Graceful shutdown - close all connections
 */
export async function closeDatabase(): Promise<void> {
  if (sqlClient) {
    await sqlClient.end();
    logger.info("Database connections closed");
    sqlClient = null;
    db = null;
  }
}

/**
 * Query performance wrapper with timing
 */
export async function timedQuery<T>(
  name: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await queryFn();
    const duration = performance.now() - start;

    if (duration > 100) {
      logger.warn(
        {
          query: name,
          duration: `${duration.toFixed(2)}ms`,
        },
        "Slow query detected"
      );
    } else {
      logger.debug(
        {
          query: name,
          duration: `${duration.toFixed(2)}ms`,
        },
        "Query executed"
      );
    }

    return result;
  } catch (err) {
    const duration = performance.now() - start;
    logger.error(
      {
        query: name,
        duration: `${duration.toFixed(2)}ms`,
        err,
      },
      "Query failed"
    );
    throw err;
  }
}
