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

describe("import apply/undo flow", () => {
  it("apply marks staged as budgetApplied and undo does nothing when nothing remains staged", () => {
    const store = makeTestStore();

    const importedAt = new Date(Date.now() - 60_000).toISOString();

    const accountNumber = "1234";
    const sessionId = "s1";

    store.setState({
      accounts: {
        [accountNumber]: {
          id: "acct-1",
          transactions: [
            {
              id: "t1",
              date: "2026-02-03",
              importSessionId: sessionId,
              staged: true,
              budgetApplied: false,
            },
            {
              id: "t2",
              date: "2026-02-10",
              importSessionId: sessionId,
              staged: true,
              budgetApplied: false,
            },
          ],
        },
      },
      importHistory: [
        {
          sessionId,
          accountNumber,
          importedAt,
          newCount: 2,
          hash: "h1",
        },
      ],
      pendingSavingsByAccount: {
        [accountNumber]: [{ id: "p1", importSessionId: sessionId, month: "2026-02", date: "2026-02-01", name: "Savings", amount: 10 }],
      },
    });

    store.getState().markTransactionsBudgetApplied(accountNumber, ["2026-02"]);

    const afterApply = store.getState().accounts[accountNumber]?.transactions ?? [];
    const afterApplyView = afterApply
      .map((t) => ({ id: t.id, staged: t.staged, budgetApplied: t.budgetApplied }))
      .filter(
        (t): t is { id: string; staged: boolean; budgetApplied: boolean } =>
          typeof t.id === "string" && typeof t.staged === "boolean" && typeof t.budgetApplied === "boolean"
      );
    expect(afterApplyView).toEqual([
      { id: "t1", staged: false, budgetApplied: true },
      { id: "t2", staged: false, budgetApplied: true },
    ]);

    store.getState().undoStagedImport(accountNumber, sessionId);

    const afterUndo = store.getState().accounts[accountNumber]?.transactions ?? [];
    expect(afterUndo).toHaveLength(2);
    const afterUndoIds = afterUndo
      .map((t) => t.id)
      .filter((id): id is string => typeof id === "string")
      .sort();
    expect(afterUndoIds).toEqual(["t1", "t2"]);

    const hist = store.getState().importHistory[0];
    expect(hist.undoneAt).toBeUndefined();
    expect(hist.removed).toBeUndefined();
  });

  it("apply one month then undo removes only remaining staged tx for that session", () => {
    const store = makeTestStore();

    const importedAt = new Date(Date.now() - 60_000).toISOString();

    const accountNumber = "1234";
    const sessionId = "s1";

    store.setState({
      accounts: {
        [accountNumber]: {
          id: "acct-1",
          transactions: [
            {
              id: "tFeb",
              date: "2026-02-03",
              importSessionId: sessionId,
              staged: true,
              budgetApplied: false,
            },
            {
              id: "tMar",
              date: "2026-03-10",
              importSessionId: sessionId,
              staged: true,
              budgetApplied: false,
            },
          ],
        },
      },
      importHistory: [
        {
          sessionId,
          accountNumber,
          importedAt,
          newCount: 2,
          hash: "h1",
        },
      ],
      pendingSavingsByAccount: {
        [accountNumber]: [
          { id: "p1", importSessionId: sessionId, month: "2026-02", date: "2026-02-01", name: "Savings", amount: 10 },
          { id: "p2", importSessionId: sessionId, month: "2026-03", date: "2026-03-01", name: "Savings", amount: 20 },
        ],
      },
      importUndoWindowMinutes: 30,
    });

    store.getState().markTransactionsBudgetApplied(accountNumber, ["2026-02"]);

    // Feb applied, Mar still staged
    const afterApply = store.getState().accounts[accountNumber]?.transactions ?? [];
    const feb = afterApply.find((t) => t.id === "tFeb");
    if (!feb) throw new Error("Expected transaction tFeb to exist");
    expect(feb).toMatchObject({ staged: false, budgetApplied: true });

    const mar = afterApply.find((t) => t.id === "tMar");
    if (!mar) throw new Error("Expected transaction tMar to exist");
    expect(mar).toMatchObject({ staged: true, budgetApplied: false });

    store.getState().undoStagedImport(accountNumber, sessionId);

    const afterUndo = store.getState().accounts[accountNumber]?.transactions ?? [];
    const afterUndoIds = afterUndo.map((t) => t.id).filter((id): id is string => typeof id === "string");
    expect(afterUndoIds).toEqual(["tFeb"]);

    const hist = store.getState().importHistory[0];
    expect(typeof hist.undoneAt).toBe("string");
    expect(hist.removed).toBe(1);

    // Pending savings for that session are removed
    expect(store.getState().pendingSavingsByAccount[accountNumber]).toEqual([]);
  });
});
