import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, isNull } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import { bills, billSummaries, quizQuestions } from "../drizzle/schema";
import { generateQuizQuestion } from "../server/utils/ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function generateQuestions() {
  console.log("[AI] Starting quiz question generation...");

  try {
    // Find bills that have summaries but NO quiz questions
    const candidates = await db
      .select({
        billId: bills.id,
        title: bills.title,
        summary: billSummaries.summary,
      })
      .from(bills)
      .innerJoin(billSummaries, eq(bills.id, billSummaries.billId)) // Must have summary
      .leftJoin(quizQuestions, eq(bills.id, quizQuestions.billId))
      .where(isNull(quizQuestions.id))
      .limit(10); // Batch size

    console.log(
      `[AI] Found ${candidates.length} bills suitable for quiz generation.`
    );

    let successCount = 0;

    for (const item of candidates) {
      console.log(`[AI] Generating question for bill ID ${item.billId}...`);

      const quizParams = await generateQuizQuestion(item.title, item.summary);

      if (quizParams) {
        await db.insert(quizQuestions).values({
          billId: item.billId,
          questionText: quizParams.question,
          category: quizParams.category,
        });
        console.log(`  - ✅ Question generated: "${quizParams.question}"`);
        successCount++;
      } else {
        console.warn("  - ⚠️ Failed to generate question (or AI disabled).");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(
      `\n[AI] Completed. Generated ${successCount}/${candidates.length} questions.`
    );
  } catch (error) {
    console.error("[AI] Error generating quiz questions:", error);
  } finally {
    await client.end();
  }
}

generateQuestions();
