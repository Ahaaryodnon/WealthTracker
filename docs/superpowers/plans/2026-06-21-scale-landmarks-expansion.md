# Scale Landmarks Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Densely populate the `/scale` page with locale-aware, well-sourced data points (incomes, billionaires, wealth-concentration totals, and "what could it fund" public-good costs), drawn from the user's US + UK research.

**Architecture:** Landmark types move to a dependency-free module so the locale packs can author landmark seeds without a circular import. `assembleLandmarks` gains a `scaleLandmarks` seed input and stays generic about its billionaire source. The locale packs (`en-US.ts`/`en-GB.ts`) carry their own landmark sets; `ScaleJourney` selects the billionaire source per locale (US → global dataset; UK → a new hand-maintained `src/data/uk-billionaires.ts`). `ScaleTrack` gains two category colors and vertical label staggering for the dense low end.

**Tech Stack:** Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind v4, `tsx --test` for unit tests, Playwright for e2e.

## Global Constraints

- Values are **nominal amounts in the locale's currency** (no FX conversion — a million is a million), consistent with the existing scale-page convention.
- Use `@/` path aliases for imports (resolves in app build AND `tsx --test`).
- Net worth in `BillionaireEntry.netWorth` is in **billions**; landmark dollars = `netWorth × 1e9`.
- Categories: `LandmarkCategory = "amount" | "everyday" | "billionaire" | "wealth" | "publicgood" | "world"`. Track colors: amount→`text-accent`, everyday→`text-emerald-600`, billionaire→`text-amber-600`, wealth→`text-rose-600`, publicgood→`text-cyan-700`, world→`text-zinc-500` (all existing Tailwind classes).
- `next build` does NOT run eslint; the repo has a pre-existing baseline of 15 lint problems in OTHER files (`useCountUp.ts`, `worker.js`, `SectionNav.tsx`, etc.) — do not fix them. New code must add zero NEW lint issues and keep `npx tsc --noEmit` clean.
- camelCase; follow existing repo patterns.
- The `/scale` route and its 4 Playwright e2e tests already exist and pass under the default (en-US) locale; they must continue to pass.

---

## File Structure

**Create:**
- `src/lib/scale/scale-landmark-types.ts` — dependency-free landmark types (`LandmarkCategory`, `Landmark`, `ScaleLandmarkSeed`).
- `src/data/uk-billionaires.ts` — hand-maintained UK Rich List billionaires (outside the Forbes pipeline).
- `src/data/uk-billionaires.test.ts` — guard test for the UK file.

**Modify:**
- `src/lib/scale/scale-landmarks.ts` — re-export types from the new module; add `scaleLandmarks` seed input + `source` propagation; remove the old `EVERYDAY_STATIC`/`WORLD_STATIC` arrays.
- `src/lib/scale/scale-landmarks.test.ts` — add seed/category/unique-id/source tests.
- `src/components/scale/ScaleTrack.tsx` — add `wealth`/`publicgood` colors (required by the exhaustive `Record`); stagger labels vertically.
- `src/lib/locale/types.ts` — add `scaleLandmarks` + `scaleTopBillionaires` to `LocaleConfig`.
- `src/lib/locale/packs/en-US.ts` — US landmark set + `scaleTopBillionaires: 3`.
- `src/lib/locale/packs/en-GB.ts` — UK landmark set + `scaleTopBillionaires: 5`.
- `src/components/scale/ScaleJourney.tsx` — select billionaire source per locale; pass `scaleLandmarks` + `scaleTopBillionaires`.
- `package.json` — add `uk-billionaires.test.ts` to `test:unit`.

---

### Task 1: Landmark types, assembly seeds, and ScaleTrack rendering

**Files:**
- Create: `src/lib/scale/scale-landmark-types.ts`
- Modify: `src/lib/scale/scale-landmarks.ts`
- Modify: `src/components/scale/ScaleTrack.tsx`
- Test: `src/lib/scale/scale-landmarks.test.ts`

