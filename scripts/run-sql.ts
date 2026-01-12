import { config } from "dotenv";
config(); // Load .env file first

import { readFileSync } from "fs";
import { getDb } from "../server/services/database";
import { sql } from "drizzle-orm";

/**
 * Execute the SQL script to create activities table and seed data
 */

async function runSQL() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("🔧 Reading SQL script...");
  const sqlScript = readFileSync(
    "scripts/create-activities-table.sql",
    "utf-8"
  );

  console.log("📝 Executing SQL script...\n");

  try {
    // Execute the entire script as one statement using postgres
    await db.execute(sql.raw(sqlScript));
    console.log("✅ SQL script executed successfully");
  } catch (error: any) {
    console.error("❌ SQL execution failed:", error.message);
    if (error.message.includes("already exists")) {
      console.log("⚠️  Table might already exist, continuing...");
    } else {
      throw error;
    }
  }

  console.log("\n🎉 SQL script execution complete!");
  console.log("📊 Checking activities table...");

  // Verify data was inserted
  try {
    const result = await db.execute(
      sql`SELECT COUNT(*) as count FROM activities`
    );
    const count = (result as any)[0]?.count || 0;

    console.log(`✅ Activities table has ${count} rows`);

    if (count === 0) {
      console.log("⚠️  No activities found, table might be empty");
    }
  } catch (error: any) {
    console.error("❌ Could not verify table:", error.message);
  }

  process.exit(0);
}

runSQL().catch(error => {
  console.error("❌ Error:", error);
  process.exit(1);
});
