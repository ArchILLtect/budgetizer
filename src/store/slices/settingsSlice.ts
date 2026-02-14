import type { StateCreator } from "zustand";

export type SettingsSlice = {
  currentPage: string;
  user: any;
  sessionExpired: boolean;
  hasInitialized: boolean;
  isDemoUser: boolean;

  isSavingsModalOpen: boolean;
  resolveSavingsPromise: any;

  isLoadingModalOpen: boolean;
  loadingHeader: string;

  isConfirmModalOpen: boolean;

  isProgressOpen: boolean;
  progressHeader: string;
  progressCount: number;
  progressTotal: number;

  isLoading: boolean;

  setIsLoading: (val: boolean) => void;

  awaitSavingsLink: (entries: any) => Promise<any>;
  resolveSavingsLink: (result: any) => void;

  openProgress: (header: any, total: any) => void;
  updateProgress: (count: any) => void;
  closeProgress: () => void;

  openLoading: (header: any) => void;
  closeLoading: () => void;

  setConfirmModalOpen: (open: any) => void;
  setSavingsModalOpen: (open: any) => void;

  setSessionExpired: (value: any) => void;
  setHasInitialized: (value: any) => void;
  setCurrentPage: (page: any) => void;
  setUser: (user: any) => void;
  setIsDemoUser: (val: any) => void;
};

type SliceCreator<T> = StateCreator<any, [], [], T>;

export const createSettingsSlice: SliceCreator<SettingsSlice> = (set, get) => ({
  currentPage: "planner",
  user: null,
  sessionExpired: false,
  hasInitialized: false,
  isDemoUser: false,

  isSavingsModalOpen: false,
  resolveSavingsPromise: null,

  isLoadingModalOpen: false,
  loadingHeader: "",

  isConfirmModalOpen: false,

  isProgressOpen: false,
  progressHeader: "",
  progressCount: 0,
  progressTotal: 0,

  isLoading: false,
  setIsLoading: (val) => set({ isLoading: val }),

  awaitSavingsLink: (entries: any) => {
    // enqueue and open modal, then return a promise resolved by resolveSavingsLink
    set({ savingsReviewQueue: entries, isSavingsModalOpen: true });
    return new Promise((resolve: any) => {
      set({ resolveSavingsPromise: resolve });
    });
  },

  resolveSavingsLink: (result: any) => {
    const resolver = (get() as any).resolveSavingsPromise;
    if (typeof resolver === "function") {
      try {
        resolver(result);
      } catch {
        // noop
      }
    }
    set({
      resolveSavingsPromise: null,
      isSavingsModalOpen: false,
      savingsReviewQueue: [],
    });
  },

  openProgress: (header: any, total: any) =>
    set({
      isProgressOpen: true,
      progressHeader: header,
      progressCount: 0,
      progressTotal: total,
    }),

  updateProgress: (count: any) => set({ progressCount: count }),

  closeProgress: () =>
    set({
      isProgressOpen: false,
      progressHeader: "",
      progressCount: 0,
      progressTotal: 0,
    }),

  openLoading: (header: any) =>
    set({
      isLoadingModalOpen: true,
      loadingHeader: header,
    }),

  closeLoading: () =>
    set({
      isLoadingModalOpen: false,
      loadingHeader: "",
    }),

  setConfirmModalOpen: (open: any) => set({ isConfirmModalOpen: open }),
  setSavingsModalOpen: (open: any) => set({ isSavingsModalOpen: open }),

  setSessionExpired: (value: any) => set({ sessionExpired: value }),
  setHasInitialized: (value: any) => set({ hasInitialized: value }),
  setCurrentPage: (page: any) => set({ currentPage: page }),
  setUser: (user: any) => set({ user }),
  setIsDemoUser: (val: any) => set({ isDemoUser: val }),
});
