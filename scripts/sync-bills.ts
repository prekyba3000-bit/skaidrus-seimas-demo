import { chromium } from "playwright";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { bills } from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

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
    await page.goto(url, { waitUntil: "domcontentloaded" });
    // Wait for the PrimeFaces results table body to be rendered
    const tableSelector =
      "#searchCompositeComponent\\:contentForm\\:resultsTable_data";
    await page.waitForSelector(tableSelector, { timeout: 15000 });

    const rows = await page.$$(tableSelector + " tr");
    console.log(`[Bills] Found ${rows.length} rows in results table.`);

    for (const row of rows) {
      // Extract link with TAP href
      const linkHandle = await row.$('a[href*="/portal/legalAct/lt/"]');
      if (!linkHandle) {
        console.log("Skipping row (no link found)");
        continue;
      }
      const seimasId = (await linkHandle.innerText()).trim();
      const href = await linkHandle.getAttribute("href");

      // Registration number (5th column)
      const regNo = await row.$eval("td:nth-child(5)", el =>
        (el.textContent ?? "").trim()
      );
      // Date (6th column, may be wrapped in span.noWrap)
      const date = await row.$eval("td:nth-child(6) span.noWrap", el =>
        (el.textContent ?? "").trim()
      );
      // Status (7th column)
      const status = await row.$eval("td:nth-child(7)", el =>
        (el.textContent ?? "").trim()
      );

      // Upsert into DB
      await db
        .insert(bills)
        .values({
          seimasId,
          title: `Įstatymo projektas ${seimasId}`,
          description: `Nuoroda: ${href}`,
          status,
          category: "Teisės akto projektas",
          submittedAt: new Date(date),
        })
        .onConflictDoUpdate({
          target: bills.seimasId,
          set: {
            title: `Įstatymo projektas ${seimasId}`,
            description: `Nuoranda: ${href}`,
            status,
            category: "Teisės akto projektas",
            submittedAt: new Date(date),
            updatedAt: new Date(),
          },
        });
    }
    console.log("[Bills] Sync completed.");
  } catch (err) {
    console.error("[Bills] Error during sync:", err);
  } finally {
    await browser.close();
    await client.end();
  }
}

syncBills().catch(console.error);
