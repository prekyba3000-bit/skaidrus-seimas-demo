import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import { committees, committeeMembers, mps } from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

const COMMITTEES_API = "https://apps.lrs.lt/sip/p2b.ad_seimo_komitetai";

interface CommitteeMemberXML {
  "@_asmens_id": string;
  "@_vardas": string;
  "@_pavardė": string;
  "@_pareigos": string;
}

interface CommitteeXML {
  "@_padalinio_id": string;
  "@_padalinio_pavadinimas": string;
  "@_padalinio_narių_skaičius": string;
  SeimoKomitetoNarys: CommitteeMemberXML | CommitteeMemberXML[];
}

interface SeimoDataXML {
  SeimoInformacija: {
    SeimoKadencija: {
      SeimoKomitetas: CommitteeXML | CommitteeXML[];
    };
  };
}

import {
  committeeInsertSchema,
  validateData,
  sanitizeString,
  formatValidationErrors,
} from "../server/utils/validation";
import { logError, ExternalAPIError } from "../server/utils/errors";

/**
 * Sync committee membership data from LRS Open Data API
 */
async function syncCommittees() {
  console.log("[Committees] Starting committee sync from LRS API...");

  try {
    // Fetch committees XML data
    console.log(`[Committees] Fetching data from ${COMMITTEES_API}...`);
    const response = await axios
      .get(COMMITTEES_API, {
        responseType: "text",
        headers: {
          Accept: "application/xml",
        },
      })
      .catch(err => {
        throw new ExternalAPIError(
          "Seimas Committees API",
          "Failed to fetch data",
          err
        );
      });

    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const data = parser.parse(response.data) as SeimoDataXML;

    console.log("[Committees] XML parsed successfully.");

    // Extract committees
    const committeesData = data.SeimoInformacija.SeimoKadencija.SeimoKomitetas;
    const committeesArray = Array.isArray(committeesData)
      ? committeesData
      : [committeesData];

    console.log(`[Committees] Found ${committeesArray.length} committees.`);

    let committeesInserted = 0;
    let membersInserted = 0;

    // Get all MPs for ID mapping
    const allMps = await db.select().from(mps);
    console.log(`[Committees] Found ${allMps.length} MPs in database.`);

    // Create mapping from Seimas ID to our MP ID
    const seimasIdToMpId = new Map<string, number>();
    for (const mp of allMps) {
      seimasIdToMpId.set(mp.seimasId, mp.id);
    }

    // Process each committee
    for (const committeeXML of committeesArray) {
      try {
        const committeeNameRaw = committeeXML["@_padalinio_pavadinimas"];
        const seimasCommitteeId = committeeXML["@_padalinio_id"];
        const memberCount = parseInt(
          committeeXML["@_padalinio_narių_skaičius"] || "0"
        );

        const committeeName = sanitizeString(committeeNameRaw);
        if (!committeeName) {
          console.warn(
            `[Committees] Skipping unnamed committee (ID: ${seimasCommitteeId})`
          );
          continue;
        }

        // Validate
        const validation = validateData(committeeInsertSchema, {
          name: committeeName,
        });
        if (!validation.success && validation.errors) {
          console.warn(
            `[Committees] Validation warning for committee ${committeeName}: ${formatValidationErrors(validation.errors)}`
          );
        }

        console.log(
          `\n[Committees] Processing: ${committeeName} (${memberCount} members)`
        );

        // Insert or update committee
        const [committee] = await db
          .insert(committees)
          .values({
            name: committeeName,
            description: `Seimas committee ID: ${seimasCommitteeId}`,
          })
          .onConflictDoNothing()
          .returning();

        let committeeId: number;

        if (committee) {
          committeeId = committee.id;
          committeesInserted++;
          console.log(`  - Created committee ID: ${committeeId}`);
        } else {
          // Committee already exists, get its ID
          const existing = await db
            .select()
            .from(committees)
            .where(eq(committees.name, committeeName))
            .limit(1);

          if (existing.length === 0) {
            console.error(
              `  - ERROR: Could not find or create committee: ${committeeName}`
            );
            continue;
          }

          committeeId = existing[0].id;
          console.log(`  - Using existing committee ID: ${committeeId}`);
        }

        // Delete existing members for this committee (to refresh the data)
        await db
          .delete(committeeMembers)
          .where(eq(committeeMembers.committeeId, committeeId));

        // Process members
        const membersData = committeeXML.SeimoKomitetoNarys;
        const membersArray = Array.isArray(membersData)
          ? membersData
          : membersData
            ? [membersData]
            : [];

        console.log(`  - Processing ${membersArray.length} members...`);

        let localMembersInserted = 0;
        let notFoundCount = 0;

        for (const memberXML of membersArray) {
          const seimasMpId = memberXML["@_asmens_id"];
          const firstName = memberXML["@_vardas"];
          const lastName = memberXML["@_pavardė"];
          const role = memberXML["@_pareigos"];

          // Find MP by Seimas ID
          const mpId = seimasIdToMpId.get(seimasMpId);

          if (!mpId) {
            console.warn(
              `    - WARNING: MP not found: ${firstName} ${lastName} (Seimas ID: ${seimasMpId})`
            );
            notFoundCount++;
            continue;
          }

          // Insert member
          await db.insert(committeeMembers).values({
            committeeId: committeeId,
            mpId: mpId,
            role: role,
            joinedAt: new Date(),
          });

          localMembersInserted++;
          membersInserted++;
        }

        console.log(
          `  - Inserted ${localMembersInserted} members${notFoundCount > 0 ? ` (${notFoundCount} not found)` : ""}`
        );
      } catch (err) {
        logError(err, "Process Committee");
      }
    }

    console.log("\n[Committees] ✅ Sync completed successfully!");
    console.log(
      `  - Total committees: ${committeesInserted} new, ${committeesArray.length - committeesInserted} existing`
    );
    console.log(`  - Total members: ${membersInserted}`);

    // Show summary
    const [totalCommitteesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(committees);
    const [totalMembersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(committeeMembers);

    console.log("\n[Committees] Database Statistics:");
    console.log(`  - Total committees in DB: ${totalCommitteesResult.count}`);
    console.log(
      `  - Total committee members in DB: ${totalMembersResult.count}`
    );
  } catch (error) {
    logError(error, "Sync Committees Main");
    // Only rethrow if distinct from logged errors or if we want to crash the process
    // throw error;
  } finally {
    await client.end();
  }
}

syncCommittees().catch(console.error);
