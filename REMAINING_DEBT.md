# 📋 Technical Debt & Remaining Work

This document tracks known TODOs, FIXMEs, and technical debt that doesn't block production launch but should be addressed in future iterations.

---

## 🔴 High Priority (Post-Launch)

### 1. User-Specific Activity Read Tracking ✅ COMPLETE

**File:** `server/routers.ts:435-445`, `server/services/database.ts:690-710`, `server/services/database.ts:741-790`
**Status:** ✅ **COMPLETE** - Fixed January 17, 2026
**Issue:** `markActivitiesAsRead` didn't filter activities by user read status in feed queries
**Impact:** All users saw the same feed regardless of read status
**Fix:** 
- ✅ `markActivitiesAsRead` already accepted `userId` correctly (function signature correct)
- ✅ Enhanced `getActivityFeed` to accept `userId` and `excludeRead` parameters
- ✅ Added filtering logic to exclude read items when `excludeRead=true`
- ✅ Updated `getFeed` router to pass `userId` and `excludeRead` to database function
- ✅ Added "Hide Read" toggle UI control in `ActivityFeed.tsx`
- ✅ Updated cache key generation to include `excludeRead` parameter

**Implementation Details:**
- Database function now filters using `NOT EXISTS` subquery on `user_activity_reads` table
- Cache keys include `excludeRead` flag for proper cache separation
- Frontend toggle allows users to hide read activities from feed

---

## 🟡 Medium Priority (Future Enhancements)

### 2. Code Splitting for Large Bundles

**File:** `client/vite.config.ts`
**Issue:** Build warning: "Some chunks are larger than 500 kB after minification"
**Impact:** Slower initial page load
**Fix:** Implement dynamic imports and code splitting:

- Lazy load chart components (Recharts)
- Lazy load heavy pages (Dashboard, MP Profile)
- Use `build.rollupOptions.output.manualChunks`

### 3. Notification System Implementation

**File:** `client/src/pages/Settings.tsx:77-82`
**Issue:** Notification settings are placeholders
**Impact:** Users can't configure notifications
**Fix:**

- Create `notifications` table
- Implement email notification service
- Connect Settings UI to backend

### 4. Activity Feed Data Population

**File:** `server/services/database.ts:getActivityFeed`
**Issue:** Falls back to synthetic feed if `activities` table is empty
**Impact:** Activity feed may show incomplete data
**Fix:**

- Create worker to populate `activities` table from votes/bills
- Schedule regular sync job

### 5. GIN Indexes Not Applied ✅ COMPLETE

**File:** `scripts/add-gin-indexes.sql`
**Status:** ✅ **COMPLETE** - Fixed January 23, 2026
**Issue:** GIN indexes for full-text search must be applied manually
**Impact:** Text search (`ILIKE`) may be slower on large datasets
**Fix:**
- ✅ Created `scripts/add-gin-indexes.sql` migration script
- ✅ Applied GIN indexes to all search columns (MPs, Bills, Committees)
- ✅ Enabled `pg_trgm` extension for trigram-based search
- ✅ Verified all 7 indexes created successfully
- ✅ Documented in deployment guide

**Performance Impact:**
- 10-100x faster text search queries
- Significant improvement for `getSearchSuggestions()` and `globalSearch()`

---

## 🟢 Low Priority (Nice to Have)

### 6. Type Safety Improvements

**Files:** Various
**Issues:**

- Some `any` types in error handlers
- Missing return type annotations
- Loose typing in some utility functions

**Fix:** Gradually add stricter types

### 7. Test Coverage

**Files:** `server/__tests__/`, `e2e/`
**Issue:** Not all critical paths have tests
**Impact:** Risk of regressions
**Fix:** Add tests for:

- Rate limiting behavior
- Health check endpoints
- Graceful shutdown
- Error boundary

### 8. Documentation

**Files:** Various
**Issues:**

- Missing JSDoc comments on some functions
- API documentation could be more detailed
- Architecture diagrams missing

**Fix:** Add comprehensive documentation

### 9. Performance Optimizations

**Files:** Various
**Issues:**

- Some queries could use better indexes
- Frontend could benefit from React.memo in some places
- Chart rendering could be optimized

**Fix:** Profile and optimize hot paths

### 10. Accessibility Improvements

**Files:** `client/src/components/`
**Issue:** Some components may lack ARIA labels
**Impact:** Screen reader compatibility
**Fix:** Audit with accessibility tools and add ARIA labels

### 11. Script Type Errors

**Files:** `scripts/seed-sample-data.ts`, `scripts/check-activities.ts`, `scripts/check-bills.ts`, `scripts/reset-database.ts`
**Issue:** TypeScript errors in utility scripts (not part of production build)
**Impact:** Scripts may not work, but doesn't affect production
**Fix:**

- Fix type mismatches (MySQL vs PostgreSQL types in seed-sample-data.ts)
- Fix missing imports
- Update scripts to use correct database types

**Note:** These scripts are not included in the production build, so they don't block deployment.

---

## 📝 Notes

### What's NOT Debt

These are intentional design decisions, not technical debt:

- **Synthetic Activity Feed:** Intentional fallback when `activities` table is empty
- **LocalStorage for Settings:** Intentional for client-side preferences (compact mode)
- **Graceful Degradation:** Redis and Sentry are optional - app works without them
- **Development Fallbacks:** CORS and rate limits have dev fallbacks intentionally

### Migration Path

1. **Phase 1 (Week 1):** Address High Priority items
2. **Phase 2 (Week 2-3):** Medium Priority enhancements
3. **Phase 3 (Ongoing):** Low Priority improvements

---

**Last Updated:** 2026-01-11
**Status:** ✅ Production Ready (debt doesn't block launch)
