# Budgeteer — Risk Register

Last updated: 2026-02-10

This register tracks risks that could impact Budgeteer’s correctness, privacy posture, or ability to ship.

Source inputs:
- `docs/budgeteer_project_context_vision.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/ingestion-architecture.md`
- `docs/legacy/*` backend/platform overviews

Scales:
- Likelihood: Low / Medium / High
- Impact: Low / Medium / High

---

## R1 — Naming inconsistencies leak into Budgeteer UX

- Likelihood: High
- Impact: Medium
- Description: Routes, copy, and localStorage keys can drift and confuse users.
- Mitigation:
  - Execute Phase 1 roadmap cleanup
  - Add grep-based checks for misnamed strings and wrong key namespaces
- Owner: Nick

---

## R2 — Shared backend model confusion / unintended coupling

- Likelihood: Medium
- Impact: High
- Description: Budgeteer consumes a backend schema originally built for another app. Without explicit partitioning, evolution could cause schema drift or unintended data overlap.
- Mitigation:
  - Keep backend changes centralized and intentional
  - Consider an `appId` discriminator or separate model namespaces if Budgeteer expands backend usage
- Owner: Nick

---

## R3 — Privacy regression via account identifiers

- Likelihood: Medium
- Impact: High
- Description: Current store/integration patterns still rely on account numbers in some places. The ingestion architecture proposes fingerprinting to avoid persisting raw account numbers.
- Mitigation:
  - Gate any cloud sync behind privacy-aware account identification
  - Audit persisted state and remove raw identifiers where feasible
- Owner: Nick

---

## R4 — Import idempotency failures (duplicate or missing transactions)

- Likelihood: Medium
- Impact: High
- Description: Strong-key dedupe is foundational; bugs here could create duplicates or drop legitimate transactions.
- Mitigation:
  - Maintain strong key as the single canonical dedupe primitive
  - Extend unit tests for edge cases (balance inclusion, normalization variants)
  - Provide import preview + explicit duplicate stats
- Owner: Nick

---

## R5 — localStorage corruption bricks startup

- Likelihood: Medium
- Impact: Medium
- Description: Persisted stores can fail to parse or contain incompatible shapes after refactors.
- Mitigation:
  - Defensive parsing and migrations
  - Provide “clear caches” dev action
  - Keep persisted schema changes versioned
- Owner: Nick

---

## R6 — Large imports cause UI stalls

- Likelihood: Medium
- Impact: Medium
- Description: Ingestion can be heavy (parsing/normalization/inference).
- Mitigation:
  - Use streaming parse and chunked processing where possible
  - Benchmark before/after
- Owner: Nick

---

## R7 — Security issues via redirect misconfiguration

- Likelihood: Low
- Impact: High
- Description: Incorrect handling of redirect targets can cause open redirect vulnerabilities.
- Mitigation:
  - Keep redirect sanitization in route guards
  - Test login flows in production origin
- Owner: Nick

---

## R8 — Bundle size/perf regression

- Likelihood: Medium
- Impact: Medium
- Description: The build already warns about large chunks; future UI additions could degrade load performance.
- Mitigation:
  - Continue code-splitting heavy routes/modals
  - Periodically inspect bundle outputs
- Owner: Nick
