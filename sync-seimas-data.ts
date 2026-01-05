import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { mps, mpStats } from "./drizzle/schema";
import * as schema from "./drizzle/schema";
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
  console.log("Fetching MPs from Seimas API...");
  try {
    // Current term (kadencija) ID is usually the latest one.
    // Based on the website, we can try to fetch the current members.
    const response = await axios.get(
      "https://apps.lrs.lt/sip/p2b.ad_seimo_nariai"
    );
    const result = parser.parse(response.data);

    // The structure usually looks like SeimoInformacija -> SeimoKadencija -> SeimoNarys
    let seimoNariai = result.SeimoInformacija?.SeimoKadencija?.SeimoNarys || 
                      result.SeimoNariai?.SeimoNarys;

    if (!seimoNariai) {
      console.error("Unexpected API response structure:", JSON.stringify(result).substring(0, 500));
      return;
    }

    const mpsList = Array.isArray(seimoNariai) ? seimoNariai : [seimoNariai];

    console.log(`Found ${mpsList.length} MPs. Syncing to database...`);

    if (mpsList.length > 0) {
      console.log("First MP sample data:", JSON.stringify(mpsList[0], null, 2));
    }

    for (const sn of mpsList) {
      const seimasId = sn["@_asmens_id"];
      const vardas = sn["@_vardas"] || "";
      const pavarde = sn["@_pavardė"] || sn["@_pavarde"] || "";
      const name = `${vardas} ${pavarde}`.trim();
      const party = sn["@_iškėlusi_partija"] || sn.iskeltas_partijos || "Išsikėlęs pats";
      const faction = sn.frakcija || "Be frakcijos";
      const district = sn.apygarda || sn["@_išrinkimo_būdas"] || "Daugiamandatė";
      const districtNumber = sn.apygardos_nr ? parseInt(sn.apygardos_nr) : null;

      const photoUrl = `https://www.lrs.lt/sip/portal.show?p_r=35299&p_k=1&p_a=498&p_asm_id=${seimasId}&p_img=1`;
      const termsCount = sn["@_kadencijų_skaičius"] || "1";
      const biography = sn["@_biografijos_nuoroda"] 
        ? `Lietuvos Respublikos Seimo narys. Kadencijų skaičius: ${termsCount}. Biografija: ${sn["@_biografijos_nuoroda"]}`
        : `Lietuvos Respublikos Seimo narys. Kadencijų skaičius: ${termsCount}.`;

      await db
        .insert(mps)
        .values({
          seimasId: seimasId.toString(),
          name,
          party,
          faction,
          district,
          districtNumber,
          email:
            sn.el_pastas ||
            `${vardas.toLowerCase()}.${pavarde.toLowerCase()}@lrs.lt`,
          phone: sn.telefonas || "",
          photoUrl,
          biography,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: mps.seimasId,
          set: {
            name,
            party,
            faction,
            district,
            districtNumber,
            biography,
            photoUrl,
            updatedAt: new Date(),
          },
        });
    }

    console.log("✓ MPs synced successfully.");

    // Initialize stats for new MPs if they don't exist
    const allMps = await db.select().from(mps);
    for (const mp of allMps) {
      const existingStats = await db
        .select()
        .from(mpStats)
        .where(sql`mp_id = ${mp.id}`);
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
  } catch (error) {
    console.error("Error syncing MPs:", error);
  }
}

// Main execution function
async function main() {
  await syncMps();
  console.log("Data synchronization finished.");
  await client.end();
  process.exit(0);
}

main();
