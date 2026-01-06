import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function checkFreshness() {
  console.log("[Monitor] Checking data freshness...");

  try {
    // Execute queries
    const [mpsData] = await db
      .select({ date: sql<Date>`max(${schema.mps.updatedAt})` })
      .from(schema.mps);
    const [billsData] = await db
      .select({ date: sql<Date>`max(${schema.bills.updatedAt})` })
      .from(schema.bills);
    const [votesData] = await db
      .select({ date: sql<Date>`max(${schema.sessionVotes.voteDate})` })
      .from(schema.sessionVotes);
    const [statsData] = await db
      .select({ date: sql<Date>`max(${schema.mpStats.lastCalculated})` })
      .from(schema.mpStats);
    const [committeesData] = await db
      .select({ date: sql<Date>`max(${schema.committeeMembers.joinedAt})` })
      .from(schema.committeeMembers);

    const now = new Date();
    const thresholds = {
      mps: 24 * 60 * 60 * 1000, // 24 hours
      bills: 24 * 60 * 60 * 1000,
      votes: 3 * 24 * 60 * 60 * 1000, // 3 days (votes happen in sittings)
      stats: 7 * 24 * 60 * 60 * 1000, // 7 days
      committees: 30 * 24 * 60 * 60 * 1000, // 30 days (rarely change)
    };

    const status = {
      mps: checkDate(mpsData?.date, thresholds.mps),
      bills: checkDate(billsData?.date, thresholds.bills),
      votes: checkDate(votesData?.date, thresholds.votes),
      stats: checkDate(statsData?.date, thresholds.stats),
      committees: checkDate(committeesData?.date, thresholds.committees),
    };

    console.log("\n[Monitor] Status Report:");
    console.table(status);

    const isStale = Object.values(status).some(s => s.status === "STALE");

    if (isStale) {
      console.warn("\n[Monitor] ⚠️  Some data is stale!");
      process.exitCode = 1;
    } else {
      console.log("\n[Monitor] ✅ All data is fresh.");
      process.exitCode = 0;
    }
  } catch (err) {
    console.error("[Monitor] Error checking freshness:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

function checkDate(
  date: Date | string | null | undefined,
  thresholdMs: number
) {
  if (!date) return { date: "NEVER", age: "N/A", status: "STALE" };

  const d = new Date(date);
  if (isNaN(d.getTime()))
    return { date: "INVALID", age: "N/A", status: "STALE" };

  const ageMs = new Date().getTime() - d.getTime();
  const ageHours = (ageMs / (1000 * 60 * 60)).toFixed(1);
  const isStale = ageMs > thresholdMs;

  return {
    date: d.toISOString(),
    age: `${ageHours}h`,
    threshold: `${thresholdMs / (1000 * 60 * 60)}h`,
    status: isStale ? "STALE" : "FRESH",
  };
}

checkFreshness();
