
export function toUtcDayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function isoToDayKey(iso: string | null | undefined): string | null {
  if (typeof iso !== "string" || iso.length < 10) return null;
  return iso.slice(0, 10);
}

export function addDaysToUtcDayKey(dayKey: string, days: number): string {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dayKey);
  if (!m) return dayKey;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isDueSoonByKey(
  dueAt: string | null | undefined,
  //status: TaskStatus,
  nowKey: string,
  windowDays: number
) {

  const dueKey = isoToDayKey(dueAt);
  if (!dueKey) return false;

  const endKey = addDaysToUtcDayKey(nowKey, windowDays);
  return dueKey >= nowKey && dueKey <= endKey;
}

export function isOverdueByKey(dueAt: string | null | undefined, /*status: TaskStatus,*/ nowKey: string) {

  const dueKey = isoToDayKey(dueAt);
  if (!dueKey) return false;
  return dueKey < nowKey;
}
