import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { getDb } from "../server/db";
import { sessionVotes, sessionMpVotes, mps } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import {
  validateSessionVote,
  validateSessionMpVote,
  sessionVoteSchema,
  sessionMpVoteSchema,
} from "../server/schemas/session-votes.schema";
import { ZodError } from "zod";

dotenv.config();

/**
 * Official LRS Open Data API for Voting Results
 * Documentation: https://www.lrs.lt/sip/portal.show?p_r=35391&p_k=1
 */

async function scrapeVotesFromAPI() {
  console.log(
    "[API] Starting vote scrape using official LRS Open Data APIs..."
  );

  const db = await getDb();
  if (!db) {
    console.error("[API] Database connection failed!");
    return;
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const termId = 10; // 2024-2028 kadencija

  // Load MPs for mapping
  const allMps = await db.select().from(mps);
  const mpMap = new Map<string, number>();
  for (const mp of allMps) {
    mpMap.set(mp.seimasId, mp.id);
  }
  console.log(`[API] Loaded ${allMps.length} MPs for ID mapping.`);
  // Step 1: Get latest session
  console.log("[API] Fetching sessions...");
  const sessionsRes = await axios.get(
    `https://apps.lrs.lt/sip/p2b.ad_seimo_sesijos?kadencijos_id=${termId}`
  );
  const sessionsData = parser.parse(sessionsRes.data);
  let sessions = sessionsData.SeimoInformacija.SeimoKadencija.SeimoSesija;
  if (!Array.isArray(sessions)) sessions = [sessions];

  // Sort by session ID descending to get the latest sessions
  sessions.sort(
    (a: any, b: any) =>
      parseInt(b["@_sesijos_id"]) - parseInt(a["@_sesijos_id"])
  );

  // Prefer regular sessions (eilinė) over extraordinary (neeilinė)
  const regularSessions = sessions.filter(
    (s: any) =>
      s["@_pavadinimas"].includes("eilinė") &&
      !s["@_pavadinimas"].includes("neeilinė")
  );
  const latestSession =
    regularSessions.length > 0 ? regularSessions[0] : sessions[0];

  console.log(
    `[API] Using session: ${latestSession["@_pavadinimas"]} (ID: ${latestSession["@_sesijos_id"]})`
  );
  console.log(
    `[API] Session period: ${latestSession["@_data_nuo"]} to ${latestSession["@_data_iki"]}`
  );

  // Step 2: Get sittings for this session
  console.log("[API] Fetching sittings...");
  const sittingsRes = await axios.get(
    `https://apps.lrs.lt/sip/p2b.ad_seimo_posedziai?sesijos_id=${latestSession["@_sesijos_id"]}`
  );
  const sittingsData = parser.parse(sittingsRes.data);
  let sittings = sittingsData.SeimoInformacija.SeimoSesija.SeimoPosėdis;
  if (!Array.isArray(sittings)) sittings = [sittings];

  // Sort sittings by date descending (newest first)
  sittings.sort((a: any, b: any) => {
    const dateA = new Date(a["@_pradžia"] || "1900-01-01");
    const dateB = new Date(b["@_pradžia"] || "1900-01-01");
    return dateB.getTime() - dateA.getTime();
  });

  console.log(`[API] Found ${sittings.length} sittings.`);
  if (sittings.length > 0) {
    console.log(
      `[API] Most recent sitting: ${sittings[0]["@_pradžia"]}, oldest: ${sittings[sittings.length - 1]["@_pradžia"]}`
    );
  }

  let totalVotes = 0;
  let totalInserted = 0;

  // Process latest 10 sittings (newest first)
  for (const sitting of sittings.slice(0, 10)) {
    const sittingId = sitting["@_posėdžio_id"];
    const sittingNum = sitting["@_numeris"];
    console.log(
      `\n[API] Processing Sitting #${sittingNum} (ID: ${sittingId})...`
    );

    try {
      // Step 3: Get FULL sitting progress (this contains voting IDs!)
      const progressRes = await axios.get(
        `https://apps.lrs.lt/sip/p2b.ad_seimo_posedzio_eiga_full?posedzio_id=${sittingId}`
      );
      const progressData = parser.parse(progressRes.data);

      // Navigate to voting data - note: this endpoint has a different structure!
      if (!progressData.posedziai || !progressData.posedziai.posedis) {
        console.log(`[API] No progress data for sitting ${sittingNum}`);
        continue;
      }

      const posedis = progressData.posedziai.posedis;
      if (!posedis["posedzio-eiga"]) {
        console.log(`[API] No posedzio-eiga for sitting ${sittingNum}`);
        continue;
      }

      let darbotvarke =
        posedis["posedzio-eiga"]["darbotvarkes-klausimas"] || [];
      if (!Array.isArray(darbotvarke)) darbotvarke = [darbotvarke];

      console.log(
        `[API] Found ${darbotvarke.length} agenda items in sitting ${sittingNum}`
      );

      // Step 4: Extract votes from each agenda item
      for (const item of darbotvarke) {
        // Check if there are balsavimai (votes) in this item
        if (!item.balsavimai || !item.balsavimai.balsavimas) continue;

        let votes = item.balsavimai.balsavimas;
        if (!Array.isArray(votes)) votes = [votes];

        for (const vote of votes) {
          const voteId = vote["@_bals_id"];
          if (!voteId) continue;

          console.log(`  [API] Found vote ID: ${voteId}`);
          totalVotes++;

          try {
            // Step 5: Fetch detailed voting results
            const voteRes = await axios.get(
              `https://apps.lrs.lt/sip/p2b.ad_sp_balsavimo_rezultatai?balsavimo_id=${voteId}`
            );
            const voteData = parser.parse(voteRes.data);

            const balsavimas = voteData.SeimoInformacija?.SeimoNariųBalsavimas;
            if (!balsavimas) {
              console.log(`    Skipping vote ${voteId} - no data`);
              continue;
            }

            const results = balsavimas.BendriBalsavimoRezultatai;
            if (!results) {
              console.log(`    Skipping vote ${voteId} - no results`);
              continue;
            }

            const questionText = item.pavadinimas || "Unknown question";
            const voteDate = sitting["@_pradžia"]?.split(" ")[0] || "";
            const voteTime = results["@_balsavimo_laikas"] || "";

            // Results
            const totalVoted = parseInt(results["@_balsavo"] || "0");
            const votedFor = parseInt(results["@_už"] || "0");
            const votedAgainst = parseInt(results["@_prieš"] || "0");
            const abstained = parseInt(results["@_susilaikė"] || "0");
            const comment = results["@_komentaras"] || "";

            console.log(`    Question: ${questionText.substring(0, 60)}...`);
            console.log(
              `    Results: For: ${votedFor}, Against: ${votedAgainst}, Abstained: ${abstained}`
            );

            // Insert into database using upsert (skip if tables don't exist yet)
            try {
              // CRITICAL: Validate data structure before DB insertion
              // This prevents corrupting the database if Seimas API changes format
              const votePayload = {
                seimasVoteId: String(voteId),
                sittingId: String(sittingId),
                sessionId: String(latestSession["@_sesijos_id"]),
                question: questionText,
                voteDate: new Date(voteDate),
                voteTime: voteTime || null,
                votedFor: votedFor,
                votedAgainst: votedAgainst,
                abstained: abstained,
                totalVoted: totalVoted,
                comment: comment || null,
              };

              // Validate against schema - throws ZodError with descriptive message
              let validatedVote;
              try {
                validatedVote = validateSessionVote(votePayload);
              } catch (validationError) {
                if (validationError instanceof ZodError) {
                  console.error(`    ❌ VALIDATION FAILED for vote ${voteId}:`);
                  console.error(`    Seimas API data format may have changed!`);
                  console.error(
                    `    Details: ${validationError.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
                  );
                  console.error(
                    `    Raw data:`,
                    JSON.stringify(votePayload, null, 2)
                  );
                  // Skip this vote but continue processing others
                  continue;
                }
                throw validationError; // Re-throw non-Zod errors
              }

              const inserted = await db
                .insert(sessionVotes)
                .values(validatedVote)
                .onConflictDoUpdate({
                  target: sessionVotes.seimasVoteId,
                  set: {
                    votedFor: votedFor,
                    votedAgainst: votedAgainst,
                    abstained: abstained,
                    totalVoted: totalVoted,
                    comment: comment || null,
                    updatedAt: new Date(),
                  },
                })
                .returning({ id: sessionVotes.id });

              if (inserted && inserted[0]) {
                totalInserted++;
                const sessionVoteId = inserted[0].id;
                console.log(`    ✅ Saved to database (ID: ${sessionVoteId})`);

                // Process Individual Votes
                let individualVotes =
                  balsavimas.IndividualusBalsavimoRezultatas;
                if (individualVotes) {
                  if (!Array.isArray(individualVotes))
                    individualVotes = [individualVotes];

                  // Delete existing (clean slate for this vote)
                  await db
                    .delete(sessionMpVotes)
                    .where(eq(sessionMpVotes.sessionVoteId, sessionVoteId));

                  const mpVotesToInsert = [];
                  for (const v of individualVotes) {
                    const seimasMpId = v["@_asmens_id"];
                    const voteVal = v["@_kaip_balsavo"];
                    const mpId = mpMap.get(seimasMpId);

                    if (mpId && voteVal) {
                      mpVotesToInsert.push({
                        sessionVoteId,
                        mpId,
                        seimasMpId,
                        voteValue: voteVal,
                      });
                    }
                  }
                  if (mpVotesToInsert.length > 0) {
                    try {
                      await db.insert(sessionMpVotes).values(mpVotesToInsert);
                      console.log(
                        `      - Saved ${mpVotesToInsert.length} MP votes`
                      );
                    } catch (err: any) {
                      console.error(
                        `      ❌ Error saving MP votes: ${err.message}`
                      );
                    }
                  }
                }
              }
            } catch (dbErr: any) {
              // Table might not exist yet - that's OK for now
              if (
                dbErr.message.includes("relation") ||
                dbErr.message.includes("does not exist")
              ) {
                console.log(
                  `    ⚠️  Table not created yet - skipping database save`
                );
              } else {
                console.error(
                  `    ❌ Database error for vote ${voteId}:`,
                  dbErr.message
                );
              }
            }
          } catch (voteErr: any) {
            console.error(
              `    Error fetching vote ${voteId}:`,
              voteErr.message
            );
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (err: any) {
      console.error(
        `[API] Error processing sitting ${sittingNum}:`,
        err.message
      );
    }
  }

  console.log(
    `\n[API] ✅ Complete! Processed ${totalVotes} votes, inserted/updated ${totalInserted} in database.`
  );
}

scrapeVotesFromAPI().catch(console.error);
