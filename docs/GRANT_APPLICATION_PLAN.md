# NGI Zero Commons Fund – Grant Application Plan (€50,000)

This plan maps existing TODOs and roadmap items into four fundable milestones that align with NGI Zero requirements: Openness, Accessibility (WCAG), Security, Interoperability, and Public Good. All deliverables are already represented as TODOs in the codebase or technical debt lists, ensuring verifiable completion.

---

## Milestone 1 (€15k): Accessibility & Inclusivity

Focus: WCAG 2.1 AA, inclusive content, plain-language access.

Deliverables (existing TODOs):

- [ ] (Grant Deliverable) Accessibility audit and ARIA labels — `REMAINING_DEBT.md` (Low Priority #10).
- [ ] (Grant Deliverable) Plain-language summaries for bills — `ROADMAP.md` Phase 3.1 “Generate plain-language Lithuanian summaries”.
- [ ] (Grant Deliverable) Add “Explain like I’m 5” toggle — `ROADMAP.md` Phase 3.1.
- [ ] (Grant Deliverable) Document component library for consistent a11y patterns — `ROADMAP.md` Design System.
- [ ] (Grant Deliverable) PWA manifest & touch-friendly interactions — `ROADMAP.md` Technical Improvements (Mobile Experience).

Acceptance evidence:

- WCAG audit report (automated + manual) with issue tracker links.
- Updated UI components with ARIA and documented patterns.
- Plain-language summary toggle shipped and demoed on bill pages.

---

## Milestone 2 (€15k): Security & Integrity

Focus: Data integrity, user-specific controls, test coverage, threat modeling.

Deliverables (existing TODOs):

- [ ] (Grant Deliverable) User-specific activity read tracking — `REMAINING_DEBT.md` High Priority #1.
- [ ] (Grant Deliverable) Security audit prep & threat model — new `security/threat-model.md` scaffold.
- [ ] (Grant Deliverable) Expand automated tests (unit/integration/E2E) — `ROADMAP.md` Testing & Quality; `REMAINING_DEBT.md` Low Priority #7.
- [ ] (Grant Deliverable) Error handling & React error boundaries — `ROADMAP.md` Error Handling.
- [ ] (Grant Deliverable) API hardening (pagination, rate limiting docs) — `ROADMAP.md` API Enhancements.

Acceptance evidence:

- Threat model document, RLS/RBAC checklist, and passing test suite with coverage summary.
- Demonstrable user-specific “read” state in activity feed.
- CI pipeline showing passing tests and lint/security checks.

---

## Milestone 3 (€10k): Infrastructure Commons

Focus: Performance, interoperability, reproducibility.

Deliverables (existing TODOs):

- [ ] (Grant Deliverable) Code splitting & dynamic imports for heavy bundles — `REMAINING_DEBT.md` Medium Priority #2 (bundles >500 kB).
- [ ] (Grant Deliverable) Apply/search GIN indexes & document DB tuning — `REMAINING_DEBT.md` Medium Priority #5.
- [ ] (Grant Deliverable) Service worker/offline support & caching strategy docs — `ROADMAP.md` Technical Improvements (Performance).
- [ ] (Grant Deliverable) Docker/DevOps docs for reproducible commons deployments — `ROADMAP.md` Technical Improvements (CI/CD pipeline, service worker).

Acceptance evidence:

- Build report showing chunk sizes below warning thresholds.
- SQL migration/verification logs for GIN indexes.
- Updated `DEPLOY.md`/Docker instructions enabling reproducible deployments.

---

## Milestone 4 (€10k): Public Engagement & Transparency

Focus: Civic UX, participatory features, notifications.

Deliverables (existing TODOs):

- [ ] (Grant Deliverable) Voting record visualization & filters — `ROADMAP.md` Phase 2.1.
- [ ] (Grant Deliverable) Bill tracking/notifications (follow bills, push/email) — `ROADMAP.md` Phase 2.2 & 3.3.
- [ ] (Grant Deliverable) Accountability/public engagement features (comment/sentiment, share) — `ROADMAP.md` Phase 3.4.
- [ ] (Grant Deliverable) Coalition/party alignment insights — `ROADMAP.md` Phase 3.2.

Acceptance evidence:

- Deployed UI with voting visualizations, filters, and bill follow/notify flow.
- Notification settings wired to backend (email/push ready).
- Public sharing/engagement widgets live with analytics events.

---

## Compliance & Commons Alignment

- **Openness:** MIT-licensed code, reproducible Docker setup, published migrations and test scripts.
- **Accessibility:** WCAG 2.1 AA target, ARIA audit planned via `scripts/accessibility-audit.ts`.
- **Security:** RLS enforced, threat model planned in `security/threat-model.md`, ISO/IEC 27001-aligned practices.
- **Interoperability:** Open APIs (tRPC/OpenAPI), PostgreSQL/Redis standards, portable Docker deployment.
- **Public Good:** Reusable transparency framework for any parliament/assembly; no proprietary SaaS lock-in.
