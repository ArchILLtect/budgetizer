import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistStorage, StorageValue } from "zustand/middleware";

import { isoNow } from "../services/storage";
import { createUserScopedZustandStorage, getUserStorageScopeKey } from "../services/userScopedStorage";

const STORAGE_KEY = "budgeteer:updates";
const STORE_VERSION = 1;
const MAX_EVENTS = 500;

export type UpdateType =
  | "task_created"
  | "task_completed"
  | "task_reopened"
  | "task_deleted"
  | "task_updated";

export type UpdateEvent = {
  id: string;
  type: UpdateType;
  occurredAt: string; // ISO
  taskId: string;
  listId: string;
  title: string;
  parentTaskId?: string | null;
};

export type UpdatesPersistedStateV1 = {
  events: UpdateEvent[];
  lastReadAt: string | null;
  clearedBeforeAt: string | null;
};

const DEFAULTS: UpdatesPersistedStateV1 = {
  events: [],
  lastReadAt: null,
  clearedBeforeAt: null,
};

const updatesScopedStorage: PersistStorage<unknown, unknown> = (() => {
  const scoped = createUserScopedZustandStorage();

  return {
    getItem: (name: string) => {
      const fromScoped = scoped.getItem(name);
      if (fromScoped != null) return fromScoped;

      // Only migrate legacy global keys if we have an explicit auth scope.
      if (!getUserStorageScopeKey()) return null;

      // Legacy migration: unscoped localStorage
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
})();

type UpdatesStore = UpdatesPersistedStateV1 & {
  addEvent: (evt: Omit<UpdateEvent, "id" | "occurredAt">) => UpdateEvent;
  clearAll: () => void;
  resetAll: () => void;
  markAllReadNow: () => void;
  clearRead: () => void;
};

export const useUpdatesStore = create<UpdatesStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      addEvent: (evt) => {
        const full: UpdateEvent = {
          ...evt,
          id: makeId("evt"),
          occurredAt: isoNow(),
        };

        const next = [full, ...(get().events ?? [])].slice(0, MAX_EVENTS);
        set({ events: next });
        return full;
      },

      clearAll: () => {
        // Intentionally does not touch read/unread state.
        set({ events: [] });
      },

      resetAll: () => {
        set({ ...DEFAULTS });
      },

      markAllReadNow: () => {
        set({ lastReadAt: isoNow() });
      },

      clearRead: () => {
        const s = get();
        if (!s.lastReadAt) return;
        set({ clearedBeforeAt: s.lastReadAt });
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      migrate: (persistedState) => persistedState,
      storage: updatesScopedStorage,
      partialize: (s) => ({
        events: s.events,
        lastReadAt: s.lastReadAt,
        clearedBeforeAt: s.clearedBeforeAt,
      }),
    }
  )
);

function makeId(prefix: string) {
  const core =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${core}`;
}

export function useUpdatesActions(): Pick<UpdatesStore, "addEvent" | "markAllReadNow" | "clearRead" | "clearAll"> {
  return useUpdatesStore(selectUpdatesActions);
}

type UpdatesActions = Pick<UpdatesStore, "addEvent" | "markAllReadNow" | "clearRead" | "clearAll">;

let cachedUpdatesActions: UpdatesActions | null = null;
let cachedUpdatesActionsInputs: {
  addEvent: UpdatesActions["addEvent"];
  markAllReadNow: UpdatesActions["markAllReadNow"];
  clearRead: UpdatesActions["clearRead"];
  clearAll: UpdatesActions["clearAll"];
} | null = null;

function selectUpdatesActions(s: UpdatesStore): UpdatesActions {
  const inputs = {
    addEvent: s.addEvent,
    markAllReadNow: s.markAllReadNow,
    clearRead: s.clearRead,
    clearAll: s.clearAll,
  };

  if (
    cachedUpdatesActions &&
    cachedUpdatesActionsInputs &&
    cachedUpdatesActionsInputs.addEvent === inputs.addEvent &&
    cachedUpdatesActionsInputs.markAllReadNow === inputs.markAllReadNow &&
    cachedUpdatesActionsInputs.clearRead === inputs.clearRead &&
    cachedUpdatesActionsInputs.clearAll === inputs.clearAll
  ) {
    return cachedUpdatesActions;
  }

  cachedUpdatesActionsInputs = inputs;
  cachedUpdatesActions = {
    addEvent: inputs.addEvent,
    markAllReadNow: inputs.markAllReadNow,
    clearRead: inputs.clearRead,
    clearAll: inputs.clearAll,
  };

  return cachedUpdatesActions;
}

type UpdatesView = {
  state: Pick<UpdatesPersistedStateV1, "lastReadAt" | "clearedBeforeAt">;
  events: UpdateEvent[];
  unreadCount: number;
};

// Important: React 19 + useSyncExternalStore requires getSnapshot to be cached.
// If our selector returns fresh objects/arrays on every call (even when state didn't change),
// React can get stuck in an infinite rerender loop.
const selectUpdatesView = (() => {
  let prevEventsRef: UpdateEvent[] | null = null;
  let prevLastReadAt: string | null = null;
  let prevClearedBeforeAt: string | null = null;
  let prevView: UpdatesView | null = null;

  return (s: UpdatesStore): UpdatesView => {
    const eventsRef = s.events ?? [];
    const lastReadAt = s.lastReadAt ?? null;
    const clearedBeforeAt = s.clearedBeforeAt ?? null;

    if (
      prevView &&
      prevEventsRef === eventsRef &&
      prevLastReadAt === lastReadAt &&
      prevClearedBeforeAt === clearedBeforeAt
    ) {
      return prevView;
    }

    const clearedBeforeMs = clearedBeforeAt ? new Date(clearedBeforeAt).getTime() : -Infinity;
    const lastReadMs = lastReadAt ? new Date(lastReadAt).getTime() : -Infinity;

    const visible = eventsRef.filter((e) => new Date(e.occurredAt).getTime() > clearedBeforeMs);
    const unreadCount = visible.filter((e) => new Date(e.occurredAt).getTime() > lastReadMs).length;

    prevEventsRef = eventsRef;
    prevLastReadAt = lastReadAt;
    prevClearedBeforeAt = clearedBeforeAt;
    prevView = {
      state: {
        lastReadAt,
        clearedBeforeAt,
      },
      events: visible,
      unreadCount,
    };

    return prevView;
  };
})();

export function useUpdatesView(): UpdatesView {
  return useUpdatesStore(selectUpdatesView);
}
