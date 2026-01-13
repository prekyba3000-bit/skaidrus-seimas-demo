import dotenv from "dotenv";
dotenv.config();

import { getDb } from "../server/services/database";
import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";

async function checkAndApplyGinIndexes() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("✅ Database connected");
  console.log("🔍 Checking for GIN indexes...\n");

  try {
    // Check if GIN indexes exist
    const indexCheck = await db.execute(
      sql`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename IN ('mps', 'bills') 
        AND indexname LIKE '%gin%'
        ORDER BY tablename, indexname;
      `
    );

    const indexes = indexCheck as Array<{
      indexname: string;
      indexdef: string;
    }>;

    if (indexes.length > 0) {
      console.log("✅ GIN indexes found:");
      indexes.forEach(idx => {
        console.log(`   - ${idx.indexname}`);
      });
      console.log("\n✅ GIN indexes are already active. No action needed.");
      process.exit(0);
    } else {
      console.log("⚠️  No GIN indexes found. Applying them now...\n");

      // Read and execute the SQL script
      const sqlScriptPath = join(
        process.cwd(),
        "scripts",
        "add-gin-indexes.sql"
      );
      const sqlScript = readFileSync(sqlScriptPath, "utf-8");

      console.log("📝 Executing SQL script...\n");

      // First, ensure pg_trgm extension exists
      await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
      console.log("✅ pg_trgm extension enabled");

      // Execute the GIN index creation
      await db.execute(sql.raw(sqlScript));
      console.log("✅ GIN indexes created successfully\n");

      // Verify indexes were created
      const verifyCheck = await db.execute(
        sql`
          SELECT indexname, indexdef 
          FROM pg_indexes 
          WHERE tablename IN ('mps', 'bills') 
          AND indexname LIKE '%gin%'
          ORDER BY tablename, indexname;
        `
      );

      const newIndexes = verifyCheck as Array<{
        indexname: string;
        indexdef: string;
      }>;

      if (newIndexes.length > 0) {
        console.log("✅ Verified GIN indexes:");
        newIndexes.forEach(idx => {
          console.log(`   - ${idx.indexname}`);
        });
        console.log("\n🎉 GIN indexes are now active!");
      } else {
        console.log("⚠️  Warning: Could not verify index creation");
      }
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("already exists")) {
      console.log("⚠️  Indexes might already exist, continuing...");
    } else {
      throw error;
    }
  }

  process.exit(0);
}

checkAndApplyGinIndexes().catch(error => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
