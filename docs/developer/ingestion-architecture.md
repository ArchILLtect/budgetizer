# Ingestion Architecture (Current)

Last Updated: 2026-02-07

This document describes the *current* CSV ingestion/import pipeline as implemented in `src/ingest/` and used by the Accounts flows.

For the historical refactor checklist and phase log, see `../legacy/ingestion-refactor-plan.md`.

---

## 1) What Ingestion Does

Ingestion turns a CSV (or parsed rows) into:

- a deterministic set of **accepted transactions** (new, non-duplicate)
- a **patch function** that merges those transactions into the Zustand store atomically
- structured **stats + telemetry** (timings, dupes, inference sources)
- structured **errors** (parse/normalize/duplicate)
- a **savingsQueue** for savings-type transactions (deferred until “Apply to Budget”)

The ingestion orchestrator is designed to be **pure** (no store access) and **idempotent** (re-importing the same data yields 0 new transactions).

---

## 2) Primary Entry Points

### UI entry points

- Import Transactions (single account): `src/components/ImportTransactionsModal.jsx`
- Sync Accounts (multi-account CSV): `src/components/SyncAccountsModal.jsx`

Both flows do:

1. parse or stream-parse CSV rows
2. call the pure orchestrator (`runIngestion`)
3. show a dry-run preview (counts/telemetry/errors)
4. on confirm/apply: apply the returned patch to the store
5. record import history and defer savings review entries

### Core orchestrator

- `src/ingest/runIngestion.js` (pure)

Inputs:

- `fileText` (CSV string) OR `parsedRows` (already-parsed rows)
- `accountNumber`
- `existingTxns`

Outputs:

- `patch(state) => partialState`
- `acceptedTxns` (preview-friendly)
- `savingsQueue`
- `stats` (counts + timings)
- `errors`

---

## 3) Pipeline Stages

Pipeline stages (high level):

1. **Parse**
   - Non-streaming path: `src/ingest/parseCsv.js`
   - Streaming path: `src/ingest/parseCsvStreaming.js` (progress + abort)

2. **Normalize**
   - `src/ingest/normalizeRow.js`
   - Enforces date shape (`YYYY-MM-DD`) and amount parsing (signed/raw amount preserved)

3. **Early Dedupe Short-Circuit**
   - Build strong key early and skip classification/inference for duplicates
   - Saves time on re-imports and duplicate-heavy files

4. **Classify**
   - `src/ingest/classifyTx.js`
   - Classifies into `income | expense | savings`

5. **Category Inference (2-pass)**
   - Per-transaction immediate inference: keyword/regex/provided
   - Vendor-root consensus pass for unlabeled transactions
   - `src/ingest/inferCategory.js` + `src/ingest/categoryRules.js`

6. **Key Build (Strong Key)**
   - `src/ingest/buildTxKey.js`
   - Format:
     - `accountNumber|YYYY-MM-DD|signedAmount|normalized description[|bal:balance]`

7. **Patch Build**
   - `src/ingest/buildPatch.js`
   - Produces a function suitable for `useBudgetStore.setState(patch)`

---

## 4) Core Invariants (Correctness)

### Dates

- Daily: `YYYY-MM-DD`
- Monthly keys: `YYYY-MM`

### Amounts

- Persist the signed original as `rawAmount`.
- Store absolute value as `amount` (for display/aggregation).

### Idempotency & Dedupe

- The strong key is the *single* dedupe primitive.
- Re-importing an identical file should yield `stats.newCount = 0`.

---

## 5) Staging / Undo / Apply-To-Budget

On apply, newly accepted transactions are written as:

- `staged: true`
- `budgetApplied: false`
- `importSessionId: <uuid>`

Import history and undo behavior live in the store:

- Audit log: `importHistory`
- Undo (time-window guarded): `undoStagedImport(accountNumber, sessionId)`
- Apply-to-budget: `markTransactionsBudgetApplied(accountNumber, months)`

Savings behavior:

- Savings-type transactions are collected into `savingsQueue`.
- The queue is **deferred** until budget apply (so users don’t have to review savings before committing the import).

---

## 6) Testing & Benchmarking

Unit tests focus on deterministic correctness (fast and pure):

- `src/ingest/__tests__/normalizeRow.test.js`
- `src/ingest/__tests__/buildTxKey.test.js`
- `src/ingest/__tests__/categoryInference.test.js`
- `src/utils/__tests__/strongKeyUtils.test.js`

Benchmark tooling:

- `src/dev/IngestionBenchmark.jsx` (dev-only panel) captures baseline snapshots and measures throughput/dupe ratios.

---

## 7) Cloud Sync Integration (Planned)

When adding Amplify-native cloud sync (see `./migration-plan.md`):

- Keep `runIngestion` pure.
- Treat the strong key as the canonical idempotency primitive.
- On import apply:
  - Apply patch locally for fast UX.
  - Enqueue outbox operations to create ImportSession + Transactions in the backend.
  - Use a TTL sync lock (mutex) to avoid two devices syncing bulk imports simultaneously.
