import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createUserScopedZustandStorage } from "../services/userScopedStorage";

export type PerfEventKind = "route" | "milestone" | "auth" | "api" | "import" | "apply";

export type PerfEvent = {
  id: string;
  occurredAt: string; // ISO
  kind: PerfEventKind;
  name?: string;
  route?: string;
  from?: string;
  to?: string;
  destination?: string;
  durationMs?: number;
  sinceRouteStartMs?: number;
  ok?: boolean;
  message?: string;
  data?: Record<string, unknown>;
};

type PerfLogState = {
  events: PerfEvent[];
  addEvent: (event: PerfEvent) => void;
  clear: () => void;
};

const MAX_EVENTS = 500;

export const usePerfLogStore = create<PerfLogState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (event) =>
        set((state) => {
          const next = [...state.events, event];
          const trimmed = next.length > MAX_EVENTS ? next.slice(next.length - MAX_EVENTS) : next;
          return { events: trimmed };
        }),
      clear: () => set({ events: [] }),
    }),
    {
      name: "budgeteer:perfLog",
      storage: createUserScopedZustandStorage(),
      partialize: (state) => ({ events: state.events }),
      version: 1,
    }
  )
);
