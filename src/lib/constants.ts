/** Default annual return rate (e.g. 5%) used for passive income calculation. */
export const DEFAULT_RETURN_RATE = 0.05;

/** Comparisons used in the visual comparison section. */
export const COMPARISONS = [
  {
    label: "Median US salary",
    value: 59_384,
    source: "US Census Bureau",
  },
  {
    label: "Average US home price",
    value: 420_800,
    source: "US Census Bureau / HUD",
  },
  {
    label: "Teacher's annual salary (US avg)",
    value: 69_544,
    source: "Bureau of Labor Statistics",
  },
] as const;
