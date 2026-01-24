# Railway Environment Variables Reference

This file lists all environment variables needed for Railway deployment.
Copy these to Railway Dashboard → Your Project → Variables.

## Required Variables

### Database
- `DATABASE_URL` - PostgreSQL connection string (Railway automatically provides this if you add a PostgreSQL service)
  - Format: `postgresql://user:password@host:port/database`
  - **Note**: Railway automatically sets this when you add a PostgreSQL service

### Server Configuration
- `PORT` - Server port (Railway automatically sets this, defaults to 3000)
- `NODE_ENV` - Set to `production` for Railway deployments

### OAuth Configuration
- `OAUTH_SERVER_URL` - OAuth server URL (optional - will use Railway public domain if not set)
  - If not set, the app will use `https://${RAILWAY_PUBLIC_DOMAIN}` automatically
  - Format: `https://your-app.up.railway.app`
- `VITE_APP_ID` - **REQUIRED** - Your OAuth app ID
  - **⚠️ Must be manually generated and pasted into Railway Dashboard Variables tab**
  - Generate: `openssl rand -hex 16`
  - Example: `cfc98fae01753458c1cda096200320ab`
- `JWT_SECRET` - **REQUIRED** - Secret key for JWT session tokens
  - **⚠️ Must be manually generated and pasted into Railway Dashboard Variables tab**
  - Generate: `openssl rand -base64 32`
  - Example: `bj49fsjQYeLCzZeed01TS+J9cjKRSZN/t5AuBAOaaw8=`
- `OWNER_OPEN_ID` - OpenID of the admin/owner user (optional)

### Redis (Optional - for caching and queues)
- `REDIS_URL` - Redis connection string (Railway automatically provides this if you add a Redis service)
  - Format: `redis://user:password@host:port`
  - **Note**: Railway automatically sets this when you add a Redis service

## Optional Variables

### AI Services
- `GEMINI_API_KEY` - Google Gemini API key for AI features

### Error Tracking
- `SENTRY_DSN` - Sentry DSN for error tracking

### Webhooks
- `WEBHOOK_URL` - Webhook URL for notifications (e.g., Slack)

### Forge API (if using)
- `BUILT_IN_FORGE_API_URL` - Forge API URL
- `BUILT_IN_FORGE_API_KEY` - Forge API key

### Logging
- `LOG_LEVEL` - Log level (debug, info, warn, error) - defaults to info in production

## Railway Auto-Provided Variables

