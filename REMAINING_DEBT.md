# 📋 Technical Debt & Remaining Work

This document tracks known TODOs, FIXMEs, and technical debt that doesn't block production launch but should be addressed in future iterations.

---

## 🔴 High Priority (Post-Launch)

### 1. User-Specific Activity Read Tracking

**File:** `server/routers.ts:376`
**Issue:** `markActivitiesAsRead` doesn't accept `userId` for user-specific read tracking
**Impact:** All users see the same "read" status for activities
**Fix:** Update `markActivitiesAsRead` to accept `userId` and track per-user read status

```typescript
// Current:
markAsRead: protectedProcedure.mutation(async ({ ctx }) => {
  return await db.markActivitiesAsRead(); // No userId
});

// Should be:
markAsRead: protectedProcedure.mutation(async ({ ctx }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return await db.markActivitiesAsRead(ctx.user.openId);
});
```

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

### 5. GIN Indexes Not Applied

**File:** `scripts/add-gin-indexes.sql`
**Issue:** GIN indexes for full-text search must be applied manually
**Impact:** Text search (`ILIKE`) may be slower on large datasets
**Fix:**

- Run `psql -f scripts/add-gin-indexes.sql` after migrations
- Or create Drizzle migration for GIN indexes

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
