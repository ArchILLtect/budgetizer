# Amplify / AppSync Backend Overview (shared plumbing)

This document describes the shared AWS Amplify “plumbing” used by the app:

- Cognito Auth (Amplify Auth + Amplify UI Authenticator)
- AppSync GraphQL API (Amplify API)
- The GraphQL schema models and auth rules
- How the frontend is configured and how it talks to the backend

It’s intended to be a practical reference when you reuse the same Amplify backend across multiple frontends (e.g., TaskMaster + a personal finance app).

---

## Where the backend lives in this repo

Amplify-generated and backend definition files:

- `amplify/` (Amplify project + environment metadata)
- GraphQL schema:
  - `amplify/backend/api/taskmaster/schema.graphql`

Frontend Amplify configuration:

- `src/amplifyConfig.ts` calls `Amplify.configure(amplifyconfiguration.json)`
- `src/amplifyconfiguration.json` contains the environment-specific endpoints and identifiers

> Note: `amplify/` is treated as generated/infrastructure config. Avoid editing it manually unless you’re in an Amplify workflow.

---

## Auth: Cognito + Amplify UI

The app uses Amplify’s Auth category:

- `aws-amplify/auth` for programmatic auth operations
- `@aws-amplify/ui-react`’s `<Authenticator />` for hosted UI components

Auth lifecycle events are observed through Amplify Hub:

- `Hub.listen("auth", ...)` listens for events like `signedIn` and `signedOut`

The frontend uses these events to:

- update the user-scoped cache namespace (`taskmaster:authScope`)
- rehydrate stores for the correct user
- reset session state on sign-out

---

## API: AppSync GraphQL

The frontend uses Amplify’s GraphQL client:

- `src/amplifyClient.ts` wraps `generateClient()` from `aws-amplify/api`
- `src/api/taskmasterApi.ts` wraps all GraphQL calls so UI code doesn’t call `client.graphql` directly

A key codebase convention:

- UI pages/components should not import `src/api/**` directly.
- Stores/hooks call the API wrapper.
- Mapping from GraphQL shapes → UI types happens in `src/api/mappers.ts`.

---

## Schema summary (models + intent)

The schema is defined in `amplify/backend/api/taskmaster/schema.graphql`.

High-level models:

- `TaskList`: container for tasks
- `Task`: item, includes ordering and optional parent/child relationships
- `UserProfile`: a per-user record that stores plan tier, visibility defaults, and versioned blobs for settings/onboarding

### Auth rules (important)

All primary models use owner-based auth:

- Owner is stored in an explicit `owner: String!` field.
- The owner identity claim is the Cognito `sub` (`identityClaim: "sub"`).
- Admin group has full access.

The intent is:

- Normal users can only CRUD their own records.
- Admins can CRUD across users.
- Ownership should not be transferable by client mutation payloads.

Defense-in-depth note:

- The frontend API wrapper strips `owner` from update inputs (`stripOwnerField()` in `src/api/taskmasterApi.ts`).
- This is not a substitute for backend enforcement, but it prevents accidental misuse in UI code.

### Schema excerpt

Below is a shortened excerpt of the schema (refer to the schema file for the full source):

```graphql
type TaskList @model @auth(rules: [
  { allow: owner, ownerField: "owner", identityClaim: "sub", operations: [create, read, update, delete] },
  { allow: groups, groups: ["Admin"], operations: [create, read, update, delete] }
]) {
  id: ID! @primaryKey
  owner: String!
  name: String!
  description: String
  isDemo: Boolean!
  isFavorite: Boolean!
  sortOrder: Int!
  tasks: [Task] @hasMany(indexName: "byList", fields: ["id"])
}

type Task @model @auth(rules: [
  { allow: owner, ownerField: "owner", identityClaim: "sub", operations: [create, read, update, delete] },
  { allow: groups, groups: ["Admin"], operations: [create, read, update, delete] }
]) {
  id: ID! @primaryKey
  owner: String!

  listId: ID! @index(name: "byList", sortKeyFields: ["sortOrder"], queryField: "tasksByList")
  sortOrder: Int!

  parentTaskId: ID @index(name: "byParent", sortKeyFields: ["sortOrder"], queryField: "tasksByParent")

  title: String!
  description: String
  status: TaskStatus!
  priority: TaskPriority!
  dueAt: AWSDateTime
  completedAt: AWSDateTime

  tagIds: [String!]!
  isDemo: Boolean!

  list: TaskList @belongsTo(fields: ["listId"])
}

type UserProfile @model @auth(rules: [
  { allow: owner, ownerField: "owner", identityClaim: "sub", operations: [create, read, update, delete] },
  { allow: groups, groups: ["Admin"], operations: [create, read, update, delete] }
]) {
  id: ID! @primaryKey
  owner: String!

  planTier: PlanTier!
  defaultVisibility: DefaultVisibility!

  seedVersion: Int!
  seededAt: AWSDateTime

  onboardingVersion: Int!
  onboarding: AWSJSON
  onboardingUpdatedAt: AWSDateTime

  settingsVersion: Int!
  settings: AWSJSON
  settingsUpdatedAt: AWSDateTime

  email: AWSEmail!
  displayName: String
  timezone: String
  locale: String
}
```

---

## Sharing the same backend with another frontend

If your finance app shares the same backend:

- It needs the same Amplify environment configuration (`amplifyconfiguration.json` values).
- You must add the finance app’s deployed domain(s) to Cognito callback + sign-out URLs.
- Consider how data should be partitioned:
  - If both apps use the same models, they will naturally “see” each other’s records (subject to owner auth).
  - If you want strict separation, consider:
    - separate AppSync APIs, or
    - add an `appId`/`product` discriminator field to shared models and filter consistently, or
    - separate model namespaces for each app.

Also consider localStorage key collisions:
- If a user runs both apps on the same origin/browser profile, use different localStorage prefixes so caches don’t conflict.

---

## Codegen + typing notes

- `src/API.ts` is generated (Amplify codegen).
- This repo also uses “minimal selection set” operations (see `src/api/operationsMinimal.ts`).
- There is a verification script (`scripts/verify-codegen-graphql.mjs`) used to ensure generated artifacts are in sync.

---

## Practical troubleshooting checklist

When a new frontend is wired to this backend and auth/API calls fail, check:

- Is `Amplify.configure(...)` being called before any Amplify usage?
- Are callback/logout URLs correct for the new deployed origin?
- Are AppSync endpoint/region values correct in the new app’s config JSON?
- Are you signed into the expected Cognito user pool (stale sessions can be confusing across apps)?
