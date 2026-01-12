import {
  getDb,
  searchMps,
  getMpStats,
  getAllBills,
} from "../server/services/database";
import { logger } from "../server/utils/logger";
import dotenv from "dotenv";

dotenv.config();

/**
 * Agent Tools CLI
 *
 * Usage:
 * tsx scripts/agent-tools.ts search_bills "query"
 * tsx scripts/agent-tools.ts get_mp_stats "mpId"
 */

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const param = args[1];

  if (!command) {
    console.error("Please provide a command: search_bills, get_mp_stats");
    process.exit(1);
  }

  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    switch (command) {
      case "search_bills":
        if (!param) throw new Error("Please provide a search query");
        console.log(`Searching bills for: ${param}`);
        // We'll use the existing getAllBills but we might need a specific text search if 'getAllBills' doesn't support Title search well.
        // Let's use globalSearch as a fallback or if getAllBills lacks text search.
        // Checking routers.ts, bills.list uses getAllBills. Let's see if getAllBills supports search.
        // It supports status and category.
        // So for "search_bills", we might want to direct query or use globalSearch and filter for bills.

        // Let's use direct DB query for specific bill title search to be useful
        const { globalSearch } = await import("../server/services/database");
        const results = await globalSearch(param, 10);
        console.log(JSON.stringify(results.bills, null, 2));
        break;

      case "get_mp_stats":
        if (!param) throw new Error("Please provide an MP ID");
        const mpId = parseInt(param);
        if (isNaN(mpId)) throw new Error("Invalid MP ID");

        console.log(`Getting stats for MP ID: ${mpId}`);
        const stats = await getMpStats(mpId);
        console.log(JSON.stringify(stats, null, 2));
        break;

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }

    process.exit(0);
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
