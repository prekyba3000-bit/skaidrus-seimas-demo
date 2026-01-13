import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, isNull, sql } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import { bills, billSummaries, systemStatus } from "../drizzle/schema";
import { summarizeBill } from "../server/utils/ai";
import dotenv from "dotenv";
import { logger } from "../server/utils/logger";

dotenv.config();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Retry wrapper for AI API calls
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY_MS
): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === retries) {
        logger.error(
          { err: error, attempt },
          "AI API call failed after retries"
        );
        return null;
      }
      logger.warn(
        { err: error, attempt, retries },
        "AI API call failed, retrying"
      );
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  return null;
}

/**
 * Update system status for a sync job
 */
async function updateSystemStatus(
  db: any,
  jobName: string,
  status: "success" | "failed" | "partial",
  recordsProcessed: number = 0,
  recordsFailed: number = 0,
  error?: string
) {
  try {
    await db
      .insert(systemStatus)
      .values({
        jobName,
        lastSuccessfulRun: status === "success" ? new Date() : undefined,
        lastRunStatus: status,
        lastRunError: error || null,
        recordsProcessed,
        recordsFailed,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemStatus.jobName,
        set: {
          lastSuccessfulRun: status === "success" ? new Date() : undefined,
          lastRunStatus: status,
          lastRunError: error || null,
          recordsProcessed,
          recordsFailed,
          updatedAt: new Date(),
        },
      });
  } catch (err: any) {
    logger.error({ err, jobName }, "Failed to update system status");
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function generateSummaries() {
  logger.info("Starting bill summarization");

  try {
    // Find bills without summaries - STRICT idempotency: only bills where summary IS NULL
    const pendingBills = await db
      .select({
        id: bills.id,
        title: bills.title,
        description: bills.description,
        explanatoryNotes: bills.explanatoryNotes,
      })
      .from(bills)
      .leftJoin(billSummaries, eq(bills.id, billSummaries.billId))
      .where(isNull(billSummaries.id))
      .limit(20); // Process in batches

    logger.info(
      { count: pendingBills.length },
      "Found bills pending summarization"
    );

    if (pendingBills.length === 0) {
      logger.info("No pending bills found");
      await updateSystemStatus(db, "bill_summaries", "success", 0, 0);
      return;
    }

    let successCount = 0;
    let failedCount = 0;

    for (const bill of pendingBills) {
      logger.info(
        { billId: bill.id, title: bill.title.substring(0, 50) },
        "Processing bill"
      );

      try {
        // Combine description and explanatory notes/text if available
        const content = bill.explanatoryNotes || "";

        // Retry AI API call with exponential backoff
        const analysis = await retryWithBackoff(() =>
          summarizeBill(bill.title, bill.description || "", content)
        );

        if (analysis) {
          await db.insert(billSummaries).values({
            billId: bill.id,
            summary: analysis.summary,
            bulletPoints: analysis.bulletPoints,
            generatedAt: new Date(),
          });
          logger.info({ billId: bill.id }, "Summary generated and saved");
          successCount++;
        } else {
          logger.warn(
            { billId: bill.id },
            "Failed to generate summary (AI disabled or API error)"
          );
          failedCount++;
          // Continue processing other bills - don't crash the whole job
        }
      } catch (err: any) {
        logger.error({ err, billId: bill.id }, "Error processing bill summary");
        failedCount++;
        // Continue to next bill
      }

      // Artificial delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const status =
      failedCount > 0 && successCount > 0
        ? "partial"
        : successCount > 0
          ? "success"
          : "failed";
    await updateSystemStatus(
      db,
      "bill_summaries",
      status,
      successCount,
      failedCount
    );

    logger.info(
      {
        success: successCount,
        failed: failedCount,
        total: pendingBills.length,
      },
      "Bill summarization completed"
    );
  } catch (error: any) {
    logger.error({ err: error }, "Fatal error generating summaries");
    await updateSystemStatus(
      db,
      "bill_summaries",
      "failed",
      0,
      0,
      error.message
    );
  } finally {
    await client.end();
  }
}

generateSummaries().catch(err => {
  logger.error({ err }, "Fatal error in bill summarization");
  process.exit(1);
});
