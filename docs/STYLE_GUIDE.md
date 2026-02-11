# Budgeteer — Style Guide

Last updated: 2026-02-10

This is a pragmatic style guide for keeping Budgeteer consistent while it continues migrating from mixed origins (platform scaffold + legacy budgeting logic).

---

## 1) Goals

- Keep the UI consistent and readable.
- Keep business logic out of presentational components.
- Keep ingestion deterministic and testable.
- Keep changes easy to review.

---

## 2) TypeScript

- Prefer explicit domain types at boundaries:
  - ingestion row normalization
  - transaction shapes
  - import session summaries
- Avoid widening types unnecessarily.
- If you need a temporary escape hatch during migration:
  - isolate it to a boundary module
  - prefer `unknown` + narrowing over `any`

---

## 3) React conventions

- Keep components idempotent: avoid doing work in render that can cause instability.
  - Example: do not call `Date.now()` in render for UI countdowns; use state/effects.
- Prefer hooks that do one thing.
- Keep route-level pages thin; push logic into store actions/services.

---

## 4) Chakra UI

- Prefer Chakra primitives (`Box`, `Stack`, `Text`, etc.) over custom CSS.
- Use consistent spacing via Chakra props.
- Avoid inventing new visual systems; keep styles boring and coherent.

---

## 5) State management

Primary domain store:
- `src/store/budgetStore.ts`

Conventions:
- Store actions should:
  - update state immutably
  - avoid hidden side-effects
  - centralize business rules (so UI stays declarative)

Persistence:
- Be intentional about what is persisted.
- User-scoped persistence is required to avoid cross-user cache mixing (see legacy platform docs).

---

## 6) API boundaries

- UI code should not call `client.graphql(...)` directly.
- Add backend calls via `src/api/budgeteerApi.ts`.
- Prefer minimal selection sets.

---

## 7) Ingestion rules

- Keep the ingestion orchestrator pure.
- Keep the strong key canonical and deterministic.
- Add tests when changing:
  - normalization
  - keying
  - category inference

See:
- `docs/ingestion-architecture.md`
- `docs/developer/category-rules-and-savings-queue.md`

---

## 8) Tests

- Prefer fast, deterministic unit tests.
- Add tests alongside ingestion and key utilities.
- Avoid brittle DOM-heavy tests unless necessary.

---

## 9) Documentation

If you change behavior in any of these areas, update the docs:

- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/ingestion-architecture.md`
- `docs/developer/README.md`
