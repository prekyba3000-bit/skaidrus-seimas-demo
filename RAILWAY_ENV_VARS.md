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
- `VITE_APP_ID` - Your OAuth app ID
- `JWT_SECRET` - Secret key for JWT session tokens (generate a secure random string)
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
3. ✅ Set `VITE_APP_ID` in Railway Variables
4. ✅ Set `JWT_SECRET` in Railway Variables (generate: `openssl rand -base64 32`)
5. ✅ Set `NODE_ENV=production` in Railway Variables
6. ✅ (Optional) Set `OAUTH_SERVER_URL` if you need a custom OAuth server
7. ✅ (Optional) Set `OWNER_OPEN_ID` for admin access
8. ✅ (Optional) Set `GEMINI_API_KEY` if using AI features
9. ✅ (Optional) Set `SENTRY_DSN` for error tracking

## Verification

After setting variables, verify the deployment:
1. Check `/health` endpoint - should return `{"status":"ok"}`
2. Check `/health/ready` endpoint - should show database and Redis status
3. Check `/test-browser` endpoint - should test Playwright functionality
