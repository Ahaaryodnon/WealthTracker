# Scale Landmarks Expansion — Locale-Aware Inequality Data Points

**Date:** 2026-06-21
**Status:** Approved design, pending spec review
**Builds on:** `docs/superpowers/specs/2026-06-21-scale-page-design.md` (the `/scale` page)
**Data source:** `wealth-shown-to-scale.html` (user-supplied US + UK research, compiled June 2026)

## Purpose

The `/scale` page currently has a sparse set of landmarks (everyday items under
~$2M, the three amount flags, the top billionaire, and a few world figures).
This expansion adds a dense, well-sourced set of **locale-aware** data points so
the journey constantly passes something meaningful — and so it tells the
inequality story the site is named for (tiny "end homelessness" flags sitting in
the dust beside giant wealth-concentration flags).

The supplied data is explicitly split by country (US figures in USD, UK figures
in GBP), which maps directly onto the page's existing locale system
(`en-US` / `en-GB`). Landmarks therefore become **locale-driven**: the US set
shows under the US/USD locale, the UK set under the UK/GBP locale, each plotted
against the `$1M/$1B/$1T` (or `£1M/£1B/£1T`) flags.

## Categories

Final `LandmarkCategory` set (drops the previously-considered `luxury`/`company`,
for which there is no data; adds `wealth` and `publicgood`):

| category | meaning | track color |
|---|---|---|
| `amount` | the $1M/$1B/$1T reference flags | accent (blue) |
| `everyday` | incomes, salaries, household wealth, lifetime earnings, CEO pay | emerald |
| `billionaire` | individual people (US: from dataset; UK: from Rich List) | amber |
| `wealth` | concentration totals (Forbes 400, Rich List 350, top-50, etc.) | rose |
| `publicgood` | what a fraction could fund (homelessness, NHS, school meals…) | cyan |
| `world` | national budgets, GDP, large company market cap | zinc/gray |

All Tailwind classes used (`text-emerald-600`, `text-amber-600`, `text-rose-600`,
`text-cyan-700`, `text-zinc-500`, `text-accent`) already exist in the project.

## Data Model

### New shared types — `src/lib/scale/scale-landmark-types.ts` (new file)

To avoid a circular import (`scale-landmarks.ts` imports `ComparisonItem` from
`@/lib/locale`, and the locale packs need the landmark types), the landmark
types move to a dependency-free module that both sides import:

```ts
export type LandmarkCategory =
  | "amount" | "everyday" | "billionaire" | "wealth" | "publicgood" | "world";

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
```

`scale-landmarks.ts` re-exports `LandmarkCategory`/`Landmark` from here (so
existing importers are unaffected) and consumes `ScaleLandmarkSeed`.

### Locale config — `src/lib/locale/types.ts`

Add one field to `LocaleConfig`:

```ts
  /** Scale-page landmarks specific to this locale (nominal amounts in its currency). */
  scaleLandmarks: readonly ScaleLandmarkSeed[];
  /** How many dataset billionaires to plant on the scale (US: 3; UK: 0 — uses Rich List seeds instead). */
  scaleTopBillionaires: number;
```

`ScaleLandmarkSeed` is imported from `@/lib/scale/scale-landmark-types`.

### Assembly — `src/lib/scale/scale-landmarks.ts`

`assembleLandmarks` gains the seed list; it merges (and continues to sort
ascending by dollars, with collision-proof ids):

```ts
export interface AssembleOptions {
  entries: BillionaireEntry[];
  comparisons: readonly ComparisonItem[];
  scaleLandmarks?: readonly ScaleLandmarkSeed[];
  topBillionaires?: number;
}
```

Order of merge: amount flags + locale comparisons (existing salary/home) +
locale `scaleLandmarks` (seeds) + dataset billionaires (top N) → sorted ascending.
Seed ids are generated as `seed-${i}-${slug(label)}` (slug = lowercase,
non-alphanumerics → `-`); billionaire ids keep the existing
`billionaire-${i}-${slug}` form. The old hardcoded `EVERYDAY_STATIC` and
`WORLD_STATIC` arrays are **removed** — their content is superseded by the richer
locale lists below (Apple/US-GDP are retained inside the US list).

### Orchestrator — `src/components/scale/ScaleJourney.tsx`

Passes the active locale's data through:

```ts
assembleLandmarks({
  entries,
  comparisons: locale.comparisons,
  scaleLandmarks: locale.scaleLandmarks,
  topBillionaires: locale.scaleTopBillionaires,
});
```

`useMemo` dependency becomes `[entries, locale]` (already is).

## The Landmark Data

Values are nominal amounts in the locale's currency (no FX conversion — a
million is a million), consistent with the existing scale-page convention. Every
item carries a `source`. Locale comparison items (`medianSalary`,
`averageHomePrice`) continue to appear automatically and are not duplicated here.

### US — `src/lib/locale/packs/en-US.ts` `scaleLandmarks` (USD)

