import { z } from "zod";

/**
 * Zod validation schema for session_votes table.
 *
 * Critical fields:
 * - seimasVoteId: Must be unique identifier from Seimas API
 * - voteDate: Required timestamp (accepts Date or ISO string)
 * - voteTime: NULLABLE (legacy data often missing)
 * - comment: NULLABLE (legacy data often missing)
 *
 * Fail-fast strategy: If Seimas API changes structure, this schema
 * will throw a descriptive error before corrupting the database.
 */
export const sessionVoteSchema = z.object({
  seimasVoteId: z.string().min(1).max(50, "Seimas vote ID exceeds 50 chars"),
  sittingId: z.string().min(1).max(50, "Sitting ID exceeds 50 chars"),
  sessionId: z.string().min(1).max(50, "Session ID exceeds 50 chars"),
  question: z.string().min(1, "Vote question is required"),
  voteDate: z.coerce.date(), // Coerce strings to Date
  voteTime: z.string().max(20).nullable().optional(),
  votedFor: z.number().int().min(0).default(0),
  votedAgainst: z.number().int().min(0).default(0),
  abstained: z.number().int().min(0).default(0),
  totalVoted: z.number().int().min(0).default(0),
  comment: z.string().nullable().optional(),
});

export const sessionMpVoteSchema = z.object({
  sessionVoteId: z.number().int().positive(),
  mpId: z.number().int().positive(),
  seimasMpId: z.string().min(1).max(50),
  voteValue: z.enum(["už", "prieš", "susilaikė", "nebalsavo", "nedalyvavo"]),
});

/**
 * Validates incoming Seimas API data before database insertion.
 * Throws descriptive ZodError if validation fails.
 *
 * @param data - Raw data from Seimas API
 * @returns Validated and typed data
 */
export function validateSessionVote(data: unknown) {
  return sessionVoteSchema.parse(data);
}

export function validateSessionMpVote(data: unknown) {
  return sessionMpVoteSchema.parse(data);
}

export type SessionVoteInput = z.infer<typeof sessionVoteSchema>;
export type SessionMpVoteInput = z.infer<typeof sessionMpVoteSchema>;
