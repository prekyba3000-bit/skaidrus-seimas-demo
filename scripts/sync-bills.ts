import { chromium } from "playwright";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { bills, systemStatus } from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import dotenv from "dotenv";
import { logger } from "../server/utils/logger";
import { z } from "zod";

dotenv.config();

// Zod schema for bill validation
const billSchema = z.object({
  seimasId: z.string().min(1),
  title: z.string().max(500),
  description: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  submittedAt: z.date(),
});

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

/**
 * Sync bills by scraping the PrimeFaces project search page.
 * URL: https://e-seimas.lrs.lt/portal/legalActProjectSearch/lt
 */
async function syncBills() {
  console.log("[Bills] Starting Playwright scrape...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    const url = "https://e-seimas.lrs.lt/portal/legalActProjectSearch/lt";
    await page.goto(url, { waitUntil: "networkidle" });

    // Wait for page to be fully loaded
    await page.waitForTimeout(3000);

    // Try multiple strategies to trigger search/load results
    console.log("[Bills] Attempting to trigger search/results loading...");

    // Strategy 1: Look for PrimeFaces command buttons (often have IDs with colons)
    try {
      const pfButtons = await page.$$(
        'button[id*="search"], button[id*="submit"], input[id*="search"], input[id*="submit"]'
      );
      for (const btn of pfButtons) {
        const btnId = await btn.getAttribute("id");
        const btnText = await btn.textContent();
        console.log(`[Bills] Found button: ${btnId} - "${btnText}"`);
      }

      if (pfButtons.length > 0) {
        console.log(`[Bills] Clicking first search/submit button...`);
        await pfButtons[0].click();
        await page.waitForTimeout(4000);
      }
    } catch (e) {
      console.log("[Bills] Strategy 1 failed, trying alternative...");
    }

    // Strategy 2: Try clicking any button in the search form area
    try {
      const formButtons = await page.$$(
        'form button, form input[type="submit"]'
      );
      if (formButtons.length > 0) {
        console.log(
          `[Bills] Found ${formButtons.length} form buttons, clicking first one...`
        );
        await formButtons[0].click();
        await page.waitForTimeout(4000);
      }
    } catch (e) {
      console.log("[Bills] Strategy 2 failed, proceeding to check table...");
    }

    // Strategy 3: Wait for AJAX/XHR requests to complete
    await page.waitForLoadState("networkidle");

    // Wait for the PrimeFaces results table body to be rendered
    const tableSelector =
      "#searchCompositeComponent\\:contentForm\\:resultsTable_data";
    console.log("[Bills] Waiting for results table...");
    await page.waitForSelector(tableSelector, { timeout: 20000 });

    // Wait a bit more for dynamic content to load
    await page.waitForTimeout(3000);

    // Debug: Check if table exists and get some info
    const tableExists = await page.$(tableSelector);
    if (!tableExists) {
      console.log(
        "[Bills] WARNING: Table selector not found, checking page content..."
      );
      const pageContent = await page.content();
      console.log(`[Bills] Page content length: ${pageContent.length}`);
      // Look for alternative table selectors
      const altTables = await page.$$(
        'table, [id*="resultsTable"], [id*="table"]'
      );
      console.log(`[Bills] Found ${altTables.length} potential table elements`);
    }

    const rows = await page.$$(tableSelector + " tr");
    console.log(`[Bills] Found ${rows.length} rows in results table.`);

    // Debug: Check first row content
    if (rows.length > 0) {
      const firstRowText = await rows[0].textContent();
      console.log(
        `[Bills] First row content preview: "${firstRowText?.substring(0, 200)}"`
      );
    }

    let processedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // Use transaction for batch insert
    await db.transaction(async tx => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          // Extract link with TAP href
          const linkElement = await row.$('a[href*="/portal/legalAct/lt/"]');
          if (!linkElement) {
            console.log(`[Bills] Skipping row ${i + 1} (no link found)`);
            skippedCount++;
            continue;
          }

          const href = await linkElement.getAttribute("href");
          const linkText = (await linkElement.innerText()).trim();

          if (!href) {
            console.log(`[Bills] Skipping row ${i + 1} (missing href)`);
            skippedCount++;
            continue;
          }

          // Extract ID from href URL (format: /portal/legalAct/lt/TAP/{UUID})
          // The UUID is the identifier we need for seimasId
          const idMatch = href.match(/\/([a-f0-9]{32})(?:\?|$)/i);
          const seimasId = idMatch ? idMatch[1] : null;

          if (!seimasId) {
            console.log(
              `[Bills] Skipping row ${i + 1} (could not extract ID from href: ${href})`
            );
            skippedCount++;
            continue;
          }

          // Use link text as title, or extract from another column if needed
          const title = linkText || "";

          // Registration number (5th column)
          let regNo = "";
          try {
            regNo = await row.$eval("td:nth-child(5)", el =>
              (el.textContent ?? "").trim()
            );
          } catch (e) {
            console.log(
              `[Bills] Row ${i + 1}: Could not extract registration number`
            );
          }

          // Date (6th column, may be wrapped in span.noWrap)
          let dateStr = "";
          try {
            dateStr = await row.$eval("td:nth-child(6) span.noWrap", el =>
              (el.textContent ?? "").trim()
            );
          } catch (e) {
            // Try without span wrapper
            try {
              dateStr = await row.$eval("td:nth-child(6)", el =>
                (el.textContent ?? "").trim()
              );
            } catch (e2) {
              console.log(`[Bills] Row ${i + 1}: Could not extract date`);
            }
          }

          // Status (7th column)
          let status = "";
          try {
            status = await row.$eval("td:nth-child(7)", el =>
              (el.textContent ?? "").trim()
            );
          } catch (e) {
            console.log(`[Bills] Row ${i + 1}: Could not extract status`);
          }

          if (!dateStr) {
            console.log(`[Bills] Skipping row ${i + 1} (missing date)`);
            skippedCount++;
            continue;
          }

          // Validate bill data before insertion
          const billData = {
            seimasId,
            title: title || `Įstatymo projektas ${seimasId}`,
            description: `Nuoroda: ${href}`,
            status: status || "Nežinomas",
            category: "Teisės akto projektas",
            submittedAt: new Date(dateStr),
          };

          // Truncate title if too long (max 500 chars per schema)
          const truncatedTitle =
            billData.title.length > 500
              ? billData.title.substring(0, 497) + "..."
              : billData.title;
          billData.title = truncatedTitle;

          // Validate with Zod
          try {
            billSchema.parse(billData);
          } catch (validationError) {
            if (validationError instanceof z.ZodError) {
              logger.warn(
                { billId: seimasId, errors: validationError.issues },
                "Bill validation failed - skipping"
              );
              skippedCount++;
              continue;
            }
            throw validationError;
          }

          // Upsert into DB within transaction
          await tx
            .insert(bills)
            .values(billData)
            .onConflictDoUpdate({
              target: bills.seimasId,
              set: {
                title: truncatedTitle,
                description: `Nuoroda: ${href}`,
                status: status || "Nežinomas",
                category: "Teisės akto projektas",
                submittedAt: new Date(dateStr),
                updatedAt: new Date(),
              },
            });

          processedCount++;
          const titlePreview =
            truncatedTitle.length > 60
              ? truncatedTitle.substring(0, 60) + "..."
              : truncatedTitle;
          logger.debug(
            { billId: seimasId, title: titlePreview },
            "Processed bill"
          );
        } catch (err: any) {
          logger.error({ err, rowIndex: i + 1 }, "Error processing bill row");
          failedCount++;
          // Continue processing other rows
        }
      }
    });

    const status =
      failedCount > 0 && processedCount > 0
        ? "partial"
        : processedCount > 0
          ? "success"
          : "failed";
    await updateSystemStatus(
      db,
      "bills_sync",
      status,
      processedCount,
      failedCount
    );

    logger.info(
      {
        processed: processedCount,
        skipped: skippedCount,
        failed: failedCount,
        total: rows.length,
      },
      "Bills sync completed"
    );
  } catch (err: any) {
    logger.error({ err }, "Fatal error during bills sync");
    await updateSystemStatus(db, "bills_sync", "failed", 0, 0, err.message);
  } finally {
    await browser.close();
    await client.end();
  }
}

syncBills().catch(err => {
  logger.error({ err }, "Fatal error in bills sync");
  process.exit(1);
});
