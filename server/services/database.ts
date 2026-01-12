import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, desc, and, sql, gte, inArray, lt } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import * as schema from "../../drizzle/schema";
import { logger } from "../utils/logger";
import { CacheService } from "./cache";

// Cache service singleton
let cacheServiceInstance: CacheService | null = null;

async function getCacheService(): Promise<CacheService> {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService();
    await cacheServiceInstance.connect();
  }
  return cacheServiceInstance;
}
import { TRPCError } from "@trpc/server";
import { InsertUser, users } from "../../drizzle/schema";
import { ENV } from "../_core/env";
import {
  mps,
  bills,
  votes,
  mpStats,
  quizQuestions,
  quizAnswers,
  userQuizResults,
  mpAssistants,
  mpTrips,
  committees,
  committeeMembers,
  accountabilityFlags,
  userFollows,
  billSponsors,
  billSummaries,
  sessionMpVotes,
  systemStatus,
  sessionVotes,
  activities,
} from "../../drizzle/schema";

/**
 * Database Connection Pool Configuration
 *
 * Optimized for production workloads:
 * - Connection pooling with limits
 * - Prepared statements
 * - Connection health checks
 * - Graceful shutdown
 */

interface PoolConfig {
  /** Maximum connections in pool */
  max: number;
  /** Idle timeout in seconds */
  idle_timeout: number;
  /** Connection timeout in seconds */
  connect_timeout: number;
  /** Enable prepared statements */
  prepare: boolean;
}

const DEFAULT_POOL_CONFIG: PoolConfig = {
  max: parseInt(process.env.DB_POOL_MAX || "20"),
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: true, // Prepared statements for query performance
};

// Connection pool singleton
let sqlClient: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create database connection pool
 */
export async function getDb() {
  if (db) return db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const config = DEFAULT_POOL_CONFIG;

  logger.info(
    {
      max: config.max,
      idle_timeout: config.idle_timeout,
      prepare: config.prepare,
    },
    "Initializing database connection pool"
  );

  sqlClient = postgres(databaseUrl, {
    max: config.max,
    idle_timeout: config.idle_timeout,
    connect_timeout: config.connect_timeout,
    prepare: config.prepare,

    // Connection lifecycle hooks
    onnotice: notice => {
      logger.debug({ notice: notice.message }, "PostgreSQL notice");
    },
  });

  db = drizzle(sqlClient, { schema });

  // Test connection
  try {
    await sqlClient`SELECT 1`;
    logger.info("Database connection established");
  } catch (err) {
    logger.error({ err }, "Database connection failed");
    throw err;
  }

  return db;
}

/**
 * Get raw SQL client for direct queries
 */
export function getSqlClient() {
  if (!sqlClient) {
    throw new Error("Database not initialized. Call getDb() first.");
  }
  return sqlClient;
}

/**
 * Database health check
 */
export async function healthCheck(): Promise<{
  status: "healthy" | "unhealthy";
  latencyMs: number;
  connections?: number;
}> {
  if (!sqlClient) {
    return { status: "unhealthy", latencyMs: -1 };
  }

  const start = performance.now();

  try {
    await sqlClient`SELECT 1`;
    const latencyMs = performance.now() - start;

    return {
      status: "healthy",
      latencyMs: Math.round(latencyMs * 100) / 100,
    };
  } catch (err) {
    logger.error({ err }, "Database health check failed");
    return {
      status: "unhealthy",
      latencyMs: performance.now() - start,
    };
  }
}

/**
 * Graceful shutdown - close all connections
 */
export async function closeDatabase(): Promise<void> {
  if (sqlClient) {
    await sqlClient.end();
    logger.info("Database connections closed");
    sqlClient = null;
    db = null;
  }
}

/**
 * Query performance wrapper with timing
 */
export async function timedQuery<T>(
  name: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await queryFn();
    const duration = performance.now() - start;

    if (duration > 100) {
      logger.warn(
        {
          query: name,
          duration: `${duration.toFixed(2)}ms`,
        },
        "Slow query detected"
      );
    } else {
      logger.debug(
        {
          query: name,
          duration: `${duration.toFixed(2)}ms`,
        },
        "Query executed"
      );
    }

    return result;
  } catch (err) {
    const duration = performance.now() - start;
    logger.error(
      {
        query: name,
        duration: `${duration.toFixed(2)}ms`,
        err,
      },
      "Query failed"
    );
    throw err;
  }
}

