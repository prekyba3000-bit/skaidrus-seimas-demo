import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../services/database";

/**
 * Watchlist Router (Gold Tier Implementation)
 *
 * Enforces:
 * 1. Authentication (protectedProcedure)
 * 2. Row Level Security (via db.getWatchlistItems)
 * 3. Explicit user_id filtering
 */
export const watchlistRouter = router({
  /**
   * Fetch all items in the user's watchlist
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    return await db.getWatchlistItems(ctx.user.openId);
  }),

  /**
   * Add an MP or Bill to the watchlist
   */
  add: protectedProcedure
    .input(
      z.object({
        mpId: z.number().optional(),
        billId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await db.addToWatchlist(ctx.user.openId, input);
    }),

  /**
   * Remove an item from the watchlist by its ID
   */
  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await db.removeFromWatchlist(ctx.user.openId, input.id);
    }),
});
