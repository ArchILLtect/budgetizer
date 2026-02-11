# Platform Systems Overview (non-business)

This document explains the **non-business “platform plumbing”** used by this codebase (TaskMaster): routing/layout composition, auth lifecycle, caching/persistence, state/store patterns, and how data flows between UI and Amplify/AppSync.

It’s intended as a **copyable reference** for other apps built from the same base (e.g., migrating an older app into this TS + Amplify scaffold).

## Tech stack (platform)

- Build: Vite + TypeScript
- UI: React + Chakra UI
- Routing: React Router (SPA)
- State: Zustand (persisted + selector-based views)
- Backend client: AWS Amplify (Cognito Auth + AppSync GraphQL)

---

## App bootstrap flow

**Entry:** `src/main.tsx`

1. Imports `src/amplifyConfig.ts` (which calls `Amplify.configure(...)`).
2. Mounts React with:
   - `ChakraProvider`
   - `BrowserRouter`
   - `<App />`

Why this matters:
- The Amplify configuration is loaded **before** any code calls `aws-amplify/auth` or `aws-amplify/api`.
- Chakra provider is global; components assume Chakra context exists.

---

## Routing + layout composition

**Routes:** `src/App.tsx`

- The app defines **public routes** (e.g. `/`, `/about`, `/login`) and **protected routes**.
- Protected routes are grouped under `<RequireAuth signedIn loading />`.
- Several heavier pages are code-split with `React.lazy()`.

**Shell:** `src/layout/AppShell.tsx`

- Provides the stable chrome (TopBar + Sidebar + BottomBar).
- Defines the primary content region (`<Outlet />`) wrapped with:
  - a single `ErrorBoundary` (for route render failures)
  - a single `Suspense` fallback (for lazy route chunk loading)
- Mounts global UI singletons:
  - `Toaster`
  - `WelcomeModal` and `DemoTourModal`
  - `StorageDisclosureBanner`
  - a skip-to-content link for accessibility

The key idea:
- **Navigation chrome stays mounted** while the route chunk loads.
- Lazy-loaded routes are handled centrally so UX is consistent.

---

## Auth lifecycle and identity propagation

**Primary hook:** `src/hooks/useAuthUser.ts`

`useAuthUser()` is responsible for:

- Resolving the currently signed-in identity via `getCurrentUser()`.
- Tracking `loading` and `signedIn` for routing/guards.
- Listening for Amplify Hub auth events:
  - on `signIn` / `signedIn`: triggers a refresh and requests the Welcome modal (“login” reason)
  - on `signOut` / `signedOut`: clears the current scope and resets in-memory session state

### The “auth scope” key (critical for caching)

This app uses **user-scoped persistence** to avoid cross-account cache mixing on shared devices.

- Scope key: `taskmaster:authScope` (see `src/services/userScopedStorage.ts`)
- The scope value is derived from the current user identity:
  - `user.userId` or `user.username`

On auth changes, `useAuthUser.applyScope()`:

1. Writes the scope key via `setUserStorageScopeKey(authKey)`.
2. Rehydrates persisted stores against that scope:
   - task store
   - inbox store
   - updates store
   - user UI cache store
3. On sign-out only (`authKey === null`): resets in-memory state with `resetUserSessionState()`.

This is intentionally designed so:
- Refreshing the page does **not** wipe user-scoped persisted state.
- Switching users updates the scope before reading any persisted data.

### Protected-route gating

**Guard:** `src/routes/RequireAuth.tsx`

- While auth is resolving (`loading`): shows a spinner to avoid redirect flash.
- If not signed in:
  - redirects to `/login?redirect=...`
  - sanitizes redirect targets to prevent open redirects.

### E2E auth bypass

For Playwright smoke tests, `RequireAuth` supports an env escape hatch:

- `VITE_E2E_BYPASS_AUTH=1` (or `true`) allows rendering protected routes without Cognito.

This keeps tests deterministic without needing real auth during CI.

---

## Client-side caching & persistence

### User-scoped localStorage keys

**Service:** `src/services/userScopedStorage.ts`

The storage namespace looks like:

- `taskmaster:authScope` → current scope key
- `taskmaster:u:<scope>:<baseKey>` → all user-scoped values

For Zustand persist, a common pattern is:

- base key: `zustand:<storeName>`
- full key: `taskmaster:u:<scope>:zustand:<storeName>`

