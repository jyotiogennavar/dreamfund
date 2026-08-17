const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

export const DEADLINE_MAX_YEARS = 5;

/** Local calendar date at noon, so comparisons stay on the intended day. */
export function startOfLocalDay(date = new Date()): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0,
  );
}

export function addCalendarYears(date: Date, years: number): Date {
  return new Date(
    date.getFullYear() + years,
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0,
  );
}

/** Allowed goal deadlines: today through 5 years from today. */
export function deadlineDateRange(now = new Date()) {
  const min = startOfLocalDay(now);
  const max = addCalendarYears(min, DEADLINE_MAX_YEARS);
  return { min, max };
}

export function isDateOnlyInRange(date: Date, min: Date, max: Date) {
  const value = formatDateOnly(date);
  return value >= formatDateOnly(min) && value <= formatDateOnly(max);
}

/** Parse yyyy-MM-dd as a local calendar date at noon to avoid UTC/DST shifts. */
export function parseDateOnly(value: string): Date | null {
  const match = DATE_ONLY.exec(value.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/** Format a Date or ISO value as yyyy-MM-dd using the stored calendar date. */
export function formatDateOnly(value: Date | string): string {
  if (typeof value === "string") {
    const match = DATE_ONLY.exec(value);
    if (match) {
      return match[0];
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return formatDateOnly(parsed);
  }

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Rehydrate a stored ISO/date-only value as a local calendar Date. */
export function dateOnlyFromStored(value: string): Date | null {
  const formatted = formatDateOnly(value);
  if (!formatted) {
    return null;
  }

  return parseDateOnly(formatted);
}
