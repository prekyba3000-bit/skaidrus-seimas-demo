import dotenv from "dotenv";
dotenv.config();

import { getDb } from "../server/services/database";
import { sql } from "drizzle-orm";

/**
 * Create user_activity_reads table if it doesn't exist
 * This applies the migration from 0003_cuddly_gideon.sql
 */

async function createTable() {
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
      console.log("✅ Table 'user_activity_reads' already exists\n");
      process.exit(0);
    }

    console.log("📊 Creating user_activity_reads table...\n");

    // Create table
    await db.execute(sql`
      CREATE TABLE "user_activity_reads" (
        "user_id" varchar(64) NOT NULL,
        "activity_id" integer NOT NULL,
        "read_at" timestamp DEFAULT now(),
        CONSTRAINT "user_activity_reads_user_id_activity_id_pk" PRIMARY KEY("user_id","activity_id")
      );
    `);

    console.log("✅ Table created\n");

    // Add foreign key constraint
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'user_activity_reads_activity_id_activities_id_fk'
        ) THEN
          ALTER TABLE "user_activity_reads" ADD CONSTRAINT "user_activity_reads_activity_id_activities_id_fk" 
            FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;
        END IF;
      END $$;
    `);

    console.log("✅ Foreign key constraint added\n");

    // Create index (from migration 0004)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "user_activity_reads_user_id_activity_id_idx" 
      ON "user_activity_reads" USING btree ("user_id","activity_id");
    `);

    console.log("✅ Index created\n");

    // Verify
    const verify = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'user_activity_reads'
      ORDER BY ordinal_position;
    `);

    console.log("📊 Table structure:");
    (verify as Array<{ column_name: string; data_type: string }>).forEach(
      col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      }
    );

    console.log("\n🎉 user_activity_reads table created successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("already exists")) {
      console.log("⚠️  Table might already exist, continuing...");
      process.exit(0);
    } else {
      throw error;
    }
  }
}

createTable().catch(error => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
