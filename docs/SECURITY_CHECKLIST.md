# Budgeteer — Security Checklist

Last updated: 2026-02-18

This checklist is meant to keep Budgeteer aligned with its stated goals:

- privacy-aware by design
- deterministic, debuggable import workflows
- boring, reliable auth

It is written for a frontend-first app that consumes a shared Amplify backend.

---

## 1) Identity and access control (Cognito/AppSync)

- Verify AppSync auth rules enforce owner-based access for user data.
- Confirm the `owner` field cannot be changed via client updates (defense-in-depth exists in the API wrapper).
- Confirm the correct Cognito User Pool and AppSync endpoints are configured for the target environment.

References:
- `docs/legacy/AMPLIFY_BACKEND_OVERVIEW.md`

---

## 2) Redirect and callback safety

- Ensure login redirect targets are sanitized (avoid open redirects).
- Ensure Cognito callback and sign-out URLs include:
  - local dev origin(s)
  - the Netlify production origin

---

## 3) Client-side storage

Budgeteer uses localStorage for persisted state.

- Keep storage keys user-scoped to prevent cross-user cache mixing on shared devices.
- Avoid persisting secrets.
- Be mindful of what is persisted:
  - never persist raw CSV file contents
  - minimize identifiers that could be sensitive

Storage key policy:
- Keep keys namespaced under `budgeteer:*` and user-scoped keys under `budgeteer:u:<scope>:`.

Reference:
- `docs/legacy/PLATFORM_SYSTEMS_OVERVIEW.md`

---

## 4) CSV import privacy

- Never persist the raw uploaded CSV.
- Ensure ingestion stores only derived transaction fields.
- Prefer privacy-aware account identification (planned fingerprinting model) before enabling cloud sync.

Reference:
- `docs/ingestion-architecture.md`

---

## 5) Logging and telemetry

- Avoid logging raw transaction descriptions, account numbers, or CSV rows in production.
- If adding telemetry:
  - aggregate counts only
  - document what is collected
  - ensure it cannot reconstruct sensitive user data

---

## 6) Dependency hygiene

- Keep dependencies updated.
- Run `npm audit` periodically.
- Avoid adding heavy or unmaintained packages.

---

## 7) Output sanitization (HTML/SVG)

React escapes strings by default. The main risk is any usage of `dangerouslySetInnerHTML`.

- Avoid `dangerouslySetInnerHTML` unless you must render markup.
- If you must render SVG/HTML from a string (especially user-controlled sources):
  - sanitize with DOMPurify
  - prefer the shared component `src/components/ui/SanitizedSvg.tsx` for SVG strings
  - keep length/size guardrails to reduce worst-case performance

---

## 8) Build and deploy

- Ensure `VITE_*` env vars do not include secrets.
- Verify the deployed bundle does not include accidental credential material.
- Ensure SPA redirects are configured correctly (so users don’t land on error pages that leak route info).

---

## 9) Admin operations (shared backend)

Because the backend may be shared:

- Treat schema changes as sensitive and coordinated.
- If adding a Budgeteer-specific model set, ensure you don’t accidentally expose other-app data or vice versa.

Reference:
- `docs/legacy/AMPLIFY_BACKEND_OVERVIEW.md`
