import { Worker, Job } from "bullmq";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import {
  sessionVotes,
  sessionMpVotes,
  mps,
  systemStatus,
} from "../../drizzle/schema";
import * as schema from "../../drizzle/schema";
import { getRedisConnection } from "../lib/redis";
import { logger } from "../utils/logger";
import { validateSessionVote } from "../schemas/session-votes.schema";
import { ZodError } from "zod";
import dotenv from "dotenv";
import { ScrapeVotesJobData } from "../lib/queue";
import * as Sentry from "@sentry/node";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

/**
 * Job Queue Worker for Scraping Votes
 *
 * Processes 'scrape:votes' jobs from the queue.
 * Scrapes voting data from the LRS Open Data API.
 */

async function updateSystemStatus(
  db: any,
  jobName: string,
  status: "success" | "failed" | "partial",
  recordsProcessed: number = 0,
  recordsFailed: number = 0,
  error?: string
) {
  try {
    const now = new Date();
    await db
      .insert(systemStatus)
      .values({
        jobName,
        lastSuccessfulRun: status === "success" ? now : null,
        lastRunStatus: status,
        lastRunError: error || null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: systemStatus.jobName,
        set: {
          ...(status === "success" ? { lastSuccessfulRun: now } : {}),
          lastRunStatus: status,
          lastRunError: error || null,
          updatedAt: now,
        },
      });
  } catch (err: any) {
    logger.error({ err, jobName }, "Failed to update system status");
  }
}

