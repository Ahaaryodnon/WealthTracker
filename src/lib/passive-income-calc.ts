/**
 * Passive income calculation: per-second rate and elapsed totals.
 * Formula: (net_worth × return_rate) / (365 × 24 × 3600) per second.
 */

const SECONDS_PER_YEAR = 365 * 24 * 3600;

export interface EntryWithNetWorth {
  netWorth?: number;
  forbesNetWorth?: number | null;
  bloombergNetWorth?: number | null;
}

/**
 * Net worth in billions. Resolves from netWorth, forbesNetWorth, or bloombergNetWorth.
 */
function getNetWorthBillion(entry: EntryWithNetWorth): number {
  return (
    entry.netWorth ??
    entry.forbesNetWorth ??
    entry.bloombergNetWorth ??
    0
  );
}

/**
 * Combined passive income per second (in dollars) for all entries.
 * Net worth is in billions; return rate is decimal (e.g. 0.05 for 5%).
 */
export function combinedPassiveIncomePerSecond(
  entries: EntryWithNetWorth[],
  returnRate: number
): number {
  const totalNetWorthBillion = entries.reduce(
    (sum, e) => sum + getNetWorthBillion(e),
    0
  );
  const annualDollars = totalNetWorthBillion * 1e9 * returnRate;
  return annualDollars / SECONDS_PER_YEAR;
}

/**
 * Total accumulated dollars from a given per-second rate over elapsed seconds.
 */
export function accumulatedFromRate(
  perSecondRate: number,
  elapsedSeconds: number
): number {
  return perSecondRate * elapsedSeconds;
}

/**
 * Elapsed seconds from 1 January 00:00:00 UTC of the current year to now.
 * Used for year-to-date cumulative total (live display).
 */
export function getYtdElapsedSeconds(): number {
  const now = Date.now();
  const year = new Date(now).getUTCFullYear();
  const jan1 = Date.UTC(year, 0, 1, 0, 0, 0, 0);
  return Math.max(0, (now - jan1) / 1000);
}

/**
 * Year-to-date cumulative total (dollars) using same formula as Accumulator:
 * combined passive income per second × YTD elapsed seconds.
 */
export function computeYtdTotal(
  entries: EntryWithNetWorth[],
  returnRate: number
): number {
  const rate = combinedPassiveIncomePerSecond(entries, returnRate);
  const ytdSeconds = getYtdElapsedSeconds();
  return accumulatedFromRate(rate, ytdSeconds);
}
