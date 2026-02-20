import { describe, expect, it } from "vitest";
import { createStore } from "zustand/vanilla";

import { createAccountsSlice } from "../accountsSlice";
import { createImportSlice } from "../importSlice";
import { createPlannerSlice } from "../plannerSlice";
import { createSettingsSlice } from "../settingsSlice";
import type { AccountsSlice } from "../accountsSlice";
import type { ImportSlice } from "../importSlice";
import type { PlannerSlice } from "../plannerSlice";
import type { SettingsSlice } from "../settingsSlice";

type SavingsReviewQueueItem = { id: string; month: string; importSessionId?: string };

function isSavingsReviewQueueItem(value: unknown): value is SavingsReviewQueueItem {
  if (!value || typeof value !== "object") return false;
  const rec = value as Record<string, unknown>;
  return typeof rec.id === "string" && typeof rec.month === "string";
}

type TestState = AccountsSlice &
  ImportSlice &
  PlannerSlice &
  SettingsSlice;

function makeTestStore() {
  return createStore<TestState>()((set, get, api) => ({
    ...createAccountsSlice(set, get, api),
    ...createImportSlice(set, get, api),
    ...createPlannerSlice(set, get, api),
    ...createSettingsSlice(set, get, api),
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
          { id: "p1", date: "2026-02-01", name: "Savings 1", amount: 10, importSessionId: sessionToClear, month: "2026-02" },
          { id: "p2", date: "2026-02-01", name: "Savings 2", amount: 20, importSessionId: "s2", month: "2026-02" },
        ],
      },
      monthlyActuals: {
        "2026-02": {
          actualExpenses: [
            { id: "e1", name: "Expense 1", description: "Expense 1", amount: 10, importSessionId: sessionToClear },
            { id: "e2", name: "Expense 2", description: "Expense 2", amount: 20, importSessionId: "s2" },
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
        { id: "q1", date: "2026-02-03", name: "Savings Q1", amount: 1, month: "2026-02", importSessionId: sessionToClear },
        { id: "q2", date: "2026-02-04", name: "Savings Q2", amount: 2, month: "2026-02", importSessionId: "s2" },
      ],
      isSavingsModalOpen: true,
    });

    store.getState().clearImportSessionEverywhere(accountNumber, sessionToClear);

    // Account transactions
    const txIds = (store.getState().accounts[accountNumber]?.transactions ?? [])
      .map((t) => t.id)
      .filter((id): id is string => typeof id === "string");
    expect(txIds).toEqual(["t2", "manual"]);

    // Import history row removed
    expect(store.getState().importHistory.map((h) => h.sessionId).sort()).toEqual(["s2"]);

    // Pending savings filtered
    expect(store.getState().pendingSavingsByAccount[accountNumber]).toEqual([
      { id: "p2", date: "2026-02-01", name: "Savings 2", amount: 20, importSessionId: "s2", month: "2026-02" },
    ]);

    // Monthly actuals filtered + total recomputed
    const actual = store.getState().monthlyActuals["2026-02"];
    expect(actual.actualExpenses.map((e) => e.id)).toEqual(["e2"]);
    expect(actual.actualFixedIncomeSources.map((i) => i.id)).toEqual(["i2"]);
    expect(actual.actualTotalNetIncome).toBe(500);

    // Savings logs filtered
    expect(store.getState().savingsLogs["2026-02"].map((l) => l.id)).toEqual(["l2"]);

    // Savings review queue filtered and modal stays open (queue not empty)
  const queueIds = (store.getState().savingsReviewQueue ?? []).filter(isSavingsReviewQueueItem).map((q) => q.id);
  expect(queueIds).toEqual(["q2"]);
    expect(store.getState().isSavingsModalOpen).toBe(true);

    // Savings goals created by s1 are removed; others remain.
    expect(store.getState().savingsGoals.map((g) => g.id).sort()).toEqual(["g2", "yearly"].sort());
  });
});
