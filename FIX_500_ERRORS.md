# Fix Guide: 500 Internal Server Errors

## Problem Diagnosis

The schema is already in sync (Drizzle reports "No schema changes"). The 500 errors are likely due to:

1. Server cache holding stale database connection
2. Database connection pool issues
3. Runtime query errors

## Solution Steps

### Step 1: Verify Database Connection

```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Or check your .env file
cat .env | grep DATABASE_URL
```

### Step 2: Restart Development Server

**CRITICAL**: Stop the current dev server (Ctrl+C) and restart:

```bash
npm run dev
```

This clears:

- Drizzle ORM connection cache
- Express server state
- tRPC router cache

### Step 3: Check Server Logs (Terminal Output)

After restarting, watch the terminal for:

**✅ Success indicators:**

- `Database connection established`
- `Server listening on port XXXX`
- No error stack traces

**❌ Error indicators to look for:**

- `DrizzleQueryError` - Query syntax issue
- `relation "user_follows" does not exist` - Table missing
- `column "user_id" does not exist` - Column mismatch
- `Connection refused` - Database not running

### Step 4: Test Endpoints

Once server restarts, test these endpoints in browser/Postman:

- `http://localhost:XXXX/trpc/user.getWatchlist?input={"userId":"1"}`
- `http://localhost:XXXX/trpc/user.isFollowingMp?input={"userId":"1","mpId":1}`

### Step 5: If Errors Persist

**Option A: Force Schema Push (if needed)**

```bash
# Generate migration files
npx drizzle-kit generate

# Check what migrations exist
ls drizzle/*.sql

# If user_follows table is missing, manually verify:
# Connect to your database and run:
# SELECT * FROM information_schema.tables WHERE table_name = 'user_follows';
```

**Option B: Check Database Directly**

```bash
# If using PostgreSQL CLI
psql $DATABASE_URL -c "\d user_follows"

# Should show:
# - id (integer, primary key)
# - user_id (varchar)
# - mp_id (integer, nullable)
# - bill_id (integer, nullable)
# - topic (varchar, nullable)
# - created_at (timestamp)
```

## Common Issues & Fixes

| Error                                    | Cause                | Fix                                     |
| ---------------------------------------- | -------------------- | --------------------------------------- |
| `relation "user_follows" does not exist` | Table not created    | Run `npm run db:push`                   |
| `column "mpId" does not exist`           | Column name mismatch | Check schema.ts uses `mpId` (camelCase) |
| `Connection timeout`                     | Database not running | Start PostgreSQL service                |
| `DrizzleQueryError: Failed query`        | SQL syntax error     | Check query in db.ts                    |

## Verification Checklist

- [ ] Server restarted successfully
- [ ] No errors in terminal logs
- [ ] Database connection established message appears
- [ ] `user.getWatchlist` endpoint returns 200 (or empty array)
- [ ] `user.isFollowingMp` endpoint returns 200 (or false)
- [ ] Frontend can load dashboard without 500 errors

## Next Steps

Once errors are resolved, proceed to create the README.md documentation.
