export const DEMO_SESSION_STORAGE_KEY = "budgeteer:isDemoSession" as const;

export function setDemoSessionActive(): void {
  try {
    localStorage.setItem(DEMO_SESSION_STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

export function clearDemoSessionActive(): void {
  try {
    localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function isDemoSessionActive(): boolean {
  try {
    return localStorage.getItem(DEMO_SESSION_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
