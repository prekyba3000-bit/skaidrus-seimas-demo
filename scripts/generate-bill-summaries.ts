import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, isNull, sql } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import { bills, billSummaries } from "../drizzle/schema";
import { summarizeBill } from "../server/utils/ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function generateSummaries() {
  console.log("[AI] Starting bill summarization...");

  try {
    // Find bills without summaries
    // We fetch bills that are NOT in bill_summaries
    const pendingBills = await db
      .select({
        id: bills.id,
        title: bills.title,
        description: bills.description,
        explanatoryNotes: bills.explanatoryNotes,
      })
      .from(bills)
      .leftJoin(billSummaries, eq(bills.id, billSummaries.billId))
      .where(isNull(billSummaries.id))
      .limit(10); // Start with small batch for testing

    console.log(
      `[AI] Found ${pendingBills.length} bills pending summarization.`
    );

    if (pendingBills.length === 0) {
      console.log("[AI] No pending bills found.");
      return;
    }

    let successCount = 0;

    for (const bill of pendingBills) {
      console.log(
        `[AI] Processing bill ID ${bill.id}: "${bill.title.substring(0, 50)}..."`
      );

      // Combine description and explanatory notes/text if available
      // Note: sync-bills might not populate explanatoryNotes or content fully yet,
      // but we use what we have.
      const content = bill.explanatoryNotes || "";

      const analysis = await summarizeBill(
        bill.title,
        bill.description || "",
        content
      );

      if (analysis) {
        await db.insert(billSummaries).values({
          billId: bill.id,
          summary: analysis.summary,
          bulletPoints: analysis.bulletPoints,
          generatedAt: new Date(),
        });
        console.log(`  - ✅ Summary generated and saved.`);
        successCount++;
      } else {
        console.warn(`  - ⚠️ Failed to generate summary (or AI disabled).`);
      }

      // Artificial delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(
      `\n[AI] Completed. Generated ${successCount}/${pendingBills.length} summaries.`
    );
  } catch (error) {
    console.error("[AI] Error generating summaries:", error);
  } finally {
    await client.end();
  }
}

generateSummaries();
