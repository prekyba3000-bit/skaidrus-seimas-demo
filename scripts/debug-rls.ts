import dotenv from "dotenv";
dotenv.config();

import { getDb, getSqlClient } from "../server/services/database";

async function debugRLS() {
  await getDb(); // Initialize database
  const sql = getSqlClient();

  console.log("🔍 Debugging RLS policies...\n");

  // Check if RLS is enabled
  const rlsStatus = await sql`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('users', 'user_follows', 'user_activity_reads');
  `;
  console.log("📊 RLS Status:");
  console.log(JSON.stringify(rlsStatus, null, 2));

  // Check policies
  const policies = await sql`
    SELECT tablename, policyname, cmd, qual, with_check
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_activity_reads';
  `;
  console.log("\n📊 Policies for user_activity_reads:");
  console.log(JSON.stringify(policies, null, 2));

  // Test setting the variable
  console.log("\n🔍 Testing SET LOCAL...");
  await sql.begin(async tx => {
    await tx.unsafe(`SET LOCAL app.current_user_id = 'test-user-123'`);
    const result =
      await tx`SELECT current_setting('app.current_user_id', true) as user_id`;
    console.log("Current setting:", JSON.stringify(result, null, 2));
  });

  // Test a query with RLS - try to access another user's data
  console.log("\n🔍 Testing RLS enforcement...");

  // First, get a real user_id from the database
  const existingData = await sql`
    SELECT DISTINCT user_id FROM user_activity_reads LIMIT 1
  `;

  if (existingData.length > 0) {
    const realUserId = existingData[0].user_id;
    const testUserId = "different-user-" + Date.now();

    console.log(
      `Testing: Set context to '${testUserId}', query for '${realUserId}'`
    );

    await sql.begin(async tx => {
      await tx.unsafe(`SET LOCAL app.current_user_id = '${testUserId}'`);

      // Try to query for a different user's data (should return 0 rows)
      const result = await tx`
        SELECT * FROM user_activity_reads WHERE user_id = ${realUserId}
      `;
      console.log(`\nQuery for user '${realUserId}' as '${testUserId}':`);
      console.log(`  Rows returned: ${result.length}`);
      if (result.length > 0) {
        console.log("  ❌ RLS NOT WORKING - should return 0 rows!");
      } else {
        console.log("  ✅ RLS WORKING - correctly blocked access");
      }

      // Now query without WHERE (should only see own data, which is none)
      const allResults = await tx`
        SELECT * FROM user_activity_reads
      `;
      console.log(`\nQuery all (as '${testUserId}'):`);
      console.log(`  Rows returned: ${allResults.length}`);
      if (allResults.length > 0) {
        console.log(
          "  ❌ RLS NOT WORKING - should return 0 rows (no data for this user)!"
        );
      } else {
        console.log("  ✅ RLS WORKING - correctly returned 0 rows");
      }
    });
  } else {
    console.log("⚠️  No data in user_activity_reads to test with");
  }

  process.exit(0);
}

debugRLS().catch(console.error);