### Persisted stores

Persisted (user-scoped):

- Tasks/lists cache: `src/store/taskStore.ts`
  - TTL-based freshness check (`TASK_STORE_TTL_MS`)
  - defensive JSON parsing to avoid bricking startup on corrupt entries
  - legacy migration from unscoped keys **only** when a real auth scope exists
- Inbox UX state: `src/store/inboxStore.ts`
  - persisted: dismissed task ids
  - non-persisted: a “computed now” timestamp to avoid calling `Date.now()` during render
- Updates feed + read markers: `src/store/updatesStore.ts`
  - persisted: events + `lastReadAt` + `clearedBeforeAt`
  - event list is capped (`MAX_EVENTS`) to avoid unbounded growth
- User UI cache: `src/services/userUICacheStore.ts`
  - persisted: user display metadata + fetched timestamp

### Session reset vs persisted reset

There are two kinds of “clear”:

- **Session reset**: clears in-memory Zustand state so a signed-out UI doesn’t show private data.
- **Persisted cache clearing**: intentionally separate; you don’t always want to destroy persisted caches on sign-out.

This repo’s stance:
- Reset session state on sign-out.
- Keep per-user persisted caches intact unless explicitly cleared (Dev tools / Settings actions).

---

## Data access patterns (GraphQL, but UI stays insulated)

### API client wrapper

**GraphQL client:** `src/amplifyClient.ts`

- Uses `generateClient()` from `aws-amplify/api`.
- Exposes a very small typed wrapper so the rest of the app never needs to depend on Amplify’s full surface area.

### API surface

**API module:** `src/api/taskmasterApi.ts`

- This is the “boring” boundary the UI/store calls.
- It calls AppSync via `client.graphql({ query, variables })`.
- It uses minimal selection sets from `src/api/operationsMinimal.ts`.
- It includes defense-in-depth measures, e.g. `stripOwnerField()` to prevent clients from reassigning ownership in update payloads.

### GraphQL → UI mapping

**Mapper:** `src/api/mappers.ts`

- Centralizes mapping from AppSync “API shapes” to stable UI types.
- Keeps the rest of the UI independent of schema details and selection-set quirks.

---

## Bootstrapping (UserProfile + demo seeding)

**Hook:** `src/hooks/useBootstrapUserProfile.ts`

- Runs once per authenticated identity.
- Calls `bootstrapUser({ seedDemo })`.
- Decides demo seeding using:
  - URL param `?demo=0` or `?demo=1`
  - per-user scoped storage key `seedDemo`

If demo seeding happens:
- expires the task cache
- triggers a refresh so the UI reflects newly seeded records

Why this exists:
- The base app expects a `UserProfile` record to exist for each user.
- Demo accounts can be created and seeded automatically.

---

## Cross-component “signals” (lightweight event bus)

This repo uses a minimal pattern for cross-cutting UI triggers without deep prop drilling:

- dispatch a `CustomEvent` on `window`
- subscribe in the relevant singleton component/hook

Example: opening the Welcome modal from multiple locations.

This is intentionally lightweight (no global event library).

---

## Debug/dev affordances

- Dev-only routes (e.g. `/dev`) are only mounted when `import.meta.env.DEV`.
- There are explicit “clear caches” actions intended for testing account switching and cache hygiene.

---

## Porting this platform to another app (e.g., your finance app)

If you “frankenstein” business logic into this scaffold, the pieces you typically keep unchanged are:

- `src/amplifyConfig.ts` and the generated Amplify config JSON
- `useAuthUser` + `RequireAuth`
- user-scoped persistence (`userScopedStorage.ts`) and store rehydrate strategy
- the AppShell composition (ErrorBoundary + Suspense + Toaster singletons)

Things you usually want to rename/adapt:

- The localStorage prefix (`taskmaster:`) → change to your new app name to avoid collisions if both apps are used on the same browser/profile.
- Store names/keys (same reason).
- Any demo-mode specifics (demo auth, seeding) if the new app doesn’t need them.

Common gotcha:
- If you share the same Amplify backend between two frontends, both apps can read/write the same AppSync models unless you intentionally partition data.

---

## Pointers to deeper docs

This repo also contains more detailed design docs under `docs/` (architecture, data model, offline mode design, etc.). Use this file as the “starting point” overview.
