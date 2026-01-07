import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function clearAllData() {
  console.log("🧹 Starting to clear all data from database...\n");

  try {
    // Disable foreign key checks and truncate all tables
    await db.execute(sql`
      -- Disable triggers temporarily
      SET session_replication_role = 'replica';

      -- Truncate all tables in order (respecting dependencies)
      TRUNCATE TABLE user_quiz_results CASCADE;
      TRUNCATE TABLE quiz_answers CASCADE;
      TRUNCATE TABLE quiz_questions CASCADE;
      TRUNCATE TABLE session_mp_votes CASCADE;
      TRUNCATE TABLE session_votes CASCADE;
      TRUNCATE TABLE votes CASCADE;
      TRUNCATE TABLE bill_summaries CASCADE;
      TRUNCATE TABLE bill_sponsors CASCADE;
      TRUNCATE TABLE committee_members CASCADE;
      TRUNCATE TABLE committees CASCADE;
      TRUNCATE TABLE accountability_flags CASCADE;
      TRUNCATE TABLE user_follows CASCADE;
      TRUNCATE TABLE mp_stats CASCADE;
      TRUNCATE TABLE mp_assistants CASCADE;
      TRUNCATE TABLE mp_trips CASCADE;
      TRUNCATE TABLE bills CASCADE;
      TRUNCATE TABLE mps CASCADE;
      TRUNCATE TABLE users CASCADE;

      -- Re-enable triggers
      SET session_replication_role = 'origin';
    `);

    console.log("✅ All data has been cleared successfully!\n");
    console.log("📝 Your database is now empty and ready for fresh data.");
    console.log("   You can now:");
    console.log("   1. Run seed scripts to add sample data");
    console.log("   2. Import real data from LRS API");
    console.log("   3. Start building your frontend with a clean slate\n");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    throw error;
  }

  await client.end();
  process.exit(0);
}

clearAllData();
