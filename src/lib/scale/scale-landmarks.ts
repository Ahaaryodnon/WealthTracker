import type { BillionaireEntry } from "@/data/billionaires.types";
import type { ComparisonItem } from "@/lib/locale";
import { MILLION, BILLION, TRILLION } from "@/lib/scale/scale-math";
import type {
  Landmark,
  LandmarkCategory,
  ScaleLandmarkSeed,
} from "@/lib/scale/scale-landmark-types";

// Re-export so existing importers (ScaleTrack, ScaleMinimap, ScaleJourney) keep working.
export type { Landmark, LandmarkCategory, ScaleLandmarkSeed };

export interface AssembleOptions {
  entries: BillionaireEntry[];
  /** readonly so `locale.comparisons` (a readonly array) can be passed directly. */
  comparisons: readonly ComparisonItem[];
  /** Locale-specific landmark seeds (readonly so `locale.scaleLandmarks` passes directly). */
  scaleLandmarks?: readonly ScaleLandmarkSeed[];
  /** How many of the richest entries to plant as landmarks. Default 1. */
  topBillionaires?: number;
}

const AMOUNT_LANDMARKS: Landmark[] = [
  { id: "amount-million", label: "One million", dollars: MILLION, category: "amount" },
  { id: "amount-billion", label: "One billion", dollars: BILLION, category: "amount" },
  { id: "amount-trillion", label: "One trillion", dollars: TRILLION, category: "amount" },
];

// Locale comparison ids we surface near the start of the journey.
const EVERYDAY_FROM_COMPARISONS: string[] = ["medianSalary", "averageHomePrice"];

/** lowercase, runs of non-alphanumerics -> single dash, trimmed. */
function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Build the full, sorted landmark list from the dataset + active locale.
 * Pure: pass in entries (netWorth in BILLIONS), locale comparisons, and the
 * locale's scale landmark seeds. The caller chooses which billionaire `entries`
 * to pass (global dataset vs a regional list) — this function is source-agnostic.
 */
export function assembleLandmarks(opts: AssembleOptions): Landmark[] {
  const { entries, comparisons, scaleLandmarks = [], topBillionaires = 1 } = opts;

  const everydayFromLocale: Landmark[] = EVERYDAY_FROM_COMPARISONS.flatMap((id) => {
    const c = comparisons.find((x) => x.id === id);
    if (!c || typeof c.value !== "number") return [];
    return [{ id: `everyday-${id}`, label: c.label, dollars: c.value, category: "everyday" as const }];
  });

  const seedLandmarks: Landmark[] = scaleLandmarks.map((s, i) => ({
    id: `seed-${i}-${slug(s.label)}`,
    label: s.label,
    dollars: s.dollars,
    category: s.category,
    source: s.source,
  }));

  const billionaires: Landmark[] = [...entries]
    .filter((e) => typeof e.netWorth === "number" && (e.netWorth as number) > 0)
    .sort((a, b) => (b.netWorth as number) - (a.netWorth as number))
    .slice(0, Math.max(0, topBillionaires))
    .map((e, i) => ({
      id: `billionaire-${i}-${e.slug}`,
      label: e.name,
      dollars: (e.netWorth as number) * BILLION,
      category: "billionaire" as const,
      source: e.source,
    }));

  return [
    ...AMOUNT_LANDMARKS,
    ...everydayFromLocale,
    ...seedLandmarks,
    ...billionaires,
  ].sort((a, b) => a.dollars - b.dollars);
}

/** End of the track: comfortably past the largest landmark, and always past a trillion. */
export function trackEndDollars(landmarks: Landmark[]): number {
  const maxLandmark = landmarks.reduce((m, l) => Math.max(m, l.dollars), 0);
  return Math.max(maxLandmark * 1.08, TRILLION * 1.2);
}
