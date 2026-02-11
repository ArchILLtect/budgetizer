
# Budgeteer — Roadmap

Last updated: 2026-02-10

This roadmap sequences work to "tighten the main app" first (UX correctness, naming/route cleanup, store boundaries, reliability), while intentionally deferring deeper CSV ingestion enhancements until the core product surface is coherent.

---

## Guiding principles

- Prefer boring, correct, explainable flows.
- Keep planning-first: Planner should feel complete even without imports.
- Avoid risky migrations until UX and domain model are stable.
- Keep naming, routes, and storage keys consistent.

---

## Phase 0 — Baseline stability (done)

Outcomes:

- Production build is clean.
- Architecture doc exists and reflects current system.

Status:

- `npm run build` passes.
- `docs/ARCHITECTURE.md` drafted.

---

## Phase 1 — Product surface coherence (tighten main app)

Goal: make the app read like Budgeteer end-to-end.

Deliverables:

- Routing and navigation consistency:
	- ensure links match actual routes
	- ensure sidebar links match actual routes
- Copy cleanup:
	- align page titles and empty states to budgeting concepts
- Storage key consistency:
	- keep localStorage keys under the `budgeteer:*` namespace
- Make auth flows feel intentional:
	- login redirect targets should land on Budgeteer home/planner
	- demo-mode entry copy should match Budgeteer intent

Acceptance criteria:

- Fresh user can click through Planner/Tracker/Accounts/Imports/Settings without seeing misaligned terminology.
- Sidebar links are correct and stable.
- Signing out and signing in as another user does not show prior user’s persisted state.

---

## Phase 2 — Domain boundaries and type hardening

Goal: reduce risk by making budgeting logic easier to change.

Deliverables:

- Break up the monolithic budget store:
	- define smaller slices (planner, accounts, importSessions, settings)
	- keep persistence controlled and explicit
- Replace high-risk `any` usages with types at ingestion boundaries:
	- CSV normalized row
	- transaction model
	- import session model
- Add small, high-value tests around:
	- strong key/dedupe
	- staging/apply/undo transitions
	- key computations used by Tracker summaries

Acceptance criteria:

- Core workflows compile with fewer implicit `any`s.
- A small test suite exists for business-critical functions.

---

## Phase 3 — UX polish on Planner and Tracker

Goal: make the two main surfaces feel complete.

Deliverables:

- Planner:
	- validation and constraints (no negative hours, reasonable ranges)
	- clearer outputs (net income breakdown, savings allocations)
- Tracker:
	- consistent planned vs actual presentation
	- clarify what “applied” means (import sessions)
	- handle empty states gracefully

Acceptance criteria:

- Planner can be used standalone.
- Tracker communicates how numbers were derived.

---

## Phase 4 — CSV ingestion enhancements (intentionally later)

Goal: improve ingestion correctness and user confidence.

Deliverables:

- Better review tooling for staged imports:
	- preview staged transactions per session
	- show dedupe reasons (same key, same hash)
- Category inference improvements and category rules UX (if/when desired)
- Performance work:
	- tune streaming thresholds
	- chunked processing for heavy normalization
- Optional import formats (additional bank CSV schemas)

Acceptance criteria:

- Users can explain what happened after an import.
- Large imports are reliable and responsive.

---

## Phase 5 — Backend alignment (optional, after model stabilizes)

Goal: decide what must persist server-side vs local-first.

Deliverables:

- Clarify data ownership model (local-only vs AppSync persisted):
	- UserProfile stays backend
	- Decide if scenarios/plans should sync
	- Decide if transaction history should sync (privacy tradeoffs)
- If syncing is added, implement minimal sync with clear boundaries.

Acceptance criteria:

- The app’s data model is intentional and documented.
- Sync (if any) doesn’t compromise privacy goals.

---

## Ongoing hygiene

- Keep builds green and remove dead code.
- Keep docs updated when refactors land.
- Avoid introducing new naming drift.

