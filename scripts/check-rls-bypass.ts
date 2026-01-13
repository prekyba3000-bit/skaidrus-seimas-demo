import dotenv from "dotenv";
dotenv.config();

import { getDb, getSqlClient } from "../server/services/database";

async function checkBypass() {
  await getDb();
  const sql = getSqlClient();

  console.log("🔍 Checking RLS bypass privileges...\n");

  // Check current user and privileges
  const userInfo = await sql`
    SELECT 
      current_user as username,
      current_setting('is_superuser') as is_superuser
  `;
  console.log("Current user:", JSON.stringify(userInfo, null, 2));

  // Check if user has BYPASSRLS
  const bypassCheck = await sql`
    SELECT 
      rolname,
      rolbypassrls,
      rolsuper
    FROM pg_roles
    WHERE rolname = current_user
  `;
  console.log("\nUser privileges:", JSON.stringify(bypassCheck, null, 2));

  // Test: Try to query without setting variable (should return 0 if RLS works)
  console.log("\n🔍 Testing query WITHOUT setting app.current_user_id...");
  const noContextResult = await sql`
    SELECT COUNT(*) as count FROM user_activity_reads
  `;
  console.log(
    "Rows without context:",
    JSON.stringify(noContextResult, null, 2)
  );

  if (parseInt(noContextResult[0]?.count || "0") > 0) {
    console.log("⚠️  WARNING: Query returned rows without RLS context!");
    console.log("   This suggests RLS is not enforcing or user has bypass");
  }

  // Test with NULL setting
  console.log("\n🔍 Testing with NULL setting...");
  await sql.begin(async tx => {
    // Don't set the variable - it should be NULL
    const result = await tx`
      SELECT 
        current_setting('app.current_user_id', true) as current_user,
        COUNT(*) as count
      FROM user_activity_reads
    `;
    console.log("Result with NULL setting:", JSON.stringify(result, null, 2));
  });

  process.exit(0);
}

checkBypass().catch(console.error);
