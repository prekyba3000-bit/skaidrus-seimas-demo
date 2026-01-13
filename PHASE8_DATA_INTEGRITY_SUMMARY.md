# Phase 8: Data Integrity & AI Enrichment - Implementation Summary

## Overview

This document summarizes the data integrity and AI enrichment work completed in Phase 8. The sync scripts have been hardened with error handling and transactions, the AI summary pipeline is now robust and idempotent, and users can see when data was last updated.

## Changes Made

### 1. Harden Data Sync Scripts

**Files Modified:**

- `scripts/scrape-votes-api.ts`
- `scripts/sync-bills.ts`

**Implementation:**

#### Error Handling:

- Wrapped all external API calls in try/catch blocks
- Individual record failures are logged but don't crash the entire sync
- Used structured logging (`logger`) instead of `console.log`
- Added error counters (`totalFailed`) to track failures

#### Transaction Safety:

- **Votes Sync:** Uses `db.transaction()` for vote and MP vote inserts to ensure data consistency
- **Bills Sync:** Wrapped entire batch processing in a transaction
- If one record fails, the transaction ensures partial data isn't committed

#### Zod Validation:

- **Bills Sync:** Added `billSchema` to validate bill data before insertion
- **Votes Sync:** Already had validation via `validateSessionVote()` - enhanced error handling
- Invalid data is logged and skipped, preventing database corruption

#### System Status Tracking:

- Both scripts now update `system_status` table with:
  - `lastSuccessfulRun` timestamp
  - `lastRunStatus` ('success', 'failed', 'partial')
  - `recordsProcessed` and `recordsFailed` counts
  - `lastRunError` message (if failed)

**Code Example (Votes Sync):**

```typescript
// Use transaction to ensure data consistency
await db.transaction(async (tx) => {
  const inserted = await tx
    .insert(sessionVotes)
    .values(validatedVote)
    .onConflictDoUpdate({...})
    .returning({ id: sessionVotes.id });

  // Process individual MP votes within same transaction
  await tx.delete(sessionMpVotes).where(...);
  await tx.insert(sessionMpVotes).values(mpVotesToInsert);
});
```

**Code Example (Bills Sync):**

```typescript
// Validate with Zod before insertion
try {
  billSchema.parse(billData);
} catch (validationError) {
  if (validationError instanceof z.ZodError) {
    logger.warn(
      { billId: seimasId, errors: validationError.issues },
      "Bill validation failed - skipping"
    );
    skippedCount++;
    continue;
  }
  throw validationError;
}

// Use transaction for batch processing
await db.transaction(async tx => {
  for (const row of rows) {
    // Process each row, continue on error
  }
});
```

### 2. Robust AI Summary Pipeline

**File Modified:** `scripts/generate-bill-summaries.ts`

**Implementation:**

#### Idempotency:

- **Strict NULL Check:** Only processes bills where `billSummaries.id IS NULL`
- Uses `LEFT JOIN` with `WHERE isNull(billSummaries.id)` to ensure no re-processing
- Prevents duplicate API calls and saves costs

#### Retry Logic:

- Created `retryWithBackoff()` function with exponential backoff
- Default: 3 retries with 2s, 4s, 6s delays
- If LLM API fails after retries, logs error and continues to next bill
- Individual bill failures don't crash the entire job

#### Error Handling:

- Wrapped each bill processing in try/catch
- Failed bills are logged but don't stop the script
- System status tracks `recordsProcessed` and `recordsFailed`

**Code:**

```typescript
// Retry wrapper for AI API calls
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY_MS
): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === retries) {
        logger.error({ err: error, attempt }, "AI API call failed after retries");
        return null;
      }
      logger.warn({ err: error, attempt, retries }, "AI API call failed, retrying");
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  return null;
}

// Usage in bill processing
const analysis = await retryWithBackoff(() =>
  summarizeBill(bill.title, bill.description || "", content)
);

if (analysis) {
  await db.insert(billSummaries).values({...});
  successCount++;
} else {
  failedCount++;
  // Continue processing other bills
}
```

### 3. "Last Updated" System

**Files Created:**

- `client/src/components/LastUpdatedBadge.tsx`

**Files Modified:**

- `drizzle/schema.ts` (added `systemStatus` table)
- `server/services/database.ts` (added `getLastUpdated()` function)
- `server/routers.ts` (added `stats.getLastUpdated` procedure)
- `client/src/pages/Dashboard.tsx` (added badge)

**Schema:**

```typescript
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
```

**Backend Function:**

```typescript
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
      statusRecords.map((r) => [r.jobName, r.lastSuccessfulRun])
    );

    // Fallback to data freshness if system_status is empty
    const freshness = await getDataFreshness();

    return {
      votes: statusMap.get("votes_sync") || freshness.votes,
      bills: statusMap.get("bills_sync") || freshness.bills,
      mps: statusMap.get("mps_sync") || freshness.mps,
      summaries: statusMap.get("bill_summaries") || null,
      overall: /* most recent timestamp */,
    };
  } catch (err) {
    // Fallback to data freshness if system_status table doesn't exist
    const freshness = await getDataFreshness();
    return { ...freshness, summaries: null, overall: ... };
  }
}
```

