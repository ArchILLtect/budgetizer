import { clearUserUIInMemoryCache } from "../services/authService";

let resetInProgress = false;
let lastResetAtMs = 0;

export function resetUserSessionState(): void {
  // Idempotency guard: multiple sign-out paths (Hub event + manual cleanup, StrictMode, etc.)
  // can call this back-to-back.
  if (resetInProgress) return;
  const now = Date.now();
  if (now - lastResetAtMs < 250) return;
  resetInProgress = true;

  // Clear module-level authService caches so a user switch doesn't show stale metadata.
  clearUserUIInMemoryCache();

  lastResetAtMs = now;
  resetInProgress = false;
}

export async function clearCurrentUserPersistedCaches(): Promise<void> {
  // Clear storage for current scope (per-user) and then reset in-memory state.
  try {
    await Promise.all([
      // Add any additional per-user persisted stores here as needed.
    ]);
  } catch {
    // ignore
  } finally {
    resetUserSessionState();
  }
}
