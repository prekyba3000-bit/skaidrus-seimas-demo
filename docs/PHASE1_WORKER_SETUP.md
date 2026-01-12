# Phase 1: Robust Data Pipeline - Setup Guide

This document explains how to set up and run the new job queue-based scraping system.

## Architecture Overview

- **BullMQ**: Job queue system powered by Redis
- **Worker Process**: Long-running process that processes jobs from the queue
- **Scheduler**: Script/endpoint that dispatches jobs to the queue
- **Redis**: Message broker (must be running)

## Prerequisites

1. **Redis Server**: Make sure Redis is running
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:7-alpine
   
   # Or install locally
   # Ubuntu/Debian: sudo apt-get install redis-server
   # macOS: brew install redis
   ```

2. **Environment Variables**: Ensure `.env` has:
   ```bash
   REDIS_URL=redis://localhost:6379
   DATABASE_URL=postgresql://user:password@localhost:5432/seimas_db
   ```

## Installation

Dependencies are already installed:
```bash
pnpm add bullmq ioredis
```

## Running the Worker

### Development (with auto-restart)

```bash
pnpm run worker:watch
```

### Production

```bash
pnpm run worker
```

The worker will:
- Connect to Redis
- Listen for jobs in the `scrape:bills` queue
- Process jobs one at a time (concurrency: 1)
- Automatically retry failed jobs (3 attempts with exponential backoff)
- Log all events and progress

### Stopping the Worker

Press `Ctrl+C` to gracefully shutdown the worker.

## Dispatching Jobs

### Option 1: Using the Scheduler Script (Recommended for Cron)

```bash
# Dispatch jobs immediately
pnpm run scheduler

# This adds jobs to the queue, which the worker will process
```

### Option 2: Using the API Endpoint

The scheduler router is registered at `/api/trpc/scheduler.*`. You can trigger jobs via tRPC:

```typescript
// From frontend or API client
trpc.scheduler.triggerBillsScrape.mutate({
  limit: 20, // optional: limit number of bills
  force: false, // optional: force re-scrape even if exists
});

// Check job status
trpc.scheduler.getJobStatus.query({ jobId: "job-id-here" });
```

### Option 3: Manual Queue Access (Advanced)

```typescript
import { enqueueScrapeBills } from "./server/lib/queue";

// Enqueue a job
const { jobId } = await enqueueScrapeBills({
  limit: 50,
  force: true,
}, {
  delay: 5000, // Process after 5 seconds
  priority: 10, // Higher priority
});
```

## Setting Up Nightly Jobs

### Using Cron (Linux/macOS)

Add to crontab (`crontab -e`):

```bash
# Run scheduler every night at 2 AM
0 2 * * * cd /path/to/skaidrus-seimas-demo && pnpm run scheduler
```

### Using systemd Timer (Linux)

Create `/etc/systemd/system/seimas-scheduler.service`:
```ini
[Unit]
Description=Seimas Data Scheduler
After=network.target

[Service]
Type=oneshot
User=your-user
WorkingDirectory=/path/to/skaidrus-seimas-demo
Environment="NODE_ENV=production"
ExecStart=/usr/bin/pnpm run scheduler
```

Create `/etc/systemd/system/seimas-scheduler.timer`:
```ini
[Unit]
Description=Daily Seimas Data Scheduler
Requires=seimas-scheduler.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:
```bash
sudo systemctl enable seimas-scheduler.timer
sudo systemctl start seimas-scheduler.timer
```

### Using Node-Cron (Alternative)

You can also run a scheduler inside your main server process using `node-cron`:

```typescript
import cron from "node-cron";
import { enqueueScrapeBills } from "./server/lib/queue";

// Schedule daily at 2 AM
cron.schedule("0 2 * * *", async () => {
  await enqueueScrapeBills();
});
```

## Monitoring Jobs

### Check Job Status via API

```typescript
const status = await trpc.scheduler.getJobStatus.query({ 
  jobId: "your-job-id" 
});

// Returns:
// - state: 'waiting' | 'active' | 'completed' | 'failed'
// - progress: number (0-100)
// - attemptsMade: number
// - returnvalue: result data
// - failedReason: error message if failed
```

### Using BullMQ Dashboard (Optional)

Install `@bull-board/express` for a web UI:

```bash
pnpm add @bull-board/express @bull-board/api
```

## Job Configuration

Jobs are configured with:
- **Retries**: 3 attempts
- **Backoff**: Exponential (5s, 10s, 20s)
- **Concurrency**: 1 job at a time (to avoid overwhelming target site)
- **Job Retention**: 
  - Completed: Last 100 jobs, 24 hours
  - Failed: Last 500 jobs

## Error Handling

The worker automatically:
- Retries failed jobs up to 3 times
- Logs all errors with context
- Preserves failed jobs for debugging
- Uses exponential backoff between retries

## Production Deployment

1. **Run Worker as a Service**: Use PM2, systemd, or similar
   ```bash
   pm2 start pnpm --name "seimas-worker" -- run worker
   ```

2. **Monitor**: Set up alerts for:
   - Worker crashes
   - High failure rates
   - Queue backlog

3. **Scaling**: Run multiple worker instances if needed:
   ```bash
   # Worker 1
   pm2 start pnpm --name "seimas-worker-1" -- run worker
   
   # Worker 2
   pm2 start pnpm --name "seimas-worker-2" -- run worker
   ```

## Troubleshooting

### Worker not processing jobs
- Check Redis is running: `redis-cli ping`
- Check worker logs for errors
- Verify `REDIS_URL` is correct

### Jobs failing immediately
- Check database connection (`DATABASE_URL`)
- Verify Playwright can access the target site
- Check worker logs for detailed errors

### High memory usage
- Reduce `concurrency` in worker config
- Lower `removeOnComplete.count` to keep fewer jobs
- Add job limits in scheduler
