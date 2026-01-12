#!/usr/bin/env node
/**
 * Nightly Scheduler Script
 * 
 * Dispatches scraping jobs to the queue on a schedule.
 * 
 * Usage:
 *   pnpm exec tsx scripts/scheduler.ts
 * 
 * For production, use a cron job or systemd timer to run this:
 *   # Example cron (runs daily at 2 AM)
 *   0 2 * * * cd /path/to/app && pnpm exec tsx scripts/scheduler.ts
 */

import dotenv from "dotenv";
import { enqueueScrapeBills } from "../server/lib/queue";
import { closeRedisConnection } from "../server/lib/redis";
import { logger } from "../server/utils/logger";

dotenv.config();

/**
 * Dispatch all scheduled scraping jobs
 */
async function dispatchScheduledJobs() {
  logger.info("Starting scheduled job dispatch...");

  try {
    // Schedule bills scraping job (runs immediately, but can be configured with delay)
    const billsJob = await enqueueScrapeBills(
      {
        limit: undefined, // No limit - scrape all available
        force: false,
      },
      {
        delay: 0, // Process immediately
        priority: 1, // Normal priority
      }
    );

    logger.info({ jobId: billsJob.jobId }, "✅ Scheduled bills scrape job");

    // Future: Add more job types here
    // Example: await enqueueScrapeMps({ ... });

    logger.info("Scheduled job dispatch complete");

    return {
      success: true,
      jobs: [billsJob],
    };
  } catch (error) {
    logger.error({ err: error }, "Failed to dispatch scheduled jobs");
    throw error;
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    await dispatchScheduledJobs();
    await closeRedisConnection();
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Fatal error in scheduler");
    await closeRedisConnection();
    process.exit(1);
  }
}

// Run if called directly
main();
