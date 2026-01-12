/**
 * Real Data Seeding Script for Skaidrus Seimas
 *
 * Fetches real MPs, bills, and generates activity data from:
 * - LRS Open Data API (https://apps.lrs.lt)
 * - e-seimas.lrs.lt (Playwright scraping for bills)
 *
 * Run with: npx tsx scripts/seed-real.ts
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { chromium, Browser } from "playwright";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { sql, eq } from "drizzle-orm";
import dotenv from "dotenv";

import * as schema from "../drizzle/schema";
import { mps, mpStats, bills, activities } from "../drizzle/schema";

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

// ============================================================================
// PARTY MAPPINGS (2024-2028 Term Parties)
// ============================================================================
const PARTY_NORMALIZATION: Record<string, string> = {
  // Current ruling coalition and opposition parties
  "Tėvynės sąjunga - Lietuvos krikščionys demokratai":
    "Tėvynės sąjunga - Lietuvos krikščionys demokratai",
  "Lietuvos socialdemokratų partija": "Lietuvos socialdemokratų partija",
  "Nemuno aušra": "Nemuno Aušra",
  "Nemuno Aušra": "Nemuno Aušra",
  "Liberalų sąjūdis": "Liberalų sąjūdis",
  "Laisvės partija": "Laisvės partija",
  "Lietuvos valstiečių ir žaliųjų sąjunga":
    "Lietuvos valstiečių ir žaliųjų sąjunga",
  "Lietuvos lenkų rinkimų akcija - Krikščioniškų šeimų sąjunga":
    "Lietuvos lenkų rinkimų akcija",
  "Darbo partija": "Darbo partija",
  'Demokratų sąjunga "Vardan Lietuvos"': "Demokratų sąjunga",
  "Išsikėlęs pats": "Išsikėlęs pats",
  Nepartinis: "Nepartinis",
};

function normalizePartyName(raw: string | null | undefined): string {
  if (!raw) return "Nepartinis";
  const trimmed = raw.trim();
  return PARTY_NORMALIZATION[trimmed] || trimmed;
}

// ============================================================================
// PHOTO URL GENERATOR
// ============================================================================
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .replace(/[ą]/g, "a")
    .replace(/[č]/g, "c")
    .replace(/[ęė]/g, "e")
    .replace(/[į]/g, "i")
    .replace(/[š]/g, "s")
    .replace(/[ųū]/g, "u")
    .replace(/[ž]/g, "z")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function getPhotoUrl(name: string): string {
  // High-res photo URL pattern for 2024 term
  return `https://www.lrs.lt/SIPIS/sn_foto/2024/${normalizeName(name)}.jpg`;
}

// ============================================================================
// MP FETCHER
// ============================================================================
interface RawMp {
  seimasId: string;
  name: string;
  party: string;
  faction: string;
  district: string;
  districtNumber: number | null;
  email: string;
  phone: string | null;
  photoUrl: string;
  biography: string;
}

async function fetchMps(): Promise<RawMp[]> {
  console.log("[Seed] Fetching MPs from LRS API...");

  const response = await axios.get(
    "https://apps.lrs.lt/sip/p2b.ad_seimo_nariai"
  );
  const result = parser.parse(response.data);

  let seimoNariai =
    result.SeimoInformacija?.SeimoKadencija?.SeimoNarys ||
    result.SeimoNariai?.SeimoNarys;

  if (!seimoNariai) {
    throw new Error("Could not find SeimoNarys in API response");
  }

  const mpsList = Array.isArray(seimoNariai) ? seimoNariai : [seimoNariai];
  console.log(`[Seed] Found ${mpsList.length} MPs in API response`);

  return mpsList
    .map((sn: any) => {
      const seimasId = sn["@_asmens_id"]?.toString() || "";
      const vardas = sn["@_vardas"] || "";
      const pavarde = sn["@_pavardė"] || sn["@_pavarde"] || "";
      const name = `${vardas} ${pavarde}`.trim();
      const rawParty =
        sn["@_iškėlusi_partija"] || sn.iskeltas_partijos || "Išsikėlęs pats";
      const party = normalizePartyName(rawParty);
      const faction = sn.frakcija || sn["@_frakcija"] || "Be frakcijos";
      const district =
        sn.apygarda || sn["@_išrinkimo_būdas"] || "Daugiamandatė";
      const districtNumber = sn.apygardos_nr ? parseInt(sn.apygardos_nr) : null;
      const termsCount = sn["@_kadencijų_skaičius"] || "1";
      const biographyUrl = sn["@_biografijos_nuoroda"] || "";

      return {
        seimasId,
        name,
        party,
        faction,
        district,
        districtNumber,
        email: `${normalizeName(vardas)}.${normalizeName(pavarde)}@lrs.lt`,
        phone: sn.telefonas || null,
        photoUrl: getPhotoUrl(name),
        biography: biographyUrl
          ? `Lietuvos Respublikos Seimo narys. Kadencijų skaičius: ${termsCount}. Biografija: ${biographyUrl}`
          : `Lietuvos Respublikos Seimo narys. Kadencijų skaičius: ${termsCount}.`,
      };
    })
    .filter((mp: RawMp) => mp.seimasId);
}

// ============================================================================
// MP SEEDER (with duplicate prevention)
// ============================================================================
async function seedMps(mpData: RawMp[]): Promise<number> {
  console.log("[Seed] Inserting MPs into database...");
  let successCount = 0;

  for (const mp of mpData) {
    try {
      await db
        .insert(mps)
        .values({
          seimasId: mp.seimasId,
          name: mp.name,
          party: mp.party,
          faction: mp.faction,
          district: mp.district,
          districtNumber: mp.districtNumber,
          email: mp.email,
          phone: mp.phone,
          photoUrl: mp.photoUrl,
          biography: mp.biography,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: mps.seimasId,
          set: {
            name: mp.name,
            party: mp.party,
            faction: mp.faction,
            district: mp.district,
            districtNumber: mp.districtNumber,
            biography: mp.biography,
            photoUrl: mp.photoUrl,
            updatedAt: new Date(),
          },
        });
      successCount++;
    } catch (err) {
      console.error(`[Seed] Error inserting MP ${mp.name}:`, err);
    }
  }

  console.log(`[Seed] ✅ Inserted/Updated: ${successCount} MPs`);
  return successCount;
}

// ============================================================================
// BILLS SYNC (Playwright)
// ============================================================================
async function syncBills(): Promise<number> {
  console.log("[Seed] Syncing bills via Playwright...");

  let browser: Browser | null = null;
  let billCount = 0;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    const url = "https://e-seimas.lrs.lt/portal/legalActProjectSearch/lt";
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Try to trigger search
    try {
      const formButtons = await page.$$(
        'form button, form input[type="submit"]'
      );
      if (formButtons.length > 0) {
        await formButtons[0].click();
        await page.waitForTimeout(4000);
      }
    } catch (e) {
      console.log("[Seed] Could not find search button, proceeding...");
    }

    await page.waitForLoadState("networkidle");

    const tableSelector =
      "#searchCompositeComponent\\:contentForm\\:resultsTable_data";

    try {
      await page.waitForSelector(tableSelector, { timeout: 15000 });
    } catch (e) {
      console.log("[Seed] Table not found, trying alternative approach...");
      // Generate sample bills if scraping fails
      return await seedSampleBills();
    }

    await page.waitForTimeout(2000);
    const rows = await page.$$(tableSelector + " tr");
    console.log(`[Seed] Found ${rows.length} bill rows`);

    const maxBills = Math.min(rows.length, 50);

    for (let i = 0; i < maxBills; i++) {
      const row = rows[i];
      try {
        const linkElement = await row.$('a[href*="/portal/legalAct/lt/"]');
        if (!linkElement) continue;

        const href = await linkElement.getAttribute("href");
        const linkText = (await linkElement.innerText()).trim();
        const idMatch = href?.match(/\/([a-f0-9]{32})(?:\?|$)/i);
        const seimasId = idMatch ? idMatch[1] : `BILL-${Date.now()}-${i}`;

        let dateStr = "";
        try {
          dateStr = await row.$eval("td:nth-child(6) span.noWrap", el =>
            (el.textContent ?? "").trim()
          );
        } catch {
          dateStr = new Date().toISOString();
        }

        let status = "";
        try {
          status = await row.$eval("td:nth-child(7)", el =>
            (el.textContent ?? "").trim()
          );
        } catch {
          status = "Registruotas";
        }

        const title = linkText || `Įstatymo projektas ${i + 1}`;
        const truncatedTitle =
          title.length > 500 ? title.substring(0, 497) + "..." : title;

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
              status: status || "Nežinomas",
              updatedAt: new Date(),
            },
          });

        billCount++;
      } catch (err) {
        // Continue to next row
      }
    }

    console.log(`[Seed] ✅ Synced ${billCount} bills`);
  } catch (err) {
    console.error("[Seed] Playwright error:", err);
    // Fallback to sample bills
    return await seedSampleBills();
  } finally {
    if (browser) await browser.close();
  }

  return billCount;
}

// Fallback sample bills if scraping fails
async function seedSampleBills(): Promise<number> {
  console.log("[Seed] Using sample bills as fallback...");
  const sampleBills = [
    {
      title: "Dėl Lietuvos Respublikos valstybės biudžeto",
      status: "Registruotas",
      category: "Finansai",
    },
    {
      title: "Dėl aplinkos apsaugos įstatymo pakeitimo",
      status: "Svarstomas",
      category: "Aplinka",
    },
    {
      title: "Dėl švietimo ir mokslo įstatymo",
      status: "Priimtas",
      category: "Švietimas",
    },
    {
      title: "Dėl sveikatos sistemos reformos",
      status: "Registruotas",
      category: "Sveikata",
    },
    {
      title: "Dėl mokesčių administravimo",
      status: "Svarstomas",
      category: "Finansai",
    },
    {
      title: "Dėl darbo kodekso pakeitimo",
      status: "Registruotas",
      category: "Darbas",
    },
    {
      title: "Dėl socialinės apsaugos",
      status: "Priimtas",
      category: "Socialinė apsauga",
    },
    {
      title: "Dėl nacionalinio saugumo strategijos",
      status: "Svarstomas",
      category: "Gynyba",
    },
    {
      title: "Dėl energetikos įstatymo",
      status: "Registruotas",
      category: "Energetika",
    },
    {
      title: "Dėl vietos savivaldos įstatymo",
      status: "Registruotas",
      category: "Savivalda",
    },
  ];

  let count = 0;
  for (let i = 0; i < 50; i++) {
    const sample = sampleBills[i % sampleBills.length];
    const seimasId = `SAMPLE-${Date.now()}-${i}`;

    await db
      .insert(bills)
      .values({
        seimasId,
        title: `${sample.title} Nr. ${i + 1}`,
        description: `Įstatymo projekto aprašymas`,
        status: sample.status,
        category: sample.category,
        submittedAt: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
        ),
      })
      .onConflictDoNothing();
    count++;
  }

  console.log(`[Seed] ✅ Created ${count} sample bills`);
  return count;
}

// ============================================================================
// MP STATS GENERATOR (Realistic Random Data)
// ============================================================================
async function seedMpStats(): Promise<void> {
  console.log("[Seed] Generating MP stats...");

  const allMps = await db.select().from(mps);
  let statsCount = 0;

  for (const mp of allMps) {
    // Generate realistic stats
    const votingAttendance = (70 + Math.random() * 28).toFixed(2); // 70-98%
    const partyLoyalty = (65 + Math.random() * 30).toFixed(2); // 65-95%
    const billsProposed = Math.floor(Math.random() * 15);
    const billsPassed = Math.floor(Math.random() * billsProposed);

    // Accountability score = weighted average
    const attendanceScore = parseFloat(votingAttendance) * 0.4;
    const loyaltyScore = parseFloat(partyLoyalty) * 0.3;
    const legislativeScore =
      (billsProposed > 0 ? (billsPassed / billsProposed) * 100 : 50) * 0.3;
    const accountabilityScore = (
      attendanceScore +
      loyaltyScore +
      legislativeScore
    ).toFixed(2);

    try {
      // Check if stats exist
      const existing = await db
        .select()
        .from(mpStats)
        .where(eq(mpStats.mpId, mp.id));

      if (existing.length === 0) {
        await db.insert(mpStats).values({
          mpId: mp.id,
          votingAttendance,
          partyLoyalty,
          billsProposed,
          billsPassed,
          accountabilityScore,
          lastCalculated: new Date(),
        });
      } else {
        await db
          .update(mpStats)
          .set({
            votingAttendance,
            partyLoyalty,
            billsProposed,
            billsPassed,
            accountabilityScore,
            lastCalculated: new Date(),
          })
          .where(eq(mpStats.mpId, mp.id));
      }
      statsCount++;
    } catch (err) {
      console.error(`[Seed] Error creating stats for MP ${mp.id}:`, err);
    }
  }

  console.log(`[Seed] ✅ Generated stats for ${statsCount} MPs`);
}

// ============================================================================
// ACTIVITIES SEEDER
// ============================================================================
const activityTypes = [
  "vote",
  "comment",
  "document",
  "session",
  "achievement",
] as const;
const categories: Record<string, string> = {
  vote: "legislation",
  comment: "discussion",
  document: "documents",
  session: "sessions",
  achievement: "achievements",
};

const voteMetadata = [
  { billTitle: "Dėl valstybės biudžeto", voteChoice: "for" },
  { billTitle: "Dėl mokesčių reformos", voteChoice: "against" },
  { billTitle: "Dėl švietimo sistemos", voteChoice: "for" },
  { billTitle: "Dėl sveikatos apsaugos", voteChoice: "abstain" },
];

const commentMetadata = [
  {
    billTitle: "Dėl aplinkos apsaugos",
    commentPreview: "Pritariu šiam pasiūlymui...",
    commentLength: 120,
  },
  {
    billTitle: "Dėl energetikos",
    commentPreview: "Būtina peržiūrėti nuostatas...",
    commentLength: 85,
  },
];

const documentMetadata = [
  {
    documentTitle: "Komiteto ataskaita",
    documentType: "report",
    fileSize: "2.4 MB",
  },
  {
    documentTitle: "Ekspertų išvada",
    documentType: "expert_opinion",
    fileSize: "1.8 MB",
  },
];

const sessionMetadata = [
  {
    sessionTitle: "Seimo posėdis",
    participationType: "attended",
    duration: 180,
  },
  {
    sessionTitle: "Komiteto posėdis",
    participationType: "spoke",
    duration: 120,
  },
];

const achievementMetadata = [
  {
    title: "100 Balsavimų",
    description: "Dalyvavo 100 balsavimų per mėnesį",
    rarity: "rare",
  },
  {
    title: "Aktyvus diskutuotojas",
    description: "Pateikė 50 komentarų",
    rarity: "common",
  },
  {
    title: "Įstatymų kūrėjas",
    description: "Inicijavo 10 įstatymų projektų",
    rarity: "epic",
  },
];

async function seedActivities(): Promise<number> {
  console.log("[Seed] Generating activities...");

  // Clear old activities first
  await db.delete(activities);

  const allMps = await db.select().from(mps).limit(50);
  const allBills = await db.select().from(bills).limit(20);

  if (allMps.length === 0) {
    console.error("[Seed] No MPs found. Seed MPs first.");
    return 0;
  }

  let activityCount = 0;
  const activitiesToCreate = [];

  // Generate 200 activities spread over last 3 months
  for (let i = 0; i < 200; i++) {
    const type = activityTypes[i % activityTypes.length];
    const mp = allMps[i % allMps.length];
    const bill = allBills.length > 0 ? allBills[i % allBills.length] : null;

    let metadata;
    let billId = null;

    switch (type) {
      case "vote":
        metadata = voteMetadata[i % voteMetadata.length];
        billId = bill?.id || null;
        break;
      case "comment":
        metadata = commentMetadata[i % commentMetadata.length];
        billId = bill?.id || null;
        break;
      case "document":
        metadata = documentMetadata[i % documentMetadata.length];
        break;
      case "session":
        metadata = sessionMetadata[i % sessionMetadata.length];
        break;
      case "achievement":
        metadata = achievementMetadata[i % achievementMetadata.length];
        break;
    }

    // Spread activities over last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdAt = new Date(
      Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000
    );

    activitiesToCreate.push({
      type,
      mpId: mp.id,
      billId,
      sessionVoteId: null,
      metadata,
      isHighlighted: i % 15 === 0,
      isNew: i < 20,
      category: categories[type],
      createdAt,
    });
  }

  // Batch insert
  for (const activity of activitiesToCreate) {
    try {
      await db.insert(activities).values(activity);
      activityCount++;
    } catch (err) {
      // Continue on error
    }
  }

  console.log(`[Seed] ✅ Created ${activityCount} activities`);
  return activityCount;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     🏛️  SKAIDRUS SEIMAS - REAL DATA SEEDER                 ║");
  console.log("║     Lithuanian Parliament (2024-2028 Term)                 ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n"
  );

  try {
    // Step 1: Fetch and seed MPs
    const mpData = await fetchMps();
    const mpCount = await seedMps(mpData);

    // Step 2: Sync bills
    const billCount = await syncBills();

    // Step 3: Generate MP stats
    await seedMpStats();

    // Step 4: Seed activities
    const activityCount = await seedActivities();

    console.log(
      "\n╔════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║                    ✅ SEEDING COMPLETE                     ║"
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣"
    );
    console.log(
      `║   MPs:        ${mpCount.toString().padStart(4)} inserted/updated                    ║`
    );
    console.log(
      `║   Bills:      ${billCount.toString().padStart(4)} synced                            ║`
    );
    console.log(
      `║   Activities: ${activityCount.toString().padStart(4)} created                          ║`
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝"
    );
  } catch (err) {
    console.error("\n❌ Seeding failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
