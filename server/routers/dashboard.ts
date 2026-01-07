import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { z } from "zod";

export const dashboardRouter = router({
  getRecentActivity: publicProcedure
    .input(z.object({ limit: z.number().default(10).optional() }).optional())
    .query(async ({ input }) => {
      try {
        const limit = input?.limit || 10;

        // SAFETY: Default to empty array immediately
        let bills: any[] = [];

        try {
          const rawBills = await db.getAllBills({});
          // STRICT CHECK: Ensure it is actually an array before trusting it
          if (Array.isArray(rawBills)) {
            bills = rawBills;
          } else {
            console.warn("Database returned non-array for bills:", rawBills);
          }
        } catch (dbError) {
          console.error("Database Connection Failed (Safe Handled):", dbError);
          // Return empty list, do NOT crash
          return [];
        }

        // SAFETY: Slice safely on the guaranteed array
        const recentBills = bills.slice(0, limit);

        // Transform
        return recentBills.map((bill: any) => ({
          id: bill.id,
          type: "bill" as const,
          mpName: "Seimo nariai",
          action: "pateikė įstatymo projektą",
          billTitle: bill.title || "Be pavadinimo",
          billNumber: bill.seimasId || "N/A",
          category: bill.category || "Bendra",
          timestamp:
            bill.submittedAt || bill.createdAt || new Date().toISOString(),
          photoUrl: undefined,
        }));
      } catch (e) {
        console.error("CRITICAL DASHBOARD ERROR:", e);
        return []; // Absolute final fallback
      }
    }),
});
