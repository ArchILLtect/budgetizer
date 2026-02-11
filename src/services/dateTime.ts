import { isoToDayKey, toUtcDayKey } from "./inboxTriage";

export function getUserTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return typeof tz === "string" && tz.length > 0 ? tz : "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Returns today's date in YYYY-MM-DD suitable for `<input type="date" />`.
 *
 * Note: this is intentionally user-timezone aware (via Intl).
 */
export function getTodayDateInputValue(timeZone: string = getUserTimeZone()): string {
  // en-CA reliably formats as YYYY-MM-DD.
  return new Date().toLocaleDateString("en-CA", { timeZone });
}

/**
 * Converts an absolute timestamp (ms since epoch) into a YYYY-MM-DD string in the given timezone.
 * Useful for "now" comparisons without forcing UTC semantics.
 */
export function msToDateInputValue(ms: number, timeZone: string = getUserTimeZone()): string {
  return new Date(ms).toLocaleDateString("en-CA", { timeZone });
}

function parseDayKey(dayKey: string): { y: number; m: number; d: number } | null {
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dayKey);
  if (!match) return null;

  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);

  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;

  return { y, m, d };
}

/**
 * Returns the first day of the month for the given day key.
 * Example: 2026-02-14 -> 2026-02-01
 */
export function startOfMonthDayKey(dayKey: string): string {
  const parsed = parseDayKey(dayKey);
  if (!parsed) return dayKey;
  return `${dayKey.slice(0, 7)}-01`;
}

/**
 * Returns the last day of the month for the given day key.
 * Example: 2026-02-14 -> 2026-02-28
 */
export function endOfMonthDayKey(dayKey: string): string {
  const parsed = parseDayKey(dayKey);
  if (!parsed) return dayKey;

  // Last day of month: day 0 of next month (in UTC).
  // Note: `parsed.m` is 1-based (01-12). JS months are 0-based.
  const d = new Date(Date.UTC(parsed.y, parsed.m, 0));
  return d.toISOString().slice(0, 10);
}

export function formatUtcDayKey(
  dayKey: string,
  opts?: {
    noneLabel?: string;
    locale?: string | string[];
    month?: "short" | "long";
  }
): string {
  const parsed = parseDayKey(dayKey);
  if (!parsed) return opts?.noneLabel ?? dayKey;

  // Use a UTC date so the label does not drift for users in negative offsets.
  const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));

  return date.toLocaleDateString(opts?.locale, {
    year: "numeric",
    month: opts?.month ?? "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatUtcMonthYear(
  dayKey: string,
  opts?: {
    noneLabel?: string;
    locale?: string | string[];
    month?: "short" | "long";
  }
): string {
  const parsed = parseDayKey(dayKey);
  if (!parsed) return opts?.noneLabel ?? dayKey;

  const date = new Date(Date.UTC(parsed.y, parsed.m - 1, 1));
  return date.toLocaleDateString(opts?.locale, {
    year: "numeric",
    month: opts?.month ?? "long",
    timeZone: "UTC",
  });
}

export function addDaysToDayKey(dayKey: string, days: number): string {
  const parsed = parseDayKey(dayKey);
  if (!parsed) return dayKey;

  const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getUtcWeekdayIndex(dayKey: string): number | null {
  const parsed = parseDayKey(dayKey);
  if (!parsed) return null;
  const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  return d.getUTCDay();
}

/**
 * Returns the week-start day key (e.g. Monday) for the given day key.
 *
 * weekStart: 0=Sunday ... 6=Saturday
 */
export function startOfWeekDayKey(dayKey: string, weekStart: number = 1): string {
  const weekday = getUtcWeekdayIndex(dayKey);
  if (weekday == null) return dayKey;

  const normalizedWeekStart = ((weekStart % 7) + 7) % 7;
  const delta = (weekday - normalizedWeekStart + 7) % 7;
  return addDaysToDayKey(dayKey, -delta);
}

export function formatUtcDayKeyWithWeekday(
  dayKey: string,
  opts?: {
    noneLabel?: string;
    locale?: string | string[];
    month?: "short" | "long";
    weekday?: "short" | "long";
  }
): string {
  const parsed = parseDayKey(dayKey);
  if (!parsed) return opts?.noneLabel ?? dayKey;

  const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  return date.toLocaleDateString(opts?.locale, {
    weekday: opts?.weekday ?? "short",
    year: "numeric",
    month: opts?.month ?? "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Formats a task dueAt for UI.
 *
 * Important: our app currently treats due dates as "floating" day-only values,
 * stored as an ISO string anchored at 00:00:00Z. To preserve that behavior,
 * we format using the ISO's UTC day key (YYYY-MM-DD) and render in UTC.
 */
export function formatDueDate(
  dueAt?: string | null,
  opts?: { noneLabel?: string; locale?: string | string[]; month?: "short" | "long" }
): string {
  const noneLabel = opts?.noneLabel ?? "Someday";
  const dueKey = isoToDayKey(dueAt);
  if (!dueKey) return noneLabel;
  return formatUtcDayKey(dueKey, { noneLabel, locale: opts?.locale, month: opts?.month });
}

/**
 * Converts an ISO datetime string (our `dueAt`) into an `<input type="date" />` value.
 *
 * Important: we treat `dueAt` as a day-only “floating” value; extracting the ISO day key
 * avoids timezone-dependent Date parsing.
 */
export function isoToDateInputValue(iso?: string | null): string {
  const dayKey = isoToDayKey(iso);
  return dayKey ?? "";
}

export function getNowUtcDayKey(nowMs: number = Date.now()): string {
  return toUtcDayKey(nowMs);
}
