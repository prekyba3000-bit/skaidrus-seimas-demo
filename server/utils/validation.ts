import { z } from "zod";

/**
 * Validation utilities for data integrity
 */

// Common validators
export const seimasIdSchema = z.string().min(1).max(50);
export const nameSchema = z.string().min(1).max(255);
export const emailSchema = z.string().email().max(255).optional().nullable();
export const phoneSchema = z.string().max(50).optional().nullable();
export const urlSchema = z.string().url().optional().nullable();

// MP validation
export const mpInsertSchema = z.object({
  seimasId: seimasIdSchema,
  name: nameSchema,
  party: nameSchema,
  faction: z.string().max(255).optional().nullable(),
  district: z.string().max(255).optional().nullable(),
  districtNumber: z.number().int().min(1).max(200).optional().nullable(),
  email: emailSchema,
  phone: phoneSchema,
  photoUrl: urlSchema,
  biography: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// Bill validation
export const billInsertSchema = z.object({
  seimasId: seimasIdSchema,
  title: z.string().min(1).max(500),
  description: z.string().optional().nullable(),
  explanatoryNotes: z.string().optional().nullable(),
  status: z.enum([
    "draft",
    "submitted",
    "in_committee",
    "in_review",
    "voting",
    "passed",
    "rejected",
    "withdrawn",
  ]),
  category: z.string().max(100).optional().nullable(),
  submittedAt: z.date().optional().nullable(),
  votedAt: z.date().optional().nullable(),
});

// Vote validation
export const voteValueSchema = z.enum([
  "Už",
  "Prieš",
  "Susilaikė",
  "Nedalyvavo",
  "Nebalsavo",
  "for",
  "against",
  "abstain",
  "absent",
]);

export const sessionVoteInsertSchema = z.object({
  seimasVoteId: seimasIdSchema,
  sittingId: z.string().max(50),
  sessionId: z.string().max(50),
  question: z.string().min(1),
  voteDate: z.date(),
  voteTime: z.string().max(20).optional().nullable(),
  votedFor: z.number().int().min(0).default(0),
  votedAgainst: z.number().int().min(0).default(0),
  abstained: z.number().int().min(0).default(0),
  totalVoted: z.number().int().min(0).default(0),
  comment: z.string().optional().nullable(),
});

// Committee validation
export const committeeInsertSchema = z.object({
  name: nameSchema,
  description: z.string().optional().nullable(),
});

// Accountability score validation
export const accountabilityScoreSchema = z.object({
  votingAttendance: z.number().min(0).max(100),
  partyLoyalty: z.number().min(0).max(100),
  billsProposed: z.number().int().min(0),
  billsPassed: z.number().int().min(0),
  accountabilityScore: z.number().min(0).max(100),
});

/**
 * Validate and sanitize data
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Format validation errors for logging
 */
export function formatValidationErrors(errors: z.ZodError): string {
  return errors.issues
    .map(issue => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
}

/**
 * Sanitize string input (remove excessive whitespace, trim)
 */
export function sanitizeString(
  input: string | null | undefined
): string | null {
  if (!input) return null;
  return input.trim().replace(/\s+/g, " ");
}

/**
 * Validate Lithuanian phone number format
 */
export function isValidLithuanianPhone(phone: string): boolean {
  // Lithuanian phone formats: +370XXXXXXXX, 8XXXXXXXX, or (8-5)XXXXXXX
  const patterns = [/^\+370\d{8}$/, /^8\d{8}$/, /^\(8-\d\)\d{7}$/];
  return patterns.some(pattern => pattern.test(phone.replace(/\s/g, "")));
}

/**
 * Validate Seimas ID format (typically numeric)
 */
export function isValidSeimasId(id: string): boolean {
  return /^\d+$/.test(id);
}

/**
 * Check if date is reasonable (not too far in past or future)
 */
export function isReasonableDate(date: Date): boolean {
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  // Seimas data should be between 1990 (independence) and 10 years in future
  return year >= 1990 && year <= currentYear + 10;
}

/**
 * Validate percentage value
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100 && !isNaN(value);
}
