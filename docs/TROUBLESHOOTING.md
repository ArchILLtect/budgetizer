# Budgeteer — Troubleshooting

Last updated: 2026-02-10

This doc covers common issues when developing or deploying Budgeteer.

---

## Dev server issues

### Port 5173 (or 5174) already in use

Symptoms:
- `npm run dev` picks a different port or exits.

Fix:
- Stop the process using the port, or let Vite choose an alternate port.

---

## Build / lint / test

### `npm run lint` fails on migration-era types

Context:
- The repo contains migration-era `any` usage that is intentionally deferred.

Fix:
- Prefer fixing *real* issues (hooks rules, unused vars, etc.) immediately.
- Keep `any` cleanup tracked as a milestone item (see `docs/ROADMAP.md`).

---

### `npm run build` warns about large chunks

Symptoms:
- Vite outputs a warning about chunks > 500kB.

Fix:
- Prefer dynamic imports for heavy pages/modals.
- Consider manual chunking only if needed.

---

## Amplify / Auth / GraphQL

### `amplify status` fails

Common reasons:
- Amplify CLI not installed
- AWS credentials not configured
- The current machine is not set up for backend workflows

Notes:
- Budgeteer is primarily a frontend consumer of the backend; you often do not need Amplify CLI for normal frontend development.

References:
- `docs/legacy/AMPLIFY_BACKEND_OVERVIEW.md`

---

### Auth redirect / callback problems

Symptoms:
- Login works locally but fails in production.

Fix:
- Ensure Cognito callback URLs and sign-out URLs include the deployed Netlify origin.

---

## Import / ingestion

### Import produces unexpected duplicates

Checklist:
- Confirm the strong transaction key inputs are stable:
  - date format
  - signed amount (`rawAmount`)
  - normalized description
  - optional balance inclusion

References:
- `docs/ingestion-architecture.md`
- `docs/DATA_MODEL.md`

---

### Savings review queue doesn’t appear

Notes:
- Savings queue review is designed to be deferred until “Apply to Budget”.

References:
- `docs/developer/category-rules-and-savings-queue.md`

---

## Local storage

### UI behaves strangely after schema changes

Symptoms:
- Missing fields, inconsistent state, or crashes after pulling changes.

Fix:
- Clear site storage for the app origin (last resort).
- Prefer adding migrations for persisted store shape changes.

---

## Netlify deployment

### Deep links 404 (e.g. `/planner`)

Cause:
- SPA redirect rule missing.

Fix:
- Add a Netlify redirect to serve `index.html` for all routes.

Reference:
- `docs/DEPLOYMENT_CHECKLIST.md`
