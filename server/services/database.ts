import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, desc, and, sql, gte, lte, inArray, lt } from "drizzle-orm";
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
  userActivityReads,
  watchlist,
  userFeedback,
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
 * Execute a query with Row Level Security (RLS) context
 *
 * This function wraps queries in a transaction that sets app.current_user_id
 * so PostgreSQL RLS policies can filter rows based on the authenticated user.
 *
 * Implementation: Uses postgres.js transaction with SET LOCAL, then creates
 * a drizzle instance that uses the transaction client. The transaction client
 * from postgres.js.begin() should be compatible with drizzle.
 *
 * @param userId - The user's openId (must match users.openId column)
 * @param queryFn - Function that executes database queries using the provided db instance
 * @returns Result of the query function
 */
export async function withUserContext<T>(
  userId: string,
  queryFn: (db: ReturnType<typeof drizzle>) => Promise<T>
): Promise<T> {
  const sqlClient = getSqlClient();

  // Use a transaction to set the user context
  // SET LOCAL only applies to the current transaction
  const result = await sqlClient.begin(async tx => {
    // Set the user context variable for RLS policies
    // Escape single quotes in userId to prevent SQL injection
    const escapedUserId = userId.replace(/'/g, "''");
    await tx.unsafe(`SET LOCAL app.current_user_id = '${escapedUserId}'`);

    // Create a new postgres client instance from the transaction
    // The transaction (tx) is already a postgres client, so we can use it directly
    // However, drizzle might need the full client structure
    // Try using the transaction client directly with drizzle
    const txDb = drizzle(tx, { schema });

    return await queryFn(txDb);
  });

  return result as T;
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
  const sqlClient = getSqlClient();

  // Use RLS context via transaction
  return await sqlClient.begin(async tx => {
    // Set RLS context
    const escapedOpenId = openId.replace(/'/g, "''");
    await tx.unsafe(`SET LOCAL app.current_user_id = '${escapedOpenId}'`);

    // Get current user (RLS ensures we only see own user)
    const [currentUser] = await tx`
      SELECT * FROM users WHERE "openId" = ${openId} LIMIT 1
    `;

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

    // Update user settings (RLS ensures we can only update own user)
    const [updated] = await tx`
      UPDATE users
      SET settings = ${JSON.stringify(updatedSettings)}::jsonb,
          "updatedAt" = NOW()
      WHERE "openId" = ${openId}
      RETURNING *
    `;

    return updated;
  });
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
    return { mps: [], bills: [], committees: [] };
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

  // Search Committees (name only for speed)
  // Limit to 5 for autocomplete
  const committeesPromise = db
    .select({
      id: committees.id,
      name: committees.name,
      description: committees.description,
    })
    .from(committees)
    .where(sql`${committees.name} ILIKE ${term}`)
    .limit(5);

  // Execute searches in parallel for speed
  const [mpsResults, billsResults, committeesResults] = await Promise.all([
    mpsPromise,
    billsPromise,
    committeesPromise,
  ]);

  return {
    mps: mpsResults,
    bills: billsResults,
    committees: committeesResults,
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
  type?: string,
  userId?: string // Optional user ID for read tracking
) {
  const db = await getDb();

  let query = db
    .select({
      activity: activities,
      mp: mps,
      bill: bills,
      // If userId is provided, check if read
      readAt: userId ? userActivityReads.readAt : sql<null>`null`,
    })
    .from(activities)
    .leftJoin(mps, eq(activities.mpId, mps.id))
    .leftJoin(bills, eq(activities.billId, bills.id));

  // If userId is provided, join with read status
  if (userId) {
    query = query.leftJoin(
      userActivityReads,
      and(
        eq(activities.id, userActivityReads.activityId),
        eq(userActivityReads.userId, userId)
      )
    ) as any;
  }

  query = query
    .orderBy(desc(activities.createdAt))
    .limit(limit)
    .offset(offset) as any;

  if (type) {
    query = query.where(eq(activities.type, type)) as any;
  }

  const rawResults = await query;

  // CRITICAL FIX: Deep serialize ALL dates including joined tables (bills have submittedAt/createdAt!)
  // AND: map isNew based on read status if userId is present
  return rawResults.map(row => {
    const activity = row.activity ? serializeObjectDates(row.activity) : null;

    // If we have a user context, override isNew based on whether a read record exists
    if (activity && userId) {
      // It is NEW if there is NO read record (readAt is null/undefined)
      // row.readAt comes from the join
      activity.isNew = !row.readAt;
    }

    return {
      activity,
      mp: row.mp ? serializeObjectDates(row.mp) : null,
      bill: row.bill ? serializeObjectDates(row.bill) : null,
    };
  });
}

export async function markActivitiesAsRead(
  userId: string,
  activityIds?: number[]
) {
  const sqlClient = getSqlClient();

  // Use RLS context via transaction
  return await sqlClient.begin(async tx => {
    // Set RLS context
    const escapedUserId = userId.replace(/'/g, "''");
    await tx.unsafe(`SET LOCAL app.current_user_id = '${escapedUserId}'`);

    if (activityIds && activityIds.length > 0) {
      // Mark specific activities as read
      const values = activityIds
        .map(id => `('${escapedUserId}', ${id}, NOW())`)
        .join(", ");
      await tx.unsafe(`
        INSERT INTO user_activity_reads (user_id, activity_id, read_at)
        VALUES ${values}
        ON CONFLICT (user_id, activity_id) DO NOTHING
      `);
    } else {
      // Mark ALL currently unread activities as read
      // RLS ensures we only see this user's read status
      const unread = await tx`
        SELECT a.id
        FROM activities a
        LEFT JOIN user_activity_reads uar ON a.id = uar.activity_id
        WHERE uar.read_at IS NULL
        LIMIT 500
      `;

      if (unread.length > 0) {
        const values = unread
          .map((row: any) => `('${escapedUserId}', ${row.id}, NOW())`)
          .join(", ");
        await tx.unsafe(`
          INSERT INTO user_activity_reads (user_id, activity_id, read_at)
          VALUES ${values}
          ON CONFLICT (user_id, activity_id) DO NOTHING
        `);
      }
    }
  });
}

/**
 * Get activity feed with cursor-based pagination
 * Returns activities from the activities table. Activities are populated from votes and bills via the populate-activities script.
 */
export async function getActivityFeed(options?: {
  limit?: number;
  cursor?: number;
  userId?: string; // NEW: for filtering read items
  excludeRead?: boolean; // NEW: whether to hide read items
}) {
  const db = await getDb();
  const limit = options?.limit ?? 20;
  const cursor = options?.cursor;
  const userId = options?.userId;
  const excludeRead = options?.excludeRead ?? false;

  // First, try to get activities from activities table
  const conditions = [];
  if (cursor) {
    conditions.push(lt(activities.id, cursor));
  }

  // Add filter for read items if requested
  if (excludeRead && userId) {
    conditions.push(
      sql`NOT EXISTS(
        SELECT 1 FROM user_activity_reads 
        WHERE user_id = ${userId} 
        AND activity_id = ${activities.id}
      )`
    );
  }

  let query = db
    .select({
      activity: activities,
      mp: mps,
      bill: bills,
      isRead: userId
        ? sql<boolean>`EXISTS(
            SELECT 1 FROM user_activity_reads 
            WHERE user_id = ${userId} 
            AND activity_id = ${activities.id}
          )`
        : sql<boolean>`false`,
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

  // Process results and return pagination info
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
  options?: {
    limit?: number;
    cursor?: number;
    fromDate?: Date | string;
    toDate?: Date | string;
  }
) {
  const db = await getDb();
  const limit = options?.limit ?? 50;
  const cursor = options?.cursor;
  const fromDate = options?.fromDate
    ? new Date(options.fromDate)
    : undefined;
  const toDate = options?.toDate ? new Date(options.toDate) : undefined;

  // Build where conditions
  const conditions = [eq(votes.mpId, mpId)];
  if (cursor) {
    conditions.push(lt(votes.id, cursor));
  }
  if (fromDate) {
    conditions.push(gte(votes.votedAt, fromDate));
  }
  if (toDate) {
    conditions.push(lte(votes.votedAt, toDate));
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

// ==================== Watchlist Queries (Gold Tier) ====================

/**
 * Get all items in a user's watchlist
 * Uses RLS context + explicit userId filter for defense-in-depth
 */
export async function getWatchlistItems(userId: string) {
  return await withUserContext(userId, async db => {
    const rows = await db
      .select({
        id: watchlist.id,
        createdAt: watchlist.createdAt,
        mp: {
          id: mps.id,
          name: mps.name,
          party: mps.party,
          photoUrl: mps.photoUrl,
        },
        bill: {
          id: bills.id,
          title: bills.title,
          status: bills.status,
        },
      })
      .from(watchlist)
      .leftJoin(mps, eq(watchlist.mpId, mps.id))
      .leftJoin(bills, eq(watchlist.billId, bills.id))
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.createdAt));

    return rows.map(row => ({
      ...row,
      mp: row.mp?.id ? row.mp : null,
      bill: row.bill?.id ? row.bill : null,
    }));
  });
}

/**
 * Add an item to the watchlist
 */
export async function addToWatchlist(
  userId: string,
  data: { mpId?: number; billId?: number }
) {
  return await withUserContext(userId, async db => {
    const [inserted] = await db
      .insert(watchlist)
      .values({
        userId,
        mpId: data.mpId ?? null,
        billId: data.billId ?? null,
      })
      .returning();
    return inserted;
  });
}

/**
 * Remove an item from the watchlist
 */
export async function removeFromWatchlist(userId: string, id: number) {
  return await withUserContext(userId, async db => {
    const [deleted] = await db
      .delete(watchlist)
      .where(and(eq(watchlist.id, id), eq(watchlist.userId, userId)))
      .returning();
    return deleted;
  });
}

// ==================== User Feedback ====================
export async function submitUserFeedback(
  userId: string,
  data: { category?: string; message: string; metadata?: any }
) {
  return await withUserContext(userId, async db => {
    const [inserted] = await db
      .insert(userFeedback)
      .values({
        userId,
        category: data.category ?? "data_discrepancy",
        message: data.message,
        metadata: data.metadata ?? null,
      })
      .returning();
    return inserted;
  });
}

// ==================== User Follows Queries ====================

export async function getUserFollows(userId: string) {
  const db = await getDb();
  const sqlClient = getSqlClient();

  // Use RLS context via transaction
  return await sqlClient.begin(async tx => {
    // Set RLS context
    const escapedUserId = userId.replace(/'/g, "''");
    await tx.unsafe(`SET LOCAL app.current_user_id = '${escapedUserId}'`);

    // Execute query via transaction - use raw SQL since drizzle doesn't work with tx
    const result = await tx`
      SELECT 
        uf.* as follow,
        m.* as mp,
        b.* as bill
      FROM user_follows uf
      LEFT JOIN mps m ON uf.mp_id = m.id
      LEFT JOIN bills b ON uf.bill_id = b.id
    `;

    // Transform result to match expected format
    return result.map((row: any) => ({
      follow: row.follow,
      mp: row.mp,
      bill: row.bill,
    }));
  });
}

export async function followEntity(follow: typeof userFollows.$inferInsert) {
  const sqlClient = getSqlClient();

  // Use RLS context via transaction
  return await sqlClient.begin(async tx => {
    // Set RLS context
    const escapedUserId = follow.userId.replace(/'/g, "''");
    await tx.unsafe(`SET LOCAL app.current_user_id = '${escapedUserId}'`);

    // Check if already follows (RLS ensures we only see own follows)
    const conditions = [];
    if (follow.mpId) conditions.push(`mp_id = ${follow.mpId}`);
    if (follow.billId) conditions.push(`bill_id = ${follow.billId}`);
    if (follow.topic)
      conditions.push(`topic = '${follow.topic.replace(/'/g, "''")}'`);

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const existing = await tx.unsafe(`
      SELECT * FROM user_follows ${whereClause} LIMIT 1
    `);

    if (existing.length > 0) return existing[0];

    // Insert follow (RLS policy ensures userId matches app.current_user_id)
    const [result] = await tx`
      INSERT INTO user_follows (user_id, mp_id, bill_id, topic, created_at)
      VALUES (
        ${follow.userId},
        ${follow.mpId ?? null},
        ${follow.billId ?? null},
        ${follow.topic ?? null},
        NOW()
      )
      RETURNING *
    `;

    return result;
  });
}

export async function unfollowEntity(userId: string, id: number) {
  // Use RLS context to ensure user can only delete their own follows
  return await withUserContext(userId, async db => {
    // RLS policy ensures we can only delete own follows
    return await db
      .delete(userFollows)
      .where(eq(userFollows.id, id))
      .returning();
  });
}

// Get watchlist (MPs followed by user) - FIXED N+1 QUERY
export async function getWatchlist(userId: string) {
  const sqlClient = getSqlClient();

  // Use RLS context via transaction
  return await sqlClient.begin(async tx => {
    // Set RLS context
    const escapedUserId = userId.replace(/'/g, "''");
    await tx.unsafe(`SET LOCAL app.current_user_id = '${escapedUserId}'`);

    // SINGLE QUERY with JOIN - eliminates N+1 problem
    // RLS policy automatically filters by userId
    const results = await tx`
      SELECT 
        m.*,
        uf.created_at as followed_at
      FROM user_follows uf
      INNER JOIN mps m ON uf.mp_id = m.id
      WHERE uf.mp_id IS NOT NULL
      ORDER BY uf.created_at DESC
    `;

    // Map to include followedAt timestamp
    return results.map((row: any) => ({
      ...row,
      followedAt: row.followed_at,
    }));
  });
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

// ---------- Coalition detection (party-level "who votes with whom") ----------
const COALITION_VOTE_MAP: Record<string, "for" | "against" | "abstain" | "absent"> = {
  for: "for",
  against: "against",
  abstain: "abstain",
  absent: "absent",
  už: "for",
  prieš: "against",
  susilaikė: "abstain",
  nebalsavo: "absent",
  nedalyvavo: "absent",
};

function normalizeVoteCoalition(v: string): "for" | "against" | "abstain" | "absent" {
  const k = (v ?? "").toLowerCase().trim();
  return COALITION_VOTE_MAP[k] ?? "absent";
}

export type CoalitionPair = {
  partyA: string;
  partyB: string;
  agreementPct: number;
  sharedBills: number;
  sameCount: number;
};

export async function getVotingCoalitions(options?: {
  limit?: number;
  minSharedBills?: number;
  monthsBack?: number;
}): Promise<CoalitionPair[]> {
  const db = await getDb();
  const limit = options?.limit ?? 20;
  const minShared = options?.minSharedBills ?? 5;
  const monthsBack = options?.monthsBack ?? 12;

  const from = new Date();
  from.setMonth(from.getMonth() - monthsBack);

  const rows = await db
    .select({
      billId: votes.billId,
      party: mps.party,
      voteValue: votes.voteValue,
    })
    .from(votes)
    .innerJoin(mps, eq(votes.mpId, mps.id))
    .where(gte(votes.votedAt, from));

  // billId -> party -> { for, against, abstain }
  const byBill = new Map<
    number,
    Map<string, { for: number; against: number; abstain: number }>
  >();

  for (const r of rows) {
    const bid = r.billId;
    const party = r.party ?? "Unknown";
    const n = normalizeVoteCoalition(r.voteValue);
    if (n === "absent") continue;
    if (!byBill.has(bid)) {
      byBill.set(bid, new Map());
    }
    const pm = byBill.get(bid)!;
    if (!pm.has(party)) pm.set(party, { for: 0, against: 0, abstain: 0 });
    const c = pm.get(party)!;
    if (n === "for") c.for++;
    else if (n === "against") c.against++;
    else c.abstain++;
  }

  // Per bill, per party: majority (for/against/abstain)
  const billPartyMajority = new Map<number, Map<string, "for" | "against" | "abstain">>();
  for (const [billId, partyCounts] of byBill) {
    const maj = new Map<string, "for" | "against" | "abstain">();
    for (const [party, counts] of partyCounts) {
      const { for: f, against: a, abstain: ab } = counts;
      const max = Math.max(f, a, ab);
      if (max === 0) continue;
      if (f >= max) maj.set(party, "for");
      else if (a >= max) maj.set(party, "against");
      else maj.set(party, "abstain");
    }
    if (maj.size > 0) billPartyMajority.set(billId, maj);
  }

  const parties = new Set<string>();
  for (const m of billPartyMajority.values()) {
    for (const p of m.keys()) parties.add(p);
  }
  const partyList = Array.from(parties).sort();

  const pairs: CoalitionPair[] = [];
  for (let i = 0; i < partyList.length; i++) {
    for (let j = i + 1; j < partyList.length; j++) {
      const pa = partyList[i];
      const pb = partyList[j];
      let shared = 0;
      let same = 0;
      for (const [, maj] of billPartyMajority) {
        const ma = maj.get(pa);
        const mb = maj.get(pb);
        if (!ma || !mb) continue;
        shared++;
        if (ma === mb) same++;
      }
      if (shared < minShared) continue;
      const agreementPct = shared > 0 ? (same / shared) * 100 : 0;
      pairs.push({ partyA: pa, partyB: pb, agreementPct, sharedBills: shared, sameCount: same });
    }
  }

  pairs.sort((a, b) => {
    if (Math.abs(b.agreementPct - a.agreementPct) > 0.5) return b.agreementPct - a.agreementPct;
    return b.sharedBills - a.sharedBills;
  });
  return pairs.slice(0, limit);
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

  // Invalidate activities feed cache when new activity is created
  // This ensures users see new activities within the TTL window
  const { cache } = await import("./cache");
  await cache.invalidate("activities:feed:*");

  return result[0];
}
