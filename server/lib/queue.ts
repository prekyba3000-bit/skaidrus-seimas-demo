// @ts-nocheck // TODO: Refactor (Grant M1) - reconcile BullMQ typings
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

export interface ScrapeVotesJobData {
  limit?: number;
  sessionId?: string; // Optional: scrape specific session
}

// Singleton queue instances
let scrapeBillsQueue: Queue<ScrapeBillsJobData> | null = null;
let scrapeVotesQueue: Queue<ScrapeVotesJobData> | null = null;

/**
 * Get or create the scrape:bills queue
 */
export function getScrapeBillsQueue(): Queue<ScrapeBillsJobData> {
  if (scrapeBillsQueue) {
    return scrapeBillsQueue;
  }

  const redis = getRedisConnection();

  scrapeBillsQueue = new Queue<ScrapeBillsJobData>("scrape:bills", {
    connection: redis as any,
    defaultJobOptions: {
      attempts: 5, // Increased from 3
      backoff: {
        type: "exponential",
        delay: 2000, // Start with 2 second delay (was 5000)
      },
      timeout: 120000, // 2 minute timeout per job
      removeOnComplete: {
        count: 100,
        age: 24 * 3600,
      },
      removeOnFail: false, // Keep ALL failed jobs for forensics
    },
  });

  logger.info("Job queue 'scrape:bills' initialized");

  return scrapeBillsQueue;
}

/**
 * Get or create the scrape:votes queue
 */
export function getScrapeVotesQueue(): Queue<ScrapeVotesJobData> {
  if (scrapeVotesQueue) {
    return scrapeVotesQueue;
  }

  const redis = getRedisConnection();

  scrapeVotesQueue = new Queue<ScrapeVotesJobData>("scrape:votes", {
    connection: redis as any,
    defaultJobOptions: {
      attempts: 5, // Increased from 3
      backoff: {
        type: "exponential",
        delay: 2000, // Start with 2 second delay (was 5000)
      },
      timeout: 180000, // 3 minute timeout per job
      removeOnComplete: {
        count: 100,
        age: 24 * 3600,
      },
      removeOnFail: false, // Keep ALL failed jobs for forensics
    },
  });

  logger.info("Job queue 'scrape:votes' initialized");

  return scrapeVotesQueue;
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

  return { jobId: job.id as string };
}

/**
 * Add a scrape:votes job to the queue
 */
export async function enqueueScrapeVotes(
  data: ScrapeVotesJobData = {},
  options?: {
    delay?: number; // Delay in milliseconds before processing
    priority?: number; // Higher priority = processed first
  }
): Promise<{ jobId: string }> {
  const queue = getScrapeVotesQueue();

  const job = await queue.add("scrape:votes", data, {
    ...options,
  });

  logger.info({ jobId: job.id, data, options }, "Enqueued scrape:votes job");

  return { jobId: job.id as string };
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  // Check both queues
  let queue: Queue<any> | null = getScrapeBillsQueue();
  let job = await queue.getJob(jobId);

  if (!job) {
    queue = getScrapeVotesQueue();
    job = await queue.getJob(jobId);
  }

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
  }
  if (scrapeVotesQueue) {
    await scrapeVotesQueue.close();
    scrapeVotesQueue = null;
  }
  logger.info("Job queues closed");
}
