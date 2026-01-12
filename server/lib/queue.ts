import { Queue } from "bullmq";
import { getRedisConnection } from "./redis";
import { logger } from "../utils/logger";

/**
 * Job Queue Configuration for BullMQ
 * 
 * Creates and manages job queues for scraping tasks.
 */

export interface ScrapeBillsJobData {
  limit?: number;
  force?: boolean;
}

// Singleton queue instances
let scrapeBillsQueue: Queue<ScrapeBillsJobData> | null = null;

/**
 * Get or create the scrape:bills queue
 */
export function getScrapeBillsQueue(): Queue<ScrapeBillsJobData> {
  if (scrapeBillsQueue) {
    return scrapeBillsQueue;
  }

  const redis = getRedisConnection();

  scrapeBillsQueue = new Queue<ScrapeBillsJobData>("scrape:bills", {
    connection: redis,
    defaultJobOptions: {
      attempts: 3, // Retry 3 times
      backoff: {
        type: "exponential", // Exponential backoff
        delay: 5000, // Start with 5 second delay
      },
      removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
        age: 24 * 3600, // Keep for 24 hours
      },
      removeOnFail: {
        count: 500, // Keep last 500 failed jobs for debugging
      },
    },
  });

  logger.info("Job queue 'scrape:bills' initialized");

  return scrapeBillsQueue;
}

/**
 * Add a scrape:bills job to the queue
 */
export async function enqueueScrapeBills(
  data: ScrapeBillsJobData = {},
  options?: {
    delay?: number; // Delay in milliseconds before processing
    priority?: number; // Higher priority = processed first
  }
): Promise<{ jobId: string }> {
  const queue = getScrapeBillsQueue();

  const job = await queue.add("scrape:bills", data, {
    ...options,
  });

  logger.info({ jobId: job.id, data, options }, "Enqueued scrape:bills job");

  return { jobId: job.id };
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const queue = getScrapeBillsQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress;
  const returnvalue = job.returnvalue;
  const failedReason = job.failedReason;

  return {
    id: job.id,
    name: job.name,
    data: job.data,
    state,
    progress,
    returnvalue,
    failedReason,
    attemptsMade: job.attemptsMade,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
}

/**
 * Gracefully close all queues
 */
export async function closeQueues(): Promise<void> {
  if (scrapeBillsQueue) {
    await scrapeBillsQueue.close();
    scrapeBillsQueue = null;
    logger.info("Job queues closed");
  }
}
