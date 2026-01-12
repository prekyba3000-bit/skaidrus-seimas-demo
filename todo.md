# Skaidrus Seimas – Project TODO

> **Last Updated:** January 9, 2026  
> **Mission:** Build the most transparent, accessible, and insightful platform for tracking Lithuanian Parliament (Seimas) activity.

---

## ✅ Completed Phases

### Phase 1: Database & Schema ✅

- [x] Define PostgreSQL schema with Drizzle ORM (16 tables)
- [x] MPs, Bills, Votes, Committees, Quiz tables
- [x] MP Assistants table (538 assistants)
- [x] Run database migrations

### Phase 2: Data Population ✅

- [x] Import 141 MPs from official Seimas data
- [x] Scrape and import 538 MP assistants from lrs.lt
- [x] Import OpenSanctions data for cross-referencing
- [x] Generate seed data scripts

### Phase 3: Core API Endpoints ✅

- [x] MPs API: list, byId, search, stats
- [x] Bills API: list (with filters), byId
- [x] Votes API: byMp, byBill
- [x] Quiz API: questions, mpAnswers, saveResult
- [x] Committees, Accountability Flags, User Follows APIs

### Phase 4: Automated Testing Infrastructure ✅

- [x] Setup Vitest with React testing library
- [x] Create unit tests for useDebounce hook
- [x] Setup Playwright for E2E testing
- [x] Add test scripts to package.json

### Phase 5: Data Pipeline Improvements ✅

- [x] Automate Seimas data sync (sync-mps.ts)
- [x] Add real voting data import (scrape-votes-api.ts)
- [x] Import real bills data (sync-bills.ts)
- [x] Calculate real accountability scores
- [x] Sync committee membership data

### Phase 6: UI Overhaul ✅

- [x] Implement "Baltic Design System" / Transparency Portal theme
- [x] Glassmorphism styling with neon accents
- [x] Dashboard with real MP statistics
- [x] "The Pulse" activity chart connected to real data

---

## 🚧 Current Phase: User Engagement & Real-Time Features

### 1.1 Activity Feed Implementation 🔲

- [ ] Create `ActivityFeed` container component
- [ ] Implement `FeedItem` with activity type variants
  - [ ] Vote activity (bill name, vote choice)
  - [ ] Comment activity (preview with expand)
  - [ ] Document activity (icon, title, download)
  - [ ] Session activity (attendance, duration)
  - [ ] Achievement activity (milestone badges)
- [ ] Build `StatusBadge` micro component
- [ ] Apply Tailwind glassmorphism styles
- [ ] Integrate Framer Motion animations
  - [ ] Staggered list animation (100ms delay)
  - [ ] New item highlight animation (cyan glow)
  - [ ] Scroll-triggered animations
- [ ] Connect to tRPC `activities` endpoint
- [ ] Implement real-time polling (5s default)
- [ ] Add infinite scroll pagination
- [ ] Accessibility: ARIA live regions, keyboard nav

### 1.2 Global Search 🔲

- [ ] Wire up search bar in `DashboardLayout`
- [ ] Add typeahead/autocomplete functionality
- [ ] Search across MPs, Bills, Committees
- [ ] Add keyboard navigation (↑↓ Enter, Esc)
- [ ] Show search results in categorized dropdown
- [ ] Add recent searches storage (localStorage)

### 1.3 Fix Broken MP Photos 🔲

- [ ] Investigate why `photoUrl` images fail to load
- [ ] Proxy images through backend or cache locally
- [ ] Add fallback avatar generation for missing photos

---

## 📊 Phase 2: Voting Record Visualization & Bill Tracking

### 2.1 Voting Record Visualization 🔲

- [ ] Build interactive vote history component
- [ ] Show for/against/abstain breakdown per MP
- [ ] Highlight "breaking with party" votes
- [ ] Add filters: topic, party, date range
- [ ] Create voting pattern heat map
- [ ] Implement D3.js/Recharts visualizations

