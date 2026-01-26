import { Worker, Job } from "bullmq";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { bills } from "../../drizzle/schema";
import * as schema from "../../drizzle/schema";
import { createRedisClient } from "../lib/redis"; // 👈 Update Import
import { logger } from "../utils/logger";
import { launchBrowser, createBrowserContext } from "../utils/playwright";
import dotenv from "dotenv";

dotenv.config();

/**
 * Job Queue Worker for Scraping Bills
 *
 * Processes 'scrape:bills' jobs from the queue with:
 * - Automatic retries (3 attempts)
 * - Exponential backoff
 * - Error handling and logging
 */

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

interface ScrapeBillsJobData {
  limit?: number;
  force?: boolean;
}

/**
 * Scrape bills from e-seimas.lrs.lt using Playwright
 */
async function scrapeBills(
  job: Job<ScrapeBillsJobData>
): Promise<{ processed: number; skipped: number; total: number }> {
  const { limit, force } = job.data;
  logger.info(
    { jobId: job.id, limit, force },
    "[Worker] Starting bills scrape job"
  );

  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  const browser = await launchBrowser();
  const context = await createBrowserContext(browser);
  const page = await context.newPage();

  try {
    const url = "https://e-seimas.lrs.lt/portal/legalActProjectSearch/lt";
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Trigger search to load results
    logger.info({ jobId: job.id }, "[Worker] Attempting to trigger search...");
    try {
      const pfButtons = await page.$$(
        'button[id*="search"], button[id*="submit"], input[id*="search"], input[id*="submit"]'
      );
      if (pfButtons.length > 0) {
        await pfButtons[0].click();
        await page.waitForTimeout(4000);
      }
    } catch (e) {
      logger.warn(
        { jobId: job.id, err: e },
        "[Worker] Search button click failed, continuing..."
      );
    }

    // Wait for results table
    const tableSelector =
      "#searchCompositeComponent\\:contentForm\\:resultsTable_data";
    await page.waitForSelector(tableSelector, { timeout: 20000 });
    await page.waitForTimeout(3000);

    const rows = await page.$$(tableSelector + " tr");
    logger.info(
      { jobId: job.id, rowCount: rows.length },
      "[Worker] Found rows in table"
    );

    let processedCount = 0;
    let skippedCount = 0;
    const maxRows = limit ? Math.min(rows.length, limit) : rows.length;

    for (let i = 0; i < maxRows; i++) {
      const row = rows[i];
      try {
        // Extract link element
        const linkElement = await row.$('a[href*="/portal/legalAct/lt/"]');
        if (!linkElement) {
          skippedCount++;
          continue;
        }

        const href = await linkElement.getAttribute("href");
        const linkText = (await linkElement.innerText()).trim();

        if (!href) {
          skippedCount++;
          continue;
        }

        // Extract UUID from href
        const idMatch = href.match(/\/([a-f0-9]{32})(?:\?|$)/i);
        const seimasId = idMatch ? idMatch[1] : null;

        if (!seimasId) {
          skippedCount++;
          continue;
        }

        // Extract data from columns
        let dateStr = "";
        try {
          dateStr = await row.$eval("td:nth-child(6) span.noWrap", el =>
            (el.textContent ?? "").trim()
          );
        } catch {
          try {
            dateStr = await row.$eval("td:nth-child(6)", el =>
              (el.textContent ?? "").trim()
            );
          } catch {
            // Date extraction failed
          }
        }

        let status = "";
        try {
          status = await row.$eval("td:nth-child(7)", el =>
            (el.textContent ?? "").trim()
          );
        } catch {
          // Status extraction failed
        }

        if (!dateStr) {
          skippedCount++;
          continue;
        }

        // Prepare bill data
        const title = linkText || `Įstatymo projektas ${seimasId}`;
        const truncatedTitle =
          title.length > 500 ? title.substring(0, 497) + "..." : title;

        // Upsert to database
        await db
          .insert(bills)
          .values({
            seimasId,
            title: truncatedTitle,
            description: `Nuoroda: ${href}`,
            status: status || "Nežinomas",
            category: "Teisės akto projektas",
            submittedAt: new Date(dateStr),
          })
          .onConflictDoUpdate({
            target: bills.seimasId,
            set: {
              title: truncatedTitle,
              description: `Nuoranda: ${href}`,
              status: status || "Nežinomas",
              category: "Teisės akto projektas",
              submittedAt: new Date(dateStr),
              updatedAt: new Date(),
            },
          });

        processedCount++;
        await job.updateProgress(((i + 1) / maxRows) * 100);
      } catch (err) {
        logger.error(
          { jobId: job.id, rowIndex: i, err },
          "[Worker] Error processing row"
        );
        skippedCount++;
      }
    }

    await browser.close();
    await client.end();

    const result = {
      processed: processedCount,
      skipped: skippedCount,
      total: maxRows,
    };
    logger.info(
      { jobId: job.id, ...result },
      "[Worker] Bills scrape job completed"
    );
    return result;
  } catch (error) {
    if (browser) await browser.close(); // Safety check
    await client.end();
    logger.error(
      { jobId: job.id, err: error },
      "[Worker] Bills scrape job failed"
    );
    throw error;
  }
}

export function startScraperWorker(): Worker {
  // ✅ Use Dedicated Connection
  const connection = createRedisClient();

  const worker = new Worker<ScrapeBillsJobData>(
    "scrape:bills",
    // @ts-ignore
    async job => {
       // @ts-ignore
       return await scrapeBills(job);
    },
    {
      connection, // 👈 Pass dedicated connection
      concurrency: 1,
      removeOnComplete: { count: 100, age: 24 * 3600 },
      removeOnFail: { count: 500 },
      maxStalledCount: 2,
    }
  );

  worker.on("completed", job => logger.info({ jobId: job?.id }, "[Worker] Job completed"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "[Worker] Job failed"));
  worker.on("error", err => logger.error({ err }, "[Worker] Worker error"));
  
  logger.info("Scraper worker started");
  return worker;
}

export async function shutdownWorker(worker: Worker): Promise<void> {
  await worker.close();
}
