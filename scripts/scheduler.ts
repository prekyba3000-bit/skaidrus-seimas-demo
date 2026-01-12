/**
 * Daily Scheduler for Skaidrus Seimas
 *
 * - Votes: Every 6 hours
 * - Bills: Daily at 2 AM
 * - Accountability Scores: Weekly (Sunday at 4 AM)
 *
 * Usage: Start via PM2 or a background process.
 */

import { calculateMpScores } from "../server/services/scoring";
import cron from "node-cron";
import dotenv from "dotenv";
import { enqueueScrapeBills, enqueueScrapeVotes } from "../server/lib/queue";
import { logger } from "../server/utils/logger";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { systemStatus } from "../drizzle/schema";

dotenv.config();

const db = drizzle(postgres(process.env.DATABASE_URL!));

async function logJobStatus(
  jobName: string,
  status: "success" | "running" | "failed",
  error?: string
) {
  try {
    const now = new Date();
    const values = {
      jobName,
      lastRunStatus: status,
      lastRunError: error || null,
      updatedAt: now,
      ...(status === "success" ? { lastSuccessfulRun: now } : {}),
    };

    await db.insert(systemStatus).values(values).onConflictDoUpdate({
      target: systemStatus.jobName,
      set: values,
    });
  } catch (err) {
    logger.error({ err }, `Failed to log status for job: ${jobName}`);
  }
}

async function runJob(name: string, task: () => Promise<any>) {
  logger.info(`Starting scheduled job: ${name}`);
  await logJobStatus(name, "running");

  try {
    await task();
    logger.info(`✅ Job completed: ${name}`);
    await logJobStatus(name, "success");
  } catch (err: any) {
    logger.error({ err }, `❌ Job failed: ${name}`);
    await logJobStatus(name, "failed", err.message);
  }
}

// --- Schedules ---

// Votes: Every 6 hours (0 */6 * * *)
cron.schedule("0 */6 * * *", () => {
  runJob("sync:votes", async () => {
    await enqueueScrapeVotes();
  });
});

// Bills: Daily at 2 AM (0 2 * * *)
cron.schedule("0 2 * * *", () => {
  runJob("sync:bills", async () => {
    await enqueueScrapeBills({ limit: undefined, force: false });
  });
});

// Accountability Scores: Weekly on Sunday at 4 AM (0 4 * * 0)
cron.schedule("0 4 * * 0", () => {
  runJob("calc:scores", async () => {
    await calculateMpScores();
  });
});

logger.info("📅 Scheduler started. Jobs loaded: Votes, Bills, Scores.");