Railway automatically provides these (you don't need to set them manually):
- `RAILWAY_PUBLIC_DOMAIN` - Your Railway public domain (e.g., `your-app.up.railway.app`)
- `RAILWAY_ENVIRONMENT` - Environment name (production, preview, etc.)
- `RAILWAY_PROJECT_ID` - Your Railway project ID
- `RAILWAY_SERVICE_ID` - Your service ID

## Start Command (Critical)

**⚠️ Do NOT use `pnpm start` in Railway.** The Docker runner stage excludes pnpm. Use `node dist/index.js` only.

- **Correct:** `node dist/index.js`
- **Wrong:** `pnpm start` or `npm start` (fails: "The executable pnpm could not be found")

**Railway Dashboard (Settings → Deploy → Custom Start Command):**

- **Explicitly avoid** setting Custom Start Command to `pnpm start` or `npm start`.
- Either **leave the field empty** (so `railway.json` / Dockerfile `CMD` is used) or set it to `node dist/index.js`.
- **If deployment fails with "pnpm could not be found":** Manually **clear** the Start Command field in the Dashboard. That allows `railway.json` settings to take precedence.

**Where the start command is defined:**

1. **railway.json** (recommended): `"startCommand": "node dist/index.js"` under `deploy` — used when Dashboard override is empty
2. **Railway Dashboard:** Service → **Settings** → **Deploy** → **Custom Start Command** — override; clear it to use `railway.json`
3. **Dockerfile:** Final `CMD` is `["node", "dist/index.js"]` — used when no override is set

## Quick Setup Checklist

1. ✅ Add PostgreSQL service in Railway (sets `DATABASE_URL` automatically)
2. ✅ Add Redis service in Railway (sets `REDIS_URL` automatically) - Optional
3. ✅ **Generate `VITE_APP_ID`** (run `openssl rand -hex 16` in terminal)
4. ✅ **Generate `JWT_SECRET`** (run `openssl rand -base64 32` in terminal)
5. ✅ **Manually paste `VITE_APP_ID` into Railway Dashboard → Variables tab**
6. ✅ **Manually paste `JWT_SECRET` into Railway Dashboard → Variables tab**
7. ✅ Set `NODE_ENV=production` in Railway Variables
8. ✅ (Optional) Set `OAUTH_SERVER_URL` if you need a custom OAuth server
9. ✅ (Optional) Set `OWNER_OPEN_ID` for admin access
10. ✅ (Optional) Set `GEMINI_API_KEY` if using AI features
11. ✅ (Optional) Set `SENTRY_DSN` for error tracking

**⚠️ Important:** `VITE_APP_ID` and `JWT_SECRET` **cannot** be auto-configured. You **must** generate them locally and manually paste them into the Railway Dashboard Variables tab for the `skaidrus-seimas-demo` service.

## Fix "pnpm not found" (Runbook)

If deployment is **stuck** with **"pnpm not found"** or **"The executable pnpm could not be found"**:

### 1. Verify config

Confirm `railway.json` has:

- `"startCommand": "node dist/index.js"`
- `"builder": "DOCKERFILE"`

(Already correct in this repo.)

### 2. Dashboard action (critical)

**The Dashboard Custom Start Command overrides both `railway.json` and the Dockerfile `CMD`.** If it is set to `pnpm start` (or anything using pnpm), the runner will fail because pnpm is not in the image.

1. Open **Railway Dashboard** → your project → **skaidrus-seimas-demo** service.
2. Go to **Settings** → **Deploy**.
3. Find **Custom Start Command** (or **Start Command**).
4. **Manually CLEAR the field** — delete any value so it is completely empty.
5. **Save**.

### 3. Trigger redeploy

1. After clearing, trigger a **new deployment** (e.g. **Redeploy**).
2. Use commit **`4655679`** (or latest main).
3. Wait until the deployment shows **Live**.

### 4. Health check

Once **Live**:

```bash
curl -f https://<your-domain>/health
```

Expected: `{"status":"ok","timestamp":"..."}`  

If this succeeds, the Node process is running.

### 5. Playwright check

```bash
curl -f https://<your-domain>/test-browser
```

Expected JSON includes `"title": "Google"` and `"success": true`.  

If so, system dependencies and Chromium binaries are correctly configured in the production runner.

---

## Railway Dashboard Verification (reference)

If you still see **"pnpm not found"** after updating config:

1. **Settings** → **Deploy** → **Custom Start Command**.
2. **Clear** the field (leave it empty).
3. Save and **Redeploy**.

An empty Custom Start Command allows `railway.json` (`"startCommand": "node dist/index.js"`) to take effect. A Dashboard override always wins, so clearing it is required when it was set to `pnpm start`.

## Final Test (After Container Starts)

**Production API:** https://skaidrus-seimas-demo-production.up.railway.app

Once the container is **Live**:

1. **`/health`** — Node process up:  
   `curl -f https://skaidrus-seimas-demo-production.up.railway.app/health`  
   → `{"status":"ok","timestamp":"..."}`

2. **`/test-browser`** — Chromium launch:  
   `curl -f https://skaidrus-seimas-demo-production.up.railway.app/test-browser`  
   → `{"success":true,"title":"Google","message":"Playwright browser test successful",...}`

If both succeed, the runner uses `node` only (no pnpm) and Playwright/Chromium are working.

## Verification

After setting variables, verify the deployment:
1. Check `/health` endpoint - should return `{"status":"ok"}`
2. Check `/health/ready` endpoint - should show database and Redis status
3. Check `/test-browser` endpoint - should test Playwright functionality
