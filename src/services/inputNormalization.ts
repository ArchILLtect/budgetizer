function clampMaxLen(value: string, maxLen?: number): string {
  if (typeof maxLen !== "number" || !Number.isFinite(maxLen) || maxLen <= 0) return value;
  return value.length > maxLen ? value.slice(0, maxLen) : value;
}

export function normalizeSingleLineText(value: string, opts?: { maxLen?: number }): string {
  // Preserve user intent but remove surrounding whitespace and collapse internal whitespace.
  // Intended for single-line fields rendered via <Input />.
  const normalized = value.replace(/\s+/g, " ").trim();
  return clampMaxLen(normalized, opts?.maxLen);
}

export function normalizeRequiredTitle(value: string, fallback: string, opts?: { maxLen?: number }): string {
  const normalized = normalizeSingleLineText(value, opts);
  const chosen = normalized.length > 0 ? normalized : fallback;
  return clampMaxLen(chosen, opts?.maxLen);
}

export function normalizeOptionalSingleLineText(value: string, opts?: { maxLen?: number }): string | null {
  const normalized = normalizeSingleLineText(value, opts);
  return normalized.length > 0 ? normalized : null;
}

export function normalizeDateInputToIso(dateInput: string): string | null {
  const normalized = normalizeSingleLineText(dateInput);
  if (!normalized) return null;

  // Expect browser <input type="date"/> format.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;

  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(normalized);
  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;

  // Strict calendar validation (reject rollover dates like 2026-02-31).
  const utc = new Date(Date.UTC(y, mo - 1, d));
  if (Number.isNaN(utc.getTime())) return null;
  if (utc.toISOString().slice(0, 10) !== normalized) return null;

  // Store dueAt as a UTC-anchored datetime string so day-key extraction is stable.
  return `${normalized}T00:00:00.000Z`;
}

export function parseFiniteNumber(
  raw: unknown,
  opts?: {
    fallback?: number;
    min?: number;
    max?: number;
  }
): number {
  const fallback = opts?.fallback ?? 0;
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? ""));
  if (!Number.isFinite(n)) return fallback;

  const min = opts?.min;
  const max = opts?.max;

  let clamped = n;
  if (typeof min === "number" && Number.isFinite(min)) clamped = Math.max(min, clamped);
  if (typeof max === "number" && Number.isFinite(max)) clamped = Math.min(max, clamped);
  return clamped;
}

export function normalizeMoney(raw: unknown, opts?: { fallback?: number; min?: number; max?: number }): number {
  const n = parseFiniteNumber(raw, { fallback: opts?.fallback ?? 0, min: opts?.min, max: opts?.max });
  // Round to cents.
  return Math.round(n * 100) / 100;
}
