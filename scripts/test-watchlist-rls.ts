import dotenv from "dotenv";
dotenv.config();

import { getDb, getSqlClient } from "../server/services/database";
import { sql } from "drizzle-orm";

/**
 * Test RLS enforcement for the watchlist table.
 * Steps:
 * 1. Create two test users
 * 2. Insert watchlist items for each user (with RLS context)
 * 3. Attempt cross-user reads (should return 0 rows)
 * 4. Verify own data is readable
 * 5. Verify querying without context returns no rows (unless superuser bypasses RLS)
 */
async function testWatchlistRLS() {
  const db = await getDb();
  const sqlClient = getSqlClient();

  if (!db || !sqlClient) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("🧪 Testing RLS for watchlist table...\n");

  try {
    const user1Id = `test-watchlist-user-1-${Date.now()}`;
    const user2Id = `test-watchlist-user-2-${Date.now()}`;

    console.log("📊 Creating test users (with context to satisfy RLS)...");
    await sqlClient.begin(async tx => {
      await tx.unsafe(`SET LOCAL app.current_user_id = '${user1Id}'`);
      await tx`
        INSERT INTO users ("openId", name, email, role)
        VALUES (${user1Id}, 'Test Watchlist User 1', 'tw1@example.com', 'user')
        ON CONFLICT ("openId") DO NOTHING;
      `;
    });
    await sqlClient.begin(async tx => {
      await tx.unsafe(`SET LOCAL app.current_user_id = '${user2Id}'`);
      await tx`
        INSERT INTO users ("openId", name, email, role)
        VALUES (${user2Id}, 'Test Watchlist User 2', 'tw2@example.com', 'user')
        ON CONFLICT ("openId") DO NOTHING;
      `;
    });
    console.log(`✅ Created users: ${user1Id}, ${user2Id}\n`);

    // Get an MP ID and Bill ID if available
    const [mp] = await db
      .select({ id: sql<number>`id` })
      .from(sql`mps`)
      .limit(1);
    const [bill] = await db
      .select({ id: sql<number>`id` })
      .from(sql`bills`)
      .limit(1);

    // Insert watchlist items for each user
    console.log("📝 Inserting watchlist items with RLS context...");
    await sqlClient.begin(async tx => {
      await tx.unsafe(
        `SET LOCAL app.current_user_id = '${user1Id.replace(/'/g, "''")}'`
      );
      await tx`
        INSERT INTO watchlist (user_id, mp_id, bill_id, created_at)
        VALUES (${user1Id}, ${mp?.id ?? null}, ${bill?.id ?? null}, NOW())
        ON CONFLICT DO NOTHING
      `;
    });
    await sqlClient.begin(async tx => {
      await tx.unsafe(
        `SET LOCAL app.current_user_id = '${user2Id.replace(/'/g, "''")}'`
      );
      await tx`
        INSERT INTO watchlist (user_id, mp_id, bill_id, created_at)
        VALUES (${user2Id}, ${mp?.id ?? null}, ${bill?.id ?? null}, NOW())
        ON CONFLICT DO NOTHING
      `;
    });
    console.log("✅ Inserted watchlist items for both users\n");

    // Cross-read attempt: User2 reading User1's watchlist (should be 0 rows)
    console.log("🔍 Attempting to read User 1's watchlist as User 2...");
    const user2ReadsUser1 = await sqlClient.begin(async tx => {
      await tx.unsafe(
        `SET LOCAL app.current_user_id = '${user2Id.replace(/'/g, "''")}'`
      );
      return await tx`
        SELECT * FROM watchlist WHERE user_id = ${user1Id}
      `;
    });
    if (user2ReadsUser1.length === 0) {
      console.log(
        "✅ SUCCESS: User 2 cannot see User 1's watchlist (RLS enforced)"
      );
    } else {
      console.log(
        "❌ FAIL: User 2 can see User 1's watchlist (RLS not enforced)"
      );
      console.log(`   Rows: ${user2ReadsUser1.length}`);
    }

    // Verify User2 can read their own data
    console.log("🔍 Verifying User 2 can read their own watchlist...");
    const user2Own = await sqlClient.begin(async tx => {
      await tx.unsafe(
        `SET LOCAL app.current_user_id = '${user2Id.replace(/'/g, "''")}'`
      );
      return await tx`SELECT * FROM watchlist`;
    });
    if (user2Own.length > 0) {
      console.log(
        `✅ SUCCESS: User 2 can see their own data (${user2Own.length} rows)`
      );
    } else {
      console.log("⚠️  User 2 has no watchlist rows to verify");
    }

    // Query without setting context (should be blocked unless using superuser with bypass)
    console.log("🔍 Querying watchlist without RLS context...");
    const noContext = await db.select().from(sql`watchlist`);
    if (noContext.length === 0) {
      console.log("✅ SUCCESS: No rows returned without RLS context");
    } else {
      console.log(
        "⚠️  Rows returned without context. If running as a superuser (rolbypassrls=true), RLS is bypassed. Use a non-superuser to fully verify."
      );
      console.log(`   Rows: ${noContext.length}`);
    }

    console.log("\n🎉 Watchlist RLS test completed");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Error testing watchlist RLS:", err?.message || err);
    process.exit(1);
  }
}

testWatchlistRLS().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
