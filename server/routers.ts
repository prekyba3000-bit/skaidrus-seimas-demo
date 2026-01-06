import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Data Status
  dataStatus: publicProcedure.query(async () => {
    return await db.getDataFreshness();
  }),

  // MPs router
  mps: router({
    list: publicProcedure
      .input(
        z
          .object({
            party: z.string().optional(),
            isActive: z.boolean().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return await db.getAllMps(input);
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const mp = await db.getMpById(input.id);
        if (!mp) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `MP with ID ${input.id} not found`,
          });
        }
        const assistants = await db.getAssistantsByMpId(input.id);
        const trips = await db.getTripsByMpId(input.id);
        return { ...mp, assistants, trips };
      }),

    search: publicProcedure
      .input(z.object({ term: z.string() }))
      .query(async ({ input }) => {
        return await db.searchMps(input.term);
      }),

    stats: publicProcedure
      .input(z.object({ mpId: z.number() }))
      .query(async ({ input }) => {
        const stats = await db.getMpStats(input.mpId);
        // It's okay if stats don't exist yet, return null or default?
        // Current frontend handles null, so we pass it through.
        return stats;
      }),

    globalStats: publicProcedure.query(async () => {
      return await db.getGlobalStats();
    }),

    activityPulse: publicProcedure
      .output(
        z.array(
          z.object({
            date: z.string(),
            count: z.number(),
          })
        )
      )
      .query(async () => {
        return await db.getActivityPulse();
      }),

    compare: publicProcedure
      .input(z.object({ mpId1: z.number(), mpId2: z.number() }))
      .query(async ({ input }) => {
        return await db.getMpComparison(input.mpId1, input.mpId2);
      }),

    trips: publicProcedure.query(async () => {
      return await db.getAllTrips();
    }),
  }),

  // Bills router
  bills: router({
    list: publicProcedure
      .input(
        z
          .object({
            status: z.string().optional(),
            category: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return await db.getAllBills(input);
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const bill = await db.getBillById(input.id);
        if (!bill) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Bill with ID ${input.id} not found`,
          });
        }
        return bill;
      }),

    sponsors: publicProcedure
      .input(z.object({ billId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBillSponsors(input.billId);
      }),

    summary: publicProcedure
      .input(z.object({ billId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBillSummary(input.billId);
      }),
  }),

  // Votes router
  votes: router({
    byMp: publicProcedure
      .input(
        z.object({
          mpId: z.number(),
          limit: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return await db.getVotesByMpId(input.mpId, input.limit);
      }),

    byBill: publicProcedure
      .input(z.object({ billId: z.number() }))
      .query(async ({ input }) => {
        return await db.getVotesByBillId(input.billId);
      }),
  }),

  // Quiz router
  quiz: router({
    questions: publicProcedure.query(async () => {
      return await db.getAllQuizQuestions();
    }),

    mpAnswers: publicProcedure
      .input(z.object({ mpId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuizAnswersByMpId(input.mpId);
      }),

    saveResult: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          questionId: z.number(),
          userAnswer: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await db.saveUserQuizResult(input);
        return { success: true };
      }),

    results: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        return await db.getUserQuizResults(input.sessionId);
      }),
  }),

  // Committees router
  committees: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCommittees();
    }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const committee = await db.getCommitteeById(input.id);
        if (!committee) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Committee with ID ${input.id} not found`,
          });
        }
        return committee;
      }),
    members: publicProcedure
      .input(z.object({ committeeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCommitteeMembers(input.committeeId);
      }),
  }),

  // Accountability Flags router
  flags: router({
    byMp: publicProcedure
      .input(z.object({ mpId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFlagsByMpId(input.mpId);
      }),
    create: publicProcedure
      .input(
        z.object({
          mpId: z.number(),
          flagType: z.string(),
          severity: z.string(),
          title: z.string(),
          description: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createAccountabilityFlag({ ...input, resolved: false });
      }),
    resolve: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.resolveAccountabilityFlag(input.id);
      }),
  }),

  // User Follows router
  follows: router({
    list: publicProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await db.getUserFollows(input.userId);
      }),
    follow: publicProcedure
      .input(
        z.object({
          userId: z.string(),
          mpId: z.number().optional(),
          billId: z.number().optional(),
          topic: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.followEntity(input);
      }),
    unfollow: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.unfollowEntity(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