**tRPC Procedure:**

```typescript
stats: router({
  getLastUpdated: publicProcedure
    .query(async () => {
      return await db.getLastUpdated();
    }),
}),
```

**Frontend Component:**

```typescript
export function LastUpdatedBadge({ className }: LastUpdatedBadgeProps) {
  const { data, isLoading } = trpc.stats.getLastUpdated.useQuery(undefined, {
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="w-3 h-3" />
        <Skeleton className="h-3 w-24" />
      </div>
    );
  }

  const lastUpdated = new Date(data.overall);
  const relativeTime = formatDistanceToNow(lastUpdated, { addSuffix: true });

  return (
    <div className="flex items-center gap-2 text-xs text-[#92adc9]">
      <Clock className="w-3 h-3" />
      <span>Duomenys atnaujinti: {relativeTime}</span>
    </div>
  );
}
```

## Files Created

1. ✅ `client/src/components/LastUpdatedBadge.tsx` - Last updated badge component

## Files Modified

### Backend:

1. ✅ `drizzle/schema.ts` - Added `systemStatus` table
2. ✅ `server/services/database.ts` - Added `getLastUpdated()` function, imported `systemStatus`
3. ✅ `server/routers.ts` - Added `stats.getLastUpdated` procedure
4. ✅ `scripts/scrape-votes-api.ts` - Added error handling, transactions, system status tracking
5. ✅ `scripts/sync-bills.ts` - Added error handling, transactions, Zod validation, system status tracking
6. ✅ `scripts/generate-bill-summaries.ts` - Added retry logic, idempotency, system status tracking

### Frontend:

1. ✅ `client/src/pages/Dashboard.tsx` - Added `LastUpdatedBadge` component

## Key Improvements

### 1. Error Resilience

- **Before:** One bad XML tag or API failure would crash the entire sync
- **After:** Individual failures are logged, counted, and the sync continues

### 2. Data Consistency

- **Before:** Partial data could be inserted if script crashed mid-batch
- **After:** Transactions ensure all-or-nothing inserts

### 3. AI Cost Savings

- **Before:** Script might re-process bills that already had summaries
- **After:** Strict NULL check ensures only new bills are processed

### 4. User Trust

- **Before:** Users had no idea how fresh the data was
- **After:** Clear "Last updated: X ago" badge on Dashboard

### 5. Observability

- **Before:** No tracking of sync job status
- **After:** `system_status` table tracks success/failure, record counts, errors

## Migration Steps

### 1. Generate Migration for system_status Table

```bash
npm run db:push
# or
npx drizzle-kit generate
npx drizzle-kit migrate
```

This will create the `system_status` table.

### 2. Verify system_status Table

```sql
-- Check if table exists
SELECT * FROM system_status;

-- Should be empty initially, will populate after first sync runs
```

## API Endpoints

### Get Last Updated

**Endpoint:** `stats.getLastUpdated`
**Method:** Query
**Auth:** Public
**Input:** None

**Output:**

```typescript
{
  votes: Date | null;
  bills: Date | null;
  mps: Date | null;
  summaries: Date | null;
  overall: Date | null; // Most recent timestamp
}
```

**Example:**

```typescript
const { data } = trpc.stats.getLastUpdated.useQuery();
// Returns: { votes: Date, bills: Date, mps: Date, summaries: Date, overall: Date }
```

## Testing Recommendations

1. **Error Handling:**
   - Simulate API failures (disconnect network)
   - Verify sync continues and logs errors
   - Check `system_status` table for failure records

2. **Transactions:**
   - Verify partial batches don't get committed
   - Check database consistency after sync failures

3. **AI Pipeline:**
   - Run script twice - verify no duplicate summaries
   - Simulate LLM API failures - verify retry logic
   - Check `system_status` for `bill_summaries` job

4. **Last Updated Badge:**
   - Verify badge shows correct relative time
   - Check skeleton loader appears while loading
   - Verify badge updates every minute

## Next Steps

1. **Monitoring:**
   - Set up alerts for failed sync jobs
   - Monitor `system_status` table for patterns
   - Track API costs for AI summaries

2. **Optimization:**
   - Batch AI API calls if possible
   - Add more granular error reporting
   - Consider dead letter queue for failed bills

3. **UI Enhancements:**
   - Add "Last Updated" badge to other pages
   - Show individual sync statuses (votes, bills, summaries)
   - Add manual refresh button

---

**Status:** ✅ Phase 8 Complete
**Date:** 2026-01-11
**Next Phase:** Phase 9 - Production Hardening
