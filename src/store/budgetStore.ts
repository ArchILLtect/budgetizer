import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStrongTransactionKey } from '../utils/storeHelpers.ts';
import { createUserScopedZustandStorage } from "../services/userScopedStorage";
import { createImportSlice } from "./slices/importSlice";
import { createPlannerSlice } from "./slices/plannerSlice";
import { createSettingsSlice } from "./slices/settingsSlice";

// TODO: Allow users to change overtime threshold and tax rates

export const useBudgetStore = create(
    persist(
        (set: any, get: any, store: any) => ({
            ...createImportSlice(set, get, store),
            ...createPlannerSlice(set, get, store),
            ...createSettingsSlice(set, get, store),
            ORIGIN_COLOR_MAP: {
                csv: 'purple',
                ofx: 'green',
                plaid: 'red',
                manual: 'blue',
            },
            accountMappings: {} as { [accountNumber: string]: { label: string; institution: string } },
            accounts: {} as { [accountNumber: string]: { transactions: any, id: any } },
            // NOTE: Import lifecycle state/actions (staging/history/undo/settings/telemetry) live in the Import slice.
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
                    const seen = new Set(
                        existing.map((t: any) => getStrongTransactionKey(t, accountNumber))
                    );
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
                    const updated = [...existing, ...newTxs].sort((a, b) =>
                        a.date.localeCompare(b.date)
                    );

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
            // Add a migration utility to re-classify non-savings transactions by sign.
            createStore: (set: any) => ({
                // ...existing state & actions...

                migrateSignBasedTypes: () => {
                    set((state: any) => {
                        if (!state.accounts) return {};
                        let changed = false;
                        const accounts = { ...state.accounts };
                        for (const acctNum of Object.keys(accounts)) {
                            const acct = accounts[acctNum];
                            if (!acct?.transactions) continue;
                            let txChanged = false;
                            const txns = acct.transactions.map((tx: any) => {
                                if (tx.type === 'savings') return tx;
                                const signed =
                                    typeof tx.rawAmount === 'number'
                                        ? tx.rawAmount
                                        : Number(tx.amount) || 0;
                                const desired = signed >= 0 ? 'income' : 'expense';
                                if (tx.type !== desired) {
                                    txChanged = true;
                                    return { ...tx, type: desired };
                                }
                                return tx;
                            });
                            if (txChanged) {
                                changed = true;
                                accounts[acctNum] = { ...acct, transactions: txns };
                            }
                        }
                        return changed ? { accounts } : {};
                    });
                },

                migrateSignedAmountsAndTypes: () => {
                    set((state: any) => {
                        if (!state.accounts) return {};
                        let changed = false;
                        const accounts = { ...state.accounts };
                        for (const acctNum of Object.keys(accounts)) {
                            const acct = accounts[acctNum];
                            if (!acct?.transactions) continue;
                            let txChanged = false;
                            const txns = acct.transactions.map((tx: any) => {
                                let updated = tx;
                                // Repair rawAmount sign from original.Amount if parentheses present and rawAmount non-negative
                                const origAmtStr =
                                    tx.original?.Amount || tx.original?.amount;
                                if (
                                    typeof updated.rawAmount === 'number' &&
                                    updated.rawAmount >= 0 &&
                                    typeof origAmtStr === 'string' &&
                                    /^\(.*\)$/.test(origAmtStr.trim())
                                ) {
                                    updated = {
                                        ...updated,
                                        rawAmount: -Math.abs(updated.rawAmount),
                                    };
                                }

                                // Re-classify non-savings
                                if (updated.type !== 'savings') {
                                    const signed =
                                        typeof updated.rawAmount === 'number'
                                            ? updated.rawAmount
                                            : Number(updated.amount) || 0;
                                    const desired = signed >= 0 ? 'income' : 'expense';
                                    if (updated.type !== desired) {
                                        updated = { ...updated, type: desired };
                                    }
                                }

                                if (updated !== tx) {
                                    txChanged = true;
                                }
                                return updated;
                            });
                            if (txChanged) {
                                changed = true;
                                accounts[acctNum] = { ...acct, transactions: txns };
                            }
                        }
                        return changed ? { accounts } : {};
                    });
                },

                // ...existing actions...
            }),
        }),

        {
            name: 'budgeteer:budgetStore', // key in localStorage
            storage: createUserScopedZustandStorage(),
            partialize: (state: any) => {
                // Intentionally strip transient flags and UI modal/progress from persistence
                const clone = { ...state };
                delete clone.sessionExpired;
                delete clone.hasInitialized;
                delete clone.isSavingsModalOpen;
                delete clone.savingsReviewQueue;
                delete clone.resolveSavingsPromise;
                delete clone.isConfirmModalOpen;
                delete clone.isLoadingModalOpen;
                delete clone.isProgressOpen;
                delete clone.progressHeader;
                delete clone.progressCount;
                delete clone.progressTotal;
                delete clone.loadingHeader;
                delete clone.showIngestionBenchmark; // dev-only toggle not persisted
                // importHistory is retained for audit/undo
                return clone;
            },
        }
    )
);
