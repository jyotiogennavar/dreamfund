type Amount = number | string | { toString(): string };

/** PostgreSQL DECIMAL(12, 2) leaves 10 digits before the decimal. */
export const MAX_INR_INTEGER_DIGITS = 10;

const inrIntegerFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export function toNumber(amount: Amount): number {
  if (typeof amount === "number") {
    return amount;
  }

  return Number(amount.toString());
}

export function formatMoney(
  amount: Amount,
  currency = "INR",
  locale = "en-IN",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(toNumber(amount));
}

export function getCurrencySymbol(currency = "INR"): string {
  try {
    return (
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ?? "₹"
    );
  } catch {
    return "₹";
  }
}

/** Strip grouping and currency symbols so validation sees a raw numeric string. */
export function stripMoneyFormatting(value: string): string {
  return value
    .trim()
    .replace(/,/g, "")
    .replace(/^[^\d]+(?=\d)/, "")
    .trim();
}

/** Keep ASCII digits only, drop a pasted decimal remainder, and cap length. */
export function sanitizeMoneyInput(raw: string): string {
  const integerPart = raw.split(".")[0] ?? "";
  const digits = integerPart.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  return digits.slice(0, MAX_INR_INTEGER_DIGITS);
}

export function formatMoneyInput(raw: string, currency = "INR"): string {
  const digits = sanitizeMoneyInput(raw);
  if (digits === "") {
    return "";
  }

  return `${getCurrencySymbol(currency)} ${inrIntegerFormatter.format(BigInt(digits))}`;
}

export function countDigitsBefore(value: string, caret: number): number {
  let count = 0;
  const end = Math.max(0, Math.min(caret, value.length));
  for (let i = 0; i < end; i += 1) {
    if (isAsciiDigit(value[i])) {
      count += 1;
    }
  }
  return count;
}

export function caretFromDigitCount(
  formatted: string,
  digitCount: number,
): number {
  if (digitCount <= 0) {
    const firstDigit = formatted.search(/[0-9]/);
    return firstDigit === -1 ? formatted.length : firstDigit;
  }

  let seen = 0;
  for (let i = 0; i < formatted.length; i += 1) {
    if (isAsciiDigit(formatted[i])) {
      seen += 1;
      if (seen === digitCount) {
        return i + 1;
      }
    }
  }

  return formatted.length;
}

function isAsciiDigit(char: string | undefined): boolean {
  return char !== undefined && char >= "0" && char <= "9";
}