### 2.2 Bill Tracking & Lifecycle 🔲

- [ ] Create bill timeline view component
  - [ ] Proposal stage
  - [ ] Committee review stage
  - [ ] Vote stage
  - [ ] Law enactment stage
- [ ] Enhance bill detail pages with full history
- [ ] Display bill sponsors with MP profile links
- [ ] Add "Follow this bill" toggle
- [ ] Show related amendments and versions

### 2.3 Enhanced Bill Detail Page 🔲

- [ ] Redesign `/bills/:id` page layout
- [ ] Add voting results section with visual breakdown
- [ ] Show committee review history
- [ ] Display sponsor information cards
- [ ] Add related bills section

---

## 🏛️ Phase 3: Committee System & MP Comparison Tool

### 3.1 Committee Pages 🔲

- [ ] Build `/committees` listing page
  - [ ] Committee cards with member count
  - [ ] Filter by jurisdiction area
  - [ ] Search by committee name
- [ ] Create `/committees/:id` detail page
  - [ ] Membership roster with roles (chair, vice-chair)
  - [ ] Meeting activity calendar
  - [ ] Attendance records
  - [ ] Active bills under review
  - [ ] Jurisdiction description

### 3.2 MP Comparison Tool 🔲

- [ ] Build `/compare` page
- [ ] Side-by-side comparison of 2-3 MPs
- [ ] Compare metrics:
  - [ ] Attendance percentage
  - [ ] Voting alignment score
  - [ ] Bills proposed count
  - [ ] Party loyalty score
  - [ ] Accountability score
- [ ] Interactive comparison charts (bar, radar)
- [ ] Exportable comparison report (PDF/share link)
- [ ] Quick-compare feature from MP cards

---

## 🤖 Phase 4: AI-Powered Insights & Accountability Alerts

### 4.1 AI Bill Summarization 🔲

- [ ] Integrate Google Gemini API
- [ ] Generate plain-language Lithuanian summaries
- [ ] Target A2-B1 reading level
- [ ] Implement "Explain like I'm 5" toggle
- [ ] Batch summarization during off-peak hours
- [ ] Store summaries in `billSummaries` table
- [ ] Add bullet-point key takeaways

### 4.2 Voting Coalitions Analysis 🔲

- [ ] Detect MPs/parties that vote together
- [ ] Identify cross-party voting patterns
- [ ] Create force-directed coalition network graph
- [ ] Show historical coalition trends
- [ ] Highlight surprising alliances

### 4.3 Accountability Alerts System 🔲

- [ ] Build notification preferences settings page
- [ ] Create email notification worker
- [ ] Implement alert triggers:
  - [ ] Attendance drops below threshold
  - [ ] Missed key votes
  - [ ] Significant voting pattern shifts
  - [ ] Bills user follows updated
- [ ] Design weekly summary email template
- [ ] Set up email scheduler (SendGrid/Postmark)

---

## 🚀 Phase 5: Production Hardening & Public Launch

### 5.1 Expand Test Coverage 🔲

- [ ] Unit tests for all hooks and utilities
- [ ] Integration tests for new API routes
- [ ] E2E tests for critical user flows:
  - [ ] MP profile viewing
  - [ ] Bill tracking flow
  - [ ] Search functionality
  - [ ] Comparison tool
- [ ] Achieve 80%+ coverage on critical paths
- [ ] Add visual regression tests

### 5.2 Performance Optimization 🔲

- [ ] Implement skeleton loading states everywhere
- [ ] Add data caching strategy (stale-while-revalidate)
- [ ] Bundle size optimization
- [ ] Code splitting by route
- [ ] Image optimization and lazy loading
- [ ] Target Lighthouse score ≥90

### 5.3 Mobile Experience 🔲

