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

describe("cross-slice invariants (accounts + import)", () => {
  it("markTransactionsBudgetApplied is month-scoped and idempotent", () => {
    const store = makeTestStore();

    const accountNumber = "1234";

    store.setState({
      accounts: {
        [accountNumber]: {
          id: "acct-1",
          transactions: [
            { id: "tFeb1", date: "2026-02-03", staged: true, budgetApplied: false },
            { id: "tFeb2", date: "2026-02-18", staged: true, budgetApplied: false },
            { id: "tMar", date: "2026-03-10", staged: true, budgetApplied: false },
          ],
        },
      },
    });

    store.getState().markTransactionsBudgetApplied(accountNumber, ["2026-02"]);

    expect(store.getState().accounts[accountNumber].transactions).toMatchObject([
      { id: "tFeb1", staged: false, budgetApplied: true },
      { id: "tFeb2", staged: false, budgetApplied: true },
      { id: "tMar", staged: true, budgetApplied: false },
    ]);

    // Re-applying the same month should be a no-op.
    const snapshotAfterFirstApply = structuredClone(store.getState().accounts[accountNumber].transactions);
    store.getState().markTransactionsBudgetApplied(accountNumber, ["2026-02"]);
    expect(store.getState().accounts[accountNumber].transactions).toEqual(snapshotAfterFirstApply);
  });

  it("processPendingSavingsForAccount queues only requested months and is idempotent", () => {
    const store = makeTestStore();

    const accountNumber = "1234";
    const sessionId = "s1";

    store.setState({
      pendingSavingsByAccount: {
        [accountNumber]: [
          { id: "p1", importSessionId: sessionId, month: "2026-02", date: "2026-02-01", kind: "savings", name: "Savings", amount: 10 },
          { id: "p2", importSessionId: sessionId, month: "2026-03", date: "2026-03-01", kind: "savings", name: "Savings", amount: 20 },
        ],
      },
      savingsReviewQueue: [],
    });

    store.getState().processPendingSavingsForAccount(accountNumber, ["2026-02"]);

    expect(store.getState().pendingSavingsByAccount[accountNumber]).toEqual([
      { id: "p2", importSessionId: sessionId, month: "2026-03", date: "2026-03-01", kind: "savings", name: "Savings", amount: 20 },
    ]);
    expect(store.getState().savingsReviewQueue).toEqual([
      { id: "p1", importSessionId: sessionId, month: "2026-02", date: "2026-02-01", kind: "savings", name: "Savings", amount: 10 },
    ]);

    // Re-processing the same month should not enqueue duplicates.
    const snapshotQueue = structuredClone(store.getState().savingsReviewQueue);
    store.getState().processPendingSavingsForAccount(accountNumber, ["2026-02"]);
    expect(store.getState().savingsReviewQueue).toEqual(snapshotQueue);
  });
});
