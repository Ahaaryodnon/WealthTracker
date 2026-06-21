/**
 * Currency and number formatting for display.
 * Use tabular figures (font-variant-numeric: tabular-nums) in CSS for stable digit width.
 */

export interface FormatLocaleOptions {
  numberLocale?: string;
  currency?: string;
}

const DEFAULT_NUMBER_LOCALE = "en-US";
const DEFAULT_CURRENCY = "USD";

interface FormatterCache {
  compact: Intl.NumberFormat;
  full: Intl.NumberFormat;
  precise: Intl.NumberFormat;
  number: Intl.NumberFormat;
}

const formatterCache = new Map<string, FormatterCache>();

function getFormatters(numberLocale: string, currency: string): FormatterCache {
  const key = `${numberLocale}-${currency}`;
  let cached = formatterCache.get(key);
  if (!cached) {
    cached = {
      compact: new Intl.NumberFormat(numberLocale, {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 1,
      }),
      full: new Intl.NumberFormat(numberLocale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      precise: new Intl.NumberFormat(numberLocale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      number: new Intl.NumberFormat(numberLocale, {
        maximumFractionDigits: 0,
      }),
    };
    formatterCache.set(key, cached);
  }
  return cached;
}

/**
 * Format a currency amount for display. Uses compact notation (e.g. $1.2B) for
 * large values; full notation with locale-appropriate separators for thousands and up; precise for small.
 */
export function formatCurrency(
  value: number,
  options: FormatLocaleOptions = {}
): string {
  const numberLocale = options.numberLocale ?? DEFAULT_NUMBER_LOCALE;
  const currency = options.currency ?? DEFAULT_CURRENCY;
  const { compact, full, precise } = getFormatters(numberLocale, currency);
  if (value >= 1e9) return compact.format(value);
  if (value >= 1e3) return full.format(value);
  return precise.format(value);
}

/**
 * Format a currency amount in compact notation (e.g. $1.2B, £340K).
 */
export function formatCompact(
  value: number,
  options: FormatLocaleOptions = {}
): string {
  const numberLocale = options.numberLocale ?? DEFAULT_NUMBER_LOCALE;
  const currency = options.currency ?? DEFAULT_CURRENCY;
  const { compact } = getFormatters(numberLocale, currency);
  return compact.format(value);
}

/**
 * Format a large number with locale-appropriate separators, no currency symbol.
 */
export function formatNumber(
  value: number,
  options: FormatLocaleOptions = {}
): string {
  const numberLocale = options.numberLocale ?? DEFAULT_NUMBER_LOCALE;
  const currency = options.currency ?? DEFAULT_CURRENCY;
  const { number: formatter } = getFormatters(numberLocale, currency);
  return formatter.format(value);
}

/**
 * Format seconds into a human-readable duration string.
 */
export function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  if (mins === 0) return `${secs} second${secs !== 1 ? "s" : ""}`;
  if (secs === 0) return `${mins} minute${mins !== 1 ? "s" : ""}`;
  return `${mins}m ${secs}s`;
}
