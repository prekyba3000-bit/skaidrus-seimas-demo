import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import {
  mps,
  mpStats,
  sessionMpVotes,
  accountabilityFlags,
} from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

// Vote values mapping
const VOTE_VALUES = {
  FOR: "Už",
  AGAINST: "Prieš",
  ABSTAIN: "Susilaikė",
  ABSENT: "Nedalyvavo",
  DID_NOT_VOTE: "Nebalsavo",
};

interface PartyVoteStats {
  for: number;
  against: number;
  abstain: number;
  total: number;
}

async function analyzeVotingPatterns() {
  console.log("[Analysis] Starting voting pattern analysis...");

  try {
    // 1. Fetch all votes with MP and Party info
    // We need: voteId, mpId, party, voteValue
    console.log("[Analysis] Fetching all vote records...");
    const allVotes = await db
      .select({
        voteId: sessionMpVotes.sessionVoteId,
        mpId: sessionMpVotes.mpId,
        party: mps.party,
        voteValue: sessionMpVotes.voteValue,
        mpName: mps.name,
      })
      .from(sessionMpVotes)
      .innerJoin(mps, eq(sessionMpVotes.mpId, mps.id));

    console.log(`[Analysis] Processing ${allVotes.length} individual votes...`);

    if (allVotes.length === 0) {
      console.log("[Analysis] No votes found. Exiting.");
      return;
    }

    // 2. Calculate Party Majority for each Session Vote
    // Map<VoteId, Map<Party, MajorityValue>>
    const partyConsensus = new Map<number, Map<string, string>>();

    // Helper map to group votes by voteId -> party
    const votesBySession = new Map<number, Map<string, string[]>>();

    for (const vote of allVotes) {
      if (!votesBySession.has(vote.voteId)) {
        votesBySession.set(vote.voteId, new Map());
      }
      const sessionMap = votesBySession.get(vote.voteId)!;

      if (!sessionMap.has(vote.party)) {
        sessionMap.set(vote.party, []);
      }
      sessionMap.get(vote.party)!.push(vote.voteValue);
    }

    // Determine consensus
    for (const [voteId, partyMap] of votesBySession.entries()) {
      const consensusMap = new Map<string, string>();

      for (const [party, votes] of partyMap.entries()) {
        let countFor = 0;
        let countAgainst = 0;
        let countAbstain = 0;

        for (const v of votes) {
          if (v === VOTE_VALUES.FOR) countFor++;
          else if (v === VOTE_VALUES.AGAINST) countAgainst++;
          else if (v === VOTE_VALUES.ABSTAIN) countAbstain++;
        }

        const validVotes = countFor + countAgainst + countAbstain;
        if (validVotes === 0) continue; // No active votes from party

        // Simple majority
        if (countFor > countAgainst && countFor > countAbstain) {
          consensusMap.set(party, VOTE_VALUES.FOR);
        } else if (countAgainst > countFor && countAgainst > countAbstain) {
          consensusMap.set(party, VOTE_VALUES.AGAINST);
        } else if (countAbstain > countFor && countAbstain > countAgainst) {
          consensusMap.set(party, VOTE_VALUES.ABSTAIN);
        } else {
          // Split vote or tie - no consensus
          consensusMap.set(party, "SPLIT");
        }
      }
      partyConsensus.set(voteId, consensusMap);
    }

    // 3. Calculate MP Loyalty
    const mpLoyaltyStats = new Map<
      number,
      { loyal: number; rebel: number; total: number; rebelVotes: number[] }
    >();

    for (const vote of allVotes) {
      // Skip if absent or didn't vote
      if (
        vote.voteValue === VOTE_VALUES.ABSENT ||
        vote.voteValue === VOTE_VALUES.DID_NOT_VOTE
      ) {
        continue;
      }

      const consensus = partyConsensus.get(vote.voteId)?.get(vote.party);

      if (!consensus || consensus === "SPLIT") {
        // No party line to rebel against
        continue;
      }

      if (!mpLoyaltyStats.has(vote.mpId)) {
        mpLoyaltyStats.set(vote.mpId, {
          loyal: 0,
          rebel: 0,
          total: 0,
          rebelVotes: [],
        });
      }
      const stats = mpLoyaltyStats.get(vote.mpId)!;
      stats.total++;

      if (vote.voteValue === consensus) {
        stats.loyal++;
      } else {
        stats.rebel++;
        stats.rebelVotes.push(vote.voteId);
      }
    }

    // 4. Update Database
    console.log("[Analysis] Updating MP stats with calculated loyalty...");
    let updatedCount = 0;

    for (const [mpId, stats] of mpLoyaltyStats.entries()) {
      const loyaltyPercentage =
        stats.total > 0 ? (stats.loyal / stats.total) * 100 : 100; // Default to 100 if no controversial votes

      // Update MP Stats
      await db
        .update(mpStats)
        .set({
          partyLoyalty: loyaltyPercentage.toFixed(2),
          lastCalculated: new Date(),
        })
        .where(eq(mpStats.mpId, mpId));

      // Flag rebels?
      // If loyalty < 50%, maybe add a flag
      if (loyaltyPercentage < 50 && stats.total > 10) {
        console.log(
          `  - ⚠️ MP ID ${mpId} has low loyalty: ${loyaltyPercentage.toFixed(2)}%`
        );
        // We could insert into accountabilityFlags here
        await db.insert(accountabilityFlags).values({
          mpId: mpId,
          flagType: "MAVERICK",
          severity: "MEDIUM",
          title: "Partijos maištininkas",
          description: `Šis Seimo narys dažnai balsuoja priešingai nei jo frakcija (${(100 - loyaltyPercentage).toFixed(1)}% atvejų).`,
          detectedAt: new Date(),
        });
      }

      updatedCount++;
    }

    console.log(
      `[Analysis] ✅ Analysis complete. Updated ${updatedCount} MPs.`
    );
  } catch (error) {
    console.error("[Analysis] Error analyzing voting patterns:", error);
  } finally {
    await client.end();
  }
}

analyzeVotingPatterns();
