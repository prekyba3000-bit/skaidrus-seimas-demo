import dotenv from "dotenv";
dotenv.config();

import { getDb } from "../server/services/database";
import { activities, votes, bills, mps } from "../drizzle/schema";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { logger } from "../server/utils/logger";

/**
 * Populate Activities Table from Votes and Bills
 *
 * This script backfills the activities table by:
 * 1. Creating "vote" activities from the votes table
 * 2. Creating "document" activities from the bills table
 *
 * Features:
 * - Idempotent: Can be run multiple times safely
 * - Batch processing for performance
 * - Progress tracking
 * - Duplicate detection
 */

interface PopulateOptions {
  /** Only process votes/bills from last N days (0 = all) */
  days?: number;
  /** Batch size for inserts */
  batchSize?: number;
  /** Dry run (don't actually insert) */
  dryRun?: boolean;
}

async function populateActivities(options: PopulateOptions = {}) {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  const { days = 0, batchSize = 100, dryRun = false } = options;

  console.log("🔍 Starting activities population...");
  console.log(
    `   Options: days=${days || "all"}, batchSize=${batchSize}, dryRun=${dryRun}\n`
  );

  let voteActivitiesCreated = 0;
  let voteActivitiesSkipped = 0;
  let billActivitiesCreated = 0;
  let billActivitiesSkipped = 0;

  try {
    // ==================== Process Votes ====================
    console.log("📊 Processing votes...");

    // Build date filter for votes
    let allVotes;
    if (days > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      cutoffDate.setHours(0, 0, 0, 0); // Start of day

      allVotes = await db
        .select({
          vote: votes,
          bill: bills,
          mp: mps,
        })
        .from(votes)
        .leftJoin(bills, eq(votes.billId, bills.id))
        .leftJoin(mps, eq(votes.mpId, mps.id))
        .where(gte(votes.votedAt, cutoffDate))
        .orderBy(desc(votes.votedAt));
    } else {
      allVotes = await db
        .select({
          vote: votes,
          bill: bills,
          mp: mps,
        })
        .from(votes)
        .leftJoin(bills, eq(votes.billId, bills.id))
        .leftJoin(mps, eq(votes.mpId, mps.id))
        .orderBy(desc(votes.votedAt));
    }

    console.log(`   Found ${allVotes.length} votes to process`);

    // Process votes in batches
    for (let i = 0; i < allVotes.length; i += batchSize) {
      const batch = allVotes.slice(i, i + batchSize);
      const activitiesToInsert = [];

      for (const { vote, bill, mp } of batch) {
        // Check if activity already exists (idempotency)
        // We check by: type='vote', mpId, billId - if exists, skip
        const existingActivity = await db
          .select()
          .from(activities)
          .where(
            and(
              eq(activities.type, "vote"),
              eq(activities.mpId, vote.mpId),
              eq(activities.billId, vote.billId)
            )
          )
          .limit(1);

        if (existingActivity.length > 0) {
          voteActivitiesSkipped++;
          continue;
        }

        // Create vote activity metadata
        const metadata = {
          voteValue: vote.voteValue,
          billTitle: bill?.title || "Unknown Bill",
          billSeimasId: bill?.seimasId || null,
        };

        activitiesToInsert.push({
          type: "vote" as const,
          mpId: vote.mpId,
          billId: vote.billId,
          sessionVoteId: null,
          metadata,
          isHighlighted: false,
          isNew: false,
          category: "Voting",
          createdAt: vote.votedAt || new Date(),
        });
      }

      // Batch insert
      if (activitiesToInsert.length > 0 && !dryRun) {
        await db.insert(activities).values(activitiesToInsert);
        voteActivitiesCreated += activitiesToInsert.length;
      } else if (activitiesToInsert.length > 0 && dryRun) {
        voteActivitiesCreated += activitiesToInsert.length;
        console.log(
          `   [DRY RUN] Would insert ${activitiesToInsert.length} vote activities`
        );
      }

      if (
        (i + batchSize) % (batchSize * 10) === 0 ||
        i + batchSize >= allVotes.length
      ) {
        console.log(
          `   Processed ${Math.min(i + batchSize, allVotes.length)}/${allVotes.length} votes`
        );
      }
    }

    console.log(
      `✅ Votes processed: ${voteActivitiesCreated} created, ${voteActivitiesSkipped} skipped\n`
    );

    // ==================== Process Bills ====================
    console.log("📄 Processing bills...");

    // Build date filter for bills
    let allBills;
    if (days > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      cutoffDate.setHours(0, 0, 0, 0); // Start of day

      allBills = await db
        .select()
        .from(bills)
        .where(gte(bills.createdAt, cutoffDate))
        .orderBy(desc(bills.createdAt));
    } else {
      allBills = await db.select().from(bills).orderBy(desc(bills.createdAt));
    }

    console.log(`   Found ${allBills.length} bills to process`);

    // Process bills in batches
    for (let i = 0; i < allBills.length; i += batchSize) {
      const batch = allBills.slice(i, i + batchSize);
      const activitiesToInsert = [];

      for (const bill of batch) {
        // For bills, we need an MP to associate with
        // Get a random active MP or the first MP
        const randomMp = await db
          .select()
          .from(mps)
          .where(eq(mps.isActive, true))
          .limit(1);

        if (randomMp.length === 0) {
          console.warn("   ⚠️  No active MPs found, skipping bill activities");
          continue;
        }

        // Check if activity already exists (idempotency)
        // We check by: type='document', billId - if exists, skip
        const existingActivity = await db
          .select()
          .from(activities)
          .where(
            and(eq(activities.type, "document"), eq(activities.billId, bill.id))
          )
          .limit(1);

        if (existingActivity.length > 0) {
          billActivitiesSkipped++;
          continue;
        }

        // Create document activity metadata
        const metadata = {
          documentTitle: bill.title,
          documentType: "bill",
          billSeimasId: bill.seimasId,
          status: bill.status,
          category: bill.category || null,
        };

        activitiesToInsert.push({
          type: "document" as const,
          mpId: randomMp[0].id, // Associate with a random MP
          billId: bill.id,
          sessionVoteId: null,
          metadata,
          isHighlighted: bill.status === "passed" || bill.status === "active",
          isNew: false,
          category: bill.category || "Legislation",
          createdAt: bill.createdAt || new Date(),
        });
      }

      // Batch insert
      if (activitiesToInsert.length > 0 && !dryRun) {
        await db.insert(activities).values(activitiesToInsert);
        billActivitiesCreated += activitiesToInsert.length;
      } else if (activitiesToInsert.length > 0 && dryRun) {
        billActivitiesCreated += activitiesToInsert.length;
        console.log(
          `   [DRY RUN] Would insert ${activitiesToInsert.length} bill activities`
        );
      }

      if (
        (i + batchSize) % (batchSize * 10) === 0 ||
        i + batchSize >= allBills.length
      ) {
        console.log(
          `   Processed ${Math.min(i + batchSize, allBills.length)}/${allBills.length} bills`
        );
      }
    }

    console.log(
      `✅ Bills processed: ${billActivitiesCreated} created, ${billActivitiesSkipped} skipped\n`
    );

    // ==================== Summary ====================
    const totalCreated = voteActivitiesCreated + billActivitiesCreated;
    const totalSkipped = voteActivitiesSkipped + billActivitiesSkipped;

    console.log("📊 Summary:");
    console.log(`   Total activities created: ${totalCreated}`);
    console.log(`   Total activities skipped (duplicates): ${totalSkipped}`);
    console.log(
      `   Vote activities: ${voteActivitiesCreated} created, ${voteActivitiesSkipped} skipped`
    );
    console.log(
      `   Bill activities: ${billActivitiesCreated} created, ${billActivitiesSkipped} skipped`
    );

    if (dryRun) {
      console.log("\n⚠️  DRY RUN MODE - No data was actually inserted");
    } else {
      // Verify by counting activities
      const activityCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(activities);

      console.log(
        `\n✅ Verification: ${activityCount[0]?.count || 0} total activities in database`
      );
    }

    return {
      voteActivitiesCreated,
      voteActivitiesSkipped,
      billActivitiesCreated,
      billActivitiesSkipped,
      totalCreated,
      totalSkipped,
    };
  } catch (error) {
    logger.error({ err: error }, "Error populating activities");
    console.error("❌ Error populating activities:", error);
    throw error;
  }
}

// ==================== CLI Interface ====================

async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const options: PopulateOptions = {
    days: 0,
    batchSize: 100,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--days" && args[i + 1]) {
      options.days = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--batch-size" && args[i + 1]) {
      options.batchSize = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Usage: pnpm tsx scripts/populate-activities.ts [options]

Options:
  --days <number>      Only process votes/bills from last N days (0 = all)
  --batch-size <number> Batch size for inserts (default: 100)
  --dry-run            Don't actually insert, just show what would be done
  --help, -h           Show this help message

Examples:
  # Populate all activities
  pnpm tsx scripts/populate-activities.ts

  # Only last 30 days
  pnpm tsx scripts/populate-activities.ts --days 30

  # Dry run to see what would be created
  pnpm tsx scripts/populate-activities.ts --dry-run

  # Custom batch size
  pnpm tsx scripts/populate-activities.ts --batch-size 50
      `);
      process.exit(0);
    }
  }

  try {
    await populateActivities(options);
    console.log("\n🎉 Activities population complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Activities population failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { populateActivities };