**Interfaces:**
- Consumes: `MILLION`, `BILLION`, `TRILLION` from `@/lib/scale/scale-math`; `ComparisonItem` from `@/lib/locale`; `BillionaireEntry` from `@/data/billionaires.types`.
- Produces:
  - `scale-landmark-types.ts`: `type LandmarkCategory` (6 members); `interface Landmark { id, label, dollars, category, source? }`; `interface ScaleLandmarkSeed { label, dollars, category, source? }`.
  - `scale-landmarks.ts` re-exports `Landmark`, `LandmarkCategory`, `ScaleLandmarkSeed`; `AssembleOptions` gains `scaleLandmarks?: readonly ScaleLandmarkSeed[]`; `assembleLandmarks` and `trackEndDollars` keep their signatures.

- [ ] **Step 1: Write the new shared types module**

Create `src/lib/scale/scale-landmark-types.ts`:

```ts
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
```

- [ ] **Step 2: Write the failing tests**

Append these tests to `src/lib/scale/scale-landmarks.test.ts` (the file already defines `ENTRIES` and `COMPARISONS` fixtures and imports `assembleLandmarks`/`trackEndDollars`). Add a `ScaleLandmarkSeed` import to the existing imports at the top:

```ts
import type { ScaleLandmarkSeed } from "@/lib/scale/scale-landmarks";
```

Then append:

```ts
const SEEDS: ScaleLandmarkSeed[] = [
  { label: "End homelessness", dollars: 9_600_000_000, category: "publicgood", source: "NAEH 2025" },
  { label: "Forbes 400 combined", dollars: 6_600_000_000_000, category: "wealth" },
];

test("scaleLandmarks seeds flow through with slug ids, category, and source", () => {
  const ls = assembleLandmarks({ entries: [], comparisons: [], scaleLandmarks: SEEDS });
  const hl = ls.find((l) => l.label === "End homelessness");
  assert.ok(hl);
  assert.equal(hl?.id, "seed-0-end-homelessness");
  assert.equal(hl?.category, "publicgood");
  assert.equal(hl?.source, "NAEH 2025");
  const fb = ls.find((l) => l.label === "Forbes 400 combined");
  assert.equal(fb?.category, "wealth");
  assert.equal(fb?.dollars, 6_600_000_000_000);
  assert.equal(fb?.source, undefined);
});

test("all landmark ids are unique in a fully-populated assembly", () => {
  const ls = assembleLandmarks({
    entries: ENTRIES,
    comparisons: COMPARISONS,
    scaleLandmarks: SEEDS,
    topBillionaires: 2,
  });
  const ids = ls.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("billionaire landmarks carry their entry source", () => {
  const withSource = [
    { name: "Rich Person", slug: "rich-person", netWorth: 100, source: "Test List" },
  ];
  const ls = assembleLandmarks({ entries: withSource, comparisons: [], topBillionaires: 1 });
  const b = ls.find((l) => l.category === "billionaire");
  assert.equal(b?.source, "Test List");
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx tsx --test src/lib/scale/scale-landmarks.test.ts`
Expected: FAIL — `scaleLandmarks` not accepted / seeds not present / `source` undefined on billionaire.

- [ ] **Step 4: Rewrite `scale-landmarks.ts`**

Replace the entire contents of `src/lib/scale/scale-landmarks.ts` with:

```ts
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
```

