import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../services/database";

/**
 * Feedback Router
 * Allows authenticated users to submit data discrepancy reports.
 * Enforces RLS via withUserContext and DB policies.
 */
export const feedbackRouter = router({
  submit: protectedProcedure
    .input(
      z.object({
        category: z.string().max(50).default("data_discrepancy"),
        message: z.string().min(5).max(2000),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await db.submitUserFeedback(ctx.user.openId, input);
    }),
});
