/**
 * Pure math primitives for the Scale page. No DOM, no React — unit-tested in
 * isolation. The track is strictly linear (a fixed pixels-per-dollar zoom); the
 * slider helpers are a SEPARATE logarithmic navigation control so a user can
 * actually drag to a million/billion, which occupy a vanishing fraction of a
 * linear trillion-scale axis.
 */

export const MILLION = 1_000_000;
export const BILLION = 1_000_000_000;
export const TRILLION = 1_000_000_000_000;

/** Convert a dollar amount to an x pixel offset at a fixed pixels-per-dollar zoom. */
export function dollarsToX(dollars: number, pxPerDollar: number): number {
  return dollars * pxPerDollar;
}

/** Map a dollar amount to a [0,1] slider fraction on a log scale over [$1, maxDollars]. */
export function dollarsToSliderFraction(dollars: number, maxDollars: number): number {
  const d = Math.max(1, dollars);
  const max = Math.max(10, maxDollars);
  return Math.min(1, Math.log10(d) / Math.log10(max));
}

/** Inverse of dollarsToSliderFraction. Clamps fraction to [0,1]. */
export function sliderFractionToDollars(fraction: number, maxDollars: number): number {
  const f = Math.min(1, Math.max(0, fraction));
  const max = Math.max(10, maxDollars);
  return Math.pow(max, f);
}