// ==================== User Queries ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User openId is required for upsert",
    });
  }

  const db = await getDb();

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    logger.error({ error }, "Failed to upsert user");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to upsert user",
      cause: error,
    });
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  openId: string,
  settings: {
    emailNotifications?: boolean;
    betaFeatures?: boolean;
    compactMode?: boolean;
  }
) {
  const db = await getDb();

  // Get current user to merge settings
  const currentUser = await getUserByOpenId(openId);
  if (!currentUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  // Merge with existing settings
  const currentSettings = (currentUser.settings as any) || {};
  const updatedSettings = {
    ...currentSettings,
    ...settings,
  };

  // Update user settings
  const result = await db
    .update(users)
    .set({
      settings: updatedSettings,
      updatedAt: new Date(),
    })
    .where(eq(users.openId, openId))
    .returning();

  return result[0];
}

// ==================== MP Queries ====================

export async function getAllMps(filters?: {
  party?: string;
  isActive?: boolean;
}) {
  const db = await getDb();

  const assistantCount = db
    .select({
      mpId: mpAssistants.mpId,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(mpAssistants)
    .groupBy(mpAssistants.mpId)
    .as("assistant_count");

  let query = db
    .select({
      mp: mps,
      assistantCount: sql<number>`COALESCE(${assistantCount.count}, 0)`,
    })
    .from(mps)
    .leftJoin(assistantCount, eq(mps.id, assistantCount.mpId));

  const conditions = [];
  if (filters?.party) {
    conditions.push(eq(mps.party, filters.party));
  }
  if (filters?.isActive !== undefined) {
    conditions.push(eq(mps.isActive, filters.isActive));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query;
  return result.map(r => ({
    ...r.mp,
    assistantCount: Number(r.assistantCount),
  }));
}

export async function getTopDelegates(limit: number = 3) {
  const db = await getDb();

  // Join mps with mpStats and sort by accountabilityScore
  return await db
    .select({
      mp: mps,
      stats: mpStats,
    })
    .from(mps)
    .innerJoin(mpStats, eq(mps.id, mpStats.mpId))
    .orderBy(desc(mpStats.accountabilityScore))
    .limit(limit);
}

export async function getMpById(id: number) {
  const db = await getDb();

  const result = await db.select().from(mps).where(eq(mps.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAssistantsByMpId(mpId: number) {
  const db = await getDb();

  return await db
    .select()
    .from(mpAssistants)
    .where(eq(mpAssistants.mpId, mpId));
}

export async function getTripsByMpId(mpId: number) {
  const db = await getDb();

  return await db.select().from(mpTrips).where(eq(mpTrips.mpId, mpId));
}

export async function getMpBySeimasId(seimasId: string) {
  const db = await getDb();

  const result = await db
    .select()
    .from(mps)
    .where(eq(mps.seimasId, seimasId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchMps(searchTerm: string) {
  const db = await getDb();

  return await db
    .select()
    .from(mps)
    .where(
      sql`${mps.name} ILIKE ${`%${searchTerm}%`} OR ${mps.party} ILIKE ${`%${searchTerm}%`}`
    );
}

/**
 * Get search suggestions for autocomplete (fast, limited results)
 * Returns top 5 MPs and top 5 Bills matching the query
 */
export async function getSearchSuggestions(searchTerm: string) {
  const db = await getDb();

  if (!searchTerm || searchTerm.trim().length === 0) {
    return { mps: [], bills: [] };
  }

  const term = `%${searchTerm.trim()}%`;

  // Search MPs (name only for speed - uses index)
  // Limit to 5 for autocomplete
  const mpsPromise = db
    .select({
      id: mps.id,
      name: mps.name,
      party: mps.party,
      photoUrl: mps.photoUrl,
    })
    .from(mps)
    .where(sql`${mps.name} ILIKE ${term}`)
    .limit(5);

  // Search Bills (title only for speed - uses index)
  // Limit to 5 for autocomplete
  const billsPromise = db
    .select({
      id: bills.id,
      title: bills.title,
      seimasId: bills.seimasId,
      status: bills.status,
    })
    .from(bills)
    .where(sql`${bills.title} ILIKE ${term}`)
    .limit(5);

  // Execute searches in parallel for speed
  const [mpsResults, billsResults] = await Promise.all([
    mpsPromise,
    billsPromise,
  ]);

  return {
    mps: mpsResults,
    bills: billsResults,
  };
}

export async function globalSearch(searchTerm: string, limit: number = 10) {
  const db = await getDb();

  if (!searchTerm || searchTerm.trim().length === 0) {
    return { mps: [], bills: [], committees: [], totalResults: 0 };
  }

  const term = `%${searchTerm.trim()}%`;

  // Search MPs (name, party, or district)
  const mpsPromise = db
    .select()
    .from(mps)
    .where(
      sql`${mps.name} ILIKE ${term} OR ${mps.party} ILIKE ${term} OR ${mps.district} ILIKE ${term}`
    )
    .limit(limit);

  // Search Bills (title or description)
  const billsPromise = db
    .select()
    .from(bills)
    .where(
      sql`${bills.title} ILIKE ${term} OR ${bills.description} ILIKE ${term}`
    )
    .limit(limit);

  // Search Committees (name or description)
  const committeesPromise = db
    .select()
    .from(committees)
    .where(
      sql`${committees.name} ILIKE ${term} OR ${committees.description} ILIKE ${term}`
    )
    .limit(limit);

  // Execute all searches in parallel
  const [mpsResults, billsResults, committeesResults] = await Promise.all([
    mpsPromise,
    billsPromise,
    committeesPromise,
  ]);

  return {
    mps: mpsResults,
    bills: billsResults,
    committees: committeesResults,
    totalResults:
      mpsResults.length + billsResults.length + committeesResults.length,
  };
}

// Helper function to safely convert dates to ISO strings
function serializeDate(date: any): string | null {
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (typeof date === "string") {
    return date;
  }
  return null;
}

// Deep serialize an object's Date fields (handles nested objects)
function serializeObjectDates(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  const serialized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date) {
      serialized[key] = value.toISOString();
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      serialized[key] = serializeObjectDates(value);
    } else {
      serialized[key] = value;
    }
  }
  return serialized;
}

export async function getRecentActivities(
  limit: number = 20,
  offset: number = 0,
  type?: string
) {
  const db = await getDb();

  let query = db
    .select({
      activity: activities,
      mp: mps,
      bill: bills,
    })
    .from(activities)
    .leftJoin(mps, eq(activities.mpId, mps.id))
    .leftJoin(bills, eq(activities.billId, bills.id))
    .orderBy(desc(activities.createdAt))
    .limit(limit)
    .offset(offset);

  if (type) {
    query = query.where(eq(activities.type, type)) as any;
  }

  const rawResults = await query;

  // CRITICAL FIX: Deep serialize ALL dates including joined tables (bills have submittedAt/createdAt!)
  return rawResults.map(row => ({
    activity: row.activity ? serializeObjectDates(row.activity) : null,
    mp: row.mp ? serializeObjectDates(row.mp) : null,
    bill: row.bill ? serializeObjectDates(row.bill) : null,
  }));
}

/**
 * Get activity feed with cursor-based pagination
 * If activities table has data, use it. Otherwise, create synthetic feed from votes and bills.
 */
export async function getActivityFeed(options?: {
  limit?: number;
  cursor?: number;
}) {
  const db = await getDb();
  const limit = options?.limit ?? 20;
  const cursor = options?.cursor;

  // First, try to get activities from activities table
  const conditions = [];
  if (cursor) {
    conditions.push(lt(activities.id, cursor));
  }

  let query = db
    .select({
      activity: activities,
      mp: mps,
      bill: bills,
    })
    .from(activities)
    .leftJoin(mps, eq(activities.mpId, mps.id))
    .leftJoin(bills, eq(activities.billId, bills.id))
    .orderBy(desc(activities.createdAt))
    .limit(limit + 1); // Fetch one extra to determine if there's a next page

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const rawResults = await query;

  // If we have activities, return them
  if (rawResults.length > 0 && rawResults[0].activity) {
    let nextCursor: number | undefined = undefined;
    let items = rawResults;
    if (rawResults.length > limit) {
      nextCursor = rawResults[limit].activity.id;
      items = rawResults.slice(0, limit);
    }

    return {
      items: items.map(row => ({
        activity: row.activity ? serializeObjectDates(row.activity) : null,
        mp: row.mp ? serializeObjectDates(row.mp) : null,
        bill: row.bill ? serializeObjectDates(row.bill) : null,
      })),
      nextCursor,
      hasMore: rawResults.length > limit,
    };
  }

  // Fallback: Create synthetic feed from recent votes and bills
  // Get recent votes (last limit/2)
  const voteLimit = Math.ceil(limit / 2);
  const recentVotes = await db
    .select({
      vote: votes,
      bill: bills,
      mp: mps,
    })
    .from(votes)
    .leftJoin(bills, eq(votes.billId, bills.id))
    .leftJoin(mps, eq(votes.mpId, mps.id))
    .orderBy(desc(votes.votedAt))
    .limit(voteLimit);

  // Get recent bills (last limit/2)
  const billLimit = Math.ceil(limit / 2);
  const recentBills = await db
    .select()
    .from(bills)
    .orderBy(desc(bills.createdAt))
    .limit(billLimit);

  // Combine and sort by date
  const syntheticActivities = [
    ...recentVotes.map(v => ({
      type: "vote" as const,
      createdAt: v.vote.votedAt,
      id: v.vote.id,
      vote: v.vote,
      bill: v.bill,
      mp: v.mp,
    })),
    ...recentBills.map(b => ({
      type: "bill" as const,
      createdAt: b.createdAt,
      id: b.id,
      bill: b,
      mp: null,
      vote: null,
    })),
  ]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit);

  return {
    items: syntheticActivities.map(item => ({
      activity:
        item.type === "vote"
          ? {
              id: item.id,
              type: "vote",
              mpId: item.vote?.mpId,
              billId: item.vote?.billId,
              createdAt: item.createdAt,
              metadata: { voteValue: item.vote?.voteValue },
            }
          : {
              id: item.id,
              type: "document",
              mpId: null,
              billId: item.bill?.id,
              createdAt: item.createdAt,
              metadata: { title: item.bill?.title },
            },
      mp: item.mp ? serializeObjectDates(item.mp) : null,
      bill: item.bill ? serializeObjectDates(item.bill) : null,
    })),
    nextCursor: undefined, // Synthetic feed doesn't support pagination yet
    hasMore: false,
  };
}

// ==================== MP Statistics Queries ====================

export async function getMpStats(mpId: number) {
  const db = await getDb();

  const result = await db
    .select()
    .from(mpStats)
    .where(eq(mpStats.mpId, mpId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getGlobalStats() {
  const db = await getDb();

  const [totalMps] = await db
    .select({ count: sql<number>`count(*)` })
    .from(mps)
    .where(eq(mps.isActive, true));
  const [totalBills] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bills);
  const [avgAttendance] = await db
    .select({ avg: sql<string>`avg(voting_attendance)` })
    .from(mpStats);
  const [billsPassed] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bills)
    .where(eq(bills.status, "passed"));

  return {
    totalMps: Number(totalMps.count),
    totalBills: Number(totalBills.count),
    avgAttendance: parseFloat(avgAttendance.avg || "0").toFixed(1),
    billsPassed: Number(billsPassed.count),
  };
}

export async function upsertMpStats(stats: typeof mpStats.$inferInsert) {
  const db = await getDb();

  await db
    .insert(mpStats)
    .values(stats)
    .onConflictDoUpdate({
      target: mpStats.mpId,
      set: {
        votingAttendance: stats.votingAttendance,
        partyLoyalty: stats.partyLoyalty,
        billsProposed: stats.billsProposed,
        billsPassed: stats.billsPassed,
        accountabilityScore: stats.accountabilityScore,
        lastCalculated: new Date(),
      },
    });
}

// ==================== Activity Pulse Query ====================

export async function getActivityPulse() {
  const db = await getDb();

  // Generate a sequence of the last 30 days
  // Left join with aggregated daily counts from bills and votes
  const result = await db.execute(sql`
    WITH dates AS (
        SELECT generate_series(
            current_date - interval '30 days',
            current_date,
            '1 day'::interval
        )::date AS day
    ),
    daily_activity AS (
        SELECT 
            created_at::date as day,
            count(*) as count
        FROM bills
        WHERE created_at > current_date - interval '30 days'
        GROUP BY 1
        
        UNION ALL
        
        SELECT 
            voted_at::date as day,
            count(*) as count
        FROM votes
        WHERE voted_at > current_date - interval '30 days'
        GROUP BY 1
    )
    SELECT 
        to_char(dates.day, 'YYYY-MM-DD') as date,
        COALESCE(SUM(daily_activity.count), 0)::int as count
    FROM dates
    LEFT JOIN daily_activity ON dates.day = daily_activity.day
    GROUP BY dates.day
    ORDER BY dates.day ASC
  `);

  return result as unknown as { date: string; count: number }[];
}

// ==================== Bill Queries ====================

export async function getAllBills(
  filters?: {
    status?: string;
    category?: string;
  },
  options?: {
    limit?: number;
    cursor?: number;
  }
) {
  const db = await getDb();
  const limit = options?.limit ?? 20;
  const cursor = options?.cursor;

  let query = db
    .select()
    .from(bills)
    .orderBy(desc(bills.createdAt))
    .limit(limit + 1); // Fetch one extra to determine if there's a next page

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(bills.status, filters.status));
  }
  if (filters?.category) {
    conditions.push(eq(bills.category, filters.category));
  }
  // Cursor-based pagination: fetch bills with ID less than cursor
  if (cursor) {
    conditions.push(lt(bills.id, cursor));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const results = await query;

  // Determine next cursor
  let nextCursor: number | undefined = undefined;
  if (results.length > limit) {
    const lastItem = results[limit];
    nextCursor = lastItem.id;
    results.pop(); // Remove the extra item
  }

  return {
    items: results,
    nextCursor,
    hasMore: results.length === limit && nextCursor !== undefined,
  };
}

export async function getBillById(id: number) {
  const db = await getDb();

  const result = await db.select().from(bills).where(eq(bills.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== Vote Queries ====================

export async function getVotesByMpId(
  mpId: number,
  options?: { limit?: number; cursor?: number }
) {
  const db = await getDb();
  const limit = options?.limit ?? 50;
  const cursor = options?.cursor;

  // Build where conditions
  const conditions = [eq(votes.mpId, mpId)];
  if (cursor) {
    conditions.push(lt(votes.id, cursor));
  }

  const results = await db
    .select({
      vote: votes,
      bill: bills,
    })
    .from(votes)
    .leftJoin(bills, eq(votes.billId, bills.id))
    .where(and(...conditions))
    .orderBy(desc(votes.votedAt))
    .limit(limit + 1); // Fetch one extra to determine if there's a next page

  // Determine next cursor
  let nextCursor: number | undefined = undefined;
  let items = results;
  if (results.length > limit) {
    const lastItem = results[limit];
    nextCursor = lastItem.vote.id;
    items = results.slice(0, limit); // Remove the extra item
  }

  return {
    items,
    nextCursor,
    hasMore: results.length > limit,
  };
}

export async function getVotesByBillId(billId: number) {
  const db = await getDb();

  return await db
    .select({
      vote: votes,
      mp: mps,
    })
    .from(votes)
    .leftJoin(mps, eq(votes.mpId, mps.id))
    .where(eq(votes.billId, billId));
}

// Helper function to format month name in Lithuanian
function formatMonthName(month: string): string {
  const [year, monthNum] = month.split("-");
  const monthNames = [
    "Sausis",
    "Vasaris",
    "Kovas",
    "Balandis",
    "Gegužė",
    "Birželis",
    "Liepa",
    "Rugpjūtis",
    "Rugsėjis",
    "Spalis",
    "Lapkritis",
    "Gruodis",
  ];
  const monthIndex = parseInt(monthNum, 10) - 1;
  return monthNames[monthIndex] || month;
}

// Generate array of last 6 months in YYYY-MM format
function generateLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    months.push(`${year}-${month}`);
  }
  return months;
}

// Get session frequency stats
async function getSessionFrequencyStats(
  db: Awaited<ReturnType<typeof getDb>>,
  sixMonthsAgo: Date
) {
  try {
    const sessionStats = await db
      .select({
        date: sql<string>`TO_CHAR(${sessionVotes.voteDate}, 'YYYY-MM-DD')`.as(
          "date"
        ),
        sessionCount: sql<number>`COUNT(DISTINCT ${sessionVotes.sessionId})`.as(
          "sessionCount"
        ),
        totalVoted: sql<number>`SUM(${sessionVotes.totalVoted})`.as(
          "totalVoted"
        ),
        votedFor: sql<number>`SUM(${sessionVotes.votedFor})`.as("votedFor"),
        votedAgainst: sql<number>`SUM(${sessionVotes.votedAgainst})`.as(
          "votedAgainst"
        ),
        abstained: sql<number>`SUM(${sessionVotes.abstained})`.as("abstained"),
      })
      .from(sessionVotes)
      .where(gte(sessionVotes.voteDate, sixMonthsAgo))
      .groupBy(sql`TO_CHAR(${sessionVotes.voteDate}, 'YYYY-MM-DD')`);

    return sessionStats.map(row => ({
      date: row.date,
      sessionCount: Number(row.sessionCount),
      attendanceRate:
        row.totalVoted > 0
          ? ((Number(row.votedFor) +
              Number(row.votedAgainst) +
              Number(row.abstained)) /
              Number(row.totalVoted)) *
            100
          : 0,
    }));
  } catch (error) {
    logger.warn({ error }, "Error fetching session stats");
    return [];
  }
}

// Calculate average attendance
function calculateAvgAttendance(
  sessionStats: Array<{ attendanceRate: number }>
): number {
  if (sessionStats.length === 0) return 0;
  const sum = sessionStats.reduce((acc, stat) => acc + stat.attendanceRate, 0);
  return sum / sessionStats.length;
}

// ==================== Pulse Analytics Queries ====================

export async function getParliamentPulse() {
  const db = await getDb();
  const cacheService = await getCacheService();

  // Cache key
  const cacheKey = "parliament_pulse";

  // Try to get from cache first
  try {
    const cached = await cacheService.get(
      cacheKey,
      async () => {
        // Calculate function (only called on cache miss)
        return await calculateParliamentPulseData(db);
      },
      {
        ttl: 3600, // 1 hour TTL
        staleTolerance: 300, // 5 minutes stale tolerance
      }
    );
    return cached;
  } catch (error) {
    // If cache fails, calculate live data
    logger.warn(
      { err: error },
      "Cache error for parliament pulse, calculating live"
    );
    return await calculateParliamentPulseData(db);
  }
}

/**
 * Calculate Parliament Pulse data (extracted for caching)
 */
async function calculateParliamentPulseData(
  db: Awaited<ReturnType<typeof getDb>>
) {
  // Calculate date 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Group votes by month and vote type
  const monthlyVotes = await db
    .select({
      month: sql<string>`TO_CHAR(${votes.votedAt}, 'YYYY-MM')`.as("month"),
      voteValue: votes.voteValue,
      count: sql<number>`COUNT(*)`.as("count"),
    })
    .from(votes)
    .where(gte(votes.votedAt, sixMonthsAgo))
    .groupBy(sql`TO_CHAR(${votes.votedAt}, 'YYYY-MM')`, votes.voteValue);

  // Transform to Recharts-friendly format
  // Group by month, then aggregate vote types
  const groupedByMonth = monthlyVotes.reduce(
    (acc, row) => {
      const month = row.month;
      if (!acc[month]) {
        acc[month] = {
          name: formatMonthName(month),
          for: 0,
          against: 0,
          abstain: 0,
          absent: 0,
        };
      }
      const voteType = row.voteValue.toLowerCase();
      if (voteType === "for") acc[month].for = Number(row.count);
      else if (voteType === "against") acc[month].against = Number(row.count);
      else if (voteType === "abstain") acc[month].abstain = Number(row.count);
      else if (voteType === "absent") acc[month].absent = Number(row.count);
      return acc;
    },
    {} as Record<
      string,
      {
        name: string;
        for: number;
        against: number;
        abstain: number;
        absent: number;
      }
    >
  );

  // Convert to array and ensure all 6 months are present
  const allMonths = generateLast6Months();
  const result = allMonths.map(
    month =>
      groupedByMonth[month] || {
        name: formatMonthName(month),
        for: 0,
        against: 0,
        abstain: 0,
        absent: 0,
      }
  );

  // Session stats (using sessionVotes if available)
  const sessionStats = await getSessionFrequencyStats(db, sixMonthsAgo);

  return {
    monthlyVotes: result,
    sessionStats,
    summary: {
      totalVotes: monthlyVotes.reduce((sum, r) => sum + Number(r.count), 0),
      avgAttendance: calculateAvgAttendance(sessionStats),
    },
  };
}

// ==================== Quiz Queries ====================

export async function getAllQuizQuestions() {
  const db = await getDb();

  return await db.select().from(quizQuestions);
}

export async function getQuizAnswersByMpId(mpId: number) {
  const db = await getDb();

  return await db
    .select({
      answer: quizAnswers,
      question: quizQuestions,
    })
    .from(quizAnswers)
    .leftJoin(quizQuestions, eq(quizAnswers.questionId, quizQuestions.id))
    .where(eq(quizAnswers.mpId, mpId));
}

export async function saveUserQuizResult(
  result: typeof userQuizResults.$inferInsert
) {
  const db = await getDb();

  await db.insert(userQuizResults).values(result);
}

export async function getUserQuizResults(sessionId: string) {
  const db = await getDb();

  return await db
    .select()
    .from(userQuizResults)
    .where(eq(userQuizResults.sessionId, sessionId));
}

// ==================== Committee Queries ====================

export async function getAllCommittees() {
  const db = await getDb();
  return await db.select().from(committees);
}

export async function getCommitteeById(id: number) {
  const db = await getDb();
  const result = await db
    .select()
    .from(committees)
    .where(eq(committees.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCommitteeMembers(committeeId: number) {
  const db = await getDb();
  return await db
    .select({
      member: committeeMembers,
      mp: mps,
    })
    .from(committeeMembers)
    .leftJoin(mps, eq(committeeMembers.mpId, mps.id))
    .where(eq(committeeMembers.committeeId, committeeId));
}

// ==================== Accountability Queries ====================

export async function getFlagsByMpId(mpId: number) {
  const db = await getDb();
  return await db
    .select()
    .from(accountabilityFlags)
    .where(eq(accountabilityFlags.mpId, mpId));
}

export async function createAccountabilityFlag(
  flag: typeof accountabilityFlags.$inferInsert
) {
  const db = await getDb();
  const result = await db.insert(accountabilityFlags).values(flag).returning();
  return result[0];
}

export async function resolveAccountabilityFlag(id: number) {
  const db = await getDb();
  const result = await db
    .update(accountabilityFlags)
    .set({ resolved: true })
    .where(eq(accountabilityFlags.id, id))
    .returning();
  return result[0];
}

// ==================== User Follows Queries ====================

export async function getUserFollows(userId: string) {
  const db = await getDb();
  return await db
    .select({
      follow: userFollows,
      mp: mps,
      bill: bills,
    })
    .from(userFollows)
    .leftJoin(mps, eq(userFollows.mpId, mps.id))
    .leftJoin(bills, eq(userFollows.billId, bills.id))
    .where(eq(userFollows.userId, userId));
}

export async function followEntity(follow: typeof userFollows.$inferInsert) {
  const db = await getDb();
  // Check if already follows
  const existing = await db
    .select()
    .from(userFollows)
    .where(
      and(
        eq(userFollows.userId, follow.userId),
        follow.mpId ? eq(userFollows.mpId, follow.mpId) : sql`1=1`,
        follow.billId ? eq(userFollows.billId, follow.billId) : sql`1=1`,
        follow.topic ? eq(userFollows.topic, follow.topic) : sql`1=1`
      )
    )
    .limit(1);

  if (existing.length > 0) return existing[0];

  const result = await db.insert(userFollows).values(follow).returning();
  return result[0];
}

export async function unfollowEntity(id: number) {
  const db = await getDb();
  return await db.delete(userFollows).where(eq(userFollows.id, id)).returning();
}

// Get watchlist (MPs followed by user) - FIXED N+1 QUERY
export async function getWatchlist(userId: string) {
  const db = await getDb();

  // SINGLE QUERY with JOIN - eliminates N+1 problem
  const results = await db
    .select({
      mp: mps,
      followedAt: userFollows.createdAt,
    })
    .from(userFollows)
    .innerJoin(mps, eq(userFollows.mpId, mps.id))
    .where(
      and(
        eq(userFollows.userId, userId),
        sql`${userFollows.mpId} IS NOT NULL` // Only MP follows
      )
    )
    .orderBy(desc(userFollows.createdAt));

  // Map to include followedAt timestamp
  return results.map(row => ({
    ...row.mp,
    followedAt: row.followedAt,
  }));
}

// Check if user follows an MP
export async function isFollowingMp(
  userId: string,
  mpId: number
): Promise<boolean> {
  const db = await getDb();

  const result = await db
    .select({ id: userFollows.id })
    .from(userFollows)
    .where(and(eq(userFollows.userId, userId), eq(userFollows.mpId, mpId)))
    .limit(1);

  return result.length > 0;
}

// Toggle follow (fast - check then insert/delete)
export async function toggleFollowMp(
  userId: string,
  mpId: number
): Promise<{ isFollowing: boolean; followId?: number }> {
  const db = await getDb();

  // Check if already following
  const existing = await db
    .select({ id: userFollows.id })
    .from(userFollows)
    .where(and(eq(userFollows.userId, userId), eq(userFollows.mpId, mpId)))
    .limit(1);

  if (existing.length > 0) {
    // Unfollow - delete
    await db.delete(userFollows).where(eq(userFollows.id, existing[0].id));
    return { isFollowing: false };
  } else {
    // Follow - insert
    const result = await db
      .insert(userFollows)
      .values({
        userId,
        mpId,
        billId: null,
        topic: null,
      })
      .returning({ id: userFollows.id });
    return { isFollowing: true, followId: result[0]?.id };
  }
}

// ==================== Bill Sponsors/Summaries Queries ====================

export async function getBillSponsors(billId: number) {
  const db = await getDb();
  return await db
    .select({
      sponsor: billSponsors,
      mp: mps,
    })
    .from(billSponsors)
    .leftJoin(mps, eq(billSponsors.mpId, mps.id))
    .where(eq(billSponsors.billId, billId));
}

export async function getBillSummary(billId: number) {
  const db = await getDb();
  const result = await db
    .select()
    .from(billSummaries)
    .where(eq(billSummaries.billId, billId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBillSummary(
  summary: typeof billSummaries.$inferInsert
) {
  const db = await getDb();
  // Upsert
  const result = await db
    .insert(billSummaries)
    .values(summary)
    .onConflictDoUpdate({
      target: billSummaries.billId,
      set: {
        summary: summary.summary,
        bulletPoints: summary.bulletPoints,
        generatedAt: new Date(),
      },
    })
    .returning();
  return result[0];
}

// ==================== Extra MP Queries ====================

export async function getAllTrips() {
  const db = await getDb();
  return await db
    .select({
      trip: mpTrips,
      mp: mps,
    })
    .from(mpTrips)
    .leftJoin(mps, eq(mpTrips.mpId, mps.id))
    .orderBy(desc(mpTrips.startDate))
    .limit(100);
}

export async function getDataFreshness() {
  const db = await getDb();

  const [mpsData] = await db
    .select({ lastUpdated: sql<Date>`max(${mps.updatedAt})` })
    .from(mps);

  const [billsData] = await db
    .select({ lastUpdated: sql<Date>`max(${bills.updatedAt})` })
    .from(bills);

  const [votesData] = await db
    .select({ lastVoteDate: sql<Date>`max(${sessionVotes.voteDate})` })
    .from(sessionVotes);

  const [statsData] = await db
    .select({
      lastCalculated: sql<Date>`max(${mpStats.lastCalculated})`,
    })
    .from(mpStats);

  const [committeesData] = await db
    .select({
      lastUpdated: sql<Date>`max(${committeeMembers.joinedAt})`,
    })
    .from(committeeMembers);

  return {
    mps: mpsData?.lastUpdated || null,
    bills: billsData?.lastUpdated || null,
    votes: votesData?.lastVoteDate || null,
    stats: statsData?.lastCalculated || null,
    committees: committeesData?.lastUpdated || null,
  };
}

/**
 * Get last updated timestamps from system_status table
 * Falls back to data freshness if system_status is not available
 */
export async function getLastUpdated() {
  const db = await getDb();

  try {
    // Try to get from system_status table first (more accurate)
    const statusRecords = await db
      .select()
      .from(systemStatus)
      .where(
        sql`${systemStatus.jobName} IN ('votes_sync', 'bills_sync', 'mps_sync', 'bill_summaries')`
      );

    const statusMap = new Map(
      statusRecords.map(r => [r.jobName, r.lastSuccessfulRun])
    );

    // Fallback to data freshness if system_status is empty
    const freshness = await getDataFreshness();

    return {
      votes: statusMap.get("votes_sync") || freshness.votes,
      bills: statusMap.get("bills_sync") || freshness.bills,
      mps: statusMap.get("mps_sync") || freshness.mps,
      summaries: statusMap.get("bill_summaries") || null,
      // Overall: use the most recent timestamp
      overall:
        [
          statusMap.get("votes_sync"),
          statusMap.get("bills_sync"),
          statusMap.get("mps_sync"),
          freshness.votes,
          freshness.bills,
          freshness.mps,
        ]
          .filter((d): d is Date => d !== null && d !== undefined)
          .sort((a, b) => b.getTime() - a.getTime())[0] || null,
    };
  } catch (err) {
    // If system_status table doesn't exist yet, fall back to data freshness
    logger.warn(
      { err },
      "system_status table not available, using data freshness"
    );
    const freshness = await getDataFreshness();
    return {
      votes: freshness.votes,
      bills: freshness.bills,
      mps: freshness.mps,
      summaries: null,
      overall: freshness.votes || freshness.bills || freshness.mps || null,
    };
  }
}

export async function getMpComparison(mpId1: number, mpId2: number) {
  const db = await getDb();

  // OPTIMIZED: Fetch MP data and stats in parallel
  const [mp1, mp2, stats1, stats2] = await Promise.all([
    getMpById(mpId1),
    getMpById(mpId2),
    getMpStats(mpId1),
    getMpStats(mpId2),
  ]);

  if (!mp1 || !mp2) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `One or both MPs not found: ${mpId1}, ${mpId2}`,
    });
  }

  // Get votes for both MPs on bills (using votes table) - parallel queries
  const [votes1, votes2] = await Promise.all([
    db
      .select({
        billId: votes.billId,
        voteValue: votes.voteValue,
        votedAt: votes.votedAt,
        bill: bills,
      })
      .from(votes)
      .leftJoin(bills, eq(votes.billId, bills.id))
      .where(eq(votes.mpId, mpId1)),
    db
      .select({
        billId: votes.billId,
        voteValue: votes.voteValue,
        votedAt: votes.votedAt,
        bill: bills,
      })
      .from(votes)
      .leftJoin(bills, eq(votes.billId, bills.id))
      .where(eq(votes.mpId, mpId2)),
  ]);

  // Map mp1 votes by billId
  const map1 = new Map<
    number,
    { voteValue: string; votedAt: Date | null; bill: any }
  >();
  for (const v of votes1) {
    if (v.billId !== null) {
      map1.set(v.billId, {
        voteValue: v.voteValue,
        votedAt: v.votedAt,
        bill: v.bill,
      });
    }
  }

  // Find common bills and calculate agreement
  let common = 0;
  let same = 0;
  const disagreements: Array<{
    billId: number;
    billTitle: string;
    mp1Vote: string;
    mp2Vote: string;
    votedAt: Date | null;
  }> = [];

  for (const v of votes2) {
    if (v.billId !== null && map1.has(v.billId)) {
      common++;
      const mp1Vote = map1.get(v.billId)!;
      if (mp1Vote.voteValue === v.voteValue) {
        same++;
      } else {
        // Record disagreement
        disagreements.push({
          billId: v.billId,
          billTitle: v.bill?.title || `Bill #${v.billId}`,
          mp1Vote: mp1Vote.voteValue,
          mp2Vote: v.voteValue,
          votedAt: v.votedAt || mp1Vote.votedAt,
        });
      }
    }
  }

  // Sort disagreements by date (most recent first) and limit to 10
  disagreements.sort((a, b) => {
    const dateA = a.votedAt ? new Date(a.votedAt).getTime() : 0;
    const dateB = b.votedAt ? new Date(b.votedAt).getTime() : 0;
    return dateB - dateA;
  });

  const agreementScore = common > 0 ? (same / common) * 100 : null; // null if no common votes

  return {
    mp1: { ...mp1, stats: stats1 },
    mp2: { ...mp2, stats: stats2 },
    agreementScore,
    commonVotes: common,
    disagreements: disagreements.slice(0, 10), // Top 10 recent disagreements
    hasOverlap: common > 0, // Flag for edge case handling
  };
}

// ==================== Activity Queries ====================

export async function getActivityById(id: number) {
  const db = await getDb();

  const result = await db
    .select({
      activity: activities,
      mp: mps,
      bill: bills,
    })
    .from(activities)
    .leftJoin(mps, eq(activities.mpId, mps.id))
    .leftJoin(bills, eq(activities.billId, bills.id))
    .where(eq(activities.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createActivity(activity: typeof activities.$inferInsert) {
  const db = await getDb();

  const result = await db.insert(activities).values(activity).returning();
  return result[0];
}

export async function markActivitiesAsRead() {
  const db = await getDb();

  await db
    .update(activities)
    .set({ isNew: false })
    .where(eq(activities.isNew, true));
}
