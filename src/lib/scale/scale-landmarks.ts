import type { BillionaireEntry } from "@/data/billionaires.types";
import type { ComparisonItem } from "@/lib/locale";
import { BILLION, TRILLION } from "@/lib/scale/scale-math";

export type LandmarkCategory = "amount" | "everyday" | "billionaire" | "world";

export interface Landmark {
  id: string;
  label: string;
  dollars: number;
  category: LandmarkCategory;
}

export interface AssembleOptions {
  entries: BillionaireEntry[];
  /** readonly so `locale.comparisons` (a readonly array) can be passed directly. */
  comparisons: readonly ComparisonItem[];
  /** How many of the richest entries to plant as landmarks. Default 1. */
  topBillionaires?: number;
}

const AMOUNT_LANDMARKS: Landmark[] = [
  { id: "amount-million", label: "One million", dollars: 1_000_000, category: "amount" },
  { id: "amount-billion", label: "One billion", dollars: 1_000_000_000, category: "amount" },
  { id: "amount-trillion", label: "One trillion", dollars: 1_000_000_000_000, category: "amount" },
];

// Everyday figures that aren't locale-specific in our data.
const EVERYDAY_STATIC: Landmark[] = [
  { id: "everyday-lifetime", label: "Avg lifetime earnings (one worker)", dollars: 2_300_000, category: "everyday" },
  { id: "everyday-jackpot", label: "Record US lottery jackpot (2022)", dollars: 2_040_000_000, category: "everyday" },
];

// Large real-world reference points past a trillion, for context at the far end.
const WORLD_STATIC: Landmark[] = [
  { id: "world-apple", label: "Apple market cap", dollars: 3_500_000_000_000, category: "world" },
  { id: "world-us-budget", label: "US annual federal budget", dollars: 6_750_000_000_000, category: "world" },
  { id: "world-us-gdp", label: "US annual GDP", dollars: 29_200_000_000_000, category: "world" },
];

// Locale comparison ids we surface near the start of the journey.
const EVERYDAY_FROM_COMPARISONS: { id: string; label: string }[] = [
  { id: "medianSalary", label: "Median salary" },
  { id: "averageHomePrice", label: "Median home price" },
];

/**
 * Build the full, sorted landmark list from the dataset + active locale.
 * Pure: pass in entries (netWorth in BILLIONS) and locale comparisons.
 */
export function assembleLandmarks(opts: AssembleOptions): Landmark[] {
  const { entries, comparisons, topBillionaires = 1 } = opts;

  const everydayFromLocale: Landmark[] = EVERYDAY_FROM_COMPARISONS.flatMap((m) => {
    const c = comparisons.find((x) => x.id === m.id);
    if (!c || typeof c.value !== "number") return [];
    return [{ id: `everyday-${m.id}`, label: m.label, dollars: c.value, category: "everyday" as const }];
  });

  const billionaires: Landmark[] = [...entries]
    .filter((e) => typeof e.netWorth === "number" && (e.netWorth as number) > 0)
    .sort((a, b) => (b.netWorth as number) - (a.netWorth as number))
    .slice(0, Math.max(0, topBillionaires))
    .map((e) => ({
      id: `billionaire-${e.slug}`,
      label: e.name,
      dollars: (e.netWorth as number) * BILLION,
      category: "billionaire" as const,
    }));

  return [
    ...AMOUNT_LANDMARKS,
    ...everydayFromLocale,
    ...EVERYDAY_STATIC,
    ...billionaires,
    ...WORLD_STATIC,
  ].sort((a, b) => a.dollars - b.dollars);
}

/** End of the track: comfortably past the largest landmark, and always past a trillion. */
export function trackEndDollars(landmarks: Landmark[]): number {
  const maxLandmark = landmarks.reduce((m, l) => Math.max(m, l.dollars), 0);
  return Math.max(maxLandmark * 1.08, TRILLION * 1.2);
}
