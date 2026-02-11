import { useUpdatesStore } from "./updatesStore";
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

  const updatesState = useUpdatesStore.getState() as unknown as { resetAll?: () => void; clearAll?: () => void };
  if (typeof updatesState.resetAll === "function") updatesState.resetAll();
  else updatesState.clearAll?.();

  // Clear module-level authService caches so a user switch doesn't show stale metadata.
  clearUserUIInMemoryCache();

  lastResetAtMs = now;
  resetInProgress = false;
}

export async function clearCurrentUserPersistedCaches(): Promise<void> {
  // Clear storage for current scope (per-user) and then reset in-memory state.
  try {
    await Promise.all([
      useUpdatesStore.persist.clearStorage(),
    ]);
  } catch {
    // ignore
  } finally {
    resetUserSessionState();
  }
}
