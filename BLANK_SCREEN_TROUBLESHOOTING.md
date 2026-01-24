# Blank Screen Bug - Troubleshooting Documentation

## Problem Statement

**Issue:** React frontend deployed to Railway production environment shows a **blank white screen** when accessed at `https://skaidrus-seimas-demo-production.up.railway.app`

**Expected Behavior:** React application should render and display the UI

**Current Behavior:** Page loads HTML correctly, but displays completely blank/white screen with no visible content

---

## Architecture Overview

### Stack
- **Frontend:** React + Vite + TypeScript
- **Backend:** Express.js + Node.js + tRPC
- **Deployment:** Railway (Docker multi-stage build)
- **Build:** Vite builds to `client/dist/`, Express serves static files

### File Structure
```
skaidrus-seimas-demo/
├── client/
│   ├── dist/              # Production build output
│   │   ├── index.html     # Entry HTML
│   │   ├── js/            # JavaScript bundles (hashed filenames)
│   │   └── assets/        # CSS and other assets
│   └── src/
│       ├── main.tsx       # React entry point
│       └── App.tsx        # Root component
└── server/
    └── _core/
        └── index.ts        # Express server setup
```

---

## What We've Already Fixed

### ✅ 1. Static File Serving (RESOLVED)

**Problem:** Express catch-all route (`app.get("*")`) was intercepting static asset requests (`/js/*.js`, `/assets/*.css`) and serving HTML instead of the actual files.

**Symptoms:**
- `curl /js/index-*.js` returned HTML instead of JavaScript
- `Content-Type` was `text/html` instead of `application/javascript`
- Browser couldn't execute JavaScript bundles

**Solution Applied:**
- Added explicit exclusion logic in catch-all route for static asset paths
- Excludes: `/js/*`, `/assets/*`, and any path with file extensions (`.js`, `.css`, etc.)
- Returns 404 JSON for missing static files instead of serving HTML

**Files Changed:**
- `server/_core/index.ts` - Added static asset path exclusions in SPA fallback route

**Verification:**
```bash
curl -I https://skaidrus-seimas-demo-production.up.railway.app/js/index-C476gx30.js
# Now returns: Content-Type: application/javascript; charset=utf-8 ✅
```

**Status:** ✅ **FIXED** - Static files now serve correctly with proper MIME types

---

### ✅ 2. Express Static Middleware Path Resolution (RESOLVED)

**Problem:** `express.static("client/dist")` used relative path which might not resolve correctly in Docker container.

**Solution Applied:**
- Changed to absolute path: `express.static(path.join(process.cwd(), "client/dist"))`
- Added logging to show static file path on startup
- Ensures correct resolution in Docker where `process.cwd()` is `/app`

**Files Changed:**
- `server/_core/index.ts` - Use absolute path for express.static

**Status:** ✅ **FIXED** - Path resolution now works correctly

---

### ✅ 3. Route Ordering (VERIFIED CORRECT)

**Current Order (in `server/_core/index.ts`):**
1. API routes (`/api/trpc`, `/health`, etc.)
2. `express.static("client/dist")` - Serves static files
3. Catch-all route `app.get("*")` - SPA fallback for React routing

**Status:** ✅ **CORRECT** - Middleware order is correct (static files served before catch-all)

---

### ✅ 4. Error Handling Enhancement (ADDED)

**Problem:** Errors were only logged to console, making debugging difficult.

**Solution Applied:**
- Added global error handlers that display errors on page
- Added loading indicator before React mounts
- Enhanced ErrorBoundary logging (now logs in production too)
- Added visible error display for uncaught errors and promise rejections

**Files Changed:**
- `client/src/main.tsx` - Enhanced error handling
- `client/src/components/ErrorBoundary.tsx` - Improved logging

**Status:** ✅ **ADDED** - Better error visibility (should help diagnose remaining issue)

---

## Current State

### ✅ What's Working

1. **HTML Served Correctly**
   - Root route (`/`) serves `index.html` ✅
   - HTML structure is correct with `<div id="root"></div>` ✅
   - Script tags reference correct hashed filenames ✅

2. **Static Assets Served Correctly**
   - JavaScript files: `Content-Type: application/javascript` ✅
   - CSS files: `Content-Type: text/css` ✅
   - Files return 200 OK status ✅
   - JavaScript content is valid (not HTML) ✅

