# Railway Deployment Fix - Action Plan

**Issue:** Deployment failing due to Dashboard override using `pnpm start`  
**Commit to deploy:** `c254599`  
**Status:** Configuration verified ✅

---

## ✅ 1. Verify railway.json

**Status:** ✅ Verified

```json
{
  "deploy": {
    "startCommand": "node dist/index.js"  ← Correct
  },
  "build": {
    "builder": "DOCKERFILE"  ← Correct
  }
}
```

**Dockerfile CMD:** `["node", "dist/index.js"]` ✅

---

## 🔧 2. Dashboard Action (CRITICAL)

**You must manually clear the Custom Start Command in Railway Dashboard:**

1. Open **Railway Dashboard**: https://railway.app
2. Navigate to: **Skaidrus_seimas** project → **skaidrus-seimas-demo** service
3. Go to: **Settings** → **Deploy** tab
4. Find: **Custom Start Command** (or **Start Command**) field
5. **ACTION:** **DELETE/CLEAR** any value in this field (make it completely empty)
6. **Save** the changes

**Why:** Dashboard Custom Start Command **overrides** both `railway.json` and Dockerfile `CMD`. If it's set to `pnpm start`, the deployment will fail because pnpm is not installed in the runner stage.

---

## 🚀 3. Trigger Redeploy

After clearing the Custom Start Command:

1. **Option A:** Click **"Redeploy"** button in Railway Dashboard
2. **Option B:** Push a new commit (or Railway will auto-deploy from GitHub)
3. **Target commit:** `c254599` (or latest main branch)
4. **Wait** until deployment status shows **"Live"**

---

## ✅ 4. Validation Checks

Once deployment shows **"Live"**, run these commands:

### Health Check (Node Process)

```bash
curl -f https://skaidrus-seimas-demo-production.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-24T..."
}
```

**If successful:** ✅ Node process is running correctly

---

### Playwright/Chromium Check

```bash
curl -f https://skaidrus-seimas-demo-production.up.railway.app/test-browser
```

**Expected Response:**
```json
{
  "success": true,
  "title": "Google",
  "message": "Playwright browser test successful",
  "timestamp": "2026-01-24T..."
}
```

**If successful:** ✅ 
- Multi-stage Docker build worked
- System dependencies installed correctly
- Browser binaries preserved in `node_modules/.cache/playwright`
- Chromium launches successfully in `node:20-slim` runner

---

## 🔍 Troubleshooting

### If `/health` fails:
- Check Railway logs: `railway logs`
- Verify environment variables are set (DATABASE_URL, VITE_APP_ID, JWT_SECRET)
- Check if container is actually running

### If `/test-browser` fails:
- Check Railway logs for Playwright errors
- Verify system dependencies were installed (check build logs)
- Verify browser binaries exist (check if `node_modules/.cache/playwright` was copied)

### If still seeing "pnpm not found":
- **Double-check** Custom Start Command is **completely empty** in Dashboard
- Try **Redeploy** again after clearing
- Check Railway logs to see what command is actually being executed

---

## 📋 Quick Reference

**Railway URL:** `https://skaidrus-seimas-demo-production.up.railway.app`

**Health endpoint:** `/health`  
**Browser test:** `/test-browser`

**Latest commit:** `c254599` - "docs: Add 'Fix pnpm not found' runbook"

---

## ✅ Success Criteria

- [ ] Custom Start Command field is **empty** in Railway Dashboard
- [ ] Deployment shows **"Live"** status
- [ ] `/health` returns `{"status":"ok"}`
- [ ] `/test-browser` returns `{"success":true,"title":"Google"}`

Once all checks pass, the deployment is fully functional! 🎉
