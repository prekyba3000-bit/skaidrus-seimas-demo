# Skaidrus Seimas API - Backend TODO

## Phase 1: Database & Schema ✅

- [x] Define PostgreSQL schema with Drizzle ORM (16 tables)
- [x] MPs table with Seimas ID, party, faction, district, contact info
- [x] MP Statistics table (voting attendance, party loyalty, accountability score)
- [x] Bills table with status, category, timestamps
- [x] Bill Summaries table for AI-generated summaries
- [x] Bill Sponsors junction table
- [x] Votes table linking MPs to Bills
- [x] Quiz system tables (questions, answers, user results)
- [x] Committees and Committee Members tables
- [x] Accountability Flags table
- [x] User Follows table for subscriptions
- [x] MP Assistants table (538 assistants)
- [x] MP Trips table
- [x] Run database migrations

## Phase 2: Data Population ✅

- [x] Import 141 MPs from official Seimas data
- [x] Scrape and import 538 MP assistants from lrs.lt
- [x] Create sample bills and votes for testing
- [x] Import OpenSanctions data for cross-referencing
- [x] Generate seed data scripts

## Phase 3: Core API Endpoints ✅

- [x] MPs API: list, byId, search, stats
- [x] Bills API: list (with filters), byId
- [x] Votes API: byMp, byBill
- [x] Quiz API: questions, mpAnswers, saveResult, results
- [x] Auth API: me, logout
- [x] Health check endpoint

## Phase 4: Missing API Endpoints ✅

- [x] Committees API: list, byId, members
- [x] Accountability Flags API: byMp, create, resolve
- [x] User Follows API: follow, unfollow, list
- [x] Bill Sponsors API: byBill, byMp
- [x] Bill Summaries API: byBill, generate (AI)
- [x] MP Trips API: byMp, list
- [x] Statistics API: aggregated stats, trends

## Phase 5: Data Pipeline Improvements 🔲

- [x] Automate Seimas data sync (scripts/sync-mps.ts)
- [x] Add real voting data import from lrs.lt (scripts/scrape-votes.ts)
- [x] Import real bills data from Seimas API (scripts/sync-bills.ts)
- [ ] Calculate real accountability scores
- [ ] Sync committee membership data
- [ ] Add data validation and error handling
- [ ] Create data freshness monitoring

## Phase 6: AI Integration 🔲

- [ ] Implement bill summarization with LLM
- [ ] Generate bullet points for bills
- [ ] Create voting pattern analysis
- [ ] Add MP comparison features
- [ ] Implement quiz question generation

## Phase 7: Testing & Quality 🔲

- [ ] Add unit tests for database functions
- [ ] Add integration tests for API endpoints
- [ ] Add data validation tests
- [ ] Set up CI/CD pipeline
- [ ] Add API documentation (OpenAPI/Swagger)

## Phase 8: Production Readiness 🔲

- [ ] Add rate limiting
- [ ] Implement caching (Redis)
- [ ] Add request logging and monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Create deployment scripts
- [ ] Add database backup strategy
- [ ] Performance optimization

---

## Current State Summary

| Component       | Status      | Details                              |
| --------------- | ----------- | ------------------------------------ |
| Database Schema | ✅ Complete | 16 tables defined                    |
| MPs Data        | ✅ Complete | 141 MPs imported                     |
| Assistants Data | ✅ Complete | 538 assistants                       |
| Core API        | ✅ Complete | MPs, Bills, Votes, Quiz              |
| Extended API    | ✅ Complete | Committees, Flags, Follows, Sponsors |
| Data Pipelines  | 🔶 Partial  | Scraping works, needs automation     |
| AI Features     | 🔲 Pending  | Not implemented                      |
| Testing         | 🔲 Minimal  | 1 test file exists                   |
| Documentation   | 🔲 Pending  | No README or API docs                |

---

## Data Files Available

- `mps_data.sql` - 141 MPs insert statements
- `mp_assistants_data.sql` - 538 assistants insert statements
- `mp_trips_data.sql` - MP travel data
- `assistants_2026.json` - Raw scraped assistant data
- `seimas_mps_opensanctions.json` - OpenSanctions cross-reference data

## Scripts Available

- `scrape-assistants.ts` - Scrape assistants from lrs.lt
- `import-assistants-pg.ts` - Import assistants to PostgreSQL
- `import-opensanctions-pg.ts` - Import OpenSanctions data
- `sync-seimas-data.ts` - Sync data from Seimas
- `seed-sample-data.ts` - Generate sample data
- `scripts/reset-database.ts` - Reset database
