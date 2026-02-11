import { userScopedGetItem, userScopedRemoveItem, userScopedSetItem } from "./userScopedStorage";

export const WELCOME_MODAL_PREF_KEY = "welcomeModalSeenVersion" as const;
export const WELCOME_MODAL_PREF_EVENT = "budgeteer:welcomeModalPrefChanged" as const;
export const WELCOME_MODAL_OPEN_EVENT = "budgeteer:welcomeModalOpenRequested" as const;

export type WelcomeModalOpenReason = "manual" | "login" | "reminder";

function emitChange(): void {
  try {
    window.dispatchEvent(new Event(WELCOME_MODAL_PREF_EVENT));
  } catch {
    // ignore
  }
}

export function getWelcomeModalSeenVersion(): number {
  try {
    const raw = userScopedGetItem(WELCOME_MODAL_PREF_KEY);
    const n = raw != null ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function setWelcomeModalSeenVersion(version: number): void {
  try {
    userScopedSetItem(WELCOME_MODAL_PREF_KEY, String(version));
  } finally {
    emitChange();
  }
}

export function clearWelcomeModalSeenVersion(): void {
  try {
    userScopedRemoveItem(WELCOME_MODAL_PREF_KEY);
  } finally {
    emitChange();
  }
}

export function onWelcomeModalPrefChange(cb: () => void): () => void {
  const handler = () => cb();
  try {
    window.addEventListener(WELCOME_MODAL_PREF_EVENT, handler);
  } catch {
    // ignore
  }

  return () => {
    try {
      window.removeEventListener(WELCOME_MODAL_PREF_EVENT, handler);
    } catch {
      // ignore
    }
  };
}

export function requestOpenWelcomeModal(reason: WelcomeModalOpenReason = "manual"): void {
  try {
    window.dispatchEvent(new CustomEvent(WELCOME_MODAL_OPEN_EVENT, { detail: { reason } }));
  } catch {
    // ignore
  }
}

export function onWelcomeModalOpenRequest(cb: (reason: WelcomeModalOpenReason) => void): () => void {
  const handler = (e: Event) => {
    const ce = e as CustomEvent<{ reason?: unknown }>;
    const raw = ce?.detail?.reason;
    const reason: WelcomeModalOpenReason = raw === "login" || raw === "reminder" ? raw : "manual";
    cb(reason);
  };
  try {
    window.addEventListener(WELCOME_MODAL_OPEN_EVENT, handler);
  } catch {
    // ignore
  }

  return () => {
    try {
      window.removeEventListener(WELCOME_MODAL_OPEN_EVENT, handler);
    } catch {
      // ignore
    }
  };
}
