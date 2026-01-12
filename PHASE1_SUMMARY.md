# Phase 1: Robust Data Pipeline - Implementation Summary

## ✅ Completed Tasks

### Task 1.1: Redis Connection Setup ✓
- **File**: `server/lib/redis.ts`
- **Purpose**: Provides ioredis connection for BullMQ
- **Features**:
  - Singleton pattern for connection reuse
  - Automatic reconnection on errors
  - Graceful shutdown handling
  - Connection health monitoring

### Task 1.2: Scraper Worker ✓
- **File**: `server/workers/scraper.ts`
- **Purpose**: Processes scraping jobs from the queue
- **Features**:
  - Extracted Playwright logic from `sync-bills.ts`
  - Automatic retries (3 attempts with exponential backoff)
  - Progress tracking for jobs
  - Comprehensive error handling and logging
  - Job completion/failure tracking

### Task 1.3: Scheduler Endpoint ✓
- **Files**: 
  - `server/routers/scheduler.ts` - tRPC router for manual job dispatch
  - `server/lib/queue.ts` - Queue management utilities
  - `scripts/scheduler.ts` - Standalone script for cron/systemd
- **Features**:
  - Manual job triggering via API
  - Job status checking
  - Configurable job options (delay, priority, limits)
  - Ready for nightly scheduling

## Installation Commands

Dependencies were installed with:
```bash
pnpm add bullmq ioredis
pnpm add -D @types/ioredis  # (Deprecated, but installed for compatibility)
```

## How to Run the Worker

### Development Mode (with auto-restart)
```bash
pnpm run worker:watch
```

### Production Mode
```bash
pnpm run worker
```

### What Happens:
1. Worker connects to Redis using `REDIS_URL` environment variable
2. Worker listens for jobs in the `scrape:bills` queue
3. When a job is received, it:
   - Launches Playwright browser
   - Navigates to e-seimas.lrs.lt
   - Scrapes bills from the search results
   - Saves to database
   - Reports progress and completion

## Dispatching Jobs

### Option 1: Manual via Script
```bash
pnpm run scheduler
```

### Option 2: Via API Endpoint
```typescript
// From frontend or API client
trpc.scheduler.triggerBillsScrape.mutate({
  limit: 20,    // optional
  force: false, // optional
});
```

### Option 3: Programmatically
```typescript
import { enqueueScrapeBills } from "./server/lib/queue";

await enqueueScrapeBills({
  limit: 50,
  force: true,
}, {
  delay: 5000,    // Process after 5 seconds
  priority: 10,   // Higher priority = processed first
});
```

## Setting Up Nightly Jobs

### Using Cron
Add to crontab (`crontab -e`):
```bash
# Run every night at 2 AM
0 2 * * * cd /path/to/skaidrus-seimas-demo && pnpm run scheduler
```

### Using systemd Timer
See `docs/PHASE1_WORKER_SETUP.md` for detailed systemd configuration.

## File Structure

```
server/
├── lib/
│   ├── redis.ts          # Redis connection for BullMQ
│   └── queue.ts          # Queue management utilities
├── workers/
│   └── scraper.ts        # Worker process for scraping jobs
└── routers/
    └── scheduler.ts      # tRPC router for job dispatch

scripts/
├── worker.ts             # Worker process script (runs worker)
└── scheduler.ts          # Scheduler script (dispatches jobs)

package.json              # Updated with new scripts:
                         # - "worker": Run worker process
                         # - "worker:watch": Run worker with auto-restart
                         # - "scheduler": Dispatch scheduled jobs
```

## Environment Variables Required

```bash
# Required
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:password@localhost:5432/seimas_db

# Optional (defaults provided)
# None for Phase 1
```

## Key Features

### Automatic Retries
- **3 attempts** per job
- **Exponential backoff**: 5s, 10s, 20s delays
- Failed jobs are preserved for debugging

### Job Monitoring
- Progress tracking (0-100%)
- Job state tracking (waiting, active, completed, failed)
- Detailed logging for all operations

### Scalability
- Multiple workers can process jobs in parallel
- Redis-based queue supports distributed processing
- Configurable concurrency (currently set to 1 to avoid overwhelming target site)

### Reliability
- Graceful shutdown on SIGTERM/SIGINT
- Error handling at all levels
- Connection retry logic
- Job state persistence

## Next Steps (Phases 2-4)

- **Phase 2**: API Scalability (Cursor-based Pagination)
- **Phase 3**: Frontend State & Architecture (Zustand)
- **Phase 4**: Quality Assurance (Vitest + Playwright E2E)

## Troubleshooting

### Worker not starting
- Check Redis is running: `redis-cli ping`
- Verify `REDIS_URL` is set correctly
- Check logs for connection errors

### Jobs not processing
- Ensure worker is running: `pnpm run worker`
- Check Redis connection
- Verify database connection (`DATABASE_URL`)
- Check worker logs for errors

### High memory usage
- Reduce worker concurrency in `scraper.ts`
- Lower job retention counts in `queue.ts`
- Add job limits in scheduler

## Documentation

For more details, see:
- `docs/PHASE1_WORKER_SETUP.md` - Detailed setup guide
- `server/workers/scraper.ts` - Worker implementation
- `server/lib/queue.ts` - Queue utilities
