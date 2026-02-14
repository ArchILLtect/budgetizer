export type BudgetDayKey = string; // YYYY-MM-DD
export type BudgetMonthKey = string; // YYYY-MM

export type TransactionType = "income" | "expense" | "savings";

// Local-first transaction shape used throughout ingestion + store.
// This is intentionally tolerant (allows extra fields) while we harden types.
export type Transaction = {
  id?: string;
  date?: BudgetDayKey;
  description?: string;

  // In some legacy UI paths this can be a string; ingestion generally uses numbers.
  amount?: number | string;
  rawAmount?: number;

  type?: TransactionType;
  category?: string;

  accountNumber?: string;

  // Import lifecycle
  importSessionId?: string;
  staged?: boolean;
  budgetApplied?: boolean;

  // Raw/origin payloads (CSV row, OFX record, etc)
  original?: Record<string, unknown>;
  origin?: string;

  [key: string]: unknown;
};

export type Account = {
  id?: string;
  accountNumber?: string;
  label?: string;
  institution?: string;
  transactions?: Transaction[];

  [key: string]: unknown;
};

export type AccountMapping = {
  label: string;
  institution: string;
};
