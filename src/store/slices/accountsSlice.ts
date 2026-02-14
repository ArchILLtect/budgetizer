import type { StateCreator } from "zustand";

import { buildTxKey } from "../../ingest/buildTxKey";
import type { Account, AccountMapping, Transaction } from "../../types";

const getStrongTransactionKey = (tx: any, accountNumber: string) =>
  buildTxKey({ ...tx, accountNumber: tx.accountNumber || accountNumber });

export type AccountsSlice = {
  accountMappings: { [accountNumber: string]: AccountMapping };
  accounts: { [accountNumber: string]: Account };

  clearAllAccounts: () => void;
  addOrUpdateAccount: (accountNumber: any, data: any) => void;
  addTransactionsToAccount: (accountNumber: any, transactions: Transaction[]) => void;
  setAccountMapping: (accountNumber: any, mapping: any) => void;
  removeAccount: (accountNumber: any) => void;
};

type SliceCreator<T> = StateCreator<any, [], [], T>;

export const createAccountsSlice: SliceCreator<AccountsSlice> = (set) => ({
  accountMappings: {},
  accounts: {},

  clearAllAccounts: () => set(() => ({ accounts: {} })),

  addOrUpdateAccount: (accountNumber: any, data: any) =>
    set((state: any) => ({
      accounts: {
        ...state.accounts,
        [accountNumber]: {
          ...(state.accounts[accountNumber] || {}),
          ...data,
        },
      },
    })),

  addTransactionsToAccount: (accountNumber: any, transactions: any) =>
    set((state: any) => {
      const existing = state.accounts[accountNumber]?.transactions || [];
      const seen = new Set(existing.map((t: any) => getStrongTransactionKey(t, accountNumber)));
      const newTxs = [];

      for (const tx of transactions) {
        const key = getStrongTransactionKey(tx, accountNumber);
        if (!seen.has(key)) {
          seen.add(key);
          newTxs.push({
            ...tx,
            accountNumber: tx.accountNumber || accountNumber,
          });
        }
      }

      const updated = [...existing, ...newTxs].sort((a, b) => a.date.localeCompare(b.date));

      return {
        accounts: {
          ...state.accounts,
          [accountNumber]: {
            ...(state.accounts[accountNumber] || {}),
            transactions: updated,
          },
        },
      };
    }),

  setAccountMapping: (accountNumber: any, mapping: any) =>
    set((state: any) => ({
      accountMappings: {
        ...state.accountMappings,
        [accountNumber]: mapping,
      },
    })),

  removeAccount: (accountNumber: any) =>
    set((state: any) => {
      const updated = { ...state.accounts };
      delete updated[accountNumber];
      return { accounts: updated };
    }),
});