(The old `EVERYDAY_STATIC` and `WORLD_STATIC` arrays are gone — their content moves into the US locale pack in Task 3.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx tsx --test src/lib/scale/scale-landmarks.test.ts`
Expected: PASS — all tests (existing + 3 new) pass, `# fail 0`.

- [ ] **Step 6: Update `ScaleTrack.tsx` — colors (required) + label staggering**

In `src/components/scale/ScaleTrack.tsx`:

(a) Replace the `CATEGORY_COLOR` constant (the exhaustive `Record` now requires all six categories):

```tsx
const CATEGORY_COLOR: Record<Landmark["category"], string> = {
  amount: "text-accent",
  everyday: "text-emerald-600",
  billionaire: "text-amber-600",
  wealth: "text-rose-600",
  publicgood: "text-cyan-700",
  world: "text-zinc-500",
};
```

(b) Stagger labels vertically so bunched low-end items don't overlap. Capture each landmark's STABLE index in the full `landmarks` array (so heights don't hop while panning) and use a 3-level cycle. Build `visible` with the index, then in the map replace the label `<div>`'s `mt-6` class with a computed inline `marginTop` and add a `source` tooltip:

```tsx
  const visible = landmarks
    .map((l, idx) => ({ l, idx, x: dollarsToX(l.dollars - cameraDollars, pxPerDollar) + centerX }))
    .filter(({ x }) => x >= -RENDER_MARGIN && x <= viewportWidth + RENDER_MARGIN);
```

```tsx
      {visible.map(({ l, idx, x }) => {
        const isAmount = l.category === "amount";
        const labelTop = [8, 52, 96][idx % 3]; // stable 3-level stagger (no hop on pan)
        return (
          <div
            key={l.id}
            className="absolute top-0 flex h-full flex-col items-center"
            style={{ left: `${x}px`, transform: "translateX(-50%)" }}
          >
            <div
              className={`max-w-[160px] text-center ${isAmount ? "font-semibold" : ""}`}
              style={{ marginTop: labelTop }}
            >
              <p className={`text-sm ${CATEGORY_COLOR[l.category]}`} title={l.source}>{l.label}</p>
              <p className="numeric text-xs text-zinc-500">{formatCompact(l.dollars, formatOpts)}</p>
            </div>
            <div className={`mt-auto mb-0 h-1/2 w-px ${isAmount ? "bg-accent" : "bg-zinc-300"}`} />
          </div>
        );
      })}
```

(Only the label's vertical offset and a `source` tooltip change; the `x` positioning math and the connector tick are untouched.)

- [ ] **Step 7: Verify types, lint, and build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: tsc clean; no NEW lint issues referencing `scale-landmarks.ts`, `scale-landmark-types.ts`, or `ScaleTrack.tsx` (pre-existing 15 unchanged); build succeeds with `/scale` static.

- [ ] **Step 8: Commit**

```bash
git add src/lib/scale/scale-landmark-types.ts src/lib/scale/scale-landmarks.ts src/lib/scale/scale-landmarks.test.ts src/components/scale/ScaleTrack.tsx
git commit -m "feat(scale): landmark seeds, source field, two new category colors, label staggering"
```

---

### Task 2: UK billionaires data file

**Files:**
- Create: `src/data/uk-billionaires.ts`
- Test: `src/data/uk-billionaires.test.ts`
- Modify: `package.json` (`test:unit` script)

**Interfaces:**
- Consumes: `BillionaireEntry` from `@/data/billionaires.types`.
- Produces: `ukBillionaires: BillionaireEntry[]` (10 entries, `netWorth` in £ billions, `citizenship: "United Kingdom"`).

- [ ] **Step 1: Write the failing test**

Create `src/data/uk-billionaires.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { ukBillionaires } from "@/data/uk-billionaires";

test("uk-billionaires has 10 entries with unique slugs", () => {
  assert.equal(ukBillionaires.length, 10);
  const slugs = ukBillionaires.map((b) => b.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every UK billionaire has positive netWorth and UK citizenship", () => {
  for (const b of ukBillionaires) {
    assert.equal(typeof b.netWorth, "number");
    assert.ok((b.netWorth as number) > 0);
    assert.equal(b.citizenship, "United Kingdom");
  }
});

test("entries are in descending net-worth order (Hinduja first)", () => {
  assert.equal(ukBillionaires[0].name, "Hinduja family");
  for (let i = 1; i < ukBillionaires.length; i++) {
    assert.ok((ukBillionaires[i - 1].netWorth as number) >= (ukBillionaires[i].netWorth as number));
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test src/data/uk-billionaires.test.ts`
Expected: FAIL — cannot find module `@/data/uk-billionaires`.

- [ ] **Step 3: Create the data file**

Create `src/data/uk-billionaires.ts`:

```ts
import type { BillionaireEntry } from "@/data/billionaires.types";

/**
 * UK billionaires from the Sunday Times Rich List 2025. netWorth in GBP billions.
 * Hand-maintained and intentionally OUTSIDE the Forbes pipeline (which rebuilds
 * src/data/billionaires.ts as the global top ~10). The scale page pulls these
 * under the en-GB locale.
 */
export const ukBillionaires: BillionaireEntry[] = [
  { name: "Hinduja family", slug: "hinduja-family", netWorth: 35.3, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "David & Simon Reuben", slug: "reuben-brothers", netWorth: 26.87, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Sir Leonard Blavatnik", slug: "leonard-blavatnik", netWorth: 25.73, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Sir James Dyson & family", slug: "james-dyson", netWorth: 20.8, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Idan Ofer", slug: "idan-ofer", netWorth: 20.12, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Weston family", slug: "weston-family", netWorth: 17.75, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Sir Jim Ratcliffe", slug: "jim-ratcliffe", netWorth: 17.05, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Lakshmi Mittal & family", slug: "lakshmi-mittal", netWorth: 15.44, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "John Fredriksen & family", slug: "john-fredriksen", netWorth: 13.68, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Bukhman brothers", slug: "bukhman-brothers", netWorth: 12.54, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test src/data/uk-billionaires.test.ts`
Expected: PASS — `# pass 3`, `# fail 0`.

- [ ] **Step 5: Wire the test into `test:unit`**

In `package.json`, replace the `test:unit` line:

```json
    "test:unit": "tsx --test scripts/update-data.test.ts src/lib/scale/scale-math.test.ts src/lib/scale/scale-landmarks.test.ts",
```

with:

```json
    "test:unit": "tsx --test scripts/update-data.test.ts src/lib/scale/scale-math.test.ts src/lib/scale/scale-landmarks.test.ts src/data/uk-billionaires.test.ts",
```

- [ ] **Step 6: Run the full unit suite**

Run: `npm run test:unit`
Expected: all tests pass across all four files (`# fail 0`).

- [ ] **Step 7: Commit**

```bash
git add src/data/uk-billionaires.ts src/data/uk-billionaires.test.ts package.json
git commit -m "feat(data): add hand-maintained UK Rich List billionaires + test"
```

---

### Task 3: Locale config fields + US & UK landmark data

**Files:**
- Modify: `src/lib/locale/types.ts`
- Modify: `src/lib/locale/packs/en-US.ts`
- Modify: `src/lib/locale/packs/en-GB.ts`

**Interfaces:**
- Consumes: `ScaleLandmarkSeed` from `@/lib/scale/scale-landmark-types`.
- Produces: `LocaleConfig` gains `scaleLandmarks: readonly ScaleLandmarkSeed[]` and `scaleTopBillionaires: number`; both packs populate them.

> Do all three edits in this one task: adding the two required fields to `LocaleConfig` makes the build fail until BOTH packs provide them.

- [ ] **Step 1: Add the fields to `LocaleConfig`**

In `src/lib/locale/types.ts`, add an import at the top (the file currently has no imports):

```ts
import type { ScaleLandmarkSeed } from "@/lib/scale/scale-landmark-types";
```

Then add these two fields to the `LocaleConfig` interface, immediately after the `salaryPresets: readonly SalaryPreset[];` line:

```ts
  /** Scale-page landmarks specific to this locale (nominal amounts in its currency). */
  scaleLandmarks: readonly ScaleLandmarkSeed[];
  /** How many billionaires to plant on the scale, from this locale's source (US: 3 from the global dataset; UK: 5 from src/data/uk-billionaires.ts). */
  scaleTopBillionaires: number;
```

- [ ] **Step 2: Populate the US pack**

In `src/lib/locale/packs/en-US.ts`, add these two properties immediately before the closing `};` of the `enUS` object (after the `salaryPresets` array):

```ts
  scaleTopBillionaires: 3,
  scaleLandmarks: [
    { label: "US poverty line (family of 4)", dollars: 31_812, category: "everyday", source: "US Census 2024" },
    { label: "Median US household income", dollars: 83_730, category: "everyday", source: "US Census 2024" },
    { label: "Lifetime earnings (median worker)", dollars: 3_767_850, category: "everyday", source: "45 yrs x median" },
    { label: "S&P 500 CEO average pay", dollars: 16_300_000, category: "everyday", source: "AFL-CIO 2024" },
    { label: "End homelessness in America", dollars: 9_600_000_000, category: "publicgood", source: "Nat. Alliance to End Homelessness 2025" },
    { label: "Free public college (1 year)", dollars: 79_000_000_000, category: "publicgood" },
    { label: "Lift every American out of poverty", dollars: 170_000_000_000, category: "publicgood", source: "one-time transfer" },
    { label: "Eliminate all US medical debt", dollars: 220_000_000_000, category: "publicgood" },
    { label: "$10,000 to every US household", dollars: 400_000_000_000, category: "publicgood", source: "131M households" },
    { label: "Forbes 400 entry threshold", dollars: 3_800_000_000, category: "wealth", source: "Forbes 400 2025" },
    { label: "Musk's wealth growth in one year", dollars: 184_000_000_000, category: "wealth", source: "2024-25" },
    { label: "Apple market cap", dollars: 3_500_000_000_000, category: "world", source: "2024" },
    { label: "US annual healthcare spending", dollars: 4_900_000_000_000, category: "world", source: "2024" },
    { label: "Forbes 400 combined wealth", dollars: 6_600_000_000_000, category: "wealth", source: "Forbes 400 2025" },
    { label: "US annual GDP", dollars: 29_200_000_000_000, category: "world", source: "2024" },
  ],
```

- [ ] **Step 3: Populate the UK pack**

In `src/lib/locale/packs/en-GB.ts`, add these two properties immediately before the closing `};` of the `enGB` object (after the `salaryPresets` array):

```ts
  scaleTopBillionaires: 5,
  scaleLandmarks: [
    { label: "NHS Band 5 nurse salary", dollars: 33_487, category: "everyday", source: "2024" },
    { label: "Median UK household income", dollars: 36_700, category: "everyday", source: "ONS FYE2024" },
    { label: "Median UK household wealth", dollars: 293_700, category: "everyday", source: "ONS 2020-22" },
    { label: "Lifetime earnings (median worker)", dollars: 1_570_000, category: "everyday", source: "45 yrs x median" },
    { label: "FTSE 100 CEO median pay", dollars: 4_400_000, category: "everyday", source: "High Pay Centre 2024" },
    { label: "Top 1% average wealth (per person)", dollars: 5_300_000, category: "wealth", source: "Resolution Foundation 2024" },
    { label: "Universal free school meals (England)", dollars: 2_500_000_000, category: "publicgood", source: "Hansard 2024" },
    { label: "Scrap the two-child benefit cap", dollars: 3_000_000_000, category: "publicgood", source: "CPAG 2023" },
    { label: "Build 90,000 social homes a year", dollars: 10_000_000_000, category: "publicgood", source: "Shelter 2024" },
    { label: "Annual cost of UK child poverty", dollars: 39_000_000_000, category: "publicgood", source: "CPAG 2023" },
    { label: "UK top-10 billionaires combined", dollars: 205_000_000_000, category: "wealth", source: "Rich List 2025" },
    { label: "NHS annual budget", dollars: 242_000_000_000, category: "world", source: "2024/25" },
    { label: "Top 50 UK families' wealth", dollars: 466_000_000_000, category: "wealth", source: "Equality Trust 2025" },
    { label: "UK Rich List 350 combined", dollars: 772_800_000_000, category: "wealth", source: "Sunday Times Rich List 2025" },
  ],
```

- [ ] **Step 4: Verify types and build**

Run: `npx tsc --noEmit && npm run build`
Expected: tsc clean (both packs satisfy the new required fields); build succeeds with `/scale` static.

- [ ] **Step 5: Commit**

```bash
git add src/lib/locale/types.ts src/lib/locale/packs/en-US.ts src/lib/locale/packs/en-GB.ts
git commit -m "feat(scale): locale-aware landmark data for US and UK"
```

---

### Task 4: Wire ScaleJourney to locale data

**Files:**
- Modify: `src/components/scale/ScaleJourney.tsx`

**Interfaces:**
- Consumes: `ukBillionaires` from `@/data/uk-billionaires`; `assembleLandmarks` (now accepts `scaleLandmarks`); `locale.scaleLandmarks` / `locale.scaleTopBillionaires` / `locale.id` from `useLocale()`.
- Produces: the page renders the active locale's full landmark set.

- [ ] **Step 1: Add the import**

In `src/components/scale/ScaleJourney.tsx`, add this import alongside the other `@/` imports near the top:

```tsx
import { ukBillionaires } from "@/data/uk-billionaires";
```

- [ ] **Step 2: Select the billionaire source per locale and pass the new options**

Replace the existing `landmarks` memo:

```tsx
  const landmarks = useMemo(
    () => assembleLandmarks({ entries, comparisons: locale.comparisons, topBillionaires: 1 }),
    [entries, locale]
  );
```

with:

```tsx
  // UK uses the hand-maintained Rich List; every other locale uses the global dataset.
  const billionaireEntries = locale.id === "en-GB" ? ukBillionaires : entries;
  const landmarks = useMemo(
    () =>
      assembleLandmarks({
        entries: billionaireEntries,
        comparisons: locale.comparisons,
        scaleLandmarks: locale.scaleLandmarks,
        topBillionaires: locale.scaleTopBillionaires,
      }),
    [billionaireEntries, locale]
  );
```

- [ ] **Step 3: Verify types, lint, and build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: tsc clean; no NEW lint issues referencing `ScaleJourney.tsx` (pre-existing 15 unchanged — note `ScaleJourney.tsx` already has one tolerated `set-state-in-effect` at the reduced-motion line; the count must not rise above 15); build succeeds with `/scale` static.

- [ ] **Step 4: Run the Scale e2e suite**

Run: `npx playwright test tests/e2e/scale.spec.ts`
Expected: 4/4 Scale tests pass. (The default locale is en-US, so the page now renders the US landmark set plus the top 3 dataset billionaires; the existing selectors — region, heading, Play/Pause, Skip to $1B, odometer status, home-page link — are unchanged.) If Playwright browsers aren't installed, run `npx playwright install chromium` first. Pre-existing failures in `wealthtracker.spec.ts` are not in scope.

- [ ] **Step 5: Commit**

```bash
git add src/components/scale/ScaleJourney.tsx
git commit -m "feat(scale): render locale-aware landmarks; UK pulls Rich List billionaires"
```

---

## Final Verification

- [ ] `npm run test:unit` — all unit tests pass (update-data, scale-math, scale-landmarks, uk-billionaires).
- [ ] `npx playwright test tests/e2e/scale.spec.ts` — 4/4 Scale e2e pass.
- [ ] `npx tsc --noEmit` — clean.
- [ ] `npm run build` — static export succeeds with `/scale` listed.
- [ ] Manual (optional): `npm run dev`, open `/scale`, Play through — confirm the journey passes many more landmarks; switch the locale toggle (bottom-right) to UK and confirm £-denominated UK landmarks + UK billionaires appear.

## Notes

- US scale end ≈ $31.5T (US GDP $29.2T × 1.08); UK scale end ≈ £1.2T (the TRILLION×1.2 floor, with the Rich List 350 at £772.8bn just before the £1T flag). Both via the unchanged `trackEndDollars`.
- All figures are nominal in the active currency (no FX), consistent with the existing convention. Sources are transcribed from `wealth-shown-to-scale.html`.
- `scaleTopBillionaires` (US 3 / UK 5) and the UK file's 10 entries are tuning knobs; adjust freely.
