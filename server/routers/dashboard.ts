import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../services/database";
import { bills } from "../../drizzle/schema";
import { desc, lt, and, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const dashboardRouter = router({
  getRecentActivity: publicProcedure
    .input(
      z
        .object({
          // coerce.number allows "10" to become 10
          limit: z.coerce.number().min(1).max(100).default(10),
          cursor: z.coerce.number().nullish(),
          // Allow string, null, undefined, or empty string
          search: z
            .string()
            .nullish()
            .transform(val => val || undefined),
        })
        .optional() // <--- THIS IS THE FIX (Allows undefined input)
    )
    .query(async ({ input }) => {
      try {
        // 1. Handle Inputs (with defaults)
        const { limit = 10, cursor, search } = input || {};

        // Get database connection
        const database = await getDb();

        const trimmedSearch = search?.trim();

        // 2. Fetch Data from Database
        // Build conditions array, filtering out undefined values
        const conditions = [];
        if (cursor) {
          conditions.push(lt(bills.id, cursor));
        }
        if (trimmedSearch && trimmedSearch.length > 0) {
          conditions.push(ilike(bills.title, `%${trimmedSearch}%`));
        }

        let query = database
          .select()
          .from(bills)
          .orderBy(desc(bills.id))
          .limit(limit + 1); // Fetch one extra item to determine next cursor

        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }

        const rawItems = await query;

        // 3. Calculate Cursor
        let nextCursor: number | undefined = undefined;
        if (rawItems.length > limit) {
          const nextItem = rawItems.pop(); // Remove the 11th item
          nextCursor = nextItem?.id; // Save its ID as the cursor
        }

        // Transform items to match frontend expectations
        // CRITICAL: Convert all Date objects to ISO strings for safe serialization
        const items = rawItems.map((bill: any) => {
          // Safely convert date to ISO string
          let dateValue: string;
          if (bill.submittedAt instanceof Date) {
            dateValue = bill.submittedAt.toISOString();
          } else if (bill.createdAt instanceof Date) {
            dateValue = bill.createdAt.toISOString();
          } else if (typeof bill.submittedAt === "string") {
            dateValue = bill.submittedAt;
          } else if (typeof bill.createdAt === "string") {
            dateValue = bill.createdAt;
          } else {
            dateValue = new Date().toISOString();
          }

          return {
            id: bill.id,
            title: bill.title || "Be pavadinimo",
            registrationNumber: bill.seimasId || "N/A",
            date: dateValue,
            status: bill.status || "Nežinomas",
            category: bill.category || "Bendra",
          };
        });

        // 4. RETURN THE CORRECT OBJECT STRUCTURE
        return {
          items, // <--- The Frontend is looking for this exact key!
          nextCursor,
        };
      } catch (e) {
        // Standardize error handling - throw TRPCError instead of returning empty data
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch recent activity",
          cause: e,
        });
      }
    }),
});
