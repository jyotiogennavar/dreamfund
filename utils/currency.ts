export const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]["value"];

/**
 * Grouping is a locale rule, not a currency rule.
 * INR uses the Indian lakh/crore system. USD, GBP, and English-formatted
 * EUR all use groups of three. Euro countries that use `.` or a thin space
 * would need a locale setting — this app does not have one.
 */
const GROUPING_LOCALE: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "en-US",
  GBP: "en-GB",
};

export function groupingLocale(currency = "INR"): string {
  if (currency in GROUPING_LOCALE) {
    return GROUPING_LOCALE[currency as CurrencyCode];
  }

  return "en-US";
}
