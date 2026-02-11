# Budgeteer — Milestones

Last updated: 2026-02-10

This file turns the roadmap phases into concrete milestones.

Source:
- `docs/ROADMAP.md`

---

## Milestone 0 — Baseline stability (Done)

Status: Done

Acceptance (from roadmap):
- Production build is clean
- Architecture doc exists and reflects current system

---

## Milestone 1 — Product surface coherence (Tighten main app)

Status: Planned / In progress

Goal:
- Make the app read like Budgeteer end-to-end.

Scope:
- Copy cleanup (titles, empty states)
- Storage key consistency (`budgeteer:*` namespace)
- Auth redirects land on Budgeteer routes (planner/home)

Acceptance:
- Users can click through Planner/Tracker/Accounts/Imports/Settings without seeing misaligned terminology
- Sidebar links match routes
- Switching users does not leak persisted state

---

## Milestone 2 — Domain boundaries and type hardening

Status: Planned

Goal:
- Reduce risk by making budgeting logic easier to change.

Scope:
- Split monolithic store into slices (planner/accounts/import/settings)
- Add types at ingestion and transaction boundaries
- Add high-value tests for staging/apply/undo transitions

Acceptance:
- Fewer implicit/widened types in critical paths
- Tests cover strong key and import lifecycle

---

## Milestone 3 — Planner/Tracker UX polish

Status: Planned

Goal:
- Planner and Tracker feel complete for real use.

Scope:
- Validation and constraints
- Clear planned vs actual presentation
- Better empty states and explanations

Acceptance:
- Planner can be used standalone
- Tracker explains numbers and sources

---

## Milestone 4 — CSV ingestion enhancements

Status: Planned (intentionally later)

Goal:
- Improve ingestion correctness, transparency, and performance.

Scope:
- Better staged import review tooling
- Category inference UX improvements
- Performance tuning (streaming thresholds, chunking)

Acceptance:
- Users can explain what happened after an import
- Large imports are reliable

---

## Milestone 5 — Backend alignment (Optional)

Status: Deferred / TBD

Goal:
- Decide what should sync server-side without compromising privacy.

Notes:
- This milestone is intentionally gated by privacy constraints and data model decisions.

Acceptance:
- Data ownership model is explicit and documented
- Any sync does not compromise privacy goals
