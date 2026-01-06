# Accountability Score Calculation

## Overview

The accountability score system calculates a comprehensive 0-100 score for each Member of Parliament (MP) based on multiple metrics that reflect their performance, transparency, and engagement.

## Formula Components

The accountability score is calculated using a weighted formula with four main components:

### 1. Voting Attendance (40%)

- **Weight**: 40% of total score
- **Calculation**: `(Votes Participated / Total Votes Available) × 100`
- **Data Source**: `session_mp_votes` table
- **Rationale**: Regular participation in votes is fundamental to an MP's duties

### 2. Legislative Activity (30%)

- **Weight**: 30% of total score
- **Calculation**: `min(100, (Bills Proposed / Average Bills Per MP) × 100)`
- **Data Source**: `bill_sponsors` table
- **Components**:
  - Bills proposed
  - Bills passed (higher weight)
- **Rationale**: Active legislative contribution demonstrates engagement and productivity

### 3. Party Independence (20%)

- **Weight**: 20% of total score
- **Calculation**: `(100 - Party Loyalty) × 0.20`
- **Data Source**: Voting patterns compared to party majority positions
- **Note**: Currently uses a baseline of 70% loyalty (placeholder)
- **Rationale**: Independence in thought and voting shows critical thinking and constituent representation

### 4. Consistency (10%)

- **Weight**: 10% of total score
- **Current**: Fixed at 100% (placeholder)
- **Future Enhancement**: Will track voting pattern consistency and unexplained absences
- **Rationale**: Consistent behavior builds trust and predictability

## Implementation

### Database Schema

The scores are stored in the `mp_stats` table:

```sql
CREATE TABLE mp_stats (
  id INTEGER PRIMARY KEY,
  mp_id INTEGER UNIQUE NOT NULL,
  voting_attendance NUMERIC(5, 2),
  party_loyalty NUMERIC(5, 2),
  bills_proposed INTEGER DEFAULT 0,
  bills_passed INTEGER DEFAULT 0,
  accountability_score NUMERIC(5, 2),
  last_calculated TIMESTAMP DEFAULT NOW()
);
```

### Calculation Script

**Location**: `scripts/calculate-accountability-scores.ts`

**Run Command**: `npm run calc:scores`

**Process**:

1. Fetches all active MPs
2. For each MP:
   - Counts voting participation from `session_mp_votes`
   - Counts bills proposed from `bill_sponsors`
   - Counts bills passed (sponsor + bill.status = 'passed')
   - Calculates weighted scores
   - Upserts results to `mp_stats` table
3. Outputs summary statistics

## Current Status

### What's Working ✅

- Database schema with unique constraint on `mp_id`
- Calculation script that processes all 146 active MPs
- Proper upsert logic to update existing scores
- Summary statistics generation

### Known Limitations ⚠️

1. **No Individual Vote Data**: The `session_mp_votes` table is currently empty, so all voting attendance scores are 0%
2. **Party Loyalty Placeholder**: Using a fixed 70% baseline instead of calculated party positions
3. **Consistency Metric**: Not yet implemented, currently fixed at 100%
4. **No Historical Tracking**: Scores are recalculated each time, not tracked over time

### Data Requirements

To calculate accurate scores, you need:

1. **Session Votes**: Already imported (131 votes in `session_votes`)
2. **Individual MP Votes**: Need to run vote scraper to populate `session_mp_votes`
3. **Bill Sponsors**: Need real sponsorship data
4. **Bill Status**: Need to sync bills with accurate status information

## Next Steps

### Immediate Actions

1. ✅ ~~Fix database constraint (COMPLETED)~~
2. ✅ ~~Implement basic calculation logic (COMPLETED)~~
3. ⏳ Scrape and import individual MP votes into `session_mp_votes`
4. ⏳ Map votes to MPs using `seimas_mp_id` field

### Future Enhancements

1. **Party Loyalty Calculation**:
   - Determine party majority position on each vote
   - Calculate each MP's alignment rate
   - Adjust weighting (independence vs. party unity)

2. **Consistency Metric**:
   - Track voting pattern changes over time
   - Flag unexplained absences
   - Identify flip-flopping on similar issues

3. **Temporal Analysis**:
   - Store historical scores
   - Track trends over time
   - Generate accountability reports

4. **Additional Metrics**:
   - Committee participation
   - Public engagement (speeches, debates)
   - Constituent service
   - Ethics flags and resolutions

## Usage

### Calculate Scores

```bash
npm run calc:scores
```

### Check Current Data

```bash
npm run check:votes
```

### View Score in Application

Scores are automatically fetched and displayed in:

- MP List page (`/mps`) - sortable by accountability score
- MP Profile page (`/mp/:id`) - prominently displayed
- Dashboard statistics

## Score Interpretation

| Score Range | Grade | Meaning                   |
| ----------- | ----- | ------------------------- |
| 90-100      | A+    | Exceptional performance   |
| 80-89       | A     | Excellent performance     |
| 70-79       | B     | Good performance          |
| 60-69       | C     | Satisfactory performance  |
| 50-59       | D     | Below average performance |
| 0-49        | F     | Poor performance          |

## Technical Notes

### Performance

- Full recalculation for 146 MPs takes ~5-10 seconds
- Can be optimized with bulk operations
- Consider running as scheduled job (daily/weekly)

### Data Integrity

- Uses upsert pattern to avoid duplicates
- Foreign key constraints ensure MP validity
- Decimal precision (5,2) allows scores up to 999.99

### Error Handling

- Database connection errors are caught and logged
- Missing MPs are skipped with warning
- Transaction rollback on failure (future enhancement)

## References

- Database Schema: `/drizzle/schema.ts`
- Calculation Logic: `/scripts/calculate-accountability-scores.ts`
- API Integration: `/server/db.ts` (getMpStats function)
- Frontend Display: `/client/src/pages/MPs.tsx`, `/client/src/pages/MPProfile.tsx`
