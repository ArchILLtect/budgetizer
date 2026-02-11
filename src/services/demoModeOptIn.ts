import {
  userScopedGetItem,
  userScopedRemoveItem,
  userScopedSetItem,
} from "./userScopedStorage";

export const DEMO_MODE_OPT_IN_KEY = "demoModeOptIn" as const;
export const DEMO_MODE_OPT_IN_EVENT = "budgeteer:demoModeOptInChanged" as const;

function emitChange(): void {
  try {
    window.dispatchEvent(new Event(DEMO_MODE_OPT_IN_EVENT));
  } catch {
    // ignore
  }
}

export function isDemoModeOptedIn(): boolean {
  try {
    return userScopedGetItem(DEMO_MODE_OPT_IN_KEY) === "1";
  } catch {
    return false;
  }
}

export function setDemoModeOptIn(enabled: boolean): void {
  try {
    userScopedSetItem(DEMO_MODE_OPT_IN_KEY, enabled ? "1" : "0");
  } finally {
    emitChange();
  }
}

export function clearDemoModeOptIn(): void {
  try {
    userScopedRemoveItem(DEMO_MODE_OPT_IN_KEY);
  } finally {
    emitChange();
  }
}

export function onDemoModeOptInChange(cb: () => void): () => void {
  const handler = () => cb();

  try {
    window.addEventListener(DEMO_MODE_OPT_IN_EVENT, handler);
  } catch {
    // ignore
  }

  return () => {
    try {
      window.removeEventListener(DEMO_MODE_OPT_IN_EVENT, handler);
    } catch {
      // ignore
    }
  };
}
