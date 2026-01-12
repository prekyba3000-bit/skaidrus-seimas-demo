import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

async function checkAndApplyIndexes() {
  console.log("🔍 Checking database indexes...");

  try {
    // Check for MP name GIN index
    const mpsIndexResult = await sql`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'mps' AND indexname = 'mps_name_gin_idx'
    `;

    if (mpsIndexResult.length === 0) {
      console.log("⚠️ mps_name_gin_idx missing. Creating...");
      // Check for pg_trgm extension first
      await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
      await sql`CREATE INDEX IF NOT EXISTS mps_name_gin_idx ON mps USING gin(name gin_trgm_ops)`;
      console.log("✅ Created mps_name_gin_idx");
    } else {
      console.log("✅ mps_name_gin_idx exists");
    }

    // Check for Bill title GIN index
    const billsIndexResult = await sql`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'bills' AND indexname = 'bills_title_gin_idx'
    `;

    if (billsIndexResult.length === 0) {
      console.log("⚠️ bills_title_gin_idx missing. Creating...");
      await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
      await sql`CREATE INDEX IF NOT EXISTS bills_title_gin_idx ON bills USING gin(title gin_trgm_ops)`;
      console.log("✅ Created bills_title_gin_idx");
    } else {
      console.log("✅ bills_title_gin_idx exists");
    }

    console.log("✨ Index check complete. Database search optimized.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to enforce indexes:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

checkAndApplyIndexes();
