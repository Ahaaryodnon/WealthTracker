/**
 * Shared helpers for supplemental source scrapers (Playwright and Firecrawl).
 * Used by scripts/scrape-sources.ts and scripts/scrape-sources-firecrawl.ts.
 */

/** Parse a string like "$123.4 B" or "123.4" into billions (number). */
export function parseNetWorthBillionsFromText(text: string): number | null {
  const cleaned = text.replace(/[$,%\s]/g, "").replace(",", ".").toLowerCase();
  if (cleaned.includes("b") || cleaned.includes("bn") || cleaned.includes("billion")) {
    const num = parseFloat(cleaned.replace(/[a-z]/g, ""));
    return Number.isFinite(num) ? num : null;
  }
  if (cleaned.includes("m") || cleaned.includes("mn") || cleaned.includes("million")) {
    const num = parseFloat(cleaned.replace(/[a-z]/g, ""));
    return Number.isFinite(num) ? num / 1000 : null;
  }
  const num = parseFloat(cleaned);
  if (!Number.isFinite(num)) return null;
  return num > 1000 ? num / 1000 : num;
}

export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function dedupeEntries(
  entries: Array<{ name: string; netWorthBillions: number }>
): Array<{ name: string; netWorthBillions: number }> {
  const seen = new Set<string>();
  const deduped: Array<{ name: string; netWorthBillions: number }> = [];
  for (const entry of entries) {
    const key = entry.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!entry.name || seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }
  return deduped;
}

export function buildPayload(
  entries: Array<{ name: string; netWorthBillions: number }>,
  dataAsOf: string
): { dataAsOf: string; entries: Array<{ name: string; netWorthBillions: number }> } {
  return {
    dataAsOf,
    entries: entries.map((e) => ({ name: e.name, netWorthBillions: e.netWorthBillions })),
  };
}
