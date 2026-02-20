import { describe, expect, it } from "vitest";
import { createStore } from "zustand/vanilla";

import { createAccountsSlice } from "../accountsSlice";
import { createImportSlice } from "../importSlice";
import { createSettingsSlice } from "../settingsSlice";
import type { AccountsSlice } from "../accountsSlice";
import type { ImportSlice } from "../importSlice";
import type { SettingsSlice } from "../settingsSlice";

type TestState = AccountsSlice & ImportSlice & SettingsSlice;

function makeTestStore() {
  return createStore<TestState>()((set, get, api) => ({
    ...createAccountsSlice(set, get, api),
    ...createImportSlice(set, get, api),
    ...createSettingsSlice(set, get, api),
  }));
}

describe("pending savings clearing", () => {
  it("clearPendingSavingsForAccountMonths removes only selected months and does not queue modal", () => {
    const store = makeTestStore();

    store.setState({
      pendingSavingsByAccount: {
        "1234": [
          { id: "p1", importSessionId: "s1", month: "2025-08", date: "2025-08-01", name: "Savings", amount: 10 },
          { id: "p2", importSessionId: "s1", month: "2025-09", date: "2025-09-01", name: "Savings", amount: 20 },
          { id: "p3", importSessionId: "s2", month: "2025-08", date: "2025-08-02", name: "Savings", amount: 30 },
        ],
      },
      savingsReviewQueue: [],
      isSavingsModalOpen: false,
    });

    store.getState().clearPendingSavingsForAccountMonths("1234", ["2025-08"]);

    expect(store.getState().pendingSavingsByAccount["1234"]).toEqual([
      { id: "p2", importSessionId: "s1", month: "2025-09", date: "2025-09-01", name: "Savings", amount: 20 },
    ]);
    expect(store.getState().savingsReviewQueue).toEqual([]);
    expect(store.getState().isSavingsModalOpen).toBe(false);

    // idempotent
    store.getState().clearPendingSavingsForAccountMonths("1234", ["2025-08"]);
    expect(store.getState().pendingSavingsByAccount["1234"]).toEqual([
      { id: "p2", importSessionId: "s1", month: "2025-09", date: "2025-09-01", name: "Savings", amount: 20 },
    ]);
  });
});
