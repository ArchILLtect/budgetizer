import { describe, expect, it } from "vitest";
import { createStore } from "zustand/vanilla";

import { createAccountsSlice } from "../accountsSlice";
import { createImportSlice } from "../importSlice";
import type { AccountsSlice } from "../accountsSlice";
import type { ImportSlice } from "../importSlice";

type TestState = AccountsSlice & ImportSlice;

function makeTestStore() {
  return createStore<TestState>()((set, get, api) => ({
    ...createAccountsSlice(set, get, api),
    ...createImportSlice(set, get, api),
  }));
}

describe("Import session-scoped apply (regression)", () => {
  it("applying one session in a month does not apply other sessions in that same month", () => {
    const store = makeTestStore();

    const accountNumber = "1234";
    const s1 = "s1";
    const s2 = "s2";

    store.setState({
      accounts: {
        [accountNumber]: {
          id: "acct-1",
          transactions: [
            // Two different sessions, same month
            { id: "s1-feb", date: "2026-02-03", importSessionId: s1, staged: true, budgetApplied: false },
            { id: "s2-feb", date: "2026-02-05", importSessionId: s2, staged: true, budgetApplied: false },
            // s1 also has another month staged
            { id: "s1-mar", date: "2026-03-02", importSessionId: s1, staged: true, budgetApplied: false },
          ],
        },
      },
    });

    store.getState().markImportSessionBudgetApplied(accountNumber, s1, ["2026-02"]);

    const txns = store.getState().accounts[accountNumber].transactions ?? [];

    const s1Feb = txns.find((t) => t.id === "s1-feb");
    if (!s1Feb) throw new Error("Expected transaction s1-feb to exist");
    expect(s1Feb).toMatchObject({ staged: false, budgetApplied: true });

    // Other session in same month remains staged.
    const s2Feb = txns.find((t) => t.id === "s2-feb");
    if (!s2Feb) throw new Error("Expected transaction s2-feb to exist");
    expect(s2Feb).toMatchObject({ staged: true, budgetApplied: false });

    // Other month in the same session remains staged (month-scoped apply).
    const s1Mar = txns.find((t) => t.id === "s1-mar");
    if (!s1Mar) throw new Error("Expected transaction s1-mar to exist");
    expect(s1Mar).toMatchObject({ staged: true, budgetApplied: false });
  });

  it("processing pending savings for one session+month does not enqueue other sessions", () => {
    const store = makeTestStore();

    const accountNumber = "1234";
    const s1 = "s1";
    const s2 = "s2";

    store.setState({
      pendingSavingsByAccount: {
        [accountNumber]: [
          { importSessionId: s1, month: "2026-02", date: "2026-02-01", id: "p1", name: "Savings", amount: 10 },
          { importSessionId: s2, month: "2026-02", date: "2026-02-02", id: "p2", name: "Savings", amount: 20 },
          { importSessionId: s1, month: "2026-03", date: "2026-03-01", id: "p3", name: "Savings", amount: 30 },
        ],
      },
      savingsReviewQueue: [],
    });

    store.getState().processPendingSavingsForImportSession(accountNumber, s1, ["2026-02"]);

    expect(store.getState().savingsReviewQueue).toEqual([
      { importSessionId: s1, month: "2026-02", date: "2026-02-01", id: "p1", name: "Savings", amount: 10 },
    ]);

    // Only s1/Feb removed from pending.
    expect(store.getState().pendingSavingsByAccount[accountNumber]).toEqual([
      { importSessionId: s2, month: "2026-02", date: "2026-02-02", id: "p2", name: "Savings", amount: 20 },
      { importSessionId: s1, month: "2026-03", date: "2026-03-01", id: "p3", name: "Savings", amount: 30 },
    ]);
  });
});
