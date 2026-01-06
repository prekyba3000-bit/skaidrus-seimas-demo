import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql, and, count } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import {
  mps,
  mpStats,
  sessionMpVotes,
  sessionVotes,
  votes,
  bills,
  billSponsors,
} from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

/**
 * Calculate accountability scores for all MPs based on real data
 *
 * Accountability Score Formula (0-100):
 * - Voting Attendance: 40% (how often they participate in votes)
 * - Party Loyalty: 20% (how often they vote with their party - inverted so independence is rewarded)
 * - Legislative Activity: 30% (bills proposed and passed)
 * - Consistency: 10% (avoiding flip-flopping or unexplained absences)
 */

async function calculateAccountabilityScores() {
  console.log("[Accountability] Starting accountability score calculation...");

  try {
    // Get all active MPs and their current loyalty stats
    const allMps = await db
      .select({
        mp: mps,
        loyalty: mpStats.partyLoyalty,
      })
      .from(mps)
      .leftJoin(mpStats, eq(mps.id, mpStats.mpId))
      .where(eq(mps.isActive, true));

    console.log(`[Accountability] Found ${allMps.length} active MPs.`);

    // Count total session votes available
    const [totalSessionVotesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessionVotes);
    const totalSessionVotesAvailable = Number(totalSessionVotesResult.count);
    console.log(
      `[Accountability] Total session votes in database: ${totalSessionVotesAvailable}`
    );

    // Count total bills
    const [totalBillsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bills);
    const totalBills = Number(totalBillsResult.count);
    console.log(`[Accountability] Total bills in database: ${totalBills}`);

    let updatedCount = 0;

    for (const record of allMps) {
      const { mp, loyalty } = record;
      console.log(`\n[Accountability] Processing MP: ${mp.name} (${mp.party})`);

      // 1. Calculate Voting Attendance from sessionMpVotes
      const [sessionVoteStats] = await db
        .select({
          totalVotes: sql<number>`count(*)`,
          votedFor: sql<number>`sum(case when ${sessionMpVotes.voteValue} = 'Už' then 1 else 0 end)`,
          votedAgainst: sql<number>`sum(case when ${sessionMpVotes.voteValue} = 'Prieš' then 1 else 0 end)`,
          abstained: sql<number>`sum(case when ${sessionMpVotes.voteValue} = 'Susilaikė' then 1 else 0 end)`,
          absent: sql<number>`sum(case when ${sessionMpVotes.voteValue} = 'Nedalyvavo' or ${sessionMpVotes.voteValue} = 'Nebalsavo' then 1 else 0 end)`,
        })
        .from(sessionMpVotes)
        .where(eq(sessionMpVotes.mpId, mp.id));

      const totalVotesParticipated = Number(sessionVoteStats.totalVotes || 0);
      const actuallyVoted =
        Number(sessionVoteStats.votedFor || 0) +
        Number(sessionVoteStats.votedAgainst || 0) +
        Number(sessionVoteStats.abstained || 0);
      const absentCount = Number(sessionVoteStats.absent || 0);

      // Voting attendance: (votes participated / total available) * 100
      const votingAttendance =
        totalSessionVotesAvailable > 0
          ? Math.min(
              100,
              (totalVotesParticipated / totalSessionVotesAvailable) * 100
            )
          : 0;

      console.log(
        `  - Session votes: ${totalVotesParticipated}/${totalSessionVotesAvailable}`
      );
      console.log(
        `  - Actually voted: ${actuallyVoted}, Absent: ${absentCount}`
      );
      console.log(`  - Voting Attendance: ${votingAttendance.toFixed(2)}%`);

      // 2. Calculate Bills Proposed and Passed
      const [billsProposedResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(billSponsors)
        .where(eq(billSponsors.mpId, mp.id));

      const billsProposed = Number(billsProposedResult.count || 0);

      const [billsPassedResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(billSponsors)
        .leftJoin(bills, eq(billSponsors.billId, bills.id))
        .where(and(eq(billSponsors.mpId, mp.id), eq(bills.status, "passed")));

      const billsPassed = Number(billsPassedResult.count || 0);

      console.log(`  - Bills Proposed: ${billsProposed}`);
      console.log(`  - Bills Passed: ${billsPassed}`);

      // 3. Get Party Loyalty (from DB or default)
      const partyLoyalty = loyalty ? parseFloat(loyalty) : 70.0;
      console.log(`  - Party Loyalty: ${partyLoyalty.toFixed(2)}%`);

      // 4. Calculate Accountability Score
      // Formula weights:
      // - Voting Attendance: 40%
      // - Legislative Activity (bills): 30%
      // - Party Independence (100 - loyalty): 20%
      // - Consistency: 10%

      const attendanceScore = votingAttendance * 0.4;

      // Legislative activity: normalized based on average
      // If average is 3 bills, 3+ bills = 100%, 0 bills = 0%
      const avgBillsPerMp = 3;
      const legislativeActivity = Math.min(
        100,
        (billsProposed / avgBillsPerMp) * 100
      );
      const legislativeScore = legislativeActivity * 0.3;

      // Party independence (inverse of loyalty)
      const independence = Math.max(0, 100 - partyLoyalty);
      const independenceScore = independence * 0.2;

      // Consistency score (placeholder)
      const consistencyScore = 100 * 0.1;

      const accountabilityScore =
        attendanceScore +
        legislativeScore +
        independenceScore +
        consistencyScore;

      console.log(`  - Attendance Score (40%): ${attendanceScore.toFixed(2)}`);
      console.log(
        `  - Legislative Score (30%): ${legislativeScore.toFixed(2)}`
      );
      console.log(
        `  - Independence Score (20%): ${independenceScore.toFixed(2)}`
      );
      console.log(
        `  - Consistency Score (10%): ${consistencyScore.toFixed(2)}`
      );
      console.log(
        `  - FINAL ACCOUNTABILITY SCORE: ${accountabilityScore.toFixed(2)}`
      );

      // 5. Upsert MP Stats
      await db
        .insert(mpStats)
        .values({
          mpId: mp.id,
          votingAttendance: votingAttendance.toFixed(2),
          partyLoyalty: partyLoyalty.toFixed(2),
          billsProposed: billsProposed,
          billsPassed: billsPassed,
          accountabilityScore: accountabilityScore.toFixed(2),
          lastCalculated: new Date(),
        })
        .onConflictDoUpdate({
          target: mpStats.mpId,
          set: {
            votingAttendance: votingAttendance.toFixed(2),
            partyLoyalty: partyLoyalty.toFixed(2),
            billsProposed: billsProposed,
            billsPassed: billsPassed,
            accountabilityScore: accountabilityScore.toFixed(2),
            lastCalculated: new Date(),
          },
        });

      updatedCount++;
    }

    console.log(
      `\n[Accountability] ✅ Successfully calculated scores for ${updatedCount} MPs.`
    );

    // Show summary statistics
    const [avgStats] = await db
      .select({
        avgAttendance: sql<string>`avg(voting_attendance)`,
        avgAccountability: sql<string>`avg(accountability_score)`,
        maxAccountability: sql<string>`max(accountability_score)`,
        minAccountability: sql<string>`min(accountability_score)`,
      })
      .from(mpStats);

    console.log("\n[Accountability] Summary Statistics:");
    console.log(
      `  - Average Attendance: ${parseFloat(avgStats.avgAttendance || "0").toFixed(2)}%`
    );
    console.log(
      `  - Average Accountability: ${parseFloat(avgStats.avgAccountability || "0").toFixed(2)}`
    );
    console.log(
      `  - Highest Accountability: ${parseFloat(avgStats.maxAccountability || "0").toFixed(2)}`
    );
    console.log(
      `  - Lowest Accountability: ${parseFloat(avgStats.minAccountability || "0").toFixed(2)}`
    );
  } catch (error) {
    console.error("[Accountability] Error calculating scores:", error);
    throw error;
  } finally {
    await client.end();
  }
}

calculateAccountabilityScores().catch(console.error);
