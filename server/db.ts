import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import * as schema from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client, { schema });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

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
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

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
} from "../drizzle/schema";

// ==================== MP Queries ====================

export async function getAllMps(filters?: {
  party?: string;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

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

export async function getMpById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(mps).where(eq(mps.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAssistantsByMpId(mpId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(mpAssistants)
    .where(eq(mpAssistants.mpId, mpId));
}

export async function getTripsByMpId(mpId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(mpTrips).where(eq(mpTrips.mpId, mpId));
}

export async function getMpBySeimasId(seimasId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(mps)
    .where(eq(mps.seimasId, seimasId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchMps(searchTerm: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(mps)
    .where(
      sql`${mps.name} ILIKE ${`%${searchTerm}%`} OR ${mps.party} ILIKE ${`%${searchTerm}%`}`
    );
}

// ==================== MP Statistics Queries ====================

export async function getMpStats(mpId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(mpStats)
    .where(eq(mpStats.mpId, mpId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getGlobalStats() {
  const db = await getDb();
  if (!db) return undefined;

  const [totalMps] = await db.select({ count: sql<number>`count(*)` }).from(mps).where(eq(mps.isActive, true));
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
  if (!db) return;

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
  if (!db) return [];

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

export async function getAllBills(filters?: {
  status?: string;
  category?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(bills).orderBy(desc(bills.createdAt));

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(bills.status, filters.status));
  }
  if (filters?.category) {
    conditions.push(eq(bills.category, filters.category));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query;
}

export async function getBillById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bills).where(eq(bills.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== Vote Queries ====================

export async function getVotesByMpId(mpId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      vote: votes,
      bill: bills,
    })
    .from(votes)
    .leftJoin(bills, eq(votes.billId, bills.id))
    .where(eq(votes.mpId, mpId))
    .orderBy(desc(votes.votedAt))
    .limit(limit);
}

export async function getVotesByBillId(billId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      vote: votes,
      mp: mps,
    })
    .from(votes)
    .leftJoin(mps, eq(votes.mpId, mps.id))
    .where(eq(votes.billId, billId));
}

// ==================== Quiz Queries ====================

export async function getAllQuizQuestions() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(quizQuestions);
}

export async function getQuizAnswersByMpId(mpId: number) {
  const db = await getDb();
  if (!db) return [];

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
  if (!db) return;

  await db.insert(userQuizResults).values(result);
}

export async function getUserQuizResults(sessionId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userQuizResults)
    .where(eq(userQuizResults.sessionId, sessionId));
}

// ==================== Committee Queries ====================

export async function getAllCommittees() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(committees);
}

export async function getCommitteeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(committees)
    .where(eq(committees.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCommitteeMembers(committeeId: number) {
  const db = await getDb();
  if (!db) return [];
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
  if (!db) return [];
  return await db
    .select()
    .from(accountabilityFlags)
    .where(eq(accountabilityFlags.mpId, mpId));
}

export async function createAccountabilityFlag(
  flag: typeof accountabilityFlags.$inferInsert
) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(accountabilityFlags).values(flag).returning();
  return result[0];
}

export async function resolveAccountabilityFlag(id: number) {
  const db = await getDb();
  if (!db) return undefined;
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
  if (!db) return [];
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
  if (!db) return undefined;
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
  if (!db) return undefined;
  return await db.delete(userFollows).where(eq(userFollows.id, id)).returning();
}

// ==================== Bill Sponsors/Summaries Queries ====================

export async function getBillSponsors(billId: number) {
  const db = await getDb();
  if (!db) return [];
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
  if (!db) return undefined;
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
  if (!db) return undefined;
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
  if (!db) return [];
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
