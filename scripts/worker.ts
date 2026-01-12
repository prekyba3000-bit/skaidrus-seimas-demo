#!/usr/bin/env node
/**
 * Worker Process Script
 * 
 * Runs the BullMQ worker to process scraping jobs.
 * 
 * Usage:
 *   pnpm exec tsx scripts/worker.ts
 * 
 * Or with tsx:
 *   tsx scripts/worker.ts
 */

import dotenv from "dotenv";
import { startScraperWorker, shutdownWorker } from "../server/workers/scraper";
import { closeRedisConnection } from "../server/lib/redis";
import { logger } from "../server/utils/logger";

dotenv.config();

let worker: ReturnType<typeof startScraperWorker> | null = null;

/**
 * Graceful shutdown handler
 */
async function handleShutdown() {
  logger.info("Received shutdown signal, closing worker...");

  if (worker) {
    await shutdownWorker(worker);
    worker = null;
  }

  await closeRedisConnection();

  logger.info("Worker shutdown complete");
  process.exit(0);
}

// Handle shutdown signals
process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  logger.error({ err: error }, "Uncaught exception in worker");
  handleShutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error({ reason, promise }, "Unhandled rejection in worker");
  handleShutdown();
});

/**
 * Main entry point
 */
async function main() {
  logger.info("Starting scraper worker...");

  try {
    // Start the worker
    worker = startScraperWorker();

    logger.info("✅ Scraper worker is running. Waiting for jobs...");
    logger.info("   Press Ctrl+C to stop the worker");

    // Keep the process alive
    // The worker will continue processing jobs until stopped
  } catch (error) {
    logger.error({ err: error }, "Failed to start worker");
    process.exit(1);
  }
}

// Start the worker
main().catch((error) => {
  logger.error({ err: error }, "Fatal error in worker");
  process.exit(1);
});
