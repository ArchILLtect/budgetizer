import { userScopedGetItem, userScopedSetItem } from "./userScopedStorage";

export const SEED_DEMO_PREF_KEY = "seedDemo" as const;

export function isSeedDemoDisabled(): boolean {
  try {
    return userScopedGetItem(SEED_DEMO_PREF_KEY) === "0";
  } catch {
    return false;
  }
}

export function setSeedDemoDisabled(disabled: boolean): void {
  try {
    userScopedSetItem(SEED_DEMO_PREF_KEY, disabled ? "0" : "1");
  } catch {
    // ignore
  }
}
