# Scale Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/scale` page that maps dollars to physical distance on a fixed-zoom horizontal axis so visitors can viscerally feel the 1,000× gaps between a million, a billion, and a trillion.

**Architecture:** A statically-exported Next.js route (`app/scale/page.tsx`) renders a client component (`ScaleJourney`) that owns a `requestAnimationFrame` "camera" travelling along a virtual axis. Only landmarks within the current viewport window are rendered (virtualization), positioned via a pure `dollars → x` function. Pure data/math modules live in `src/lib/scale/` and are unit-tested with the repo's `tsx --test` runner; the interactive surface is covered by a Playwright e2e test.

**Tech Stack:** Next.js 16 (App Router, static export), React 19, Tailwind CSS v4, TypeScript, `tsx --test` (Node test runner) for unit tests, Playwright for e2e.

## Global Constraints

- Static export only — no server runtime, no data fetching at request time. The route must be a client-enhanced static page.
- Money display MUST use `formatCurrency` / `formatCompact` from `@/lib/format-currency` and respect the active locale via `useLocale()` from `@/contexts/LocaleContext`. `LocaleProvider` already wraps all routes in `src/app/layout.tsx`. **The context value is `{ localeId, locale, setLocaleId }`** — there is no pre-built format-options object. Build it the same way `ContextStrip` does: `const { locale } = useLocale(); const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };`. Locale comparison data is `locale.comparisons` (a `readonly ComparisonItem[]`).
- Net worth values in `src/data/billionaires.ts` are stored in **billions**; multiply by `BILLION` (1e9) to get dollars.
- Honor `prefers-reduced-motion`: no auto-animation when set.
- Provide a `<noscript>` static fallback, mirroring the pattern in `src/app/page.tsx`.
- Use `@/` path aliases for imports (resolves in app build AND in `tsx --test`).
- Tailwind design tokens already in the codebase: `bg-accent`, `text-accent`, `section-kicker`, `numeric`. Reuse them; do not invent a new palette.
- Follow existing import style (`@/...`), camelCase names, and ISO date strings.

---

## File Structure

**Create:**
- `src/lib/scale/scale-math.ts` — pure constants + `dollars → x` + log-scrubber helpers.
- `src/lib/scale/scale-math.test.ts` — unit tests for the above.
- `src/lib/scale/scale-landmarks.ts` — pure landmark assembly from data + locale.
- `src/lib/scale/scale-landmarks.test.ts` — unit tests for the above.
- `src/components/scale/ScaleControls.tsx` — presentational playback controls.
- `src/components/scale/ScaleMinimap.tsx` — presentational full-track overview.
- `src/components/scale/ScaleTrack.tsx` — presentational windowed axis of visible landmarks.
- `src/components/scale/ScaleJourney.tsx` — stateful orchestrator (camera, rAF, composition).
- `src/app/scale/page.tsx` — route shell, metadata, `<noscript>` fallback.
- `tests/e2e/scale.spec.ts` — Playwright coverage.

**Modify:**
- `src/components/sections/ContextStrip.tsx` — add a CTA link to `/scale`.
- `src/app/billionaires/page.tsx` — add a link to `/scale`.
- `package.json` — extend `test:unit` to include the new unit tests.

---

### Task 1: Scale math primitives (pure)

**Files:**
- Create: `src/lib/scale/scale-math.ts`
- Test: `src/lib/scale/scale-math.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `MILLION = 1_000_000`, `BILLION = 1_000_000_000`, `TRILLION = 1_000_000_000_000` (numbers).
  - `dollarsToX(dollars: number, pxPerDollar: number): number`
  - `dollarsToSliderFraction(dollars: number, maxDollars: number): number` → value in [0,1].
  - `sliderFractionToDollars(fraction: number, maxDollars: number): number`

- [ ] **Step 1: Write the failing test**

Create `src/lib/scale/scale-math.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  MILLION,
  BILLION,
  TRILLION,
  dollarsToX,
  dollarsToSliderFraction,
  sliderFractionToDollars,
} from "@/lib/scale/scale-math";

test("magnitude constants are 1000x apart", () => {
  assert.equal(MILLION, 1_000_000);
  assert.equal(BILLION, MILLION * 1000);
  assert.equal(TRILLION, BILLION * 1000);
});

test("dollarsToX scales linearly by pxPerDollar", () => {
  assert.equal(dollarsToX(1_000_000, 0.001), 1000);
  assert.equal(dollarsToX(0, 0.001), 0);
  // a billion is exactly 1000x the pixel distance of a million
  assert.equal(dollarsToX(BILLION, 1e-6) / dollarsToX(MILLION, 1e-6), 1000);
});