3. **Server Running**
   - Health endpoint works: `/health` returns `{"status":"ok"}` ✅
   - API endpoints respond (though some return database errors) ✅

### ❌ What's Still Broken

**Blank White Screen:**
- Page loads HTML ✅
- JavaScript files load ✅
- CSS files load ✅
- **BUT:** React app doesn't render (blank screen) ❌

---

## Potential Root Causes (Not Yet Verified)

### 1. JavaScript Runtime Error (MOST LIKELY)

**Hypothesis:** JavaScript executes but throws an error during React initialization, preventing render.

**Evidence:**
- Files load correctly (verified)
- No visible error on page (yet - enhanced error handling just deployed)
- tRPC endpoint `/api/trpc/mps.list` returns database error (might cause React query to fail)

**What to Check:**
- Browser console (F12 → Console) for JavaScript errors
- Network tab for failed requests
- After latest deployment, check if error handlers display anything

**Files to Investigate:**
- `client/src/main.tsx` - React initialization
- `client/src/App.tsx` - Root component setup
- `client/src/pages/Home.tsx` - Uses `trpc.mps.list.useQuery()` which might fail

---

### 2. tRPC Client Configuration Issue

**Hypothesis:** tRPC client fails to connect, causing React Query to throw, preventing render.

**Evidence:**
- `trpc.mps.list.useQuery()` is called in `Home.tsx` (root route component)
- API endpoint `/api/trpc/mps.list` returns database error
- If query fails catastrophically, it might prevent React from rendering

**What to Check:**
- Verify tRPC client URL configuration (`/api/trpc`)
- Check if React Query error handling is working
- See if ErrorBoundary catches tRPC errors

**Files to Investigate:**
- `client/src/App.tsx` - tRPC client setup
- `client/src/lib/trpc.ts` - tRPC configuration
- `client/src/pages/Home.tsx` - Uses tRPC query

---

### 3. CSS Not Loading / Styling Issue

**Hypothesis:** CSS loads but Tailwind/styles aren't applied, making content invisible (white on white).

**Evidence:**
- CSS file loads correctly (verified)
- But if Tailwind isn't processing, content might be invisible

**What to Check:**
- Inspect DOM in browser - is content actually rendered but invisible?
- Check computed styles on root element
- Verify Tailwind CSS is included in build

**Files to Investigate:**
- `client/src/index.css` - Tailwind imports
- `client/vite.config.ts` - Tailwind plugin configuration
- Build output CSS file

---

### 4. Content Security Policy (CSP) Blocking

**Hypothesis:** Helmet CSP headers block inline scripts or external resources.

**Evidence:**
- Helmet is configured in `server/_core/index.ts`
- CSP might block module scripts or inline styles

**What to Check:**
- Browser console for CSP violations
- Check Helmet CSP configuration
- Verify CSP allows `script-src 'self'` for module scripts

**Files to Investigate:**
- `server/_core/index.ts` - Helmet CSP configuration

---

### 5. Environment Variables Missing

**Hypothesis:** Frontend requires `VITE_*` environment variables that aren't set, causing initialization to fail.

**Evidence:**
- `client/src/monitoring.ts` uses `import.meta.env.VITE_SENTRY_DSN` (optional)
- No other `VITE_*` vars seem required, but worth checking

**What to Check:**
- Verify no required `VITE_*` env vars are missing
- Check if Sentry initialization fails silently

**Files to Investigate:**
- `client/src/monitoring.ts` - Sentry initialization
- Any other files using `import.meta.env.VITE_*`

---

## Debugging Steps Already Taken

### ✅ Completed Steps

1. **Verified HTML Structure**
   - ✅ HTML is served correctly
   - ✅ Root element exists: `<div id="root"></div>`
   - ✅ Script tags reference correct files

2. **Verified Static Asset Serving**
   - ✅ JavaScript files return correct Content-Type
   - ✅ CSS files return correct Content-Type
   - ✅ Files contain actual code (not HTML)

3. **Fixed Route Interception**
   - ✅ Catch-all route no longer intercepts static assets
   - ✅ Express static middleware serves files correctly

4. **Enhanced Error Handling**
   - ✅ Added visible error display
   - ✅ Added loading indicator
   - ✅ Enhanced ErrorBoundary logging

5. **Verified Server Configuration**
   - ✅ Route ordering is correct
   - ✅ Static file paths are correct
   - ✅ MIME types are set correctly

