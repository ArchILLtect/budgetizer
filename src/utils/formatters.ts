export function formatNumber(
  value: unknown,
  opts?: {
    noneLabel?: string;
    locale?: string | string[];
    formatOptions?: Intl.NumberFormatOptions;
  }
): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return opts?.noneLabel ?? "--";
  return n.toLocaleString(opts?.locale, opts?.formatOptions);
}

export function formatCurrency(
  value: unknown,
  opts?: {
    noneLabel?: string;
    locale?: string | string[];
    showSymbol?: boolean;
  }
): string {
  const num = formatNumber(value, {
    noneLabel: opts?.noneLabel,
    locale: opts?.locale,
    formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  });

  if (num === (opts?.noneLabel ?? "--")) return num;
  if (opts?.showSymbol === false) return num;
  return `$${num}`;
}
