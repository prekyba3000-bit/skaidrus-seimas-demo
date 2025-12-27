# Skaidrus Seimas - Full Application TODO

## Phase 1: Database & Backend Setup
- [x] Update database schema with all tables (MPs, Bills, Votes, Quiz, MpStatistics)
- [x] Run database migration (pnpm db:push)
- [x] Create database helper functions in server/db.ts
- [x] Implement tRPC routers for MPs, Bills, Votes, Quiz, Statistics
- [ ] Test API endpoints

## Phase 2: Data Population
- [x] Copy MP import script and data files from seimas.v.2
- [x] Create database seeding script
- [x] Import MPs (50 sample MPs generated)
- [x] Generate sample bills and votes for testing
- [x] Verify data integrity

## Phase 3: Frontend Development
- [ ] Design application navigation structure
- [ ] Build Home page with statistics dashboard
- [ ] Build MPs List page with search and filtering
- [ ] Build MP Profile page (integrate existing demo components)
- [ ] Build Bills List page
- [ ] Build Bill Detail page
- [ ] Build Political Quiz page
- [ ] Build Quiz Results page
- [ ] Build Interactive Map page

## Phase 4: Advanced Features
- [ ] Integrate AI bill summarization
- [ ] Add MP statistics calculations
- [ ] Implement accountability scoring
- [ ] Add voting pattern analysis
- [ ] Enable district map visualization

## Phase 5: Polish & Testing
- [ ] Apply Modern Baltic Gov-Tech design system
- [ ] Ensure all text is in Lithuanian
- [ ] Add loading states and error handling
- [ ] Mobile responsiveness testing
- [ ] End-to-end testing
- [ ] Create final checkpoint