---

## Next Steps for Future Agents

### 🔍 Immediate Actions

1. **Check Browser Console** (CRITICAL)
   - Open `https://skaidrus-seimas-demo-production.up.railway.app` in browser
   - Press F12 → Console tab
   - Look for:
     - Red error messages
     - Failed network requests
     - CSP violations
     - Any JavaScript errors

2. **Check Network Tab**
   - F12 → Network tab
   - Reload page
   - Verify all requests succeed:
     - `index.html` ✅
     - `index-*.js` ✅
     - `index-*.css` ✅
     - `/api/trpc/*` (might fail, but shouldn't block render)

3. **Inspect DOM**
   - F12 → Elements tab
   - Check if `<div id="root">` has any children
   - If empty → React didn't mount
   - If has children → React mounted but content invisible

4. **Check Railway Logs**
   ```bash
   railway logs --tail 100 | grep -i "error\|warn\|static"
   ```
   - Look for static file serving errors
   - Look for application errors

---

### 🐛 If Still Blank Screen After Latest Deployment

**The enhanced error handling should now display errors on the page.** Check:

1. **Is there a loading indicator?**
   - YES → React is trying to mount, check for errors after
   - NO → JavaScript might not be executing at all

2. **Is there an error message displayed?**
   - YES → That's the root cause! Fix that error
   - NO → Check browser console for errors

3. **Browser Console Errors?**
   - Check for:
     - Module loading errors
     - Syntax errors
     - Network errors
     - CSP violations

---

## Key Files to Review

### Server-Side
- `server/_core/index.ts` - Express configuration, static file serving, SPA fallback
- `Dockerfile` - Build process, file copying

### Client-Side
- `client/src/main.tsx` - React entry point, error handling
- `client/src/App.tsx` - Root component, tRPC setup
- `client/src/pages/Home.tsx` - First route, uses tRPC query
- `client/src/components/ErrorBoundary.tsx` - Error boundary component
- `client/vite.config.ts` - Build configuration

### Configuration
- `package.json` - Build scripts
- `railway.json` - Railway deployment config

---

## Test Commands

```bash
# Verify static assets
curl -I https://skaidrus-seimas-demo-production.up.railway.app/js/index-C476gx30.js | grep content-type
# Expected: application/javascript; charset=utf-8

# Verify HTML
curl https://skaidrus-seimas-demo-production.up.railway.app/ | grep -o 'src="[^"]*\.js"'
# Should show: src="/js/index-*.js"

# Verify API
curl https://skaidrus-seimas-demo-production.up.railway.app/api/trpc/mps.list
# Might return error, but shouldn't block render

# Check logs
railway logs --tail 100
```

---

## Known Issues (Not Related to Blank Screen)

1. **Database Query Errors**
   - `/api/trpc/mps.list` returns database error
   - This shouldn't cause blank screen (React should render with error state)
   - But might be related if error handling is broken

2. **Missing Environment Variables**
   - `VITE_SENTRY_DSN` not set (optional, shouldn't cause issues)
   - Other `VITE_*` vars might be missing

---

## Summary for Future Agents

**DO NOT REPEAT:**
- ❌ Don't fix static file serving (already fixed)
- ❌ Don't change route ordering (already correct)
- ❌ Don't modify express.static path (already using absolute path)

**DO CHECK:**
- ✅ Browser console for JavaScript errors
- ✅ Network tab for failed requests
- ✅ DOM inspection to see if React mounted
- ✅ Railway logs for runtime errors
- ✅ After latest deployment, check if error handlers show anything

**MOST LIKELY CAUSE:**
JavaScript runtime error during React initialization, possibly related to:
- tRPC query failure in `Home.tsx`
- Missing environment variables
- CSP blocking scripts
- Module loading error

**NEXT STEP:**
Wait for latest deployment (commit `91beee3`) to complete, then check browser console and see if enhanced error handlers display any errors on the page.

---

## Commits Related to This Issue

- `f578295` - Initial fix: Serve React client frontend
- `3f7a6ac` - Fix: Exclude static assets from SPA fallback
- `824c72b` - Fix: Use absolute path for express.static
- `4c33697` - Add: Validation script for static assets
- `91beee3` - Fix: Enhanced error handling for blank screen debugging

---

**Last Updated:** 2026-01-24
**Status:** Blank screen persists, enhanced error handling deployed to help diagnose
