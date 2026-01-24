# Railway Variables Setup Guide

**Production API:** https://skaidrus-seimas-demo-production.up.railway.app

## ⚠️ Critical: Manual Generation Required

**`VITE_APP_ID` and `JWT_SECRET` must be manually generated and pasted into Railway Dashboard.**

These values **cannot** be auto-configured. You must:

1. Generate them locally using the commands below
2. Copy the generated values
3. Manually paste them into Railway Dashboard → Variables tab

## Generate Values

### Step 1: Generate JWT_SECRET

Run in your terminal:
```bash
openssl rand -base64 32
```

Example output:
```
bj49fsjQYeLCzZeed01TS+J9cjKRSZN/t5AuBAOaaw8=
```

### Step 2: Generate VITE_APP_ID

Run in your terminal:
```bash
openssl rand -hex 16
```

Example output:
```
cfc98fae01753458c1cda096200320ab
```

**⚠️ Important:** Generate fresh values for each deployment. Do not reuse values from documentation examples.

---

## Steps to Add to Railway Dashboard

### 1. Navigate to Variables
1. Open **Railway Dashboard**: https://railway.app
2. Go to: **Skaidrus_seimas** project → **skaidrus-seimas-demo** service
3. Click: **Variables** tab (or **Settings** → **Variables**)

### 2. Add VITE_APP_ID
1. Click **"+ New Variable"** (or **"Add Variable"**)
2. **Name:** `VITE_APP_ID`
3. **Value:** Paste the value you generated with `openssl rand -hex 16`
   - Example: `cfc98fae01753458c1cda096200320ab`
4. Click **"Add"** or **"Save"**

### 3. Add JWT_SECRET
1. Click **"+ New Variable"** (or **"Add Variable"**)
2. **Name:** `JWT_SECRET`
3. **Value:** Paste the value you generated with `openssl rand -base64 32`
   - Example: `bj49fsjQYeLCzZeed01TS+J9cjKRSZN/t5AuBAOaaw8=`
4. Click **"Add"** or **"Save"**

**⚠️ Remember:** Generate fresh values using the commands above. Do not copy example values from this documentation.

### 4. Verify DATABASE_URL
- Check if `DATABASE_URL` already exists (should auto-populate if PostgreSQL service is linked)
- If missing, ensure **Postgres** service is connected to **skaidrus-seimas-demo** in the Architecture view

### 5. Optional: Set NODE_ENV
- **Name:** `NODE_ENV`
- **Value:** `production`

---

## After Adding Variables

### 1. Redeploy
- Railway will **auto-redeploy** when variables are added, OR
- Manually click **"Redeploy"** button

### 2. Monitor Logs
Watch for these log messages indicating successful startup:

```
Environment variables validated
Skaidrus Seimas API server started
```

### 3. Verify Endpoints

Once deployment shows **"Live"**:

```bash
# Health check
curl -f https://skaidrus-seimas-demo-production.up.railway.app/health

# Expected: {"status":"ok","timestamp":"..."}

# Playwright test
curl -f https://skaidrus-seimas-demo-production.up.railway.app/test-browser

# Expected: {"success":true,"title":"Google","message":"Playwright browser test successful",...}
```

**✅ Production API is live:** https://skaidrus-seimas-demo-production.up.railway.app

---

## Troubleshooting

### If still getting 502 error:
1. **Check logs** for "Missing required environment variables" error
2. **Verify** all three variables are set:
   - `DATABASE_URL` ✅
   - `VITE_APP_ID` ✅
   - `JWT_SECRET` ✅
3. **Ensure** PostgreSQL service is linked (for `DATABASE_URL`)
4. **Redeploy** after adding variables

### If variables don't appear:
- Refresh the Railway Dashboard
- Check you're in the correct service (`skaidrus-seimas-demo`)
- Verify you have permissions to edit variables

---

## Security Note

⚠️ **Never commit `.env` to Git** - These values should remain private.

⚠️ **Generate fresh values** - Do not reuse values from examples or previous deployments.

The generated `JWT_SECRET` and `VITE_APP_ID` are cryptographically secure and unique. Keep them secret!

## Summary

1. **Generate** `JWT_SECRET` with `openssl rand -base64 32`
2. **Generate** `VITE_APP_ID` with `openssl rand -hex 16`
3. **Manually paste** both values into Railway Dashboard → Variables tab
4. **Verify** `/health` endpoint returns `{"status":"ok"}`
5. **Production API:** https://skaidrus-seimas-demo-production.up.railway.app
