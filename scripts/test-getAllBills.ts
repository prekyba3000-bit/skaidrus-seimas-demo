import dotenv from "dotenv";
import * as db from "../server/services/database";

dotenv.config();

async function testGetAllBills() {
  console.log("=== TESTING getAllBills FUNCTION ===");
  console.log("DATABASE_URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"));
  
  try {
    const result = await db.getAllBills({});
    
    console.log(`\nResult type: ${typeof result}`);
    console.log(`Is Array: ${Array.isArray(result)}`);
    console.log(`Count: ${Array.isArray(result) ? result.length : "N/A"}`);
    
    if (Array.isArray(result) && result.length > 0) {
      console.log("\nFirst 3 bills from getAllBills:");
      result.slice(0, 3).forEach((bill: any, i: number) => {
        console.log(`\nBill ${i + 1}:`);
        console.log(`  ID: ${bill.id}`);
        console.log(`  seimasId: ${bill.seimasId}`);
        console.log(`  Title: ${bill.title?.substring(0, 60)}...`);
        console.log(`  Status: ${bill.status}`);
        console.log(`  Category: ${bill.category}`);
        console.log(`  createdAt: ${bill.createdAt}`);
        console.log(`  submittedAt: ${bill.submittedAt}`);
      });
    } else {
      console.log("\n⚠️  getAllBills returned empty or non-array!");
      console.log("Result:", result);
    }
    
  } catch (error) {
    console.error("Error in getAllBills:", error);
  }
}

testGetAllBills().catch(console.error);