test("slider mapping is logarithmic and round-trips", () => {
  const max = TRILLION;
  // a million sits in the lower portion of a log slider over [$1, $1T]
  const fMillion = dollarsToSliderFraction(MILLION, max);
  const fBillion = dollarsToSliderFraction(BILLION, max);
  assert.ok(fMillion > 0 && fMillion < 1);
  assert.ok(fBillion > fMillion);
  assert.equal(dollarsToSliderFraction(TRILLION, max), 1);
  // round-trip within float tolerance
  const back = sliderFractionToDollars(fBillion, max);
  assert.ok(Math.abs(back - BILLION) / BILLION < 1e-9);
});

test("sliderFractionToDollars clamps out-of-range fractions", () => {
  assert.equal(sliderFractionToDollars(-1, TRILLION), 1);
  assert.equal(sliderFractionToDollars(2, TRILLION), TRILLION);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test src/lib/scale/scale-math.test.ts`
Expected: FAIL — cannot find module `@/lib/scale/scale-math`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/scale/scale-math.ts`:

```ts
/**
 * Pure math primitives for the Scale page. No DOM, no React — unit-tested in
 * isolation. The track is strictly linear (a fixed pixels-per-dollar zoom); the
 * slider helpers are a SEPARATE logarithmic navigation control so a user can
 * actually drag to a million/billion, which occupy a vanishing fraction of a
 * linear trillion-scale axis.
 */

export const MILLION = 1_000_000;
export const BILLION = 1_000_000_000;
export const TRILLION = 1_000_000_000_000;

/** Convert a dollar amount to an x pixel offset at a fixed pixels-per-dollar zoom. */
export function dollarsToX(dollars: number, pxPerDollar: number): number {
  return dollars * pxPerDollar;
}

/** Map a dollar amount to a [0,1] slider fraction on a log scale over [$1, maxDollars]. */
export function dollarsToSliderFraction(dollars: number, maxDollars: number): number {
  const d = Math.max(1, dollars);
  const max = Math.max(10, maxDollars);
  return Math.min(1, Math.log10(d) / Math.log10(max));
}

/** Inverse of dollarsToSliderFraction. Clamps fraction to [0,1]. */
export function sliderFractionToDollars(fraction: number, maxDollars: number): number {
  const f = Math.min(1, Math.max(0, fraction));
  const max = Math.max(10, maxDollars);
  return Math.pow(max, f);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test src/lib/scale/scale-math.test.ts`
Expected: PASS — `# pass 4`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/scale/scale-math.ts src/lib/scale/scale-math.test.ts
git commit -m "feat(scale): add pure scale math primitives"
```

---

### Task 2: Landmark assembly (pure)

**Files:**
- Create: `src/lib/scale/scale-landmarks.ts`
- Test: `src/lib/scale/scale-landmarks.test.ts`

**Interfaces:**
- Consumes: `BILLION`, `MILLION`, `TRILLION` from `@/lib/scale/scale-math`; `BillionaireEntry` from `@/data/billionaires.types`; `ComparisonItem` from `@/lib/locale`.
- Produces:
  - `type LandmarkCategory = "amount" | "everyday" | "billionaire" | "world"`
  - `interface Landmark { id: string; label: string; dollars: number; category: LandmarkCategory }`
  - `interface AssembleOptions { entries: BillionaireEntry[]; comparisons: readonly ComparisonItem[]; topBillionaires?: number }` (readonly so `locale.comparisons` can be passed directly).
  - `assembleLandmarks(opts: AssembleOptions): Landmark[]` — sorted ascending by `dollars`.
  - `trackEndDollars(landmarks: Landmark[]): number`

- [ ] **Step 1: Write the failing test**

Create `src/lib/scale/scale-landmarks.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import type { BillionaireEntry } from "@/data/billionaires.types";
import type { ComparisonItem } from "@/lib/locale";
import { BILLION, MILLION, TRILLION } from "@/lib/scale/scale-math";
import { assembleLandmarks, trackEndDollars } from "@/lib/scale/scale-landmarks";

const ENTRIES: BillionaireEntry[] = [
  { name: "Rich Person", slug: "rich-person", rank: 1, netWorth: 1239.18 },
  { name: "Second Person", slug: "second-person", rank: 2, netWorth: 300 },
];

const COMPARISONS: ComparisonItem[] = [
  { id: "medianSalary", label: "Median US salary", value: 59_384, source: "Census", effortLabel: "a year of work" },
  { id: "averageHomePrice", label: "Average US home price", value: 420_800, source: "NAR", effortLabel: "a home" },
];

test("always includes the three headline amounts", () => {
  const ls = assembleLandmarks({ entries: [], comparisons: [] });
  const amounts = ls.filter((l) => l.category === "amount").map((l) => l.dollars);
  assert.deepEqual(amounts.sort((a, b) => a - b), [MILLION, BILLION, TRILLION]);
});

test("maps locale comparisons to everyday landmarks", () => {
  const ls = assembleLandmarks({ entries: [], comparisons: COMPARISONS });
  const salary = ls.find((l) => l.id === "everyday-medianSalary");
  assert.ok(salary);
  assert.equal(salary?.dollars, 59_384);
  assert.equal(salary?.category, "everyday");
});

test("converts top billionaire net worth (billions) to dollars", () => {
  const ls = assembleLandmarks({ entries: ENTRIES, comparisons: [], topBillionaires: 1 });
  const bills = ls.filter((l) => l.category === "billionaire");
  assert.equal(bills.length, 1);
  assert.equal(bills[0].label, "Rich Person");
  assert.equal(bills[0].dollars, 1239.18 * BILLION);
});

test("respects topBillionaires count and sorts by net worth", () => {
  const ls = assembleLandmarks({ entries: ENTRIES, comparisons: [], topBillionaires: 2 });
  const bills = ls.filter((l) => l.category === "billionaire");
  assert.equal(bills.length, 2);
  // output is sorted ascending by dollars, so the richest selected billionaire is last
  assert.equal(bills[bills.length - 1].label, "Rich Person");
});

test("output is sorted ascending by dollars", () => {
  const ls = assembleLandmarks({ entries: ENTRIES, comparisons: COMPARISONS });
  for (let i = 1; i < ls.length; i++) {
    assert.ok(ls[i].dollars >= ls[i - 1].dollars);
  }
});

test("trackEnd covers the largest landmark and is at least past a trillion", () => {
  const ls = assembleLandmarks({ entries: ENTRIES, comparisons: COMPARISONS });
  const max = ls.reduce((m, l) => Math.max(m, l.dollars), 0);
  const end = trackEndDollars(ls);
  assert.ok(end >= max);
  assert.ok(end >= TRILLION * 1.2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test src/lib/scale/scale-landmarks.test.ts`
Expected: FAIL — cannot find module `@/lib/scale/scale-landmarks`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/scale/scale-landmarks.ts`:

```ts
import type { BillionaireEntry } from "@/data/billionaires.types";
import type { ComparisonItem } from "@/lib/locale";
import { MILLION, BILLION, TRILLION } from "@/lib/scale/scale-math";

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
  { id: "amount-million", label: "One million", dollars: MILLION, category: "amount" },
  { id: "amount-billion", label: "One billion", dollars: BILLION, category: "amount" },
  { id: "amount-trillion", label: "One trillion", dollars: TRILLION, category: "amount" },
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

// Locale comparison ids we surface near the start of the journey. The landmark
// label comes from the locale's own ComparisonItem.label (single source of truth).
const EVERYDAY_FROM_COMPARISONS: string[] = ["medianSalary", "averageHomePrice"];

/**
 * Build the full, sorted landmark list from the dataset + active locale.
 * Pure: pass in entries (netWorth in BILLIONS) and locale comparisons.
 */
export function assembleLandmarks(opts: AssembleOptions): Landmark[] {
  const { entries, comparisons, topBillionaires = 1 } = opts;

  const everydayFromLocale: Landmark[] = EVERYDAY_FROM_COMPARISONS.flatMap((id) => {
    const c = comparisons.find((x) => x.id === id);
    if (!c || typeof c.value !== "number") return [];
    return [{ id: `everyday-${id}`, label: c.label, dollars: c.value, category: "everyday" as const }];
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test src/lib/scale/scale-landmarks.test.ts`
Expected: PASS — `# pass 6`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/scale/scale-landmarks.ts src/lib/scale/scale-landmarks.test.ts
git commit -m "feat(scale): assemble landmarks from dataset and locale"
```

---

### Task 3: Playback controls (presentational)

**Files:**
- Create: `src/components/scale/ScaleControls.tsx`

**Interfaces:**
- Consumes: `dollarsToSliderFraction`, `sliderFractionToDollars` from `@/lib/scale/scale-math`.
- Produces: default export `ScaleControls` with this exact props contract (consumed by Task 6):

```ts
export type ScaleSpeed = "play" | "fast" | "warp";
export interface ScaleControlsProps {
  isPlaying: boolean;
  speed: ScaleSpeed;
  cameraDollars: number;
  trackEnd: number;
  onTogglePlay: () => void;
  onSetSpeed: (s: ScaleSpeed) => void;
  onSkipTo: (dollars: number) => void;
  onScrub: (dollars: number) => void;
}
```

- [ ] **Step 1: Write the implementation**

Create `src/components/scale/ScaleControls.tsx`:

```tsx
"use client";

import { MILLION, BILLION, TRILLION, dollarsToSliderFraction, sliderFractionToDollars } from "@/lib/scale/scale-math";

export type ScaleSpeed = "play" | "fast" | "warp";

export interface ScaleControlsProps {
  isPlaying: boolean;
  speed: ScaleSpeed;
  cameraDollars: number;
  trackEnd: number;
  onTogglePlay: () => void;
  onSetSpeed: (s: ScaleSpeed) => void;
  onSkipTo: (dollars: number) => void;
  onScrub: (dollars: number) => void;
}

const SPEEDS: { id: ScaleSpeed; label: string }[] = [
  { id: "play", label: "1×" },
  { id: "fast", label: "Fast" },
  { id: "warp", label: "Warp" },
];

const SKIPS: { label: string; dollars: number }[] = [
  { label: "Skip to $1M", dollars: MILLION },
  { label: "Skip to $1B", dollars: BILLION },
  { label: "Skip to $1T", dollars: TRILLION },
];

const SLIDER_STEPS = 1000;

/** Presentational playback controls. All state lives in the parent (ScaleJourney). */
export default function ScaleControls({
  isPlaying,
  speed,
  cameraDollars,
  trackEnd,
  onTogglePlay,
  onSetSpeed,
  onSkipTo,
  onScrub,
}: ScaleControlsProps) {
  const sliderValue = Math.round(dollarsToSliderFraction(cameraDollars, trackEnd) * SLIDER_STEPS);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-pressed={isPlaying}
          className="inline-flex h-11 min-w-[96px] items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-white shadow-md transition-colors hover:bg-accent-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <div className="inline-flex overflow-hidden rounded-full border border-zinc-200" role="group" aria-label="Travel speed">
          {SPEEDS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSetSpeed(s.id)}
              aria-pressed={speed === s.id}
              className={`h-11 px-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                speed === s.id ? "bg-accent text-white" : "bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {SKIPS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onSkipTo(s.dollars)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {s.label}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Jump anywhere (log scale)
        </span>
        <input
          type="range"
          min={0}
          max={SLIDER_STEPS}
          step={1}
          value={sliderValue}
          onChange={(e) => onScrub(sliderFractionToDollars(Number(e.target.value) / SLIDER_STEPS, trackEnd))}
          aria-label="Jump to position on the scale"
          className="w-full accent-accent"
        />
      </label>
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks and lints**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors referencing `ScaleControls.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/scale/ScaleControls.tsx
git commit -m "feat(scale): add playback controls component"
```

---

### Task 4: Minimap (presentational)

**Files:**
- Create: `src/components/scale/ScaleMinimap.tsx`

**Interfaces:**
- Consumes: `Landmark` type from `@/lib/scale/scale-landmarks`.
- Produces: default export `ScaleMinimap` with this exact props contract (consumed by Task 6):

```ts
export interface ScaleMinimapProps {
  landmarks: Landmark[];
  cameraDollars: number;
  trackEnd: number;
}
```

- [ ] **Step 1: Write the implementation**

Create `src/components/scale/ScaleMinimap.tsx`:

```tsx
"use client";

import type { Landmark } from "@/lib/scale/scale-landmarks";

export interface ScaleMinimapProps {
  landmarks: Landmark[];
  cameraDollars: number;
  trackEnd: number;
}

/**
 * Full $0 → trackEnd overview, drawn on a LINEAR scale so the honesty lands:
 * the million and billion flags cram almost exactly onto $0 next to a trillion.
 */
export default function ScaleMinimap({ landmarks, cameraDollars, trackEnd }: ScaleMinimapProps) {
  const pct = (d: number) => `${Math.min(100, Math.max(0, (d / trackEnd) * 100))}%`;
  const amounts = landmarks.filter((l) => l.category === "amount");

  return (
    <div className="w-full">
      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-400">
        Full scale ($0 → {Math.round(trackEnd / 1_000_000_000_000)}T+) — linear
      </p>
      <div className="relative h-8 w-full rounded-full bg-zinc-100" aria-hidden="true">
        {amounts.map((l) => (
          <span
            key={l.id}
            className="absolute top-0 h-8 w-px bg-accent/60"
            style={{ left: pct(l.dollars) }}
          />
        ))}
        {/* Camera position marker */}
        <span
          className="absolute top-[-2px] h-[36px] w-[3px] rounded-full bg-accent shadow"
          style={{ left: pct(cameraDollars) }}
        />
      </div>
      <p className="mt-1 text-[11px] text-zinc-500">
        The $1M and $1B marks sit almost on top of $0 — that gap is the whole point.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks and lints**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors referencing `ScaleMinimap.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/scale/ScaleMinimap.tsx
git commit -m "feat(scale): add linear full-track minimap"
```

---

### Task 5: Windowed track (presentational)

**Files:**
- Create: `src/components/scale/ScaleTrack.tsx`

**Interfaces:**
- Consumes: `Landmark` from `@/lib/scale/scale-landmarks`; `dollarsToX` from `@/lib/scale/scale-math`; `useLocale` from `@/contexts/LocaleContext`; `formatCompact` from `@/lib/format-currency`.
- Produces: default export `ScaleTrack` with this exact props contract (consumed by Task 6):

```ts
export interface ScaleTrackProps {
  landmarks: Landmark[];
  cameraDollars: number;   // dollar value at the horizontal CENTER of the viewport
  pxPerDollar: number;
  viewportWidth: number;   // measured px width of the track viewport
}
```

**Positioning math (must match exactly):** for a landmark at `dollars`, its on-screen x =
`(dollars - cameraDollars) * pxPerDollar + viewportWidth / 2`. Render only landmarks whose x is within `[-200, viewportWidth + 200]`.

- [ ] **Step 1: Write the implementation**

Create `src/components/scale/ScaleTrack.tsx`:

```tsx
"use client";

import type { Landmark } from "@/lib/scale/scale-landmarks";
import { dollarsToX } from "@/lib/scale/scale-math";
import { useLocale } from "@/contexts/LocaleContext";
import { formatCompact } from "@/lib/format-currency";

export interface ScaleTrackProps {
  landmarks: Landmark[];
  cameraDollars: number;
  pxPerDollar: number;
  viewportWidth: number;
}

const CATEGORY_COLOR: Record<Landmark["category"], string> = {
  amount: "text-accent",
  everyday: "text-emerald-600",
  billionaire: "text-amber-600",
  world: "text-zinc-500",
};

const RENDER_MARGIN = 200;

/** The visible window of the linear axis. Only landmarks near the camera are drawn. */
export default function ScaleTrack({ landmarks, cameraDollars, pxPerDollar, viewportWidth }: ScaleTrackProps) {
  const { locale } = useLocale();
  const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };
  const centerX = viewportWidth / 2;

  const visible = landmarks
    .map((l) => ({ l, x: dollarsToX(l.dollars - cameraDollars, pxPerDollar) + centerX }))
    .filter(({ x }) => x >= -RENDER_MARGIN && x <= viewportWidth + RENDER_MARGIN);

  return (
    <div className="relative h-64 w-full overflow-hidden border-y border-zinc-200 bg-gradient-to-b from-zinc-50 to-white">
      {/* center baseline */}
      <div className="absolute left-0 top-1/2 h-px w-full bg-zinc-200" aria-hidden="true" />

      {visible.map(({ l, x }) => {
        const isAmount = l.category === "amount";
        return (
          <div
            key={l.id}
            className="absolute top-0 flex h-full flex-col items-center"
            style={{ left: `${x}px`, transform: "translateX(-50%)" }}
          >
            <div className={`mt-6 max-w-[160px] text-center ${isAmount ? "font-semibold" : ""}`}>
              <p className={`text-sm ${CATEGORY_COLOR[l.category]}`}>{l.label}</p>
              <p className="numeric text-xs text-zinc-500">{formatCompact(l.dollars, formatOpts)}</p>
            </div>
            <div className={`mt-auto mb-0 h-1/2 w-px ${isAmount ? "bg-accent" : "bg-zinc-300"}`} />
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks and lints**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors referencing `ScaleTrack.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/scale/ScaleTrack.tsx
git commit -m "feat(scale): add virtualized windowed track"
```

---

### Task 6: Journey orchestrator (stateful)

**Files:**
- Create: `src/components/scale/ScaleJourney.tsx`

**Interfaces:**
- Consumes: `BillionaireEntry` from `@/data/billionaires.types`; `useLocale` from `@/contexts/LocaleContext`; `assembleLandmarks`, `trackEndDollars` from `@/lib/scale/scale-landmarks`; `formatCurrency` from `@/lib/format-currency`; `ScaleControls` (+ `ScaleSpeed`), `ScaleMinimap`, `ScaleTrack`.
- Produces: default export `ScaleJourney`:

```ts
export interface ScaleJourneyProps {
  entries: BillionaireEntry[];
}
```

**Behavior:**
- `pxPerDollar = 1.2e-3` constant (tunable; at this zoom $1M ≈ 1,200px — about one viewport — so the opening plays over several seconds).
- Base travel speed `BASE_PX_PER_SEC = 220`; multipliers `play: 1`, `fast: 80`, `warp: 4000`. Dollars/sec = `pxPerSec / pxPerDollar`.
- `cameraDollars` starts at `0`, advances via `requestAnimationFrame` while `isPlaying`, clamped to `trackEnd` (auto-pauses at end).
- `prefers-reduced-motion`: start paused; the rAF loop still applies single-step jumps from skip/scrub, but never auto-advances.
- Measure viewport width with a `ref` + `ResizeObserver`, default 0 until measured.

- [ ] **Step 1: Write the implementation**

Create `src/components/scale/ScaleJourney.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BillionaireEntry } from "@/data/billionaires.types";
import { useLocale } from "@/contexts/LocaleContext";
import { assembleLandmarks, trackEndDollars } from "@/lib/scale/scale-landmarks";
import { formatCurrency } from "@/lib/format-currency";
import ScaleControls, { type ScaleSpeed } from "@/components/scale/ScaleControls";
import ScaleMinimap from "@/components/scale/ScaleMinimap";
import ScaleTrack from "@/components/scale/ScaleTrack";

export interface ScaleJourneyProps {
  entries: BillionaireEntry[];
}

const PX_PER_DOLLAR = 1.2e-3;
const BASE_PX_PER_SEC = 220;
const SPEED_MULT: Record<ScaleSpeed, number> = { play: 1, fast: 80, warp: 4000 };

export default function ScaleJourney({ entries }: ScaleJourneyProps) {
  const { locale } = useLocale();
  const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };

  const landmarks = useMemo(
    () => assembleLandmarks({ entries, comparisons: locale.comparisons, topBillionaires: 1 }),
    [entries, locale]
  );
  const trackEnd = useMemo(() => trackEndDollars(landmarks), [landmarks]);

  const [cameraDollars, setCameraDollars] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<ScaleSpeed>("play");
  const [viewportWidth, setViewportWidth] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  // Mutable mirrors so the rAF loop reads fresh values without re-subscribing.
  const cameraRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef<ScaleSpeed>("play");
  // Mirror in an effect (not during render) to satisfy react-hooks/refs. No deps
  // array → runs after every render, keeping the refs current for the rAF loop.
  useEffect(() => {
    cameraRef.current = cameraDollars;
    playingRef.current = isPlaying;
    speedRef.current = speed;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => setViewportWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!isPlaying || reducedMotion) return;

    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const dollarsPerSec = (BASE_PX_PER_SEC * SPEED_MULT[speedRef.current]) / PX_PER_DOLLAR;
      const next = cameraRef.current + dollarsPerSec * dt;
      if (next >= trackEnd) {
        setCameraDollars(trackEnd);
        setIsPlaying(false);
        return;
      }
      setCameraDollars(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [isPlaying, reducedMotion, trackEnd]);

  const jumpTo = (dollars: number) => {
    setIsPlaying(false);
    setCameraDollars(Math.min(trackEnd, Math.max(0, dollars)));
  };

  return (
    <section
      id="scale-journey"
      aria-label="Million, billion, trillion scale journey"
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10"
    >
      <header className="text-center">
        <p className="section-kicker mb-2">Scale</p>
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
          A million, a billion, a trillion
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600">
          Each dollar is a fixed distance. Press play and watch how far a billion
          really is from a million — and how a trillion dwarfs them both.
        </p>
      </header>

      <div
        className="numeric text-center text-2xl font-semibold text-accent sm:text-3xl"
        role="status"
        aria-label="Current position on the scale"
      >
        {formatCurrency(Math.round(cameraDollars), formatOpts)}
      </div>

      <div ref={trackRef} className="w-full">
        <ScaleTrack
          landmarks={landmarks}
          cameraDollars={cameraDollars}
          pxPerDollar={PX_PER_DOLLAR}
          viewportWidth={viewportWidth}
        />
      </div>

      <ScaleMinimap landmarks={landmarks} cameraDollars={cameraDollars} trackEnd={trackEnd} />

      <ScaleControls
        isPlaying={isPlaying}
        speed={speed}
        cameraDollars={cameraDollars}
        trackEnd={trackEnd}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onSetSpeed={setSpeed}
        onSkipTo={jumpTo}
        onScrub={jumpTo}
      />

      {reducedMotion && (
        <p className="text-center text-xs text-zinc-500">
          Auto-travel is disabled because your system prefers reduced motion. Use the
          skip buttons and slider to explore.
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify it typechecks and lints**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev`, open `http://localhost:3000/scale` (route added next task — if not yet present, temporarily render `ScaleJourney` from the home page or skip to Task 7 then return). Confirm: header renders, Play advances the odometer, Skip buttons jump, slider scrubs.

- [ ] **Step 4: Commit**

```bash
git add src/components/scale/ScaleJourney.tsx
git commit -m "feat(scale): add journey orchestrator with rAF camera"
```

---

### Task 7: The `/scale` route

**Files:**
- Create: `src/app/scale/page.tsx`

**Interfaces:**
- Consumes: `wealthTrackerData` from `@/data/billionaires`; `ScaleJourney` from `@/components/scale/ScaleJourney`; `formatCurrency` from `@/lib/format-currency`.
- Produces: a static route at `/scale`.

- [ ] **Step 1: Write the implementation**

Create `src/app/scale/page.tsx`:

```tsx
import type { Metadata } from "next";
import { wealthTrackerData } from "@/data/billionaires";
import ScaleJourney from "@/components/scale/ScaleJourney";
import { formatCurrency } from "@/lib/format-currency";

export const metadata: Metadata = {
  title: "A Million vs a Billion vs a Trillion — The Inequality Calculator",
  description:
    "See the gap for yourself: each dollar is a fixed distance. A billion is 1,000× a million; a trillion is 1,000× a billion.",
  openGraph: {
    title: "A Million vs a Billion vs a Trillion",
    description:
      "Each dollar is a fixed distance. Travel the scale and feel how far a billion — and a trillion — really is.",
    url: "https://theinequalitycalculator.com/scale",
    siteName: "The Inequality Calculator",
  },
};

export default function ScalePage() {
  const { entries } = wealthTrackerData;
  const topNetWorth = entries.reduce((m, e) => Math.max(m, e.netWorth ?? 0), 0) * 1_000_000_000;

  return (
    <main className="min-h-screen bg-white">
      <noscript>
        <div className="px-4 py-16 text-center" style={{ fontFamily: "system-ui, sans-serif" }}>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-400">
            Scale (JavaScript disabled)
          </p>
          <p className="mb-4 text-zinc-700">
            A million is {formatCurrency(1_000_000)}. A billion is {formatCurrency(1_000_000_000)} —
            one thousand millions. A trillion is {formatCurrency(1_000_000_000_000)} — one thousand
            billions. The richest person today is worth about {formatCurrency(topNetWorth)}.
          </p>
          <p className="text-sm text-zinc-500">Enable JavaScript to travel the scale interactively.</p>
        </div>
      </noscript>
      <ScaleJourney entries={entries} />
    </main>
  );
}
```

- [ ] **Step 2: Verify it builds (static export)**

Run: `npm run build`
Expected: build succeeds and output lists `/scale` as a statically generated route.

- [ ] **Step 3: Commit**

```bash
git add src/app/scale/page.tsx
git commit -m "feat(scale): add /scale route with metadata and noscript fallback"
```

---

### Task 8: Entry-point links

**Files:**
- Modify: `src/components/sections/ContextStrip.tsx`
- Modify: `src/app/billionaires/page.tsx`

**Interfaces:**
- Consumes: Next.js `Link` from `next/link`.
- Produces: visible navigation to `/scale` from the home Scale section and the billionaires page.

- [ ] **Step 1: Add the CTA in ContextStrip**

`src/components/sections/ContextStrip.tsx` is a `"use client"` component rendering `<section id="scale">…</section>`; it does NOT currently import `Link`. Its final content block is the `<div className="grid grid-cols-1 gap-4 sm:grid-cols-3 …">…</div>` cards grid, immediately followed by `</section>`.

First, add the import alongside the existing imports at the top:

```tsx
import Link from "next/link";
```

Then insert this block between the closing `</div>` of the cards grid and the `</section>` tag (match the existing 6-space indentation):

```tsx
      <div className="mt-10 text-center">
        <Link
          href="/scale"
          className="inline-flex h-11 items-center justify-center rounded-full border border-accent px-6 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          See how big a trillion really is →
        </Link>
      </div>
```

- [ ] **Step 2: Add a link on the billionaires page**

`src/app/billionaires/page.tsx` is a server component that ALREADY imports `Link from "next/link"` (do not duplicate). It has a `<header className="mb-8">` containing an `<h1>` and a `<p>`. Insert this link as the last child of that `<header>`, after the `<p>…</p>` and before `</header>`:

```tsx
        <Link
          href="/scale"
          className="mt-3 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          New: see a million vs a billion vs a trillion →
        </Link>
```

- [ ] **Step 3: Verify it builds and lints**

Run: `npm run lint && npm run build`
Expected: no errors; both `/` and `/billionaires` still build.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/ContextStrip.tsx src/app/billionaires/page.tsx
git commit -m "feat(scale): link to /scale from home and billionaires pages"
```

---

### Task 9: E2E coverage + unit-test wiring

**Files:**
- Create: `tests/e2e/scale.spec.ts`
- Modify: `package.json` (`test:unit` script)

**Interfaces:**
- Consumes: Playwright `test`/`expect`; the running dev server (configured in `playwright.config.ts`).
- Produces: e2e verification of the `/scale` page, and a `test:unit` script that runs all scale unit tests.

- [ ] **Step 1: Extend the unit-test script**

In `package.json`, replace the `test:unit` line:

```json
    "test:unit": "tsx --test scripts/update-data.test.ts",
```

with:

```json
    "test:unit": "tsx --test scripts/update-data.test.ts src/lib/scale/scale-math.test.ts src/lib/scale/scale-landmarks.test.ts",
```

- [ ] **Step 2: Run the unit suite to confirm wiring**

Run: `npm run test:unit`
Expected: all tests pass across the three files (`# fail 0`).

- [ ] **Step 3: Write the e2e test**

Create `tests/e2e/scale.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Scale page", () => {
  test("renders the journey with heading and controls", async ({ page }) => {
    await page.goto("/scale");

    await expect(
      page.getByRole("region", { name: "Million, billion, trillion scale journey" })
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: "A million, a billion, a trillion" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip to $1B" })).toBeVisible();
  });

  test("odometer advances when playing", async ({ page }) => {
    await page.goto("/scale");

    const odometer = page.getByRole("status", { name: "Current position on the scale" });
    await expect(odometer).toBeVisible();
    const before = await odometer.textContent();

    await page.getByRole("button", { name: "Play" }).click();
    // Web-first assertion: retries until the odometer text changes (no fixed sleep).
    await expect(odometer).not.toHaveText(before ?? "");
    // Pause to freeze the value for comparison.
    await page.getByRole("button", { name: "Pause" }).click();
    const after = await odometer.textContent();

    expect(after).not.toEqual(before);
  });

  test("skip to $1B jumps the odometer into the billions", async ({ page }) => {
    await page.goto("/scale");
    await page.getByRole("button", { name: "Skip to $1B" }).click();
    const odometer = page.getByRole("status", { name: "Current position on the scale" });
    await expect(odometer).toContainText("B");
  });

  test("home page links to the scale page", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: "See how big a trillion really is →" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/scale\/?$/);
  });
});
```

> **NOTE for implementer:** `formatCurrency` renders billions in compact notation (e.g. `$1B`), so the "Skip to $1B" assertion checks for `"B"`. If the active default locale renders differently, adjust the expectation to match the real compact output — verify by running the test.

- [ ] **Step 4: Run the e2e suite**

Run: `npm run test`
Expected: the Scale page tests pass (Playwright starts the dev server automatically per `playwright.config.ts`).

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/scale.spec.ts package.json
git commit -m "test(scale): add e2e coverage and wire scale unit tests"
```

---

## Final Verification

- [ ] `npm run test:unit` — all unit tests pass.
- [ ] `npm run test` — all e2e tests pass.
- [ ] `npm run lint` — clean.
- [ ] `npm run build` — static export succeeds with `/scale` listed.
- [ ] Manual: `/scale` plays, skips, scrubs; `/` and `/billionaires` link to it; reduced-motion disables auto-travel.

## Notes & Known Simplifications

- This page is about the abstract magnitudes 1,000,000 / 1,000,000,000 / 1,000,000,000,000 — the *zeros*, not the exchange rate. Landmark `dollars` are therefore treated as **nominal amounts displayed in the active currency symbol** and are NOT multiplied by `locale.exchangeRateFromUsd`. Converting "one million" to £790k would destroy the framing. (This deliberately differs from `ContextStrip`, which converts real benchmark values.) Locale `comparisons` values are used as-is from the active pack; mixing a GBP median-salary landmark with USD-nominal world figures is an accepted minor inconsistency.
- `PX_PER_DOLLAR`, `BASE_PX_PER_SEC`, and speed multipliers are tuning constants; the *proportions* between landmarks are never altered (strict linear scale), preserving honesty. Adjust the constants if the opening pacing feels too fast or slow.
- `topBillionaires` is set to 1 (the single richest). Bump to 3 in `ScaleJourney` if the extra flags stay visually uncluttered. (Billionaire landmark ids include the array index — `billionaire-${i}-${slug}` — so duplicate slugs cannot collide React keys when this is raised.)
- Under `prefers-reduced-motion` the camera anchors to the `$1M` flag on mount (there is no travel), so a reduced-motion user lands on a meaningful frame; the minimap, odometer, skip buttons, and scrubber carry the rest.
