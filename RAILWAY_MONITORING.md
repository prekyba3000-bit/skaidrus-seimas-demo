# Railway Deployment Monitoring Guide

## Commit 255fa11 Deployment Status

**Commit**: `255fa11` - "fix: Add missing libxss1 dependency and verify Playwright configuration"

## Monitoring Steps

### 1. Check Railway Dashboard
1. Go to https://railway.app
2. Navigate to your project: **Skaidrus_seimas**
3. Check the **Deployments** tab
4. Look for commit `255fa11` in the deployment list
5. Verify deployment status (Building → Deploying → Active)

### 2. View Deployment Logs

**Via Railway Dashboard:**
- Click on the deployment
- View the **Logs** tab
- Look for:
  - ✅ `Building` - Docker build starting
  - ✅ `Installing system dependencies` - apt-get installing libraries
  - ✅ `Copying files from builder` - Multi-stage copy operations
  - ✅ `Starting node dist/index.js` - Application starting
  - ✅ `Skaidrus Seimas API server started` - Server ready

**Via Railway CLI:**
```bash
railway logs --tail 100
```

### 3. Get Deployment URL

**Via Railway Dashboard:**
- Go to **Settings** → **Domains**
- Copy the public domain (e.g., `your-app.up.railway.app`)

**Via Railway CLI:**
```bash
railway status
# Look for "Deployed at" or public URL
```

### 4. Test the Deployment

**Option A: Use the monitoring script**
```bash
./monitor-deployment.sh https://your-app.up.railway.app
```

**Option B: Manual testing**
```bash
# 1. Test health endpoint
curl -f https://your-app.up.railway.app/health

# 2. Test Playwright browser endpoint
curl -f https://your-app.up.railway.app/test-browser | jq '.'
```

**Option C: Use the test script**
```bash
./test-browser.sh https://your-app.up.railway.app
```

## Expected Results

### ✅ Successful Deployment Indicators

1. **Build Logs Should Show:**
   ```
   Installing system dependencies...
   libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 ...
   Copying node_modules (including .cache/playwright)...
   Starting node dist/index.js...
   ```

2. **Health Endpoint Response:**
   ```json
   {
     "status": "ok",
     "timestamp": "2026-01-24T..."
   }
   ```

3. **Browser Test Endpoint Response:**
   ```json
   {
     "success": true,
     "title": "Google",
     "message": "Playwright browser test successful",
     "timestamp": "2026-01-24T..."
   }
   ```

### ❌ Failure Indicators

If you see errors like:
- `Error: Cannot find module 'playwright'` → node_modules not copied correctly
- `Failed to launch browser` → System dependencies missing
- `Error: spawn chromium ENOENT` → Browser binaries not found
- `DATABASE_URL is required` → Environment variables not set

## Verification Checklist

- [ ] Deployment shows commit `255fa11` in Railway dashboard
- [ ] Build logs show successful Docker build
- [ ] Build logs show system dependencies installed
- [ ] Runtime logs show `node dist/index.js` starting
- [ ] `/health` endpoint returns `{"status":"ok"}`
- [ ] `/test-browser` endpoint returns success with title "Google"
- [ ] No errors in Railway logs

## Troubleshooting

If the `/test-browser` endpoint fails:

1. **Check Railway Logs:**
   ```bash
   railway logs --tail 100
   ```

2. **Verify Environment Variables:**
   - Railway Dashboard → Variables
   - Ensure `DATABASE_URL` is set (from PostgreSQL service)
   - Ensure `VITE_APP_ID` and `JWT_SECRET` are set

3. **Check Build Logs:**
   - Look for Playwright installation: `npx playwright install --with-deps chromium`
   - Verify system dependencies installed: `apt-get install libnss3...`

4. **Verify Browser Binaries:**
   - Check if `node_modules/.cache/playwright` exists in build logs
   - Verify COPY command executed successfully

## Next Steps After Successful Deployment

Once `/test-browser` returns `{"success": true, "title": "Google"}`:

1. ✅ Multi-stage Docker build verified
2. ✅ System dependencies installation verified  
3. ✅ Browser binaries preservation verified
4. ✅ Chromium launch in node:20-slim verified
5. ✅ Playwright integration complete

The deployment is production-ready! 🚀
