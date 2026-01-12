import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { enqueueScrapeBills, getJobStatus } from "../lib/queue";
import { logger } from "../utils/logger";

/**
 * Scheduler Router
 * 
 * Provides endpoints to manually trigger and monitor scraping jobs.
 */

export const schedulerRouter = router({
  /**
   * Manually trigger a bills scraping job
   */
  triggerBillsScrape: publicProcedure
    .input(
      z
        .object({
          limit: z.number().optional(),
          force: z.boolean().optional(),
        })
        .optional()
    )
    .mutation(async ({ input }) => {
      logger.info({ input }, "Manual bills scrape triggered");
      const result = await enqueueScrapeBills(input || {});
      return result;
    }),

  /**
   * Get job status by ID
   */
  getJobStatus: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      const status = await getJobStatus(input.jobId);
      if (!status) {
        throw new Error(`Job ${input.jobId} not found`);
      }
      return status;
    }),
});
