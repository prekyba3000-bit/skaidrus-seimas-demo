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

import {
  mpInsertSchema,
  validateData,
  formatValidationErrors,
  sanitizeString,
} from "../server/utils/validation";
import {
  logError,
  DatabaseError,
  ExternalAPIError,
} from "../server/utils/errors";

async function syncMps() {
  console.log("[Sync] Fetching MPs from Seimas API...");
  try {
    const response = await axios
      .get("https://apps.lrs.lt/sip/p2b.ad_seimo_nariai")
      .catch(err => {
        throw new ExternalAPIError("Seimas API", "Failed to fetch MPs", err);
      });

    const result = parser.parse(response.data);

    let seimoNariai =
      result.SeimoInformacija?.SeimoKadencija?.SeimoNarys ||
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

    let successCount = 0;
    let failCount = 0;

    for (const sn of mpsList) {
      try {
        const seimasId = sn["@_asmens_id"]?.toString();

        if (!seimasId) {
          console.warn("[Sync] Skipping MP without ID");
          failCount++;
          continue;
        }

        const vardas = sn["@_vardas"] || "";
        const pavarde = sn["@_pavardė"] || sn["@_pavarde"] || "";
        const name = sanitizeString(`${vardas} ${pavarde}`);
        const party = sanitizeString(
          sn["@_iškėlusi_partija"] || sn.iskeltas_partijos || "Išsikėlęs pats"
        );
        const faction = sanitizeString(sn.frakcija || "Be frakcijos");
        const district = sanitizeString(
          sn.apygarda || sn["@_išrinkimo_būdas"] || "Daugiamandatė"
        );
        const districtNumber = sn.apygardos_nr
          ? parseInt(sn.apygardos_nr)
          : null;

        const normalizeName = (str: string) => {
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
            .replace(/_+/g, "_");
        };

        const photoUrl = `https://www.lrs.lt/SIPIS/sn_foto/2024/${normalizeName(name || "")}.jpg`;
        const termsCount = sn["@_kadencijų_skaičius"] || "1";
        const biography = sn["@_biografijos_nuoroda"]
          ? `Lietuvos Respublikos Seimo narys. Kadencijų skaičius: ${termsCount}. Biografija: ${sn["@_biografijos_nuoroda"]}`
          : `Lietuvos Respublikos Seimo narys. Kadencijų skaičius: ${termsCount}.`;

        const mpData = {
          seimasId,
          name,
          party,
          faction,
          district,
          districtNumber,
          email: sanitizeString(
            sn.el_pastas ||
              `${normalizeName(vardas)}.${normalizeName(pavarde)}@lrs.lt`
          ),
          phone: sanitizeString(sn.telefonas),
          photoUrl,
          biography,
          isActive: true,
        };

        // Validate data
        const validation = validateData(mpInsertSchema, mpData);
        if (!validation.success && validation.errors) {
          console.warn(
            `[Sync] Validation warning for MP ${name}: ${formatValidationErrors(validation.errors)}`
          );
          // We continue anyway as we want to save partial data if possible,
          // but in a strict mode we would skip.
        }

        await db
          .insert(mps)
          .values(mpData as typeof mps.$inferInsert)
          .onConflictDoUpdate({
            target: mps.seimasId,
            set: {
              name: mpData.name || "",
              party: mpData.party || "",
              faction: mpData.faction || "",
              district: mpData.district || "",
              districtNumber: mpData.districtNumber,
              biography: mpData.biography,
              photoUrl: mpData.photoUrl,
              updatedAt: new Date(),
            },
          });
        successCount++;
      } catch (err) {
        logError(err, `Sync MP`);
        failCount++;
      }
    }

    console.log(
      `[Sync] MPs synced. Success: ${successCount}, Failed: ${failCount}`
    );

    // Init stats
    const allMps = await db.select().from(mps);
    for (const mp of allMps) {
      try {
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
      } catch (err) {
        console.error(`[Sync] Stats init error for MP ${mp.id}`, err);
      }
    }
    console.log("[Sync] MP Stats initialized.");
  } catch (error) {
    logError(error, "Sync MPs Main");
  }
}

async function main() {
  await syncMps();
  await client.end();
}

main();
