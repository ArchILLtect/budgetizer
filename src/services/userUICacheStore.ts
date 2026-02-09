import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import type { UserUI } from "../types";
import { createUserScopedZustandStorage, getUserStorageScopeKey } from "./userScopedStorage";

export const USER_UI_STORAGE_KEY = "taskmaster:user";
export const USER_UI_STORE_VERSION = 1 as const;

export type UserUICacheState = {
  userUI: UserUI | null;
  fetchedAtMs: number | null;

  set: (userUI: UserUI) => void;
  clear: () => void;
};

export const useUserUICacheStore = create<UserUICacheState>()(
  persist(
    (set) => ({
      userUI: null,
      fetchedAtMs: null,

      set: (userUI) => set({ userUI, fetchedAtMs: Date.now() }),
      clear: () => set({ userUI: null, fetchedAtMs: null }),
    }),
    {
      name: USER_UI_STORAGE_KEY,
      version: USER_UI_STORE_VERSION,
      migrate: (persistedState) => persistedState,
      storage: (() => {
        const scoped = createUserScopedZustandStorage();

        const storage: PersistStorage<unknown, unknown> = {
          getItem: (name: string) => {
            const fromScoped = scoped.getItem(name);
            if (fromScoped != null) return fromScoped;

            // Only migrate legacy global keys if we have an explicit auth scope.
            if (!getUserStorageScopeKey()) return null;

            // Legacy migration: older builds stored the cache under unscoped localStorage[name].
            try {
              const raw = localStorage.getItem(name);
              if (!raw) return null;
              const parsed = JSON.parse(raw) as StorageValue<unknown>;
              scoped.setItem(name, parsed);
              localStorage.removeItem(name);
              return parsed;
            } catch {
              return null;
            }
          },
          setItem: (name: string, value: StorageValue<unknown>) => {
            scoped.setItem(name, value);
          },
          removeItem: (name: string) => {
            scoped.removeItem(name);
          },
        };

        return storage;
      })(),
      partialize: (s) => ({ userUI: s.userUI, fetchedAtMs: s.fetchedAtMs }),
    }
  )
);
