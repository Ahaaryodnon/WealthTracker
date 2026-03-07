/**
 * Canonical data model for WealthTracker.
 * Shared by app, pipeline, and sync. convex/schema.ts (Story 1.2) should mirror
 * these field names and concepts for a single source of truth.
 * All field names camelCase; dates ISO 8601 strings.
 */

/** Single billionaire entry. Per-source net worth when multiple sources (e.g. Forbes, Bloomberg). */
export interface BillionaireEntry {
  name: string;
  /** Computed or primary net worth when using a single source. */
  netWorth?: number;
  /** Forbes-reported net worth; null when unavailable. */
  forbesNetWorth?: number | null;
  /** Bloomberg-reported net worth; null when unavailable. */
  bloombergNetWorth?: number | null;
  /** Other identifiers as needed (e.g. source IDs). */
  id?: string;
}

/** Metadata for the canonical dataset: data-as-of date and comparison baseline. */
export interface WealthTrackerMetadata {
  /** ISO 8601 date string (e.g. "2026-03-07"). */
  dataAsOf: string;
  /** Comparison baseline for methodology and relatable comparison (e.g. median salary). */
  medianSalary: number;
}

/** Full canonical dataset shape. App and sync step import this; pipeline validates and writes to Convex then sync writes src/data/ using this shape. */
export interface WealthTrackerData {
  dataAsOf: string;
  medianSalary: number;
  entries: BillionaireEntry[];
}