- [ ] Improve sidebar mobile navigation
- [ ] Add bottom navigation for mobile
- [ ] Touch-friendly interactions
- [ ] PWA manifest for "Add to Home Screen"
- [ ] Service worker for offline support
- [ ] Test on iOS and Android devices

### 5.4 Accessibility Audit 🔲

- [ ] Keyboard navigation complete audit
- [ ] Screen reader optimization
- [ ] WCAG 2.1 AA color contrast verification
- [ ] Add `prefers-reduced-motion` support
- [ ] Visible focus indicators
- [ ] Form error handling accessibility

### 5.5 Launch Preparation 🔲

- [ ] Complete API documentation (OpenAPI/Swagger)
- [ ] Create user onboarding flow
- [ ] Design marketing landing page
- [ ] Security penetration testing
- [ ] GDPR compliance review
- [ ] Production deployment playbook
- [ ] Monitoring and alerting setup
- [ ] Database backup verification

---

## 📅 Timeline & Milestones

| Milestone                            | Target      | Status         |
| ------------------------------------ | ----------- | -------------- |
| User Engagement & Real-Time Features | Q1 2026     | 🟡 In Progress |
| Voting Visualization & Bill Tracking | Q1-Q2 2026  | ⚪ Not Started |
| Committee System & MP Comparison     | Q2 2026     | ⚪ Not Started |
| AI-Powered Insights & Alerts         | Q2-Q3 2026  | ⚪ Not Started |
| Production Hardening                 | Q3 2026     | ⚪ Not Started |
| **v1.0 Public Launch**               | **Q3 2026** | ⚪ Not Started |

---

## 📂 Scripts Reference

| Script                                       | Description                    |
| -------------------------------------------- | ------------------------------ |
| `scripts/sync-mps.ts`                        | Sync MPs from Seimas API       |
| `scripts/sync-bills.ts`                      | Sync bills from Seimas API     |
| `scripts/sync-committees.ts`                 | Sync committee membership      |
| `scripts/scrape-votes-api.ts`                | Scrape voting data from Seimas |
| `scripts/calculate-accountability-scores.ts` | Calculate MP scores            |
| `scripts/monitor-data-freshness.ts`          | Check data freshness           |
| `scripts/generate-bill-summaries.ts`         | AI bill summarization          |
| `scripts/generate-quiz-questions.ts`         | AI quiz generation             |

---

## 🔧 Technical Debt

- [ ] Resolve Git branch divergence (main vs origin/main)
- [ ] Create proper branching strategy (main/develop/feature)
- [ ] Set up PR workflow with code review
- [ ] Implement React error boundaries
- [ ] Add global error handling
- [ ] Document component library
- [ ] Add dark/light mode toggle to settings

---

## 📊 Current State Summary

| Component            | Status         | Details                      |
| -------------------- | -------------- | ---------------------------- |
| Database Schema      | ✅ Complete    | 16 tables defined            |
| MPs Data             | ✅ Complete    | 141 MPs imported             |
| Assistants Data      | ✅ Complete    | 538 assistants               |
| Core API             | ✅ Complete    | MPs, Bills, Votes, Quiz      |
| Extended API         | ✅ Complete    | Committees, Flags, Follows   |
| Data Pipelines       | ✅ Complete    | Scraping, validation         |
| AI Features          | ✅ Complete    | Summarization, quiz gen      |
| Testing              | ✅ Complete    | Vitest, Playwright setup     |
| Production Infra     | ✅ Complete    | Redis, rate limiting, Docker |
| UI Overhaul          | ✅ Complete    | Baltic Design System         |
| Activity Feed        | 🟡 In Progress | FEED_PLAN.md approved        |
| Global Search        | 🔲 Not Started | —                            |
| Voting Visualization | 🔲 Not Started | —                            |
| Committee Pages      | 🔲 Not Started | —                            |
| MP Comparison        | 🔲 Not Started | —                            |

---

_Made with ❤️ for transparency in democracy_
