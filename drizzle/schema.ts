import {
  integer,
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  json,
  decimal,
  index,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Users
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  settings: jsonb("settings").$type<{
    emailNotifications?: boolean;
    betaFeatures?: boolean;
    compactMode?: boolean;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// MPs
export const mps = pgTable(
  "mps",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    seimasId: varchar("seimas_id", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    party: varchar("party", { length: 255 }).notNull(),
    faction: varchar("faction", { length: 255 }),
    district: varchar("district", { length: 255 }),
    districtNumber: integer("district_number"),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    photoUrl: text("photo_url"),
    biography: text("biography"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  table => ({
    // Composite index for common filter: isActive + party
    isActivePartyIdx: index("mps_is_active_party_idx").on(
      table.isActive,
      table.party
    ),
    // Index for party filtering
    partyIdx: index("mps_party_idx").on(table.party),
    // Index for name (for text search - GIN index will be added via SQL migration)
    nameIdx: index("mps_name_idx").on(table.name),
  })
);

// MP Stats
export const mpStats = pgTable("mp_stats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  mpId: integer("mp_id")
    .notNull()
    .references(() => mps.id)
    .unique(),
  votingAttendance: decimal("voting_attendance", {
    precision: 5,
    scale: 2,
  }).notNull(),
  partyLoyalty: decimal("party_loyalty", { precision: 5, scale: 2 }).notNull(),
  billsProposed: integer("bills_proposed").default(0),
  billsPassed: integer("bills_passed").default(0),
  accountabilityScore: decimal("accountability_score", {
    precision: 5,
    scale: 2,
  }).notNull(),
  lastCalculated: timestamp("last_calculated").defaultNow(),
});

// Bills
export const bills = pgTable(
  "bills",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    seimasId: varchar("seimas_id", { length: 50 }).notNull().unique(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    explanatoryNotes: text("explanatory_notes"),
    status: varchar("status", { length: 50 }).notNull(),
    category: varchar("category", { length: 100 }),
    submittedAt: timestamp("submitted_at"),
    votedAt: timestamp("voted_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  table => ({
    // Composite index for common filter: status + createdAt (for pagination)
    statusCreatedAtIdx: index("bills_status_created_at_idx").on(
      table.status,
      table.createdAt
    ),
    // Index for status filtering
    statusIdx: index("bills_status_idx").on(table.status),
    // Index for category filtering
    categoryIdx: index("bills_category_idx").on(table.category),
    // Index for createdAt (used in pagination and ordering)
    createdAtIdx: index("bills_created_at_idx").on(table.createdAt),
    // Index for title (for text search - GIN index will be added via SQL migration)
    titleIdx: index("bills_title_idx").on(table.title),
  })
);

// Bill Summaries
export const billSummaries = pgTable("bill_summaries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  billId: integer("bill_id")
    .notNull()
    .references(() => bills.id),
  summary: text("summary").notNull(),
  bulletPoints: json("bullet_points").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// System Status table (tracks last sync times)
export const systemStatus = pgTable(
  "system_status",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    jobName: varchar("job_name", { length: 100 }).notNull().unique(),
    lastSuccessfulRun: timestamp("last_successful_run"),
    lastRunStatus: varchar("last_run_status", { length: 20 }), // 'success', 'failed', 'partial'
    lastRunError: text("last_run_error"),
    recordsProcessed: integer("records_processed").default(0),
    recordsFailed: integer("records_failed").default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    jobNameIdx: index("system_status_job_name_idx").on(table.jobName),
  })
);

// Bill Sponsors
export const billSponsors = pgTable("bill_sponsors", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  billId: integer("bill_id")
    .notNull()
    .references(() => bills.id),
  mpId: integer("mp_id")
    .notNull()
    .references(() => mps.id),
  isPrimary: boolean("is_primary").default(false),
});

// Votes
export const votes = pgTable(
  "votes",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    billId: integer("bill_id")
      .notNull()
      .references(() => bills.id),
    mpId: integer("mp_id")
      .notNull()
      .references(() => mps.id),
    voteValue: varchar("vote_value", { length: 20 }).notNull(),
    votedAt: timestamp("voted_at").defaultNow(),
  },
  table => ({
    // Composite index for common query: mpId + votedAt (for MP voting history with pagination)
    mpIdVotedAtIdx: index("votes_mp_id_voted_at_idx").on(
      table.mpId,
      table.votedAt
    ),
    // Composite index for common query: billId + votedAt
    billIdVotedAtIdx: index("votes_bill_id_voted_at_idx").on(
      table.billId,
      table.votedAt
    ),
    // Index for mpId filtering
    mpIdIdx: index("votes_mp_id_idx").on(table.mpId),
    // Index for billId filtering
    billIdIdx: index("votes_bill_id_idx").on(table.billId),
    // Index for votedAt (used in Parliament Pulse date filtering)
    votedAtIdx: index("votes_voted_at_idx").on(table.votedAt),
  })
);

