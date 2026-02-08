# Cloud Sync Migration Plan (Amplify-native)

Status: Draft
Last Updated: 2026-02-07

This document proposes a phased strategy to add multi-device cloud sync to the existing React/Vite + Zustand budget app, using an AWS/Amplify-native stack (Cognito + AppSync/DynamoDB or Amplify Data). The plan is optimized for:

- "One device at a time" usage (soft presence + hard sync lock).
- Idempotent re-imports (strong transaction key).
- Incremental rollout (keep current app usable while migrating).

Non-goals (initially):

- Full CRDT/offline-collaboration.
- Perfect real-time co-editing.
- Double-entry ledger accounting (we’ll add manual repair tools instead).

---

## 1) Core Approach

We will implement **entity sync** (Approach B): store Accounts/Transactions/ImportSessions as backend entities and sync them to/from the client.

The client remains "offline-tolerant": it reads from local state/cache and can queue changes when offline, but the **cloud becomes the durable source of truth**.

Key principle: **Idempotency first**. All sync writes must be safe to retry.

---

## 2) Key Decisions (recommended defaults)

### 2.1 Amplify flavor

Pick one:

- **Amplify Gen 2 (recommended)**: model definitions in code; generates typed client APIs.
- Amplify Gen 1 GraphQL/AppSync: schema.graphql + codegen.

Either works. The rest of this plan assumes a GraphQL-like data model with auth rules.

### 2.2 Data ownership

- Single family "tenant" (or a single Cognito user) is simplest.
- If you want “Nick + Jr” as separate logins, use a shared `householdId` and enforce access via auth rules.

### 2.3 Conflict strategy

Because you expect mostly one device at a time:

- Default to **last-write-wins** at the field level for most edits.
- For high-risk operations (bulk import/apply/undo), enforce a **sync lock**.

---

## 3) Data Model (minimal viable schema)

### 3.1 Transaction identity (important)

We already have a strong transaction key:

`accountNumber|YYYY-MM-DD|signedAmount|normalized description[|bal:balance]`

We will store this as `strongKey` and make it part of the backend’s primary identity so re-import is naturally idempotent.

Recommended Dynamo-style keys:

- Partition key: `pk = householdId#<id>`
- Sort key: `sk = TX#<accountId>#<strongKey>`

or (if using Amplify model IDs):

- `Transaction.id = sha256(householdId + '|' + accountId + '|' + strongKey)`

This ensures “same transaction imported twice” becomes “same ID written twice”.

### 3.2 Proposed entities

**Account**

- `id`
- `householdId`
- `accountNumber` (optional if you prefer internal IDs)
- `label`, `institution`, `type`
- `createdAt`, `updatedAt`

**ImportSession** (audit + undo/apply tracking)

- `id` (UUID)
- `householdId`
- `accountId`
- `fileHash` (short hash)
- `importedAt`
- `newCount`, `dupesExisting`, `dupesIntraFile`, `savingsCount`
- `status`: `STAGED | APPLIED | UNDONE | EXPIRED` (or equivalent)
- `undoWindowMinutes` (optional)

**Transaction**

- `id` (derived / deterministic)
- `householdId`
- `accountId`
- `importSessionId`
- `date` (YYYY-MM-DD)
- `rawAmount` (signed)
- `amount` (absolute)
- `description`, `descriptionNormalized`
- `type`: `income | expense | savings`
- `category`
- `balance` (optional)
- `staged` (boolean) and/or `budgetAppliedAt`
- `editedFields` metadata (optional) to prevent import overwriting user edits

**Presence** (soft indicator)

- `householdId`
- `deviceId`
- `displayName`
- `lastSeenAt`
- `expiresAt` (TTL)

**SyncLock** (hard lock for sync only)

- `householdId` (primary key)
- `lockId` (constant, e.g. `SYNC`)
- `ownerDeviceId`
- `ownerDisplayName`
- `acquiredAt`
- `expiresAt` (TTL)

---

## 4) Sync Mechanics

### 4.1 Presence heartbeat

- Client generates a stable `deviceId` (localStorage).
- Every 20–30 seconds while app is open, update Presence with `expiresAt = now + 90s`.
- UI shows green if nobody else is active (no unexpired Presence records besides your own), red otherwise.

Presence is advisory only.

### 4.2 Sync lock (mutex)

Used only for bulk/unsafe operations:

- uploading an import session
- applying staged imports
- undoing a session

Implementation:

- Acquire lock via conditional write: "only if lock absent or expired".
- While syncing, extend TTL periodically.
- Release lock at end (best-effort), but TTL handles crashes.

### 4.3 Outbox pattern (recommended)

Instead of writing directly to the backend from every UI action:

- Write to local store immediately (fast UX).
- Append a sync operation into an `outbox` (local queue).
- Sync drains the outbox under the sync lock.

Operation examples:

- `UPSERT_ACCOUNT`
- `UPSERT_TRANSACTION`
- `MARK_IMPORT_APPLIED`
- `UNDO_IMPORT_SESSION`

This keeps offline-tolerance simple and makes retries safe.

---

## 5) Ingestion Integration (preserve current pipeline)

The existing ingestion pipeline already yields:

- accepted transactions (staged)
- importSessionId
- file hash
- patch function for local state

Migration strategy:

1) Keep the pipeline as-is for classification/dedupe.
2) Replace/augment the “apply patch” step with:
	- local apply (same as today)
	- enqueue outbox ops to create ImportSession + Transactions in the backend

Key rule: backend writes must be idempotent via deterministic transaction identity.

---

## 6) Phased Rollout Plan

### Phase A — Foundations

- Add Amplify backend + Cognito.
- Create models (Account, Transaction, ImportSession).
- Add device identity + presence heartbeat.

### Phase B — Read-only sync (safe)

- Implement "pull" to download Accounts/Transactions into local store.
- Add a manual "Sync now" button.

### Phase C — Write sync for imports

- Add outbox.
- Wrap Sync Accounts / Import Transactions with sync lock.
- On import apply: write ImportSession + Transactions to backend (idempotent).

### Phase D — Broaden to planner/tracker entities

- Add SavingsGoals/SavingsLogs and MonthlyActuals/Plans models.
- Migrate gradually (one domain at a time).

---

## 7) Manual Repair Tools (avoid double-entry)

To handle real-world edge cases without adopting full double-entry ledger modeling:

- Split transaction (one bank row -> multiple categories)
- Edit transaction fields (type/category/description)
- Merge/mark duplicate
- Transfer pairing helper (optional)

---

## 8) Success Criteria

- Same user can switch devices with no data loss.
- Re-importing the same CSV yields `newCount = 0` in the cloud as well as locally.
- Sync retries do not duplicate transactions.
- Presence and sync lock prevent common “two people syncing at once” mistakes.
