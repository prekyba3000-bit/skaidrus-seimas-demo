import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import {
  publicProcedure,
  router,
  protectedProcedure,
  adminProcedure,
} from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./services/database";
import { dashboardRouter } from "./routers/dashboard";
import { schedulerRouter } from "./routers/scheduler";
import { watchlistRouter } from "./routers/watchlist";
import { feedbackRouter } from "./routers/feedback";
import { cache, CacheService } from "./services/cache";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  dashboard: dashboardRouter,
  scheduler: schedulerRouter,
  watchlist: watchlistRouter,
  feedback: feedbackRouter,
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

    topDelegates: publicProcedure
      .input(
        z.object({ limit: z.number().min(1).max(10).default(3) }).optional()
      )
      .query(async ({ input }) => {
        return await db.getTopDelegates(input?.limit);
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        // OPTIMIZED: Fetch MP, assistants, and trips in parallel to eliminate sequential queries
        const [mp, assistants, trips] = await Promise.all([
          db.getMpById(input.id),
          db.getAssistantsByMpId(input.id),
          db.getTripsByMpId(input.id),
        ]);

        if (!mp) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `MP with ID ${input.id} not found`,
          });
        }

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
      .output(
        z.object({
          mp1: z.any(), // MP object with stats
          mp2: z.any(),
          agreementScore: z.number().nullable(),
          commonVotes: z.number(),
          disagreements: z.array(
            z.object({
              billId: z.number(),
              billTitle: z.string(),
              mp1Vote: z.string(),
              mp2Vote: z.string(),
              votedAt: z.date().nullable(),
            })
          ),
          hasOverlap: z.boolean(),
        })
      )
      .query(async ({ input }) => {
        return await db.getMpComparison(input.mpId1, input.mpId2);
      }),

    trips: protectedProcedure.query(async () => {
      // SECURITY: Trips contain travel/expense data - require authentication
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
            limit: z.number().min(1).max(100).optional(),
            cursor: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const result = await db.getAllBills(
          input
            ? { status: input.status, category: input.category }
            : undefined,
          input ? { limit: input.limit, cursor: input.cursor } : undefined
        );
        // Backward compatibility: if no cursor/limit provided, return items array directly
        if (!input?.cursor && !input?.limit) {
          return result.items;
        }
        return result;
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
          limit: z.number().min(1).max(100).optional(),
          cursor: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const result = await db.getVotesByMpId(input.mpId, {
          limit: input.limit,
          cursor: input.cursor,
        });
        // Backward compatibility: if no cursor/limit provided, return items array directly
        if (!input?.cursor && !input?.limit) {
          return result.items;
        }
        return result;
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

    saveResult: protectedProcedure
      .input(
        z.object({
          sessionId: z.string(),
          questionId: z.number(),
          userAnswer: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only authenticated users can save quiz results
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }
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
    create: protectedProcedure
      .input(
        z.object({
          mpId: z.number(),
          flagType: z.string(),
          severity: z.string(),
          title: z.string(),
          description: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only authenticated users can create flags
        return await db.createAccountabilityFlag({ ...input, resolved: false });
      }),
    resolve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // Only admins can resolve flags
        return await db.resolveAccountabilityFlag(input.id);
      }),
  }),

  // User Follows router
  follows: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // Users can only see their own follows
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }
      return await db.getUserFollows(ctx.user.openId);
    }),
    follow: protectedProcedure
      .input(
        z.object({
          mpId: z.number().optional(),
          billId: z.number().optional(),
          topic: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Users can only follow entities for themselves
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }
        return await db.followEntity({ ...input, userId: ctx.user.openId });
      }),
    unfollow: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Users can only unfollow their own follows
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }
        // Verify ownership before unfollowing (RLS will also enforce this)
        const userFollows = await db.getUserFollows(ctx.user.openId);
        const userFollow = userFollows.find(f => f.follow.id === input.id);
        if (!userFollow) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only unfollow your own follows",
          });
        }
        return await db.unfollowEntity(ctx.user.openId, input.id);
      }),
  }),

  // Activities router (Activity Feed)
  activities: router({
    list: publicProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(20).default(10), // Cap at 20 to prevent scraping
            offset: z.number().min(0).optional(), // Optional offset
            type: z
              .enum(["vote", "comment", "document", "session", "achievement"])
              .optional(),
          })
          .optional()
      )
      .query(async ({ input, ctx }) => {
        const { limit = 10, offset = 0, type } = input || {};

        // SECURITY: Offset-based pagination requires authentication to prevent bulk enumeration
        if (offset > 0 && !ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Pagination requires authentication",
          });
        }

        return await db.getRecentActivities(
          limit,
          offset,
          type,
          ctx.user?.openId
        );
      }),

    getFeed: publicProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(50).default(20),
            cursor: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const { limit = 20, cursor } = input || {};

        // Generate cache key based on input parameters
        const cacheKey = CacheService.keys.activitiesFeed(limit, cursor);

        // Use cache with 5-minute TTL (users don't need sub-second updates)
        return await cache.get(
          cacheKey,
          async () => {
            return await db.getActivityFeed(input);
          },
          {
            ttl: CacheService.TTL.ACTIVITIES_FEED,
            staleTolerance: 60, // Allow 1 minute stale data while revalidating
          }
        );
      }),

    markAsRead: protectedProcedure
      .input(z.array(z.number()).optional()) // Optional array of activity IDs
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }
        return await db.markActivitiesAsRead(ctx.user.openId, input);
      }),
  }),

  // Global Search router
  search: router({
    global: publicProcedure
      .input(
        z.object({
          query: z.string().min(1),
          limit: z.number().default(5),
        })
      )
      .query(async ({ input }) => {
        return await db.globalSearch(input.query, input.limit);
      }),

    getSuggestions: publicProcedure
      .input(
        z.object({
          query: z.string().min(1),
        })
      )
      .query(async ({ input }) => {
        return await db.getSearchSuggestions(input.query);
      }),
  }),

  // Pulse Analytics router
  pulse: router({
    getParliamentPulse: publicProcedure
      .output(
        z.object({
          monthlyVotes: z.array(
            z.object({
              name: z.string(),
              for: z.number(),
              against: z.number(),
              abstain: z.number(),
              absent: z.number(),
            })
          ),
          sessionStats: z.array(
            z.object({
              date: z.string(),
              sessionCount: z.number(),
              attendanceRate: z.number(),
            })
          ),
          summary: z.object({
            totalVotes: z.number(),
            avgAttendance: z.number(),
          }),
        })
      )
      .query(async () => {
        return await db.getParliamentPulse();
      }),
  }),

  // Stats router
  stats: router({
    getLastUpdated: publicProcedure.query(async () => {
      return await db.getLastUpdated();
    }),
  }),

  // User router
  user: router({
    getWatchlist: protectedProcedure.query(async ({ ctx }) => {
      // Users can only access their own watchlist
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }
      return await db.getWatchlist(ctx.user.openId);
    }),

    isFollowingMp: protectedProcedure
      .input(z.object({ mpId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Users can only check their own follow status
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }
        return await db.isFollowingMp(ctx.user.openId, input.mpId);
      }),

    toggleFollowMp: protectedProcedure
      .input(z.object({ mpId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Users can only toggle their own follows
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }
        return await db.toggleFollowMp(ctx.user.openId, input.mpId);
      }),

    getSettings: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }
      const user = await db.getUserByOpenId(ctx.user.openId);
      return (
        user?.settings || {
          emailNotifications: false,
          betaFeatures: false,
          compactMode: false,
        }
      );
    }),

    updateSettings: protectedProcedure
      .input(
        z.object({
          emailNotifications: z.boolean().optional(),
          betaFeatures: z.boolean().optional(),
          compactMode: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }
        return await db.updateUserSettings(ctx.user.openId, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
