import { userScopedGetItem, userScopedSetItem } from "./userScopedStorage";

export const DEMO_TOUR_SEEN_KEY = "demoTourSeen:v1" as const;

export function isDemoTourDisabled(): boolean {
  return userScopedGetItem(DEMO_TOUR_SEEN_KEY) === "1";
}

export function setDemoTourDisabled(disabled: boolean): void {
  userScopedSetItem(DEMO_TOUR_SEEN_KEY, disabled ? "1" : "0");
}

export function resetDemoTourDisabled(): void {
  userScopedSetItem(DEMO_TOUR_SEEN_KEY, "0");
}
