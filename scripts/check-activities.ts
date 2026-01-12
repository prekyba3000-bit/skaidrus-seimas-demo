import { config } from "dotenv";
config();

import { getDb } from "../server/services/database";
import { sql } from "drizzle-orm";

async function checkActivities() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("✅ Database connected");

  // Check activities table
  const result = await db.execute(
    sql`SELECT COUNT(*) as count FROM activities`
  );
  const count = (result as any)[0]?.count || 0;

  console.log(`📊 Activities in database: ${count}`);

  if (count === 0) {
    console.log("\n⚠️  Activities table is EMPTY! Running seed script...\n");
    // Import and run seeding
    const { default: seedActivities } = await import("./seed-activities");
    process.exit(0);
  } else {
    console.log("\n✅ Activities table has data");
    // Show first 3
    const sample = await db.execute(sql`SELECT * FROM activities LIMIT 3`);
    console.log("\nSample activities:");
    console.log(sample);
  }

  process.exit(0);
}

checkActivities().catch(console.error);
