import { describe, expect, it } from "vitest";
import { createStore } from "zustand/vanilla";

import { createAccountsSlice } from "../accountsSlice";
import { createImportSlice } from "../importSlice";
import { createPlannerSlice } from "../plannerSlice";

function makeTestStore() {
  return createStore<any>()((set, get, api) => ({
    ...createAccountsSlice(set as any, get as any, api as any),
    ...createImportSlice(set as any, get as any, api as any),
    ...createPlannerSlice(set as any, get as any, api as any),
  }));
}

describe("clearImportSessionEverywhere", () => {
  it("removes session transactions and tracker-derived items tagged with importSessionId", () => {
    const store = makeTestStore();

    const accountNumber = "1234";
    const sessionToClear = "s1";

    store.setState({
      accounts: {
        [accountNumber]: {
          id: "acct-1",
          transactions: [
            { id: "t1", date: "2026-02-03", importSessionId: sessionToClear, staged: false, budgetApplied: true },
            { id: "t2", date: "2026-02-10", importSessionId: "s2", staged: false, budgetApplied: true },
            { id: "manual", date: "2026-02-12" },
          ],
        },
      },
      importHistory: [
        { sessionId: sessionToClear, accountNumber, importedAt: new Date().toISOString(), newCount: 1, hash: "h1" },
        { sessionId: "s2", accountNumber, importedAt: new Date().toISOString(), newCount: 1, hash: "h2" },
      ],
      pendingSavingsByAccount: {
        [accountNumber]: [
          { importSessionId: sessionToClear, month: "2026-02" },
          { importSessionId: "s2", month: "2026-02" },
        ],
      },
      monthlyActuals: {
        "2026-02": {
          actualExpenses: [
            { id: "e1", amount: 10, importSessionId: sessionToClear },
            { id: "e2", amount: 20, importSessionId: "s2" },
          ],
          actualFixedIncomeSources: [
            { id: "i1", amount: 1000, importSessionId: sessionToClear },
            { id: "i2", amount: 500, importSessionId: "s2" },
          ],
          actualTotalNetIncome: 1500,
          customSavings: 0,
        },
      },
      savingsLogs: {
        "2026-02": [
          { id: "l1", goalId: null, date: "2026-02-03", amount: 100, name: "X", importSessionId: sessionToClear },
          { id: "l2", goalId: null, date: "2026-02-04", amount: 50, name: "Y", importSessionId: "s2" },
        ],
      },
      savingsGoals: [
        { id: "yearly", name: "Yearly Savings Goal", target: 10000 },
        { id: "g1", name: "From s1", createdFromImportSessionId: sessionToClear },
        { id: "g2", name: "From s2", createdFromImportSessionId: "s2" },
      ],
      // If a savings review queue exists, it should also be cleaned.
      savingsReviewQueue: [
        { id: "q1", month: "2026-02", importSessionId: sessionToClear },
        { id: "q2", month: "2026-02", importSessionId: "s2" },
      ],
      isSavingsModalOpen: true,
    });

    store.getState().clearImportSessionEverywhere(accountNumber, sessionToClear);

    // Account transactions
    const txIds = store.getState().accounts[accountNumber].transactions.map((t: any) => t.id);
    expect(txIds).toEqual(["t2", "manual"]);

    // Import history row removed
    expect(store.getState().importHistory.map((h: any) => h.sessionId).sort()).toEqual(["s2"]);

    // Pending savings filtered
    expect(store.getState().pendingSavingsByAccount[accountNumber]).toEqual([{ importSessionId: "s2", month: "2026-02" }]);

    // Monthly actuals filtered + total recomputed
    const actual = store.getState().monthlyActuals["2026-02"];
    expect(actual.actualExpenses.map((e: any) => e.id)).toEqual(["e2"]);
    expect(actual.actualFixedIncomeSources.map((i: any) => i.id)).toEqual(["i2"]);
    expect(actual.actualTotalNetIncome).toBe(500);

    // Savings logs filtered
    expect(store.getState().savingsLogs["2026-02"].map((l: any) => l.id)).toEqual(["l2"]);

    // Savings review queue filtered and modal stays open (queue not empty)
    expect(store.getState().savingsReviewQueue.map((q: any) => q.id)).toEqual(["q2"]);
    expect(store.getState().isSavingsModalOpen).toBe(true);

    // Savings goals created by s1 are removed; others remain.
    expect(store.getState().savingsGoals.map((g: any) => g.id).sort()).toEqual(["g2", "yearly"].sort());
  });
});
