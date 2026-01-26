# Seeding Guide - Skaidrus Seimas Dashboard

This guide explains how to seed all needed live data for the Skaidrus Seimas transparency dashboard.

## Quick Start (Recommended)

For a complete initial seed with all data:

```bash
# Option 1: All-in-one seed (recommended for first-time setup)
npm run seed:real
```

This single command will:
- ✅ Fetch and seed **MPs** from LRS API
- ✅ Sync **bills** via Playwright scraping
- ✅ Generate **MP stats** (voting attendance, party loyalty, etc.)
- ✅ Create **activities** (votes, comments, documents, sessions, achievements)

## Step-by-Step Seeding (For Incremental Updates)

If you need to seed data incrementally or update specific data types:

### 1. Seed MPs (Members of Parliament)
```bash
npm run sync:mps
```
- Fetches current MPs from LRS Open Data API
- Includes party, faction, district, contact info, photos
- Updates existing records or creates new ones

### 2. Sync Bills (Legislative Proposals)
```bash
npm run sync:bills
```
- Scrapes bills from e-seimas.lrs.lt using Playwright
- Extracts bill titles, status, categories, submission dates
- Falls back to sample data if scraping fails

### 3. Sync Votes (Voting Records)
```bash
npm run sync:votes
```
- Fetches voting data from LRS Open Data API
- Includes session votes and individual MP votes
- Processes latest 10 sittings (newest first)
- Updates `sessionVotes` and `sessionMpVotes` tables

### 4. Sync Committees
```bash
npm run sync:committees
```
- Fetches committee data from LRS API
- Includes committee members and their roles
- Links committees to MPs

## Complete Seeding Sequence

For a complete fresh seed with all data types:

```bash
# 1. Ensure database schema is up to date
npm run db:push

# 2. Seed MPs (required first, as other data references MPs)
npm run sync:mps

# 3. Seed bills
npm run sync:bills

# 4. Seed votes (requires MPs to be seeded first)
npm run sync:votes

# 5. Seed committees
npm run sync:committees

# 6. Generate MP stats (optional, but recommended)
# This is included in seed:real, but can be run separately if needed
```

## What Each Data Type Contains

### MPs (Members of Parliament)
- Name, party, faction
- District information
- Contact details (email, phone)
- Photo URLs
- Biography information
- Active status

### Bills
- Seimas ID (unique identifier)
- Title and description
- Status (Registruotas, Svarstomas, Priimtas, etc.)
- Category
- Submission date

### Votes
- Session votes (aggregate results)
- Individual MP votes (how each MP voted)
- Vote dates and times
- Question text
- Vote counts (for, against, abstained)

### Committees
- Committee names and IDs
- Committee members
- Member roles (chair, member, etc.)

### MP Stats (Generated)
- Voting attendance percentage
- Party loyalty score
- Bills proposed count
- Bills passed count
- Accountability score (calculated)

### Activities (Generated)
- Vote activities
- Comment activities
- Document activities
- Session participation
- Achievement badges

## Production Deployment

For Railway/production deployments, the seeding is handled automatically via `railway.json`:

```json
{
  "deploy": {
    "startCommand": "npm run db:push && npm run seed:real && node dist/index.js"
  }
}
```

This ensures:
1. Database schema is pushed
2. Real data is seeded
3. Server starts

## Troubleshooting

### If `seed:real` fails:
- Check your `DATABASE_URL` environment variable
- Ensure you have internet access (for API calls)
- For bills scraping, Playwright needs Chromium (installed via postinstall)

### If sync scripts fail:
- Check API availability: https://apps.lrs.lt/sip/
- Verify network connectivity
- Check logs for specific error messages

### For offline development:
Use the minimal seed for testing:
```bash
npm run seed:db
```
This creates 3 mock bills without API calls.

## Data Sources

- **MPs**: https://apps.lrs.lt/sip/p2b.ad_seimo_nariai
- **Votes**: https://apps.lrs.lt/sip/p2b.ad_sp_balsavimo_rezultatai
- **Committees**: https://apps.lrs.lt/sip/p2b.ad_seimo_komitetai
- **Bills**: https://e-seimas.lrs.lt/portal/legalActProjectSearch/lt (scraped)

## Notes

- All sync scripts use `onConflictDoUpdate` to handle duplicates
- Data is fetched for the current term (2024-2028)
- Some data (like MP stats and activities) is generated with realistic random values
- Votes sync processes the latest 10 sittings to avoid overwhelming the API
