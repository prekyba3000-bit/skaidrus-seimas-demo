import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

async function applySeismicIndex() {
  console.log("🔍 Applying Seismic Index...");

  try {
    // Check if index exists
    const indexResult = await sql`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'session_votes' AND indexname = 'idx_session_votes_contested'
    `;

    if (indexResult.length === 0) {
      console.log("⚠️ idx_session_votes_contested missing. Creating...");
      // We use the raw SQL for the expression index
      await sql`CREATE INDEX IF NOT EXISTS "idx_session_votes_contested" ON "session_votes" USING btree ("vote_date", abs("voted_for" - "voted_against"));`;
      console.log("✅ Created idx_session_votes_contested");
    } else {
      console.log("✅ idx_session_votes_contested already exists");
    }

    console.log("✨ Seismic Index application complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to apply index:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

applySeismicIndex();
