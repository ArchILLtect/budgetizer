import { getCurrentUser } from "aws-amplify/auth";

import { budgeteerApi } from "../api/budgeteerApi";
import { bootstrapUser } from "./userBootstrapService";
import { useUpdatesStore } from "../store/updatesStore";

function errorToMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Unknown error";
}


export async function resetDemoData(): Promise<void> {
  // Requires auth; keep this helper strict so callers can surface a clear message.
  await getCurrentUser();

  // Clear UX-only local state first to avoid stale UI while the reset runs.
  useUpdatesStore.getState().resetAll?.();

  // Clear persisted UX state for the current user scope.
  try {
    await Promise.all([
      useUpdatesStore.persist.clearStorage(),
    ]);
  } catch {
    // ignore
  }

  // 4) Reset seed gate so demo seed can run again.
  // NOTE: We rely on bootstrapUser() to claim + seed safely (multi-tab safe).
  const current = await getCurrentUser();
  const profileId = current.userId;
  try {
    await budgeteerApi.updateUserProfile({ id: profileId, seedVersion: 0, seededAt: null });
  } catch (err) {
    throw new Error(`Failed to reset seed version: ${errorToMessage(err)}`);
  }

  // 5) Re-seed demo dataset
  await bootstrapUser({ seedDemo: true });

  // 6) Clear updates again so seed events don't flood the feed
  useUpdatesStore.getState().resetAll?.();
  try {
    await useUpdatesStore.persist.clearStorage();
  } catch {
    // ignore
  }
}