async function scrapeVotes(
  job: Job<ScrapeVotesJobData>
): Promise<{ processed: number; failed: number }> {
  const { sessionId: targetSessionId } = job.data;
  logger.info(
    { jobId: job.id, targetSessionId },
    "[Worker] Starting vote scrape job"
  );

  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  try {
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
    logger.info(`[Worker] Loaded ${allMps.length} MPs for ID mapping.`);

    // Step 1: Get latest session
    logger.info("[Worker] Fetching sessions...");
    const sessionsRes = await axios.get(
      `https://apps.lrs.lt/sip/p2b.ad_seimo_sesijos?kadencijos_id=${termId}`
    );
    const sessionsData = parser.parse(sessionsRes.data);
    let sessions = sessionsData.SeimoInformacija?.SeimoKadencija?.SeimoSesija;

    if (!sessions) {
      throw new Error("No session data found from API");
    }

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

    // If specific session requested, use that, otherwise use latest
    const sessionToUse = targetSessionId
      ? sessions.find((s: any) => s["@_sesijos_id"] === targetSessionId) ||
        latestSession
      : latestSession;

    logger.info(
      `[Worker] Using session: ${sessionToUse["@_pavadinimas"]} (ID: ${sessionToUse["@_sesijos_id"]})`
    );

    // Step 2: Get sittings for this session
    logger.info("[Worker] Fetching sittings...");
    const sittingsRes = await axios.get(
      `https://apps.lrs.lt/sip/p2b.ad_seimo_posedziai?sesijos_id=${sessionToUse["@_sesijos_id"]}`
    );
    const sittingsData = parser.parse(sittingsRes.data);
    let sittings =
      sittingsData.SeimoInformacija?.SeimoSesija?.SeimoPosėdis || [];
    if (!Array.isArray(sittings)) sittings = [sittings];

    // Sort sittings by date descending (newest first)
    sittings.sort((a: any, b: any) => {
      const dateA = new Date(a["@_pradžia"] || "1900-01-01");
      const dateB = new Date(b["@_pradžia"] || "1900-01-01");
      return dateB.getTime() - dateA.getTime();
    });

    logger.info(`[Worker] Found ${sittings.length} sittings.`);

    let totalVotes = 0;
    let totalInserted = 0;
    let totalFailed = 0;

    // Process latest 10 sittings (newest first)
    const sittingsToProcess = sittings.slice(0, 10);
    const totalSittings = sittingsToProcess.length;

    for (let i = 0; i < totalSittings; i++) {
      const sitting = sittingsToProcess[i];
      const sittingId = sitting["@_posėdžio_id"];
      const sittingNum = sitting["@_numeris"];

      logger.info(
        `[Worker] Processing Sitting #${sittingNum} (ID: ${sittingId})...`
      );

      // Internal job progress update
      await job.updateProgress((i / totalSittings) * 100);

      try {
        // Step 3: Get FULL sitting progress
        const progressRes = await axios.get(
          `https://apps.lrs.lt/sip/p2b.ad_seimo_posedzio_eiga_full?posedzio_id=${sittingId}`
        );
        const progressData = parser.parse(progressRes.data);

        if (!progressData.posedziai || !progressData.posedziai.posedis) {
          logger.info(`[Worker] No progress data for sitting ${sittingNum}`);
          continue;
        }

        const posedis = progressData.posedziai.posedis;
        if (!posedis["posedzio-eiga"]) {
          logger.info(`[Worker] No posedzio-eiga for sitting ${sittingNum}`);
          continue;
        }

        let darbotvarke =
          posedis["posedzio-eiga"]["darbotvarkes-klausimas"] || [];
        if (!Array.isArray(darbotvarke)) darbotvarke = [darbotvarke];

        // Step 4: Extract votes from each agenda item
        for (const item of darbotvarke) {
          if (!item.balsavimai || !item.balsavimai.balsavimas) continue;

          let votes = item.balsavimai.balsavimas;
          if (!Array.isArray(votes)) votes = [votes];

          for (const vote of votes) {
            const voteId = vote["@_bals_id"];
            if (!voteId) continue;

            totalVotes++;

            try {
              // Step 5: Fetch detailed voting results
              const voteRes = await axios.get(
                `https://apps.lrs.lt/sip/p2b.ad_sp_balsavimo_rezultatai?balsavimo_id=${voteId}`
              );
              const voteData = parser.parse(voteRes.data);

              const balsavimas =
                voteData.SeimoInformacija?.SeimoNariųBalsavimas;
              if (!balsavimas) {
                continue;
              }

              const results = balsavimas.BendriBalsavimoRezultatai;
              if (!results) {
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

              // Upsert to database
              const votePayload = {
                seimasVoteId: String(voteId),
                sittingId: String(sittingId),
                sessionId: String(sessionToUse["@_sesijos_id"]),
                question: questionText,
                voteDate: new Date(voteDate),
                voteTime: voteTime || null,
                votedFor: votedFor,
                votedAgainst: votedAgainst,
                abstained: abstained,
                totalVoted: totalVoted,
                comment: comment || null,
              };

              // Validate
              const validatedVote = validateSessionVote(votePayload);

              // Use transaction
              await db.transaction(async tx => {
                const inserted = await tx
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

                  // Process Individual Votes
                  let individualVotes =
                    balsavimas.IndividualusBalsavimoRezultatas;
                  if (individualVotes) {
                    if (!Array.isArray(individualVotes))
                      individualVotes = [individualVotes];

                    // Clean existing votes for this sessionVoteId
                    await tx
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
                      await tx.insert(sessionMpVotes).values(mpVotesToInsert);
                    }
                  }
                }
              });
            } catch (err: any) {
              if (err instanceof ZodError) {
                logger.warn(
                  { voteId, issues: err.issues },
                  "[Worker] Validation failed"
                );
              } else {
                logger.error(
                  { err, voteId },
                  "[Worker] Failed to process vote"
                );
              }
              totalFailed++;
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } catch (err) {
        logger.error({ err, sittingId }, "[Worker] Error processing sitting");
      }
    }

    const status =
      totalFailed > 0 && totalInserted > 0
        ? "partial"
        : totalInserted > 0
          ? "success"
          : "failed";
    await updateSystemStatus(
      db,
      "votes_sync",
      status,
      totalInserted,
      totalFailed
    );

    logger.info(
      { jobId: job.id, totalVotes, totalInserted, totalFailed },
      "[Worker] Vote scrape completed"
    );

    await client.end();
    return { processed: totalInserted, failed: totalFailed };
  } catch (error) {
    await updateSystemStatus(db, "votes_sync", "failed", 0, 0, String(error));
    logger.error(
      { jobId: job.id, err: error },
      "[Worker] Vote scrape job failed"
    );
    await client.end();
    throw error;
  }
}

/**
 * Create and start the vote scraper worker
 */
export function startVoteScraperWorker(): Worker {
  const redis = getRedisConnection();

  const worker = new Worker<ScrapeVotesJobData>(
    "scrape:votes",
    async job => {
      return await scrapeVotes(job);
    },
    {
      connection: redis as any,
      concurrency: 1, // Process one job at a time
      removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
        age: 24 * 3600, // Keep for 24 hours
      },
      removeOnFail: {
        count: 500, // Keep last 500 failed jobs
        age: 7 * 24 * 3600, // Keep for a week
      },
    }
  );

  worker.on("completed", job => {
    logger.info(
      { jobId: job?.id, result: job?.returnvalue },
      "[Worker:Votes] Job completed"
    );
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "[Worker:Votes] Job failed");

    // Send to Sentry as DLQ alert if job exhausted all retries
    if (job && job.attemptsMade >= 5) {
      Sentry.captureException(
        new Error(`[DLQ] Votes scrape job exhausted retries: ${job.name}`),
        {
          extra: {
            jobId: job.id,
            data: job.data,
            attempts: job.attemptsMade,
            error: err instanceof Error ? err.message : String(err),
          },
        }
      );
      logger.error(
        { jobId: job.id, attempts: job.attemptsMade },
        "[DLQ] Job moved to dead letter - manual intervention required"
      );
    }
  });

  worker.on("error", err => {
    logger.error({ err }, "[Worker:Votes] Worker error");
  });

  logger.info("Vote Scraper worker started for queue 'scrape:votes'");

  return worker;
}

/**
 * Gracefully shutdown worker
 */
export async function shutdownWorker(worker: Worker): Promise<void> {
  logger.info("Shutting down vote scraper worker...");
  await worker.close();
  logger.info("Vote scraper worker shutdown complete");
}
