# Samples

This folder contains sample CSV exports you can use to test Budgeteer’s import pipeline.

## Files

- `sample-transactions.csv`
  - Small, curated set of transactions for quick manual testing.
  - Good for verifying: dedupe, staging, apply/undo, and category/type parsing.

- `History_07-28-25.csv`
  - Larger “history export” style file.
  - Good for verifying: performance, streaming thresholds, and long-range month grouping.

## Expected columns

Budgeteer’s importer expects a header row and a date column.

Common columns:

- `date` — `YYYY-MM-DD`
- `description`
- `amount` — numeric (may be signed in some exports)

Optional columns (supported or used when present):

- `type` — `income | expense | savings`
- `category` — free text
- `balance` — used to strengthen dedupe in collision-prone exports

## Notes

- Imports are intended to be idempotent: importing the same file twice should not create duplicates.
- New transactions are typically staged first so they can be applied/undone safely.
