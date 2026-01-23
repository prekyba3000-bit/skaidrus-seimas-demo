import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../services/database";
import { sessionVotes, sessionMpVotes } from "../../drizzle/schema";
import { and, eq, sql, lt, desc, gte, lte, asc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const seismographRouter = router({
  // Health check for the module
  status: publicProcedure.query(() => {
    return { status: "healthy", timestamp: new Date() };
  }),

  /**
   * getSeismicEvents
   * Fetches "high conflict" votes between two MPs.
   * "Seismic" = Low margin (contested) votes where both MPs participated.
   */
  getSeismicEvents: publicProcedure
    .input(
      z.object({
        mpA: z.number(),
        mpB: z.number(),
        minDate: z.string().datetime().optional(), // Scrubber passes ISO strings
        maxDate: z.string().datetime().optional(),
        limit: z.number().default(20), // Top 20 "Spikes"
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();

      // Aliases for the double join (MP A's vote vs MP B's vote)
      const v1 = alias(sessionMpVotes, "v1");
      const v2 = alias(sessionMpVotes, "v2");

      // Seismic Magnitude = 1 / Margin (Sort by lowest margin = highest conflict)
      // We sort by margin ascending (closest contest) -> effectively sorting by magnitude desc
      // Or we can just calculate margin: abs(for - against)
      const marginExpression = sql`abs(${sessionVotes.votedFor} - ${sessionVotes.votedAgainst})`;

      // Common filters:
      // 1. Both MPs must have voted in this session
      // 2. Margin must be < 80% (Exclude unanimous votes)
      const baseFilters = and(
        // Join MP A
        eq(sessionVotes.id, v1.sessionVoteId),
        eq(v1.mpId, input.mpA),
        // Join MP B
        eq(sessionVotes.id, v2.sessionVoteId),
        eq(v2.mpId, input.mpB),
        // "Seismic" Definition: Contested Votes only
        // Margin < 80% of total votes
        lt(marginExpression, sql`${sessionVotes.totalVoted} * 0.8`)
      );

      // Date filters (if provided via Scrubber)
      const dateFilters = and(
        input.minDate
          ? gte(sessionVotes.voteDate, new Date(input.minDate))
          : undefined,
        input.maxDate
          ? lte(sessionVotes.voteDate, new Date(input.maxDate))
          : undefined
      );

      // 1. Fetch Events (The Spikes)
      const events = await db
        .select({
          id: sessionVotes.id,
          date: sessionVotes.voteDate,
          question: sessionVotes.question, // The "Bill Title" equivalent
          votedFor: sessionVotes.votedFor,
          votedAgainst: sessionVotes.votedAgainst,
          abstain: sessionVotes.abstained,
          totalVoted: sessionVotes.totalVoted,
          mpAVote: v1.voteValue,
          mpBVote: v2.voteValue,
          margin: marginExpression,
        })
        .from(sessionVotes)
        .innerJoin(v1, eq(sessionVotes.id, v1.sessionVoteId))
        .innerJoin(v2, eq(sessionVotes.id, v2.sessionVoteId))
        .where(and(baseFilters, dateFilters))
        .orderBy(asc(marginExpression), desc(sessionVotes.voteDate)) // Lowest margin (Highest Conflict) first
        .limit(input.limit);

      // 2. Fetch Metadata (Min/Max Date, Total Count of Conflicts)
      // This allows the Scrubber to know the full timeline boundaries
      const [meta] = await db
        .select({
          minDate: sql<Date>`min(${sessionVotes.voteDate})`,
          maxDate: sql<Date>`max(${sessionVotes.voteDate})`,
          totalCount: sql<number>`count(*)`,
        })
        .from(sessionVotes)
        .innerJoin(v1, eq(sessionVotes.id, v1.sessionVoteId)) // Must verify they were both present
        .innerJoin(v2, eq(sessionVotes.id, v2.sessionVoteId))
        .where(
          and(
            eq(v1.mpId, input.mpA),
            eq(v2.mpId, input.mpB),
            lt(marginExpression, sql`${sessionVotes.totalVoted} * 0.8`)
          )
        );

      return {
        events: events.map(e => ({
          ...e,
          date: e.date.toISOString(), // Ensure serializable
          margin: Number(e.margin), // Ensure number
        })),
        meta: {
          minDate: meta?.minDate?.toISOString() || null,
          maxDate: meta?.maxDate?.toISOString() || null,
          totalCount: Number(meta?.totalCount || 0),
        },
      };
    }),
});
