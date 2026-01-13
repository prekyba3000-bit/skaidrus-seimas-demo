import { chromium } from "playwright";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import fs from "fs";

async function scrapeProtocolVotes() {
  console.log("[Protocol] Fetching sittings...");
  // Fetch current term ID (10 for 2024-2028)
  const termId = 10;

  // Fetch sessions
  const sessionsRes = await axios.get(
    `https://apps.lrs.lt/sip/p2b.ad_seimo_sesijos?kadencijos_id=${termId}`
  );
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const sessionsData = parser.parse(sessionsRes.data);
  let sessions = sessionsData.SeimoInformacija.SeimoKadencija.SeimoSesija;
  if (!Array.isArray(sessions)) sessions = [sessions];

  // Sort descending
  sessions.sort((a: any, b: any) => b["@_sesijos_id"] - a["@_sesijos_id"]);

  // Force use of session 139 (1 eilinė) which corresponds to late 2024
  const targetSessionId = 139;
  const latestSession =
    sessions.find((s: any) => s["@_sesijos_id"] == targetSessionId) ||
    sessions[0];
  console.log(
    `[Protocol] Selected Session: ${latestSession["@_pavadinimas"]} (ID: ${latestSession["@_sesijos_id"]})`
  );

  // Fetch Sittings
  const sittingsRes = await axios.get(
    `https://apps.lrs.lt/sip/p2b.ad_seimo_posedziai?sesijos_id=${latestSession["@_sesijos_id"]}`
  );
  const sittingsData = parser.parse(sittingsRes.data);
  let sittings = sittingsData.SeimoInformacija.SeimoSesija.SeimoPosėdis;
  if (!Array.isArray(sittings)) sittings = [sittings];

  // Find one with Stenograma (Transcript) preferably, else Protocol
  // Prefer older sittings (from 2024), but skip the first one (SPP-1)
  const sittingsWithDoc = sittings.filter(
    (s: any) =>
      (s.Stenograma && s.Stenograma["@_stenogramos_nuoroda"]) ||
      (s.Protokolas && s.Protokolas["@_protokolo_nuoroda"])
  );

  if (sittingsWithDoc.length < 2) {
    console.log("[Protocol] Not enough sittings with docs found.");
    return;
  }

  // Pick the second one
  const targetSitting = sittingsWithDoc[1];

  let targetUrl = "";
  if (
    targetSitting.Stenograma &&
    targetSitting.Stenograma["@_stenogramos_nuoroda"]
  ) {
    targetUrl = targetSitting.Stenograma["@_stenogramos_nuoroda"];
    console.log(`[Protocol] Scraping STENOGRAMA (Transcript): ${targetUrl}`);
  } else {
    targetUrl = targetSitting.Protokolas["@_protokolo_nuoroda"];
    console.log(`[Protocol] Scraping PROTOCOL: ${targetUrl}`);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  await page.goto(targetUrl);
  await page.waitForLoadState("domcontentloaded");

  // Try to switch to "Dokumento tekstas" tab if it exists
  try {
    // The tab might be an anchor or a list item
    // Look for EXACT text "Dokumento tekstas"
    const textTab = page
      .locator("a, div, li, span")
      .filter({ hasText: /^Dokumento tekstas$/ })
      .first();

    // Also look for class 'parsed-tab-header' which is common in e-seimas
    const specificTab = page.locator(
      '.parsed-tab-header:has-text("Dokumento tekstas")'
    );

    let clicked = false;
    if (await specificTab.isVisible()) {
      await specificTab.click();
      clicked = true;
    } else if (await textTab.isVisible()) {
      await textTab.click();
      clicked = true;
    }

    if (clicked) {
      console.log(
        "[Protocol] Clicked 'Dokumento tekstas' tab. Waiting for content..."
      );
      await page.waitForTimeout(3000);
    } else {
      console.log("[Protocol] 'Dokumento tekstas' tab not found/visible.");
    }
  } catch (e) {
    console.log("Tab switching error", e);
  }

  // Check for Voting links/data
  // In the text, voting results are often links with text "Balsavimo rezultatai"
  const voteLinks = await page
    .getByRole("link", { name: /Balsavimo rezultatai|duomenys/i })
    .all();
  console.log(`[Protocol] Found ${voteLinks.length} potential voting links.`);

  for (const link of voteLinks) {
    const href = await link.getAttribute("href");
    console.log(` - Link: ${href}`);

    if (href) {
      // Resolve relative URL
      const fullUrl = new URL(href, targetUrl).toString();
      console.log(`   -> Visiting: ${fullUrl}`);

      try {
        const votePage = await context.newPage();
        await votePage.goto(fullUrl);
        await votePage.waitForLoadState("domcontentloaded");

        // Check for XML link on THIS page
        const xmlLink = await votePage
          .getByRole("link", { name: /XML/i })
          .first();
        if (await xmlLink.isVisible()) {
          const xmlUrl = await xmlLink.getAttribute("href");
          console.log(`   !!! FOUND XML: ${xmlUrl}`);
        } else {
          // Scrape table
          const rows = await votePage.locator("table tr").count();
          console.log(`   -> Table rows found: ${rows}`);
        }
        await votePage.close();
      } catch (e) {
        console.log("Failed to visit vote link", e);
      }
    }
  }

  await browser.close();
}

scrapeProtocolVotes().catch(console.error);
