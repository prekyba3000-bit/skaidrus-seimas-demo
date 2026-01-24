# Railway Deployment Troubleshooting - 502 Error

## Current Status
- **Deployment:** Shows "ACTIVE" and "Deployment successful"
- **Service Status:** "Online" 
- **HTTP Response:** 502 "Application failed to respond"
- **Issue:** App is not responding (likely crashing on startup)

## Diagnosis

The logs show Redis connection errors but **no server startup messages**, which suggests:

1. ✅ **Start Command Fixed:** No "pnpm not found" errors (good!)
2. ❌ **App Crashing:** Missing "Environment variables validated" log
3. ❌ **App Not Starting:** Missing "Skaidrus Seimas API server started" log

## Most Likely Cause: Missing Environment Variables

The app validates environment variables at startup and throws if missing:

- `DATABASE_URL` (required)
- `VITE_APP_ID` (required)  
- `JWT_SECRET` (required)

## Fix Steps

### 1. Check Railway Variables

Go to **Railway Dashboard** → **skaidrus-seimas-demo** → **Variables** (or **Settings** → **Variables**)

**Required Variables:**
- ✅ `DATABASE_URL` - Should be auto-set if PostgreSQL service is linked
- ❓ `VITE_APP_ID` - Must be set manually
- ❓ `JWT_SECRET` - Must be set manually  
- ❓ `NODE_ENV=production` - Recommended

### 2. Verify PostgreSQL Service Link

- Check if **Postgres** service is linked to **skaidrus-seimas-demo**
- If not linked, link it (Railway Dashboard → Architecture → Connect services)
- `DATABASE_URL` should auto-populate when linked

### 3. Set Missing Variables

If variables are missing, add them:

1. **VITE_APP_ID:** Your OAuth app ID
2. **JWT_SECRET:** Generate with `openssl rand -base64 32`
3. **NODE_ENV:** Set to `production`

### 4. Redeploy After Setting Variables

After adding variables:
- **Redeploy** the service
- Wait for **"Live"** status
- Check logs for "Environment variables validated" and "Skaidrus Seimas API server started"

### 5. Verify Startup

Once redeployed, check logs for:

```
Environment variables validated
Skaidrus Seimas API server started
```

Then test:
```bash
curl -f https://skaidrus-seimas-demo-production.up.railway.app/health
curl -f https://skaidrus-seimas-demo-production.up.railway.app/test-browser
```

## Quick Checklist

- [ ] PostgreSQL service linked to skaidrus-seimas-demo
- [ ] `DATABASE_URL` variable exists (auto-set from Postgres)
- [ ] `VITE_APP_ID` variable set
- [ ] `JWT_SECRET` variable set  
- [ ] `NODE_ENV=production` variable set (optional but recommended)
- [ ] Service redeployed after setting variables
- [ ] Logs show "Environment variables validated"
- [ ] Logs show "Skaidrus Seimas API server started"
- [ ] `/health` endpoint returns `{"status":"ok"}`
- [ ] `/test-browser` endpoint returns success with `"title":"Google"`
