/**
 * Shared, dependency-free landmark types for the scale page. Kept apart from
 * scale-landmarks.ts so the locale packs can author landmark seeds
 * (LocaleConfig.scaleLandmarks) without a circular import — scale-landmarks.ts
 * imports ComparisonItem from @/lib/locale, which would otherwise cycle.
 */

export type LandmarkCategory =
  | "amount"
  | "everyday"
  | "billionaire"
  | "wealth"
  | "publicgood"
  | "world";

export interface Landmark {
  id: string;
  label: string;
  dollars: number;
  category: LandmarkCategory;
  source?: string;
}

/** A landmark as authored in a locale pack (no id — assembled later). */
export interface ScaleLandmarkSeed {
  label: string;
  dollars: number;
  category: LandmarkCategory;
  source?: string;
}
