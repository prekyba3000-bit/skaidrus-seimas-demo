# Quick Fix: Clear Custom Start Command

## Current Issue
Dashboard Custom Start Command override is causing "pnpm not found" error.

## Solution

### In Railway Dashboard → Settings → Deploy:

1. **Find:** "Custom Start Command" or "Start Command" field
2. **Action:** Delete any value (make it completely empty)
3. **Save** the changes
4. **Redeploy** the service

### After Redeploy Shows "Live":

**Health Check:**
```bash
curl -f https://skaidrus-seimas-demo-production.up.railway.app/health
```

**Playwright Check:**
```bash
curl -f https://skaidrus-seimas-demo-production.up.railway.app/test-browser
```

## Expected Results

- `/health` → `{"status":"ok","timestamp":"..."}`
- `/test-browser` → `{"success":true,"title":"Google",...}`

If both succeed, deployment is fixed! ✅
