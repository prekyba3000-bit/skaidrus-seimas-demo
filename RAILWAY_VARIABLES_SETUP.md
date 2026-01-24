# Railway Variables Setup Guide

## Generated Values

The following values have been generated and added to your local `.env` file:

### VITE_APP_ID
```
2fec4d14565de548b168bc3961aff610
```

### JWT_SECRET
```
gr5KnJCMRMetlO8Hpkw4TD+yWGCcs0Okxd2QSR2YDfs=
```

---

## Steps to Add to Railway Dashboard

### 1. Navigate to Variables
1. Open **Railway Dashboard**: https://railway.app
2. Go to: **Skaidrus_seimas** project → **skaidrus-seimas-demo** service
3. Click: **Variables** tab (or **Settings** → **Variables**)

### 2. Add VITE_APP_ID
1. Click **"+ New Variable"** (or **"Add Variable"**)
2. **Name:** `VITE_APP_ID`
3. **Value:** `2fec4d14565de548b168bc3961aff610`
4. Click **"Add"** or **"Save"**

### 3. Add JWT_SECRET
1. Click **"+ New Variable"** (or **"Add Variable"**)
2. **Name:** `JWT_SECRET`
3. **Value:** `gr5KnJCMRMetlO8Hpkw4TD+yWGCcs0Okxd2QSR2YDfs=`
4. Click **"Add"** or **"Save"**

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

⚠️ **Never commit `.env` to Git** - These values are already in your local `.env` file but should remain private.

The generated `JWT_SECRET` is cryptographically secure and unique. Keep it secret!
