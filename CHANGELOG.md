# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project aims to follow Semantic Versioning once releases begin.

## [Unreleased]

### Added
- App foundation: routing shell + protected routes, redirect sanitization, and auth lifecycle/session bootstrapping.
- Zustand slice architecture (`accounts`, `import`, `planner`, `settings`) with expanded unit test coverage for cross-slice invariants and import apply/undo flows.
- Import session features: session-scoped apply helpers, import history pruning/retention tests, and regression tests for overlapping import sessions.
- ImportPlan commit boundary: `analyzeImport(...) -> ImportPlan` (serializable) and store commit via `commitImportPlan(plan)`.
- UI components and screens: improved Accounts/Planner/Tracker pages, new/shared form components, Welcome modal logic tests, and import metrics panels.
- Expanded developer documentation, including ingestion architecture/contract docs and updated milestones.

### Changed
- Ingestion entrypoints now follow the explicit plan/commit boundary (no UI patch application).
- Income calculation state handling to avoid unstable snapshots and update-depth loops.
- Documentation updated repo-wide to reflect the current ingestion design (ImportPlan + commit boundary).

### Fixed
- Planner/Tracker crash caused by a render/update feedback loop (“Maximum update depth exceeded” / unstable snapshots) in `IncomeCalculator`.

### Removed
- Legacy `runIngestion` wrapper module and remaining patch-closure terminology in non-legacy docs.

## [0.0.0] - 2026-02-10

### Added
- Initial public repo baseline for Budgeteer (frontend app + documentation).

