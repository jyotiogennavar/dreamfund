const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

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
