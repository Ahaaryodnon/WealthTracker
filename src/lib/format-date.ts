/**
 * Format ISO date (YYYY-MM-DD) for display (e.g. "7 March 2026").
 * Returns empty string for missing or invalid dates.
 */
export function formatDataAsOf(isoDate: string): string {
  if (!isoDate?.trim()) return "";
  const d = new Date(isoDate.trim() + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
