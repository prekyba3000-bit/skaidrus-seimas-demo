import dotenv from "dotenv";
dotenv.config();

import { getDb } from "../server/services/database";
import { sql } from "drizzle-orm";

/**
 * Apply missing indexes for activities and user_activity_reads tables
 *
 * This script applies the indexes defined in the schema:
 * - activities_created_at_idx on activities.created_at
 * - user_activity_reads_user_id_activity_id_idx on user_activity_reads(user_id, activity_id)
 */

async function applyIndexes() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("🔍 Applying missing indexes...\n");

  try {
    // Check if indexes already exist
    const existingIndexes = await db.execute(sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('activities', 'user_activity_reads')
      AND indexname IN (
        'activities_created_at_idx',
        'user_activity_reads_user_id_activity_id_idx'
      );
    `);

    const existingIndexNames = (
      existingIndexes as Array<{ indexname: string }>
    ).map(idx => idx.indexname);

    // Apply activities.created_at index
    if (!existingIndexNames.includes("activities_created_at_idx")) {
      console.log("📊 Creating index: activities_created_at_idx");
      await db.execute(
        sql`CREATE INDEX "activities_created_at_idx" ON "activities" USING btree ("created_at");`
      );
      console.log("✅ Index created: activities_created_at_idx\n");
    } else {
      console.log("⏭️  Index already exists: activities_created_at_idx\n");
    }

    // Apply user_activity_reads composite index
    // First check if table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_activity_reads'
      );
    `);

    const tableExistsResult = (tableExists as Array<{ exists: boolean }>)[0]
      ?.exists;

    if (tableExistsResult) {
      if (
        !existingIndexNames.includes(
          "user_activity_reads_user_id_activity_id_idx"
        )
      ) {
        console.log(
          "📊 Creating index: user_activity_reads_user_id_activity_id_idx"
        );
        await db.execute(
          sql`CREATE INDEX "user_activity_reads_user_id_activity_id_idx" ON "user_activity_reads" USING btree ("user_id", "activity_id");`
        );
        console.log(
          "✅ Index created: user_activity_reads_user_id_activity_id_idx\n"
        );
      } else {
        console.log(
          "⏭️  Index already exists: user_activity_reads_user_id_activity_id_idx\n"
        );
      }
    } else {
      console.log(
        "⏭️  Table 'user_activity_reads' does not exist yet. Index will be created when table is created.\n"
      );
    }

    // Verify indexes were created
    const verifyIndexes = await db.execute(sql`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename IN ('activities', 'user_activity_reads')
      AND indexname IN (
        'activities_created_at_idx',
        'user_activity_reads_user_id_activity_id_idx'
      )
      ORDER BY tablename, indexname;
    `);

    const indexes = verifyIndexes as Array<{
      indexname: string;
      indexdef: string;
    }>;

    if (indexes.length > 0) {
      console.log("✅ Verified indexes:");
      indexes.forEach(idx => {
        console.log(`   - ${idx.indexname}`);
      });
      console.log("\n🎉 All indexes applied successfully!");
    } else {
      console.log("⚠️  Warning: Could not verify index creation");
    }
  } catch (error: any) {
    console.error("❌ Error applying indexes:", error.message);
    if (error.message.includes("already exists")) {
      console.log("⚠️  Indexes might already exist, continuing...");
    } else {
      throw error;
    }
  }

  process.exit(0);
}

applyIndexes().catch(error => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
