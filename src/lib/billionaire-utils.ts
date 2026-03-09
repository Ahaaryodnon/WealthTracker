import { wealthTrackerData } from "@/data/billionaires";
import type { BillionaireEntry } from "@/data/billionaires.types";

/** Top 10 entries for the homepage accumulator. */
export const top10Entries = wealthTrackerData.entries.slice(0, 10);

/** All entries. */
export const allEntries = wealthTrackerData.entries;

/** Look up a billionaire by slug. Returns undefined if not found. */
export function findBySlug(slug: string): BillionaireEntry | undefined {
  return wealthTrackerData.entries.find((e) => e.slug === slug);
}

/** Get the effective net worth in billions. */
export function getNetWorth(entry: BillionaireEntry): number {
  return entry.netWorth ?? entry.forbesNetWorth ?? entry.bloombergNetWorth ?? 0;
}

/** Get unique industries across all entries. */
export function getAllIndustries(): string[] {
  const set = new Set<string>();
  for (const entry of wealthTrackerData.entries) {
    if (entry.industries) {
      for (const ind of entry.industries) set.add(ind);
    }
  }
  return Array.from(set).sort();
}

/** Get unique countries across all entries. */
export function getAllCountries(): string[] {
  const set = new Set<string>();
  for (const entry of wealthTrackerData.entries) {
    if (entry.citizenship) set.add(entry.citizenship);
  }
  return Array.from(set).sort();
}
