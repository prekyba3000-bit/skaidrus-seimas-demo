import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, serial, json, decimal, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// MPs (Members of Parliament) table
export const mps = mysqlTable('mps', {
  id: int('id').autoincrement().primaryKey(),
  seimasId: varchar('seimas_id', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  party: varchar('party', { length: 255 }).notNull(),
  faction: varchar('faction', { length: 255 }),
  district: varchar('district', { length: 255 }),
  districtNumber: int('district_number'),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  photoUrl: text('photo_url'),
  biography: text('biography'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// MP Statistics table
export const mpStats = mysqlTable('mp_stats', {
  id: int('id').autoincrement().primaryKey(),
  mpId: int('mp_id').notNull().references(() => mps.id),
  votingAttendance: decimal('voting_attendance', { precision: 5, scale: 2 }).notNull(),
  partyLoyalty: decimal('party_loyalty', { precision: 5, scale: 2 }).notNull(),
  billsProposed: int('bills_proposed').default(0),
  billsPassed: int('bills_passed').default(0),
  accountabilityScore: decimal('accountability_score', { precision: 5, scale: 2 }).notNull(),
  lastCalculated: timestamp('last_calculated').defaultNow(),
});

// Bills table
export const bills = mysqlTable('bills', {
  id: int('id').autoincrement().primaryKey(),
  seimasId: varchar('seimas_id', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  explanatoryNotes: text('explanatory_notes'),
  status: varchar('status', { length: 50 }).notNull(), // draft, proposed, voted, passed, rejected
  category: varchar('category', { length: 100 }),
  submittedAt: timestamp('submitted_at'),
  votedAt: timestamp('voted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Bill Summaries table (AI-generated)
export const billSummaries = mysqlTable('bill_summaries', {
  id: int('id').autoincrement().primaryKey(),
  billId: int('bill_id').notNull().references(() => bills.id),
  summary: text('summary').notNull(),
  bulletPoints: json('bullet_points').notNull(), // Array of strings
  generatedAt: timestamp('generated_at').defaultNow(),
});

// Bill Sponsors table (many-to-many relationship)
export const billSponsors = mysqlTable('bill_sponsors', {
  id: int('id').autoincrement().primaryKey(),
  billId: int('bill_id').notNull().references(() => bills.id),
  mpId: int('mp_id').notNull().references(() => mps.id),
  isPrimary: boolean('is_primary').default(false),
});

// Votes table
export const votes = mysqlTable('votes', {
  id: int('id').autoincrement().primaryKey(),
  billId: int('bill_id').notNull().references(() => bills.id),
  mpId: int('mp_id').notNull().references(() => mps.id),
  voteValue: varchar('vote_value', { length: 20 }).notNull(), // for, against, abstain, absent
  votedAt: timestamp('voted_at').defaultNow(),
});

// Quiz Questions table
export const quizQuestions = mysqlTable('quiz_questions', {
  id: int('id').autoincrement().primaryKey(),
  billId: int('bill_id').references(() => bills.id),
  questionText: text('question_text').notNull(),
  category: varchar('category', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Quiz Answers table (MP positions on quiz questions)
export const quizAnswers = mysqlTable('quiz_answers', {
  id: int('id').autoincrement().primaryKey(),
  questionId: int('question_id').notNull().references(() => quizQuestions.id),
  mpId: int('mp_id').notNull().references(() => mps.id),
  answer: varchar('answer', { length: 20 }).notNull(), // agree, disagree, neutral
});

// User Quiz Results table (for storing user quiz responses)
export const userQuizResults = mysqlTable('user_quiz_results', {
  id: int('id').autoincrement().primaryKey(),
  sessionId: varchar('session_id', { length: 100 }).notNull(),
  questionId: int('question_id').notNull().references(() => quizQuestions.id),
  userAnswer: varchar('user_answer', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Committees table
export const committees = mysqlTable('committees', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Committee Members table (many-to-many)
export const committeeMembers = mysqlTable('committee_members', {
  id: int('id').autoincrement().primaryKey(),
  committeeId: int('committee_id').notNull().references(() => committees.id),
  mpId: int('mp_id').notNull().references(() => mps.id),
  role: varchar('role', { length: 100 }), // chair, member, etc.
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Accountability Flags table
export const accountabilityFlags = mysqlTable('accountability_flags', {
  id: int('id').autoincrement().primaryKey(),
  mpId: int('mp_id').notNull().references(() => mps.id),
  flagType: varchar('flag_type', { length: 100 }).notNull(), // high_absence, voting_inconsistency, party_flip, etc.
  severity: varchar('severity', { length: 20 }).notNull(), // low, medium, high
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  detectedAt: timestamp('detected_at').defaultNow(),
  resolved: boolean('resolved').default(false),
});

// User Follows table (for notification system)
export const userFollows = mysqlTable('user_follows', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  mpId: int('mp_id').references(() => mps.id),
  billId: int('bill_id').references(() => bills.id),
  topic: varchar('topic', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});
