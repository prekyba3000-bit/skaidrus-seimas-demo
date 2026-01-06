# Skaidrus Seimas – Project Roadmap

> **Mission**: Build the most transparent, accessible, and insightful platform for tracking Lithuanian Parliament (Seimas) activity.

---

## 🔧 Phase 1: Polish & Fix (Short-term)

### 1.1 Fix Broken MP Photos

- [x] Investigate why `photoUrl` images fail to load
- [ ] Consider proxying images through backend or caching locally
- [ ] Add fallback avatar generation for missing photos

### 1.2 Connect "The Pulse" Chart to Real Data

- [x] Replace mock SVG chart with actual voting/activity data
- [x] Implement time-series data fetching from API
- [x] Add interactive tooltips and time range selection

### 1.3 Implement Global Search

- [ ] Wire up the search bar in `DashboardLayout`
- [ ] Add typeahead/autocomplete functionality
- [ ] Search across MPs, bills, and committees
- [ ] Add keyboard navigation (↑↓ Enter)

### 1.4 Resolve Git Branch Divergence

- [ ] Reconcile local `main` with `origin/main`
- [ ] Create proper branching strategy (main/develop/feature)
- [ ] Set up PR workflow

---

## 🚀 Phase 2: Core Features (Medium-term)

### 2.1 Voting Record Visualization

- [ ] Show how each MP voted on specific bills
- [ ] Filter by topic, party, date range
- [ ] Visual vote breakdown (for/against/abstain)
- [ ] Highlight "breaking with party" votes

### 2.2 Bill Tracking & Status

- [ ] Timeline view: proposal → committee → vote → law
- [ ] Bill detail pages with full history
- [ ] "Follow" functionality for bills
- [ ] Push/email notifications for followed bills

### 2.3 Committee Pages

- [ ] Build committee listing page
- [ ] Committee detail pages with membership
- [ ] Meeting activity and attendance
- [ ] Jurisdiction and active bills in committee

### 2.4 MP Comparison Tool

- [ ] Side-by-side comparison of 2-3 MPs
- [ ] Compare: attendance, voting alignment, bills proposed
- [ ] Party loyalty score comparison
- [ ] Visual charts for comparison data

---

## 🎯 Phase 3: Differentiation (Long-term)

### 3.1 AI-Powered Summaries

- [ ] Integrate LLM for bill text summarization
- [ ] Generate plain-language Lithuanian summaries
- [ ] Populate `aiSummary` field in database
- [ ] Add "Explain like I'm 5" toggle

### 3.2 Voting Coalitions Analysis

- [ ] Detect MPs/parties that vote together
- [ ] Identify cross-party voting patterns
- [ ] Visualize coalition networks (graph view)
- [ ] Historical coalition trends

### 3.3 Accountability Alerts

- [ ] Email/push notifications for:
  - Attendance drops below threshold
  - Missed key votes
  - Significant voting pattern shifts
- [ ] User preference settings
- [ ] Weekly summary emails

### 3.4 Public Engagement

- [ ] "Follow" MPs functionality
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

- [ ] Add skeleton loading states everywhere
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
| Phase 1 Complete   | Q1 2026 | 🟡 In Progress |
| Phase 2 Complete   | Q2 2026 | ⚪ Not Started |
| Phase 3 Complete   | Q4 2026 | ⚪ Not Started |
| v1.0 Public Launch | Q2 2026 | ⚪ Not Started |

---

_Last updated: January 6, 2026_
