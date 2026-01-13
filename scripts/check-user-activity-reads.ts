import dotenv from "dotenv";
dotenv.config();

import { getDb } from "../server/services/database";
import { sql } from "drizzle-orm";

/**
 * Check if user_activity_reads table exists in the database
 */

async function checkTable() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("🔍 Checking if user_activity_reads table exists...\n");

  try {
    // Check if table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_activity_reads'
      );
    `);

    const exists = (tableExists as Array<{ exists: boolean }>)[0]?.exists;

    if (exists) {
      console.log("✅ Table 'user_activity_reads' exists\n");

      // Check table structure
      const columns = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'user_activity_reads'
        ORDER BY ordinal_position;
      `);

      console.log("📊 Table structure:");
      (
        columns as Array<{
          column_name: string;
          data_type: string;
          is_nullable: string;
        }>
      ).forEach(col => {
        console.log(
          `   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
        );
      });

      // Check indexes
      const indexes = await db.execute(sql`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'user_activity_reads';
      `);

      console.log("\n📊 Indexes:");
      if ((indexes as Array<any>).length > 0) {
        (indexes as Array<{ indexname: string; indexdef: string }>).forEach(
          idx => {
            console.log(`   - ${idx.indexname}`);
          }
        );
      } else {
        console.log("   (no indexes found)");
      }

      // Check row count
      const count = await db.execute(
        sql`SELECT COUNT(*) as count FROM user_activity_reads`
      );
      const rowCount = (count as Array<{ count: string }>)[0]?.count || "0";
      console.log(`\n📊 Row count: ${rowCount}`);
    } else {
      console.log("❌ Table 'user_activity_reads' does NOT exist\n");
      console.log("⚠️  Need to create the table via migration");
    }

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkTable();
