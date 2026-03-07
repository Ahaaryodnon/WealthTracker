/**
 * Currency and number formatting for display.
 * Use tabular figures (font-variant-numeric: tabular-nums) in CSS for stable digit width.
 */

const compactFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const preciseFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a dollar amount for display. Uses compact notation (e.g. $1.2B) for
 * large values; full notation with commas for thousands and up; precise for small.
 */
export function formatCurrency(value: number): string {
  if (value >= 1e9) return compactFormatter.format(value);
  if (value >= 1e3) return fullFormatter.format(value);
  return preciseFormatter.format(value);
}

/**
 * Format a dollar amount in compact notation (e.g. $1.2B, $340K).
 */
export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

/**
 * Format a large number with commas, no currency symbol.
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
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
