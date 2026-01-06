import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { mps, mpStats } from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import dotenv from "dotenv";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { sql } from "drizzle-orm";

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

async function syncMps() {
  console.log("[Sync] Fetching MPs from Seimas API...");
  try {
    const response = await axios.get(
      "https://apps.lrs.lt/sip/p2b.ad_seimo_nariai"
    );
    const result = parser.parse(response.data);

    let seimoNariai = result.SeimoInformacija?.SeimoKadencija?.SeimoNarys || 
                      result.SeimoNariai?.SeimoNarys;

    if (!seimoNariai) {
      console.warn("[Sync] Unexpected API format. checking SeimoNariai root.");
       seimoNariai = result.SeimoNariai?.SeimoNarys;
    }

    if (!seimoNariai) {
        console.error("[Sync] Could not find SeimoNarys in response.");
        return;
    }

    const mpsList = Array.isArray(seimoNariai) ? seimoNariai : [seimoNariai];
    console.log(`[Sync] Found ${mpsList.length} MPs.`);

    for (const sn of mpsList) {
      const seimasId = sn["@_asmens_id"];
      const vardas = sn["@_vardas"] || "";
      const pavarde = sn["@_pavardė"] || sn["@_pavarde"] || "";
      const name = `${vardas} ${pavarde}`.trim();
      const party = sn["@_iškėlusi_partija"] || sn.iskeltas_partijos || "Išsikėlęs pats";
      const faction = sn.frakcija || "Be frakcijos";
      const district = sn.apygarda || sn["@_išrinkimo_būdas"] || "Daugiamandatė";
      const districtNumber = sn.apygardos_nr ? parseInt(sn.apygardos_nr) : null;

      const normalizeName = (str: string) => {
        return str.toLowerCase()
          .replace(/[ą]/g, "a").replace(/[č]/g, "c").replace(/[ęė]/g, "e")
          .replace(/[į]/g, "i").replace(/[š]/g, "s").replace(/[ųū]/g, "u")
          .replace(/[ž]/g, "z").replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
      };

      const photoUrl = `https://www.lrs.lt/SIPIS/sn_foto/2024/${normalizeName(name)}.jpg`;
      const termsCount = sn["@_kadencijų_skaičius"] || "1";
      const biography = sn["@_biografijos_nuoroda"] 
        ? `Lietuvos Respublikos Seimo narys. Kadencijų skaičius: ${termsCount}. Biografija: ${sn["@_biografijos_nuoroda"]}`
        : `Lietuvos Respublikos Seimo narys. Kadencijų skaičius: ${termsCount}.`;

      await db.insert(mps).values({
          seimasId: seimasId.toString(),
          name,
          party,
          faction,
          district,
          districtNumber,
          email: sn.el_pastas || `${vardas.toLowerCase()}.${pavarde.toLowerCase()}@lrs.lt`,
          phone: sn.telefonas || "",
          photoUrl,
          biography,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: mps.seimasId,
          set: {
            name, party, faction, district, districtNumber, biography, photoUrl, updatedAt: new Date(),
          },
        });
    }

    console.log("[Sync] MPs synced successfully.");

    // Init stats
    const allMps = await db.select().from(mps);
    for (const mp of allMps) {
      const existingStats = await db.select().from(mpStats).where(sql`mp_id = ${mp.id}`);
      if (existingStats.length === 0) {
        await db.insert(mpStats).values({
          mpId: mp.id,
          votingAttendance: "0.00",
          partyLoyalty: "0.00",
          billsProposed: 0,
          billsPassed: 0,
          accountabilityScore: "0.00",
        });
      }
    }
    console.log("[Sync] MP Stats initialized.");

  } catch (error) {
    console.error("[Sync] Error syncing MPs:", error);
  }
}

async function main() {
  await syncMps();
  await client.end();
}

main();
