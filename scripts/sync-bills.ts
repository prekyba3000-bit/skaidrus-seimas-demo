import { chromium } from "playwright";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { bills } from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import dotenv from "dotenv";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

async function syncBills() {
  console.log("[Bills] Starting hybrid XML+Scrape sync...");
  const browser = await chromium.launch();
  
  try {
    // 1. Get Current Term (Kadencija)
    console.log("[Bills] Fetching terms...");
    const termsRes = await axios.get("https://apps.lrs.lt/sip/p2b.ad_seimo_kadencijos");
    const termsData = parser.parse(termsRes.data);
    const terms = termsData.SeimoInformacija?.SeimoKadencija || [];
    // Last term
    const currentTerm = Array.isArray(terms) ? terms[terms.length - 1] : terms;
    const termId = currentTerm["@_kadencijos_id"];
    console.log(`[Bills] Current Term ID: ${termId} (${currentTerm["@_pavadinimas"]})`);

    // 2. Get Sessions for Term
    console.log(`[Bills] Fetching sessions for term ${termId}...`);
    const sessionsRes = await axios.get(`https://apps.lrs.lt/sip/p2b.ad_seimo_sesijos?kadencijos_id=${termId}`);
    const sessionsData = parser.parse(sessionsRes.data);
    let sessions = sessionsData.SeimoInformacija?.SeimoKadencija?.SeimoSesija || [];
    if (!Array.isArray(sessions)) sessions = [sessions];
    
    // Sort desc and take last 2
    sessions.sort((a: any, b: any) => parseInt(b["@_numeris"]) - parseInt(a["@_numeris"]));
    const recentSessions = sessions.slice(0, 2);

    console.log(`[Bills] Processing ${recentSessions.length} recent sessions...`);

    for (const session of recentSessions) {
      const sessionId = session["@_sesijos_id"];
      console.log(`[Bills] Fetching sittings for Session ${sessionId} (${session["@_pavadinimas"]})...`);
      
      const sittingsRes = await axios.get(`https://apps.lrs.lt/sip/p2b.ad_seimo_posedziai?sesijos_id=${sessionId}`);
      const sittingsData = parser.parse(sittingsRes.data);
      let sittings = sittingsData.SeimoInformacija?.SeimoSesija?.SeimoPosėdis || [];
      if (!Array.isArray(sittings)) sittings = [sittings];

      // Limit to last 10 sittings to save time
      const recentSittings = sittings.slice(-10);
      console.log(`[Bills] Found ${sittings.length} sittings. Processing last ${recentSittings.length}...`);

      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });
      const page = await context.newPage();

      for (const sitting of recentSittings) {
        const protocolUrl = sitting.Protokolas?.["@_protokolo_nuoroda"];
        if (!protocolUrl) continue;

        console.log(`[Bills] Scraping Protocol: ${protocolUrl}`);
        
        try {
          await page.goto(protocolUrl, { waitUntil: 'domcontentloaded' });
          
          // Extract links to projects (TAP)
          // Pattern: /portal/legalAct/lt/tap/GUID or links with text matching REGEX
          const billsFound = await page.evaluate(() => {
            const items = [];
            const links = Array.from(document.querySelectorAll("a"));
            const uniqueIds = new Set();

            for (const link of links) {
              const href = link.getAttribute('href');
              const text = (link as HTMLElement).innerText.trim();
              
              if (!href || !text) continue;
              
              // Check if it looks like a Project ID
              // e.g. "XIVP-1234(2)"
              const match = text.match(/([XIVP]+-\d+(?:\(\d+\))?)/);
              if (match) {
                 const seimasId = match[1];
                 if (uniqueIds.has(seimasId)) continue;
                 uniqueIds.add(seimasId);

                 // Status guess
                 items.push({
                   seimasId,
                   title: text, // often the text is just the number, we might need context
                   href,
                   category: 'Teisės akto projektas'
                 });
              }
            }
            return items;
          });

          console.log(`[Bills] Found ${billsFound.length} bills in sitting.`);
          
          for (const b of billsFound) {
             await db.insert(bills).values({
               seimasId: b.seimasId,
               title: `Įstatymo projektas ${b.seimasId}`, // Placeholder title, could fetch real one if needed
               description: `Nuoroda: ${b.href}`,
               status: 'svarstomas',
               category: b.category,
               submittedAt: new Date(),
             }).onConflictDoUpdate({
               target: bills.seimasId,
               set: {
                 updatedAt: new Date()
               }
             });
          }

        } catch (err) {
          console.warn(`[Bills] Failed to scrape protocol ${protocolUrl}:`, err);
        }
      }
      await context.close();
    }

  } catch (error) {
    console.error("[Bills] Error:", error);
  } finally {
    await browser.close();
    await client.end();
  }
}

syncBills().catch(console.error);
