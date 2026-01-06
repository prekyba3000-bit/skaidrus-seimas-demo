import { chromium } from "playwright";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { votes, bills, mps } from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import fs from "fs";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

async function scrapeVotes() {
  console.log("[Scrape] Starting LRS Votes scrape...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // "Balsavimo rezultatai" page
  const URL = "https://www.lrs.lt/sip/portal.show?p_r=37067&p_k=1";
  console.log(`[Scrape] Navigating to ${URL}...`);

  await page.goto(URL);
  // Handle Cookies
  try {
    const acceptCookies = page.getByRole("button", {
      name: "Patvirtinti visus",
    });
    if (await acceptCookies.isVisible()) {
      await acceptCookies.click();
      console.log("[Scrape] Accepted all cookies.");
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    /* ignore */
  }

  const title = await page.title();
  console.log(`[Scrape] Page Title: ${title}`);

  // Debug: print some page content
  const pageContent = await page.evaluate(() =>
    document.body.innerText.substring(0, 1000)
  );
  console.log("[Scrape] Content preview:\n", pageContent);

  // Select the latest session if available, or just click "Ieškoti" (Search)
  // The page seems to have dropdowns "Pasirinkite kadenciją" and "Pasirinkite sesiją"
  // Let's assume current ones are selected by default.

  // Monitor network requests to see data loading
  page.on("response", async response => {
    const url = response.url();
    if (
      url.includes("portal.show") &&
      !url.includes(".css") &&
      !url.includes(".js") &&
      !url.includes(".png")
    ) {
      console.log(`[Network] Response: ${url} (${response.status()})`);
      try {
        // const text = await response.text();
        // if (text.includes('Balsavo')) console.log('[Network] Found "Balsavo" in response!');
      } catch (e) {}
    }
  });

  // Debug: Custom Dropdown handling for Session
  try {
    console.log("[Scrape] Handling custom Session dropdown...");
    const dropdownToggler = page.locator("#dropdownSesija");
    if (await dropdownToggler.isVisible()) {
      await dropdownToggler.click();
      await page.waitForTimeout(500);

      // Select "1 eilinė" (ID 139)
      const options = page.locator(".dropdownSesija .dropdownOption");
      const count = await options.count();
      let clicked = false;
      for (let i = 0; i < count; i++) {
        const txt = await options.nth(i).innerText();
        if (txt.includes("1 eilinė")) {
          console.log(`[Scrape] Selecting option: ${txt}`);
          await options.nth(i).click();
          clicked = true;
          break;
        }
      }
      if (!clicked && count > 0) await options.first().click();
      await page.waitForTimeout(3000); // Wait for reload
    } else {
      console.warn("[Scrape] Session dropdown not visible.");
    }
  } catch (e) {
    console.warn("[Scrape] Failed to inspect custom session dropdown:", e);
  }

  // Handle Sitting Dropdown
  console.log("[Scrape] Selecting Sitting (Posėdis)...");
  try {
    const sittingToggler = page.locator("#dropdownPosedis");
    await sittingToggler.click();
    await page.waitForTimeout(1000);

    const sittingOptions = page.locator(".dropdownPosedis .dropdownOption");
    const count = await sittingOptions.count();
    console.log(`[Scrape] Found ${count} sittings.`);

    if (count > 0) {
      // Select FIRST sitting (Latest)
      const firstSitting = sittingOptions.first();
      const sittingText = await firstSitting.innerText();
      console.log(`[Scrape] Clicking FIRST sitting: ${sittingText}`);

      // Setup response listener for the navigation
      const responsePromise = page.waitForResponse(
        resp => resp.url().includes("p_fakt_pos_id") && resp.status() === 200,
        { timeout: 10000 }
      );

      await firstSitting.click();

      try {
        const response = await responsePromise;
        const text = await response.text();
        console.log(`[Scrape] Navigation Response Size: ${text.length}`);
        // Check for keywords in the raw response
        if (text.includes("Balsavo"))
          console.log("[Scrape] Response contains 'Balsavo'");
        else console.log("[Scrape] Response DOES NOT contain 'Balsavo'");
      } catch (e) {
        console.log("Response capture failed", e);
      }

      await page.waitForTimeout(3000);
    }
  } catch (e) {
    console.error("Sitting selection failed", e);
  }

  // Dump text content
  const content = await page.evaluate(() => document.body.innerText);
  console.log(`[Scrape] Body Text length: ${content.length}`);
  if (content.includes("Balsavo"))
    console.log("[Scrape] Page has 'Balsavo' visible.");

  console.log("[Scrape] Checking for results table...");

  // Try iframe which is likely the real source
  try {
    // Wait for the iframe "balsavimas"
    // Note: It might be dynamic, so let's look for any iframe
    const frameElement = page.frameLocator('iframe[name="balsavimas"]');

    // Check if frame exists by waiting for body
    await frameElement
      .locator("body")
      .waitFor({ state: "attached", timeout: 5000 });
    console.log("[Scrape] 'balsavimas' iframe found.");

    const frameRows = await frameElement.locator("tr").all();
    console.log(`[Scrape] Found ${frameRows.length} rows in iframe.`);

    const voteData = [];
    for (const row of frameRows) {
      const txt = await row.innerText();
      // Basic filter for rows that look like vote records (contain date/time)
      if (txt.match(/\d{4}-\d{2}-\d{2}/)) {
        voteData.push(txt.replace(/\s+/g, " ").trim());
      }
    }

    console.log(
      `[Scrape] Extracted ${voteData.length} valid vote rows from iframe.`
    );
    if (voteData.length > 0) {
      console.log("First vote sample:", voteData[0]);
      // DB Insert would happen here
    }
  } catch (e) {
    console.log(
      "[Scrape] Iframe access failed or timed out:",
      e instanceof Error ? e.message : String(e)
    );

    // Fallback: Check main page
    const contentRows = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll(".bals-rez-row, .list-row, tr")
      );
      return elements
        .map(e => (e as HTMLElement).innerText.replace(/\s+/g, " ").trim())
        .filter(t => t.length > 10 && t.length < 200);
    });
    console.log(`[Scrape] Found ${contentRows.length} rows in main body.`);
    if (contentRows.length > 0) console.log("Sample:", contentRows[0]);
  }

  /*
  // Real DB Insert logic would go here
  if (voteResults.length > 0) {
      // insert...
  }
  */

  await browser.close();
  console.log("[Scrape] Done.");
}

scrapeVotes().catch(console.error);
