export type ActualIncomeSourceLike = { amount?: unknown } & Record<string, unknown>;

export type MonthlyActualBase<TExpense = unknown, TIncomeSource = ActualIncomeSourceLike> = {
  actualExpenses: TExpense[];
  actualTotalNetIncome: number;
  actualFixedIncomeSources: TIncomeSource[];
  overiddenExpenseTotal?: number;
  overiddenIncomeTotal?: number;
};

function roundToCents(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function calcActualIncomeTotal<TIncomeSource extends { amount?: unknown }>(
  actualFixedIncomeSources: TIncomeSource[] | undefined
): number {
  if (!Array.isArray(actualFixedIncomeSources)) return 0;
  return roundToCents(
    actualFixedIncomeSources.reduce((sum, source) => sum + (Number(source?.amount) || 0), 0)
  );
}

export function ensureMonthlyActual<TExpense = unknown, TIncomeSource = ActualIncomeSourceLike>(
  existing?: unknown
): MonthlyActualBase<TExpense, TIncomeSource> {
  if (existing && typeof existing === "object") {
    const e = existing as Record<string, unknown>;

    const overiddenExpenseTotalRaw = Number(e.overiddenExpenseTotal);
    const overiddenIncomeTotalRaw = Number(e.overiddenIncomeTotal);

    return {
      actualExpenses: Array.isArray(e.actualExpenses) ? (e.actualExpenses as TExpense[]) : [],
      actualTotalNetIncome: Number(e.actualTotalNetIncome) || 0,
      actualFixedIncomeSources: Array.isArray(e.actualFixedIncomeSources)
        ? (e.actualFixedIncomeSources as TIncomeSource[])
        : [],
      overiddenExpenseTotal: Number.isFinite(overiddenExpenseTotalRaw) ? overiddenExpenseTotalRaw : undefined,
      overiddenIncomeTotal: Number.isFinite(overiddenIncomeTotalRaw) ? overiddenIncomeTotalRaw : undefined,
    };
  }

  return {
    actualExpenses: [],
    actualTotalNetIncome: 0,
    actualFixedIncomeSources: [],
  };
}
