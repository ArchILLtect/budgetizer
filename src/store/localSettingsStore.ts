import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createUserScopedZustandStorage, getUserStorageScopeKey } from "../services/userScopedStorage";

export const LOCAL_SETTINGS_STORE_VERSION = 1 as const;

export type SidebarWidthPreset = "small" | "medium" | "large";

export type DefaultViewRoute = "/today" | "/week" | "/month";

export type DefaultLandingRoute =
  | "/today"
  | "/inbox"
  | "/tasks"
  | "/lists"
  | "/favorites"
  | "/updates"
  | "/week"
  | "/month";

export type LocalSettingsState = {
  dueSoonWindowDays: number;
  sidebarWidthPreset: SidebarWidthPreset;
  defaultViewRoute: DefaultViewRoute;
  defaultLandingRoute: DefaultLandingRoute;

  setDueSoonWindowDays: (days: number) => void;
  setSidebarWidthPreset: (preset: SidebarWidthPreset) => void;
  setDefaultViewRoute: (route: DefaultViewRoute) => void;
  setDefaultLandingRoute: (route: DefaultLandingRoute) => void;
};

function normalizeDueSoonDays(days: number): number {
  return Math.max(1, Math.min(30, Math.floor(days || 0) || 3));
}

function normalizeSidebarWidthPreset(value: unknown): SidebarWidthPreset {
  return value === "small" || value === "medium" || value === "large" ? value : "small";
}

function normalizeDefaultViewRoute(value: unknown): DefaultViewRoute {
  return value === "/today" || value === "/week" || value === "/month" ? value : "/today";
}

function normalizeDefaultLandingRoute(value: unknown): DefaultLandingRoute {
  return value === "/today" ||
    value === "/inbox" ||
    value === "/tasks" ||
    value === "/lists" ||
    value === "/favorites" ||
    value === "/updates" ||
    value === "/week" ||
    value === "/month"
    ? value
    : "/today";
}

function readLegacyDueSoonDays(): number | null {
  // Best-effort migration: older builds stored this on the inbox store.
  // We avoid changing any backend settingsVersion (GraphQL persistence comes later).
  try {
    // Don't read/migrate legacy global caches unless we have an explicit auth scope.
    if (!getUserStorageScopeKey()) return null;
    const raw = localStorage.getItem("taskmaster:inbox");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const envelope = parsed as { state?: unknown };
    const state = envelope.state as { dueSoonWindowDays?: unknown } | undefined;
    const n = state?.dueSoonWindowDays;
    const migrated = typeof n === "number" && Number.isFinite(n) ? normalizeDueSoonDays(n) : null;

    // Legacy inbox store also contained triage/dismiss state; clear it once we've migrated what we need.
    try {
      localStorage.removeItem("taskmaster:inbox");
    } catch {
      // ignore
    }

    return migrated;
  } catch {
    return null;
  }
}

const DEFAULT_DUE_SOON_DAYS = readLegacyDueSoonDays() ?? 3;
const DEFAULT_SIDEBAR_WIDTH_PRESET: SidebarWidthPreset = "small";
const DEFAULT_DEFAULT_VIEW_ROUTE: DefaultViewRoute = "/today";
const DEFAULT_DEFAULT_LANDING_ROUTE: DefaultLandingRoute = "/today";

export const useLocalSettingsStore = create<LocalSettingsState>()(
  persist(
    (set) => ({
      dueSoonWindowDays: DEFAULT_DUE_SOON_DAYS,
      sidebarWidthPreset: DEFAULT_SIDEBAR_WIDTH_PRESET,
      defaultViewRoute: DEFAULT_DEFAULT_VIEW_ROUTE,
      defaultLandingRoute: DEFAULT_DEFAULT_LANDING_ROUTE,

      setDueSoonWindowDays: (days) => {
        set({ dueSoonWindowDays: normalizeDueSoonDays(days) });
      },

      setSidebarWidthPreset: (preset) => {
        set({ sidebarWidthPreset: normalizeSidebarWidthPreset(preset) });
      },

      setDefaultViewRoute: (route) => {
        set({ defaultViewRoute: normalizeDefaultViewRoute(route) });
      },

      setDefaultLandingRoute: (route) => {
        set({ defaultLandingRoute: normalizeDefaultLandingRoute(route) });
      },
    }),
    {
      name: "taskmaster:localSettings",
      version: LOCAL_SETTINGS_STORE_VERSION,
      migrate: (persistedState) => {
        const s = persistedState as Partial<LocalSettingsState> | undefined;
        return {
          dueSoonWindowDays: normalizeDueSoonDays(s?.dueSoonWindowDays ?? DEFAULT_DUE_SOON_DAYS),
          sidebarWidthPreset: normalizeSidebarWidthPreset(s?.sidebarWidthPreset ?? DEFAULT_SIDEBAR_WIDTH_PRESET),
          defaultViewRoute: normalizeDefaultViewRoute(s?.defaultViewRoute ?? DEFAULT_DEFAULT_VIEW_ROUTE),
          defaultLandingRoute: normalizeDefaultLandingRoute(s?.defaultLandingRoute ?? DEFAULT_DEFAULT_LANDING_ROUTE),
        } satisfies Pick<
          LocalSettingsState,
          "dueSoonWindowDays" | "sidebarWidthPreset" | "defaultViewRoute" | "defaultLandingRoute"
        >;
      },
      storage: createUserScopedZustandStorage(),
      partialize: (s) => ({
        dueSoonWindowDays: s.dueSoonWindowDays,
        sidebarWidthPreset: s.sidebarWidthPreset,
        defaultViewRoute: s.defaultViewRoute,
        defaultLandingRoute: s.defaultLandingRoute,
      }),
    }
  )
);

// IMPORTANT: keep selectors primitive/function-returning.
// Returning new object literals here can trigger infinite render loops under React strict/dev.
export function useDueSoonWindowDays(): number {
  return useLocalSettingsStore((s) => s.dueSoonWindowDays);
}

export function useSetDueSoonWindowDays(): LocalSettingsState["setDueSoonWindowDays"] {
  return useLocalSettingsStore((s) => s.setDueSoonWindowDays);
}

export function useSidebarWidthPreset(): SidebarWidthPreset {
  return useLocalSettingsStore((s) => s.sidebarWidthPreset);
}

export function useSetSidebarWidthPreset(): LocalSettingsState["setSidebarWidthPreset"] {
  return useLocalSettingsStore((s) => s.setSidebarWidthPreset);
}

export function useDefaultViewRoute(): DefaultViewRoute {
  return useLocalSettingsStore((s) => s.defaultViewRoute);
}

export function useSetDefaultViewRoute(): LocalSettingsState["setDefaultViewRoute"] {
  return useLocalSettingsStore((s) => s.setDefaultViewRoute);
}

export function useDefaultLandingRoute(): DefaultLandingRoute {
  return useLocalSettingsStore((s) => s.defaultLandingRoute);
}

export function useSetDefaultLandingRoute(): LocalSettingsState["setDefaultLandingRoute"] {
  return useLocalSettingsStore((s) => s.setDefaultLandingRoute);
}