| label | dollars | category | source |
|---|---|---|---|
| US poverty line (family of 4) | 31_812 | everyday | US Census 2024 |
| Median US household income | 83_730 | everyday | US Census 2024 |
| Lifetime earnings (median worker) | 3_767_850 | everyday | 45 yrs × median |
| S&P 500 CEO average pay | 16_300_000 | everyday | AFL-CIO 2024 |
| End homelessness in America | 9_600_000_000 | publicgood | Nat. Alliance to End Homelessness 2025 |
| Eliminate all US medical debt | 220_000_000_000 | publicgood | — |
| Free public college (1 year) | 79_000_000_000 | publicgood | — |
| Lift every American out of poverty | 170_000_000_000 | publicgood | one-time transfer |
| $10,000 to every US household | 400_000_000_000 | publicgood | 131M households |
| Forbes 400 entry threshold | 3_800_000_000 | wealth | Forbes 400 2025 |
| Musk's wealth growth in one year | 184_000_000_000 | wealth | 2024–25 |
| Apple market cap | 3_500_000_000_000 | world | retained |
| US annual healthcare spending | 4_900_000_000_000 | world | 2024 |
| Forbes 400 combined wealth | 6_600_000_000_000 | wealth | Forbes 400 2025 |
| US annual GDP | 29_200_000_000_000 | world | retained |

`scaleTopBillionaires: 3` → the three richest from the dataset (currently Musk
~$1.24T, Page, Brin) are also planted, populating the $200B–$1.2T range.

### UK — `src/lib/locale/packs/en-GB.ts` `scaleLandmarks` (GBP)

| label | dollars | category | source |
|---|---|---|---|
| NHS Band 5 nurse salary | 33_487 | everyday | 2024 |
| Median UK household income | 36_700 | everyday | ONS FYE2024 (disposable) |
| Median UK household wealth | 293_700 | everyday | ONS 2020–22 |
| Lifetime earnings (median worker) | 1_570_000 | everyday | 45 yrs × median |
| FTSE 100 CEO median pay | 4_400_000 | everyday | High Pay Centre 2024 |
| Top 1% average wealth (per person) | 5_300_000 | wealth | Resolution Foundation 2024 |
| Universal free school meals (England) | 2_500_000_000 | publicgood | Hansard 2024 |
| Scrap the two-child benefit cap | 3_000_000_000 | publicgood | CPAG 2023 |
| Build 90,000 social homes a year | 10_000_000_000 | publicgood | Shelter 2024 |
| Bukhman brothers | 12_540_000_000 | billionaire | Sunday Times Rich List 2025 |
| Sir Jim Ratcliffe | 17_050_000_000 | billionaire | Sunday Times Rich List 2025 |
| Sir James Dyson & family | 20_800_000_000 | billionaire | Sunday Times Rich List 2025 |
| David & Simon Reuben | 26_870_000_000 | billionaire | Sunday Times Rich List 2025 |
| Hinduja family (UK's richest) | 35_300_000_000 | billionaire | Sunday Times Rich List 2025 |
| Annual cost of UK child poverty | 39_000_000_000 | publicgood | CPAG 2023 |
| UK top-10 billionaires combined | 205_000_000_000 | wealth | Rich List 2025 |
| NHS annual budget | 242_000_000_000 | world | 2024/25 |
| Top 50 UK families' wealth | 466_000_000_000 | wealth | Equality Trust 2025 |
| UK Rich List 350 combined | 772_800_000_000 | wealth | Sunday Times Rich List 2025 |

`scaleTopBillionaires: 0` → no dataset billionaires under the UK locale (the
global dataset is mostly American; UK billionaires come from the seeds above).

## Rendering Changes

### Track colors — `src/components/scale/ScaleTrack.tsx`
Add `wealth: "text-rose-600"` and `publicgood: "text-cyan-700"` to
`CATEGORY_COLOR` (the `Record<LandmarkCategory, string>` already enforces
exhaustiveness, so the compiler requires both).

### Track de-clutter (vertical label staggering) — `ScaleTrack.tsx`
With a dense set, low-end items (everything under ~$1M) can fall within the same
~$833k viewport window and overlap. The fix: stagger label vertical offset by the
index within the `visible` array (which is already sorted ascending by dollars),
alternating two heights so neighbours don't collide. Positioning math (`x`) is
unchanged — only the label's vertical offset alternates. At high magnitudes
landmarks are far apart and never share a window, so staggering is invisible
there.

### Minimap — unchanged
Still renders only the three `amount` ticks + camera marker; immune to landmark
density. `trackEndDollars` remains dynamic (US end ≈ $31.5T via US GDP; UK end ≈
£1.2T via the TRILLION×1.2 floor, with the Rich List 350 at £772.8bn just before
the £1T flag).

## Testing

`src/lib/scale/scale-landmarks.test.ts` — extend:
- Seeds flow through: passing `scaleLandmarks` adds them with `seed-${i}-${slug}`
  ids, the correct `category`/`source`, and they sort into position by dollars.
- New categories accepted (`wealth`, `publicgood`).
- **All landmark ids are unique** across a fully-populated assembly (guards the
  dense additions and any duplicate labels).
- `scaleTopBillionaires: 0` plants no billionaires; `3` plants three.
- Existing tests (amount flags always present, ascending sort, billions→dollars,
  trackEnd floor) still hold.

No locale-pack unit tests exist; the assembly tests use fixture seeds. A build
(`npm run build`) plus the existing Playwright e2e confirm the page still renders
under the default locale.

## Out of Scope (YAGNI)

- FX conversion of figures (kept nominal, per the existing convention).
- Luxury/company categories (no data supplied).
- Minimap landmark rendering, per-category filtering UI, or a legend — the track
  colors are self-explanatory; revisit only if users ask.
- Changing the home page or other routes.

## Open Items for Spec Review
- Exact figures and labels are transcribed from `wealth-shown-to-scale.html`;
  adjust any during review.
- UK billionaire selection is a 5-person spread (£12.5bn → £35.3bn); add more
  from the Rich List if a denser upper-mid range is wanted.
- `scaleTopBillionaires` US = 3 is a knob; raise/lower freely.
