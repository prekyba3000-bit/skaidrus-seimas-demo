import postgres from "postgres";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { bills } from "../drizzle/schema";
import { desc } from "drizzle-orm";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

async function checkBills() {
  console.log("=== CHECKING BILLS IN DATABASE ===");
  console.log(
    "DATABASE_URL:",
    process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@")
  );

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  try {
    // Direct query to check bills
    const allBills = await db
      .select()
      .from(bills)
      .orderBy(desc(bills.createdAt))
      .limit(10);

    console.log(`\nFound ${allBills.length} bills in database`);

    if (allBills.length > 0) {
      console.log("\nFirst 3 bills:");
      allBills.slice(0, 3).forEach((bill, i) => {
        console.log(`\nBill ${i + 1}:`);
        console.log(`  ID: ${bill.id}`);
        console.log(`  seimasId: ${bill.seimasId}`);
        console.log(`  Title: ${bill.title?.substring(0, 60)}...`);
        console.log(`  Status: ${bill.status}`);
        console.log(`  Category: ${bill.category}`);
        console.log(`  createdAt: ${bill.createdAt}`);
        console.log(`  submittedAt: ${bill.submittedAt}`);
        console.log(`  updatedAt: ${bill.updatedAt}`);
      });
    } else {
      console.log("\n⚠️  No bills found in database!");
      console.log("\nChecking if bills table exists...");
      const tableExists = await client`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'bills'
        );
      `;
      console.log("Table exists:", tableExists[0]?.exists);
    }

    // Also check count
    const countResult = await db.select().from(bills);
    console.log(`\nTotal bills count: ${countResult.length}`);
  } catch (error) {
    console.error("Error checking bills:", error);
  } finally {
    await client.end();
  }
}

checkBills().catch(console.error);
