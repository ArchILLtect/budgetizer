import { userScopedGetItem, userScopedSetItem } from "./userScopedStorage";

const WELCOME_MODAL_LAST_SHOWN_AT_KEY = "welcomeModalLastShownAtMs" as const;

export const WELCOME_MODAL_REMIND_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function getWelcomeModalLastShownAtMs(): number {
  try {
    const raw = userScopedGetItem(WELCOME_MODAL_LAST_SHOWN_AT_KEY);
    const n = raw != null ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function setWelcomeModalLastShownAtMs(ms: number): void {
  try {
    const v = Number.isFinite(ms) ? ms : 0;
    userScopedSetItem(WELCOME_MODAL_LAST_SHOWN_AT_KEY, String(v));
  } catch {
    // ignore
  }
}

export function getWelcomeModalNextReminderAtMs(): number {
  const last = getWelcomeModalLastShownAtMs();
  if (!last) return 0;
  return last + WELCOME_MODAL_REMIND_INTERVAL_MS;
}

export function isWelcomeModalReminderDue(nowMs: number = Date.now()): boolean {
  const next = getWelcomeModalNextReminderAtMs();
  return Boolean(next) && nowMs >= next;
}
