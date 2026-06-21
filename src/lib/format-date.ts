/**
 * Format ISO date (YYYY-MM-DD) for display (e.g. "7 March 2026").
 * Returns empty string for missing or invalid dates.
 */
export function formatDataAsOf(
  isoDate: string,
  dateLocale: string = "en-GB"
): string {
  if (!isoDate?.trim()) return "";
  const d = new Date(isoDate.trim() + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
