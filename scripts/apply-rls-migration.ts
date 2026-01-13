import dotenv from "dotenv";
dotenv.config();

import { getDb, getSqlClient } from "../server/services/database";
import { readFileSync } from "fs";
import { join } from "path";
import { sql } from "drizzle-orm";

/**
 * Apply RLS migration manually
 * This script applies the RLS policies to the database
 */

async function applyRLS() {
  const db = await getDb();
  const sqlClient = getSqlClient();

  if (!db || !sqlClient) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("🔒 Applying Row Level Security (RLS) policies...\n");

  try {
    // Apply RLS policies directly (more reliable than parsing SQL file)

    console.log("📊 Enabling RLS on users table...");
    await sqlClient.unsafe(`ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;`);

    console.log("📊 Creating users policies...");
    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "users_select_own" ON "users";
      CREATE POLICY "users_select_own" ON "users"
        FOR SELECT
        USING ("openId" = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "users_update_own" ON "users";
      CREATE POLICY "users_update_own" ON "users"
        FOR UPDATE
        USING ("openId" = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "users_insert_allow" ON "users";
      CREATE POLICY "users_insert_allow" ON "users"
        FOR INSERT
        WITH CHECK (true);
    `);

    console.log("📊 Enabling RLS on user_follows table...");
    await sqlClient.unsafe(
      `ALTER TABLE "user_follows" ENABLE ROW LEVEL SECURITY;`
    );

    console.log("📊 Creating user_follows policies...");
    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "user_follows_select_own" ON "user_follows";
      CREATE POLICY "user_follows_select_own" ON "user_follows"
        FOR SELECT
        USING (user_id::text = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "user_follows_insert_own" ON "user_follows";
      CREATE POLICY "user_follows_insert_own" ON "user_follows"
        FOR INSERT
        WITH CHECK (user_id::text = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "user_follows_update_own" ON "user_follows";
      CREATE POLICY "user_follows_update_own" ON "user_follows"
        FOR UPDATE
        USING (user_id::text = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "user_follows_delete_own" ON "user_follows";
      CREATE POLICY "user_follows_delete_own" ON "user_follows"
        FOR DELETE
        USING (user_id::text = current_setting('app.current_user_id', true));
    `);

    console.log("📊 Ensuring watchlist table exists...");
    await sqlClient.unsafe(`
      CREATE TABLE IF NOT EXISTS "watchlist" (
        "id" serial PRIMARY KEY,
        "user_id" varchar(64) NOT NULL,
        "mp_id" integer REFERENCES mps(id),
        "bill_id" integer REFERENCES bills(id),
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    await sqlClient.unsafe(`
      CREATE INDEX IF NOT EXISTS "watchlist_user_id_idx" ON "watchlist" ("user_id");
    `);

    console.log("📊 Enabling RLS on user_activity_reads table...");
    await sqlClient.unsafe(
      `ALTER TABLE "user_activity_reads" ENABLE ROW LEVEL SECURITY;`
    );

    console.log("📊 Creating user_activity_reads policies...");
    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "user_activity_reads_select_own" ON "user_activity_reads";
      CREATE POLICY "user_activity_reads_select_own" ON "user_activity_reads"
        FOR SELECT
        USING (user_id::text = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "user_activity_reads_insert_own" ON "user_activity_reads";
      CREATE POLICY "user_activity_reads_insert_own" ON "user_activity_reads"
        FOR INSERT
        WITH CHECK (user_id::text = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "user_activity_reads_update_own" ON "user_activity_reads";
      CREATE POLICY "user_activity_reads_update_own" ON "user_activity_reads"
        FOR UPDATE
        USING (user_id::text = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "user_activity_reads_delete_own" ON "user_activity_reads";
      CREATE POLICY "user_activity_reads_delete_own" ON "user_activity_reads"
        FOR DELETE
        USING (user_id::text = current_setting('app.current_user_id', true));
    `);

    console.log("📊 Enabling RLS on watchlist table...");
    await sqlClient.unsafe(
      `ALTER TABLE "watchlist" ENABLE ROW LEVEL SECURITY;`
    );

    console.log("📊 Creating watchlist policies...");
    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "watchlist_select_own" ON "watchlist";
      CREATE POLICY "watchlist_select_own" ON "watchlist"
        FOR SELECT
        USING ("user_id" = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "watchlist_insert_own" ON "watchlist";
      CREATE POLICY "watchlist_insert_own" ON "watchlist"
        FOR INSERT
        WITH CHECK ("user_id" = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "watchlist_update_own" ON "watchlist";
      CREATE POLICY "watchlist_update_own" ON "watchlist"
        FOR UPDATE
        USING ("user_id" = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "watchlist_delete_own" ON "watchlist";
      CREATE POLICY "watchlist_delete_own" ON "watchlist"
        FOR DELETE
        USING ("user_id" = current_setting('app.current_user_id', true));
    `);

    console.log("📊 Ensuring user_feedback table exists...");
    await sqlClient.unsafe(`
      CREATE TABLE IF NOT EXISTS "user_feedback" (
        "id" serial PRIMARY KEY,
        "user_id" varchar(64) NOT NULL,
        "category" varchar(50) NOT NULL DEFAULT 'data_discrepancy',
        "message" text NOT NULL,
        "metadata" jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    await sqlClient.unsafe(`
      CREATE INDEX IF NOT EXISTS "user_feedback_user_id_idx" ON "user_feedback" ("user_id");
    `);
    await sqlClient.unsafe(`
      CREATE INDEX IF NOT EXISTS "user_feedback_category_idx" ON "user_feedback" ("category");
    `);

    console.log("📊 Enabling RLS on user_feedback table...");
    await sqlClient.unsafe(
      `ALTER TABLE "user_feedback" ENABLE ROW LEVEL SECURITY;`
    );

    console.log("📊 Creating user_feedback policies...");
    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "user_feedback_select_own" ON "user_feedback";
      CREATE POLICY "user_feedback_select_own" ON "user_feedback"
        FOR SELECT
        USING ("user_id" = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "user_feedback_insert_own" ON "user_feedback";
      CREATE POLICY "user_feedback_insert_own" ON "user_feedback"
        FOR INSERT
        WITH CHECK ("user_id" = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "user_feedback_update_own" ON "user_feedback";
      CREATE POLICY "user_feedback_update_own" ON "user_feedback"
        FOR UPDATE
        USING ("user_id" = current_setting('app.current_user_id', true));
    `);

    await sqlClient.unsafe(`
      DROP POLICY IF EXISTS "user_feedback_delete_own" ON "user_feedback";
      CREATE POLICY "user_feedback_delete_own" ON "user_feedback"
        FOR DELETE
        USING ("user_id" = current_setting('app.current_user_id', true));
    `);

    // Verify RLS is enabled
    const rlsCheck = await db.execute(sql`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'user_follows', 'user_activity_reads', 'watchlist', 'user_feedback');
    `);

    console.log("\n📊 RLS Status:");
    (rlsCheck as Array<{ tablename: string; rowsecurity: boolean }>).forEach(
      row => {
        console.log(
          `   ${row.tablename}: ${row.rowsecurity ? "✅ Enabled" : "❌ Disabled"}`
        );
      }
    );

    // Verify policies exist
    const policiesCheck = await db.execute(sql`
      SELECT tablename, policyname, cmd 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'user_follows', 'user_activity_reads', 'watchlist', 'user_feedback')
      ORDER BY tablename, policyname;
    `);

    console.log("\n📊 Policies:");
    (
      policiesCheck as Array<{
        tablename: string;
        policyname: string;
        cmd: string;
      }>
    ).forEach(policy => {
      console.log(`   ${policy.tablename}.${policy.policyname}: ${policy.cmd}`);
    });

    console.log("\n🎉 RLS migration applied successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error applying RLS:", error.message);
    console.error(error);
    process.exit(1);
  }
}

applyRLS().catch(error => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
