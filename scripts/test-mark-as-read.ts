import dotenv from "dotenv";
dotenv.config();

import { getDb } from "../server/services/database";
import { activities, userActivityReads, users } from "../drizzle/schema";
import { sql, eq } from "drizzle-orm";

/**
 * Test the markActivitiesAsRead functionality
 *
 * This script:
 * 1. Gets a test user (or creates one)
 * 2. Gets some activity IDs
 * 3. Calls markActivitiesAsRead
 * 4. Verifies rows were inserted into user_activity_reads
 */

async function testMarkAsRead() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("🧪 Testing markActivitiesAsRead functionality...\n");

  try {
    // Use a test user ID (we'll use a simple string)
    const userId = "test-user-" + Date.now();
    console.log(`✅ Using test user ID: ${userId}\n`);

    // Get some activity IDs
    const activitiesList = await db
      .select({ id: activities.id })
      .from(activities)
      .limit(5);

    if (activitiesList.length === 0) {
      console.error(
        "❌ No activities found. Please populate activities first."
      );
      process.exit(1);
    }

    const activityIds = activitiesList.map(a => a.id);
    console.log(`📊 Found ${activityIds.length} activities to mark as read:`);
    activityIds.forEach(id => console.log(`   - Activity ID: ${id}`));
    console.log();

    // Check current read status
    const beforeCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(userActivityReads)
      .where(eq(userActivityReads.userId, userId));

    console.log(
      `📊 Current read count for user: ${beforeCount[0]?.count || 0}\n`
    );

    // Import and call markActivitiesAsRead
    const { markActivitiesAsRead } = await import(
      "../server/services/database"
    );

    console.log("🔄 Calling markActivitiesAsRead...");
    await markActivitiesAsRead(userId, activityIds);
    console.log("✅ markActivitiesAsRead completed\n");

    // Verify rows were inserted
    const afterCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(userActivityReads)
      .where(eq(userActivityReads.userId, userId));

    const newCount = (afterCount[0]?.count || 0) as number;
    const oldCount = (beforeCount[0]?.count || 0) as number;
    const inserted = newCount - oldCount;

    console.log(`📊 New read count for user: ${newCount}`);
    console.log(`📊 Activities marked as read: ${inserted}\n`);

    // Get the actual records
    const readRecords = await db
      .select()
      .from(userActivityReads)
      .where(eq(userActivityReads.userId, userId))
      .limit(10);

    console.log("📋 Sample read records:");
    readRecords.forEach(record => {
      console.log(
        `   - Activity ${record.activityId} read at ${record.readAt}`
      );
    });

    if (inserted > 0) {
      console.log("\n✅ SUCCESS: User-specific read tracking is working!");
      console.log(
        `   ${inserted} activities were marked as read for user ${userId}`
      );
    } else {
      console.log("\n⚠️  WARNING: No new records were inserted.");
      console.log("   This might mean they were already marked as read.");
    }

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testMarkAsRead();
