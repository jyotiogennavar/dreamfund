type Amount = number | string | { toString(): string };

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
