import { create } from "zustand";

type RouteLoadingState = {
  isRouteLoading: boolean;
  destination: string | null;
  startedAtMs: number | null;

  startRouteLoading: (destination?: string | null) => void;
  stopRouteLoading: () => void;
};

export const useRouteLoadingStore = create<RouteLoadingState>((set) => ({
  isRouteLoading: false,
  destination: null,
  startedAtMs: null,

  startRouteLoading: (destination) =>
    set((prev) => ({
      isRouteLoading: true,
      destination: typeof destination === "string" && destination.trim() ? destination : prev.destination,
      startedAtMs: prev.startedAtMs ?? Date.now(),
    })),

  stopRouteLoading: () => set({ isRouteLoading: false, destination: null, startedAtMs: null }),
}));