// Quiz Questions
export const quizQuestions = pgTable("quiz_questions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  billId: integer("bill_id").references(() => bills.id),
  questionText: text("question_text").notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz Answers
export const quizAnswers = pgTable("quiz_answers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  questionId: integer("question_id")
    .notNull()
    .references(() => quizQuestions.id),
  mpId: integer("mp_id")
    .notNull()
    .references(() => mps.id),
  answer: varchar("answer", { length: 20 }).notNull(),
});

// User Quiz Results
export const userQuizResults = pgTable("user_quiz_results", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  questionId: integer("question_id")
    .notNull()
    .references(() => quizQuestions.id),
  userAnswer: varchar("user_answer", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Committees
export const committees = pgTable("committees", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Committee Members
export const committeeMembers = pgTable("committee_members", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  committeeId: integer("committee_id")
    .notNull()
    .references(() => committees.id),
  mpId: integer("mp_id")
    .notNull()
    .references(() => mps.id),
  role: varchar("role", { length: 100 }),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Accountability Flags
export const accountabilityFlags = pgTable("accountability_flags", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  mpId: integer("mp_id")
    .notNull()
    .references(() => mps.id),
  flagType: varchar("flag_type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  detectedAt: timestamp("detected_at").defaultNow(),
  resolved: boolean("resolved").default(false),
});

// User Follows
export const userFollows = pgTable("user_follows", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id", { length: 100 }).notNull(),
  mpId: integer("mp_id").references(() => mps.id),
  billId: integer("bill_id").references(() => bills.id),
  topic: varchar("topic", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// MP Assistants
export const mpAssistants = pgTable("mp_assistants", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  mpId: integer("mp_id")
    .notNull()
    .references(() => mps.id),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// MP Trips
export const mpTrips = pgTable("mp_trips", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  mpId: integer("mp_id")
    .notNull()
    .references(() => mps.id),
  destination: varchar("destination", { length: 255 }).notNull(),
  purpose: text("purpose"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session Votes (for parliamentary sitting votes)
export const sessionVotes = pgTable("session_votes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  seimasVoteId: varchar("seimas_vote_id", { length: 50 }).notNull().unique(),
  sittingId: varchar("sitting_id", { length: 50 }).notNull(),
  sessionId: varchar("session_id", { length: 50 }).notNull(),
  question: text("question").notNull(),
  voteDate: timestamp("vote_date").notNull(),
  voteTime: varchar("vote_time", { length: 20 }),
  votedFor: integer("voted_for").default(0),
  votedAgainst: integer("voted_against").default(0),
  abstained: integer("abstained").default(0),
  totalVoted: integer("total_voted").default(0),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual MP votes for session votes
export const sessionMpVotes = pgTable("session_mp_votes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionVoteId: integer("session_vote_id")
    .notNull()
    .references(() => sessionVotes.id),
  mpId: integer("mp_id")
    .notNull()
    .references(() => mps.id),
  seimasMpId: varchar("seimas_mp_id", { length: 50 }).notNull(),
  voteValue: varchar("vote_value", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activities (for Activity Feed)
export const activities = pgTable("activities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: varchar("type", { length: 50 }).notNull(), // 'vote', 'comment', 'document', 'session', 'achievement'
  mpId: integer("mp_id")
    .notNull()
    .references(() => mps.id),
  billId: integer("bill_id").references(() => bills.id),
  sessionVoteId: integer("session_vote_id").references(() => sessionVotes.id),
  metadata: json("metadata").notNull(), // Type-specific data
  isHighlighted: boolean("is_highlighted").default(false),
  isNew: boolean("is_new").default(true),
  category: varchar("category", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Activity Reads (for tracking read status per user)
export const userActivityReads = pgTable(
  "user_activity_reads",
  {
    userId: varchar("user_id", { length: 64 }).notNull(),
    activityId: integer("activity_id")
      .notNull()
      .references(() => activities.id),
    readAt: timestamp("read_at").defaultNow(),
  },
  t => ({
    pk: primaryKey({ columns: [t.userId, t.activityId] }),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
