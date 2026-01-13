# ⚡ Quick Fix: 500 Errors

## The Problem

Your schema is already in sync (Drizzle confirmed "No schema changes"). The 500 errors are from **stale server cache**.

## The Solution (3 Steps)

### 1️⃣ Stop Your Dev Server

Press `Ctrl+C` in the terminal where `npm run dev` is running.

### 2️⃣ Restart the Server

```bash
npm run dev
```

### 3️⃣ Verify It Works

Check your terminal for:

- ✅ `Database connection established`
- ✅ `Server listening on port XXXX`
- ✅ No red error messages

Then test in browser:

- Dashboard should load without 500 errors
- Watchlist widget should appear (empty if no follows yet)
- MP profiles should load

## Why This Works

- Drizzle ORM caches database connections
- Express/tRPC routers cache route handlers
- Restarting clears all caches and reconnects to DB

## If Errors Persist

See [FIX_500_ERRORS.md](./FIX_500_ERRORS.md) for detailed troubleshooting.

---

**Time to fix: ~30 seconds** ⚡
