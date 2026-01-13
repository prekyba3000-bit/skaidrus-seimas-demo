# Phase 6: Feature Completion - Implementation Plan

## Current Status

✅ **Backend Features Complete:**

- `search.getSuggestions` - Implemented in `server/services/database.ts` and `server/routers.ts`
- `activities.getFeed` - Implemented with cursor-based pagination and synthetic fallback
- `user.getSettings` / `user.updateSettings` - Implemented with database persistence
- Database schema includes `settings` JSONB column in users table
- GIN indexes applied for text search performance

✅ **Frontend Integration:**

- ActivityFeed component uses `activities.getFeed` with infinite query
- Settings page uses `user.getSettings` and `user.updateSettings`
- Search dropdown uses `search.global` (not yet using `search.getSuggestions`)

## Remaining Work

### 1. Frontend: Switch Search to Use `search.getSuggestions` ⚠️ OPTIONAL

**Priority:** Medium (performance optimization)

**Current State:**

- `DashboardLayout.tsx` uses `search.global` for autocomplete
- `SearchDropdown.tsx` uses `search.global`
- `MPSelector.tsx` uses `search.global`

**Benefits of Switching:**

- Faster autocomplete (limited to 5 results per type vs unlimited)
- Better performance (uses GIN indexes)
- Parallel execution for speed
- Same response format, easy to switch

**Implementation Steps:**

1. Update `DashboardLayout.tsx` to use `search.getSuggestions` instead of `search.global`
2. Update `SearchDropdown.tsx` to use `search.getSuggestions`
3. Update `MPSelector.tsx` to use `search.getSuggestions` (if needed)
4. Test search functionality across all components
5. Verify performance improvements

**Files to Modify:**

- `client/src/components/DashboardLayout.tsx` (line 45)
- `client/src/components/SearchDropdown.tsx` (line 33)
- `client/src/components/MPSelector.tsx` (line 30) - optional

**Estimated Time:** 30-45 minutes

---

### 2. Activities Table Population Worker 🔴 HIGH PRIORITY

**Priority:** High (enables real activity feed)

**Current State:**

- `activities` table exists but may be empty
- `getActivityFeed()` falls back to synthetic feed (votes + bills) when activities table is empty
- Synthetic feed works but is less efficient and doesn't include all activity types

**Goal:**
Create a worker/script that populates the `activities` table from existing votes and bills data.

**Implementation Steps:**

#### Step 2.1: Create Activities Population Script

**File:** `scripts/populate-activities.ts`

**Functionality:**

- Query recent votes (last 30-90 days)
- Query recent bills (newly created/updated)
- Transform votes into activity records:
  - Type: "vote"
  - MP ID, Bill ID
  - Description: "MP voted [For/Against/Abstain] on [Bill Title]"
  - Created at: vote timestamp
- Transform bills into activity records:
  - Type: "document" or "session"
  - Bill ID
  - Description: "New bill: [Title]" or "Bill updated: [Title]"
  - Created at: bill created/updated timestamp
- Batch insert activities (use transactions)
- Skip duplicates (check existing activities)
- Handle errors gracefully

**Database Schema Reference:**

```typescript
// From drizzle/schema.ts
export const activities = pgTable("activities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: varchar("type", { length: 50 }).notNull(), // "vote", "comment", "document", "session", "achievement"
  mpId: integer("mp_id").references(() => mps.id),
  billId: integer("bill_id").references(() => bills.id),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### Step 2.2: Create Scheduled Worker (Optional)

**File:** `server/workers/activities-sync.ts`

**Functionality:**

- Run periodically (every 15-30 minutes)
- Sync new votes/bills since last run
- Use timestamps to track last sync
- Store last sync time in database or cache
- Handle incremental updates (not full resync)

#### Step 2.3: Add CLI Command

**File:** `scripts/populate-activities.ts`

**Usage:**

```bash
# Full population (first run)
npx tsx scripts/populate-activities.ts --full

# Incremental sync (only new items)
npx tsx scripts/populate-activities.ts --incremental

# Sync last N days
npx tsx scripts/populate-activities.ts --days 30
```

**Files to Create:**

- `scripts/populate-activities.ts` (NEW)
- `server/workers/activities-sync.ts` (NEW - optional)

**Files to Modify:**

- `package.json` - Add script command (optional)

**Estimated Time:** 2-3 hours

---

### 3. Settings UI Enhancements 🟡 OPTIONAL

**Priority:** Low (nice to have)

**Current State:**

- Settings page has 3 options: emailNotifications, betaFeatures, compactMode
- Settings persist to database
- Basic UI with toggles

**Enhancement Options:**

#### 3.1: Add More Settings Options

- **Theme:** Light/Dark/Auto (if not already implemented)
- **Language:** Lithuanian/English (if i18n is planned)
- **Notifications:** Email frequency, push notifications
- **Privacy:** Public profile visibility, data sharing preferences

#### 3.2: Settings Validation

- Add client-side validation
- Add server-side validation
- Show validation errors in UI

#### 3.3: Settings Export/Import

- Export settings as JSON
- Import settings from JSON
- Settings backup/restore functionality

**Files to Modify:**

- `client/src/pages/Settings.tsx`
- `server/routers.ts` (add validation)
- `drizzle/schema.ts` (extend settings type if needed)

**Estimated Time:** 2-4 hours (depending on scope)

---

## Recommended Implementation Order

1. **First:** Activities Table Population (High Priority)
   - Enables real activity feed
   - Improves performance
   - Better user experience

2. **Second:** Search Suggestions Switch (Medium Priority)
   - Quick win
   - Performance improvement
   - Low risk

3. **Third:** Settings Enhancements (Low Priority)
   - Can be done incrementally
   - Not blocking for production

---

## Testing Checklist

### Search Suggestions

- [ ] Search dropdown shows results correctly
- [ ] Keyboard navigation works
- [ ] Results are limited to 5 per type
- [ ] Performance is improved (check network tab)
- [ ] No regressions in existing search functionality

### Activities Population

- [ ] Script runs without errors
- [ ] Activities are created correctly
- [ ] No duplicate activities
- [ ] Activity feed shows real data (not synthetic)
- [ ] Incremental sync works correctly
- [ ] Worker handles errors gracefully

### Settings Enhancements

- [ ] New settings save correctly
- [ ] Validation works (client and server)
- [ ] Export/import works (if implemented)
- [ ] Settings persist across sessions
- [ ] No data loss on updates

---

## Migration Notes

### Database

- No new migrations needed (activities table already exists)
- Settings column already exists in users table
- GIN indexes already applied

### Deployment

- Run activities population script after deployment
- Consider running as a one-time job or scheduled task
- Monitor activity feed performance after population

---

## Success Criteria

✅ **Phase 6 Complete When:**

1. Activities table is populated with real data
2. Activity feed shows real activities (not synthetic fallback)
3. Search uses optimized suggestions endpoint (optional)
4. Settings enhancements are implemented (optional)

---

**Status:** 🟡 In Progress
**Last Updated:** 2026-01-11
**Next Review:** After activities population implementation
