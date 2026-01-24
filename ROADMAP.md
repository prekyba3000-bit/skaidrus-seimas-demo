# Skaidrus Seimas – Project Roadmap

> **Mission**: Build the most transparent, accessible, and insightful platform for tracking Lithuanian Parliament (Seimas) activity.

---

## 🇪🇺 Phase 4: NGI Zero Grant Execution (Planned)

### Milestone 1 (€15k): Accessibility & Inclusivity

- [ ] (Grant Deliverable) Accessibility audit & ARIA labels (WCAG 2.1 AA) — from `REMAINING_DEBT.md` (Low Priority #10)
- [ ] (Grant Deliverable) Plain-language bill summaries & “Explain like I’m 5” toggle — Phase 3.1 AI-Powered Summaries
- [ ] (Grant Deliverable) Document component library for consistent a11y patterns — Design System
- [ ] (Grant Deliverable) PWA manifest & touch-friendly interactions — Technical Improvements (Mobile Experience)

### Milestone 2 (€15k): Security & Integrity

- [ ] (Grant Deliverable) User-specific activity read tracking — `REMAINING_DEBT.md` High Priority #1
- [ ] (Grant Deliverable) Threat model & security audit prep — new `security/threat-model.md`
- [ ] (Grant Deliverable) Test coverage expansion (unit/integration/E2E) — Testing & Quality
- [ ] (Grant Deliverable) Error boundaries & global error handling — Error Handling
- [ ] (Grant Deliverable) API hardening (pagination, rate limits, OpenAPI) — API Enhancements

### Milestone 3 (€10k): Infrastructure Commons

- [ ] (Grant Deliverable) Code splitting & dynamic imports to reduce >500 kB chunks — `REMAINING_DEBT.md` Medium Priority #2
- [ ] (Grant Deliverable) GIN indexes applied & documented — `REMAINING_DEBT.md` Medium Priority #5
- [ ] (Grant Deliverable) Service worker/offline support & caching docs — Technical Improvements (Performance)
- [ ] (Grant Deliverable) Reproducible Docker/CI docs — Technical Improvements (CI/CD, deployment)

### Milestone 4 (€10k): Public Engagement & Transparency

- [ ] (Grant Deliverable) Voting record visualization & filters — Phase 2.1 Voting Record Visualization
- [ ] (Grant Deliverable) Bill tracking + notifications (follow bills, push/email) — Phase 2.2 & 3.3
- [ ] (Grant Deliverable) Coalition insights & public engagement (comments/sentiment/share) — Phase 3.2 & 3.4

---

## 🔧 Phase 1: Polish & Fix (Short-term)

### 1.1 Fix Broken MP Photos ✅ COMPLETE

- [x] Investigate why `photoUrl` images fail to load
- [x] Consider proxying images through backend or caching locally
- [x] Add fallback avatar generation for missing photos

### 1.2 Connect "The Pulse" Chart to Real Data ✅ COMPLETE

- [x] Replace mock SVG chart with actual voting/activity data
- [x] Implement time-series data fetching from API
- [x] Add interactive tooltips and time range selection

### 1.3 Implement Global Search ✅ COMPLETE

- [x] Wire up the search bar in `DashboardLayout`
- [x] Add typeahead/autocomplete functionality
- [x] Search across MPs, bills, and committees
- [x] Add keyboard navigation (↑↓ Enter)

### 1.4 Resolve Git Branch Divergence ✅ COMPLETE

- [x] Reconcile local `main` with `origin/main`
- [x] Create proper branching strategy (main/develop/feature)
- [x] Set up PR workflow

---

## 🚀 Phase 2: Core Features (Medium-term)

### 2.1 Voting Record Visualization

- [x] Show how each MP voted on specific bills
- [x] Filter by topic, party, date range
- [x] Visual vote breakdown (for/against/abstain)
- [x] Highlight "breaking with party" votes

### 2.2 Bill Tracking & Status

- [x] Timeline view: proposal → committee → vote → result (BillDetail "Projekto eiga")
- [x] Bill detail pages with full history
- [x] "Follow" functionality for bills (watchlist; FollowBillButton on BillDetail)
- [ ] Push/email notifications for followed bills (future)

### 2.3 Committee Pages ✅ CORE COMPLETE

- [x] Build committee listing page (`/committees`)
- [x] Committee detail pages with membership (`/committees/:id`)
- [ ] Meeting activity and attendance (future)
- [ ] Jurisdiction and active bills in committee (future)

### 2.4 MP Comparison Tool ✅ CORE COMPLETE

- [x] Side-by-side comparison of 2 MPs (3rd MP deferred)
- [x] Compare: attendance, voting alignment, bills proposed
- [x] Party loyalty score comparison
- [x] Visual charts for comparison data (Seismograph + stat bars)
- [x] Discoverability: Sidebar "Palyginimas", MPs list "Palyginti" CTA, MP profile "Palyginti"

---

## 🎯 Phase 3: Differentiation (Long-term)

### 3.1 AI-Powered Summaries

- [x] Integrate LLM for bill text summarization (Gemini via `summarizeBill`, `generate-bill-summaries` script)
- [x] Generate plain-language Lithuanian summaries (`bill_summaries` table)
- [x] Populate `bill_summaries` (summary + bulletPoints) via script
- [x] Add "Explain like I'm 5" toggle ("Kaip 5‑mečiui" on BillDetail: summary-only vs full + bullets)
- [x] Wire BillDetail to `bills.summary` API; fallback when no summary

### 3.2 Voting Coalitions Analysis

- [x] Detect parties that vote together (party-level majority agreement)
- [x] Identify cross-party voting patterns (`coalitions.votingTogether` API)
- [x] Simple viz: coalition table (Koalicijos page, agreement % + shared bills)
- [ ] Graph view / historical trends (future)

### 3.3 Accountability Alerts

- [ ] Email/push notifications for:
  - Attendance drops below threshold
  - Missed key votes
  - Significant voting pattern shifts
- [ ] User preference settings
- [ ] Weekly summary emails

### 3.4 Public Engagement

- [x] "Follow" MPs functionality (FollowButton, watchlist, userFollows)
- [ ] Comment system on bills
- [ ] Aggregated public sentiment display
- [ ] Share to social media

---

## 🔨 Technical Improvements

### Testing & Quality

- [ ] Add unit tests (Vitest)
- [ ] Add integration tests for API
- [ ] Add E2E tests (Playwright)
- [ ] Set up CI/CD pipeline

### Error Handling

- [ ] Implement React error boundaries
- [ ] Add global error handling
- [ ] Improve API error messages
- [ ] Add Sentry or similar monitoring

### Performance

- [x] Add skeleton loading states everywhere (Settings, Bills; MP/Committee/Pulsas/Activity etc. already had)
- [ ] Implement data caching strategy
- [ ] Optimize bundle size
- [ ] Add service worker for offline support

### Mobile Experience

- [ ] Improve sidebar mobile navigation
- [ ] Add bottom navigation for mobile
- [ ] Touch-friendly interactions
- [ ] PWA manifest for "Add to Home Screen"

---

## 📊 Data & Backend

### Data Quality

- [ ] Regular sync with Seimas API
- [ ] Historical data import
- [ ] Data validation and cleaning
- [ ] Automated data freshness checks

### API Enhancements

- [ ] Add pagination to all list endpoints
- [ ] Implement filtering and sorting
- [ ] Add rate limiting
- [ ] API documentation (OpenAPI/Swagger)

---

## 🎨 Design System

- [x] Implement MP Tracker color palette
- [x] Create `DashboardLayout` component
- [ ] Document component library
- [ ] Add dark/light mode toggle
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## 📅 Milestones

| Milestone          | Target  | Status         |
| ------------------ | ------- | -------------- |
| Phase 1 Complete   | Q1 2026 | ✅ Complete    |
| Phase 2 Complete   | Q2 2026 | 🟡 In Progress (2.1–2.4 core done) |
| Phase 3 Complete   | Q4 2026 | ⚪ Not Started |
| v1.0 Public Launch | Q2 2026 | ⚪ Not Started |

---

_Last updated: January 23, 2026_
