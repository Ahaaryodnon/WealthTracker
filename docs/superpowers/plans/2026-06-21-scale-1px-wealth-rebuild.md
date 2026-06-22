# Scale "1 Pixel Wealth" Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/scale` so every value is a filled bar from $0; you travel right and bars terminate one by one, so the screen visibly empties from many bars to a few — magnitude shown, not counted.

**Architecture:** Reuse the existing landmark data layer unchanged. Add a pure `scale-scroll` helper (partition into bars vs "& beyond", per-bar state at a travel position). Build four new client components — `WealthBars` (rows of bars-from-zero), `WealthOverview` (log seek strip), `WealthControls` (auto-travel + jumps), and `WealthScale` (orchestrator: travel position, wheel/drag, rAF auto-travel, reduced-motion). Swap the route to render `WealthScale`, delete the retired camera-travel components, and rewrite the e2e.

**Tech Stack:** Next.js 16 (App Router, static export), React 19, Tailwind v4, TypeScript, `tsx --test`, Playwright.

## Global Constraints

- Reuse the data layer unchanged: `Landmark { id, label, dollars, category, source? }` (categories `amount|everyday|billionaire|wealth|publicgood|world`), `assembleLandmarks`, the locale `scaleLandmarks`/`scaleTopBillionaires`, and `src/data/uk-billionaires.ts`. UK billionaire source is selected by `locale.id === "en-GB"`.
- Values are nominal in the active currency (no FX). `netWorth` is in billions (×1e9 → dollars) — but the data layer already handles that; this plan works in dollars.
- `@/` path aliases; `"use client"` on every interactive component; camelCase.
- `prefers-reduced-motion`: no auto-travel; manual wheel/drag/overview-seek still work. Live-update the preference via a `change` listener.
- The rAF auto-travel reads fresh state via refs **mirrored in an effect, not during render** (React `react-hooks/refs` rule).
- `next build` does NOT run eslint; the repo baseline is 15 pre-existing lint problems in OTHER files — do not fix them. New code adds zero NEW lint; `npx tsc --noEmit` stays clean.
- Tailwind tokens used must already exist: `bg-accent`/`text-accent`, `bg-emerald-500`/`text-emerald-700`, `bg-amber-500`/`text-amber-700`, `bg-rose-500`/`text-rose-700`, `bg-cyan-600`/`text-cyan-700`, `bg-zinc-400`/`text-zinc-600`, plus `numeric`, `section-kicker`.
- Accessibility hooks the e2e relies on (define exactly): region `aria-label="Wealth to scale"`; heading text `"Wealth, to scale"`; odometer `role="status"` `aria-label="Current position"`; each bar row `data-testid="wealth-bar"` with `data-state` ∈ `ended|ending|running`; control buttons labelled `Play`/`Pause`, `Fast`, `Warp`, `Skip to $1M`, `Skip to $1B`, `Next bar end`; overview `role="slider"` `aria-label="Overview — seek position"`.

---

## File Structure

**Create:**
- `src/lib/scale/scale-scroll.ts` — pure: `PX_PER_DOLLAR`, `partitionLandmarks`, `barStateAt`, `terminusX`, `nextBarEnd`.
- `src/lib/scale/scale-scroll.test.ts` — unit tests.
- `src/components/scale/WealthBars.tsx` — bar rows (presentational).
- `src/components/scale/WealthOverview.tsx` — log seek strip (presentational).
- `src/components/scale/WealthControls.tsx` — controls (presentational).
- `src/components/scale/WealthScale.tsx` — orchestrator (stateful).

**Modify:**
- `src/lib/locale/types.ts` — add `scaleScrollMaxDollars: number` to `LocaleConfig`.
- `src/lib/locale/packs/en-US.ts` / `en-GB.ts` — set it (US `7_000_000_000_000`, UK `1_050_000_000_000`).
- `src/app/scale/page.tsx` — render `WealthScale`; update `<noscript>` copy.
- `package.json` — add `scale-scroll.test.ts` to `test:unit`.
- `tests/e2e/scale.spec.ts` — rewrite for the new UI.

**Delete (cutover):**
- `src/components/scale/ScaleJourney.tsx`, `ScaleTrack.tsx`, `ScaleMinimap.tsx`, `ScaleControls.tsx`.

---

### Task 1: Pure scroll helpers

**Files:**
- Create: `src/lib/scale/scale-scroll.ts`
- Test: `src/lib/scale/scale-scroll.test.ts`

**Interfaces:**
- Consumes: `Landmark` from `@/lib/scale/scale-landmark-types`; `dollarsToX` from `@/lib/scale/scale-math`.
- Produces: `PX_PER_DOLLAR` (number); `type BarState = "ended" | "ending" | "running"`; `partitionLandmarks(landmarks, ceilingDollars) => { bars: Landmark[]; beyond: Landmark[] }`; `barStateAt(valueDollars, posDollars, viewportDollars) => BarState`; `terminusX(valueDollars, posDollars, pxPerDollar) => number`; `nextBarEnd(landmarks, posDollars) => number | null`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/scale/scale-scroll.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import type { Landmark } from "@/lib/scale/scale-landmark-types";
import {
  PX_PER_DOLLAR,
  partitionLandmarks,
  barStateAt,
  terminusX,
  nextBarEnd,
} from "@/lib/scale/scale-scroll";

const L = (id: string, dollars: number): Landmark => ({ id, label: id, dollars, category: "wealth" });
const LANDMARKS = [L("a", 1_000), L("b", 1_000_000), L("c", 1_000_000_000), L("d", 50_000_000_000)];

test("PX_PER_DOLLAR is a positive zoom constant", () => {
  assert.ok(PX_PER_DOLLAR > 0);
});

test("partitionLandmarks splits at the ceiling (inclusive in bars)", () => {
  const { bars, beyond } = partitionLandmarks(LANDMARKS, 1_000_000_000);
  assert.deepEqual(bars.map((l) => l.id), ["a", "b", "c"]);
  assert.deepEqual(beyond.map((l) => l.id), ["d"]);
});

test("partitionLandmarks with a huge ceiling puts everything in bars, beyond empty", () => {
  const { bars, beyond } = partitionLandmarks(LANDMARKS, 1e15);
  assert.equal(bars.length, 4);
  assert.equal(beyond.length, 0);
});

test("barStateAt: ended / ending / running at the boundaries", () => {
  // viewport window is [pos, pos + viewportDollars]
  assert.equal(barStateAt(500, 1_000, 10_000), "ended"); // value < pos
  assert.equal(barStateAt(5_000, 1_000, 10_000), "ending"); // pos <= value <= pos+vp
  assert.equal(barStateAt(50_000, 1_000, 10_000), "running"); // value > pos+vp
  assert.equal(barStateAt(11_000, 1_000, 10_000), "ending"); // exactly at pos+vp
});

test("terminusX is the pixel offset of the value from the current position", () => {
  assert.equal(terminusX(2_000, 1_000, 0.001), 1); // (2000-1000)*0.001
  assert.equal(terminusX(1_000, 1_000, 0.001), 0);
});

test("nextBarEnd returns the smallest value strictly greater than pos, or null", () => {
  assert.equal(nextBarEnd(LANDMARKS, 0), 1_000);
  assert.equal(nextBarEnd(LANDMARKS, 1_000), 1_000_000);
  assert.equal(nextBarEnd(LANDMARKS, 50_000_000_000), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test src/lib/scale/scale-scroll.test.ts`
Expected: FAIL — cannot find module `@/lib/scale/scale-scroll`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/scale/scale-scroll.ts`:

```ts
/**
 * Pure helpers for the bars-from-zero "1 pixel wealth" scale. No DOM, no React.
 * Every value is a bar from $0; the viewport is a window [pos, pos+viewportDollars]
 * in dollar space at a fixed pixels-per-dollar zoom.
 */
import type { Landmark } from "@/lib/scale/scale-landmark-types";
import { dollarsToX } from "@/lib/scale/scale-math";

export const PX_PER_DOLLAR = 1e-4; // 1px = $10,000 (tunable)

export type BarState = "ended" | "ending" | "running";

/** Split into scrollable bars (value <= ceiling) and "& beyond" markers (value > ceiling). */
export function partitionLandmarks(
  landmarks: Landmark[],
  ceilingDollars: number,
): { bars: Landmark[]; beyond: Landmark[] } {
  const bars: Landmark[] = [];
  const beyond: Landmark[] = [];
  for (const l of landmarks) {
    if (l.dollars <= ceilingDollars) bars.push(l);
    else beyond.push(l);
  }
  return { bars, beyond };
}

/** Where a bar's end sits relative to the viewport window [pos, pos+viewportDollars]. */
export function barStateAt(
  valueDollars: number,
  posDollars: number,
  viewportDollars: number,
): BarState {
  if (valueDollars < posDollars) return "ended";
  if (valueDollars > posDollars + viewportDollars) return "running";
  return "ending";
}

/** On-screen x (px) of a bar's terminus given the current travel position. */
export function terminusX(valueDollars: number, posDollars: number, pxPerDollar: number): number {
  return dollarsToX(valueDollars - posDollars, pxPerDollar);
}

/** Smallest landmark value strictly greater than pos (for "jump to next bar-end"); null if none. */
export function nextBarEnd(landmarks: Landmark[], posDollars: number): number | null {
  let best: number | null = null;
  for (const l of landmarks) {
    if (l.dollars > posDollars && (best === null || l.dollars < best)) best = l.dollars;
  }
  return best;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test src/lib/scale/scale-scroll.test.ts`
Expected: PASS — `# pass 6`, `# fail 0`.

- [ ] **Step 5: Wire into `test:unit` and commit**

In `package.json`, append the new file to `test:unit` (currently ends with `... src/data/uk-billionaires.test.ts`):

```json
    "test:unit": "tsx --test scripts/update-data.test.ts src/lib/scale/scale-math.test.ts src/lib/scale/scale-landmarks.test.ts src/data/uk-billionaires.test.ts src/lib/scale/scale-scroll.test.ts",
```

Run `npm run test:unit` (all pass), then:

```bash
git add src/lib/scale/scale-scroll.ts src/lib/scale/scale-scroll.test.ts package.json
git commit -m "feat(scale): pure bars-from-zero scroll helpers"
```

---

### Task 2: Locale scroll ceiling

**Files:**
- Modify: `src/lib/locale/types.ts`
- Modify: `src/lib/locale/packs/en-US.ts`
- Modify: `src/lib/locale/packs/en-GB.ts`

**Interfaces:**
- Produces: `LocaleConfig.scaleScrollMaxDollars: number` (US `7_000_000_000_000`, UK `1_050_000_000_000`).

> One task: the required field breaks the build until both packs set it.

- [ ] **Step 1: Add the field**

In `src/lib/locale/types.ts`, add to the `LocaleConfig` interface immediately after the `scaleTopBillionaires: number;` line:

```ts
  /** The bars-from-zero travel spans $0 -> this ceiling (nominal, locale currency). Landmarks above it become "& beyond" jump markers. */
  scaleScrollMaxDollars: number;
```

- [ ] **Step 2: Set it in both packs**

In `src/lib/locale/packs/en-US.ts`, add immediately after the `scaleTopBillionaires: 3,` line:

```ts
  scaleScrollMaxDollars: 7_000_000_000_000,
```

In `src/lib/locale/packs/en-GB.ts`, add immediately after the `scaleTopBillionaires: 5,` line:

```ts
  scaleScrollMaxDollars: 1_050_000_000_000,
```

- [ ] **Step 3: Verify and commit**

Run: `npx tsc --noEmit` (clean — both packs satisfy the field).

```bash
git add src/lib/locale/types.ts src/lib/locale/packs/en-US.ts src/lib/locale/packs/en-GB.ts
git commit -m "feat(scale): per-locale scroll ceiling"
```

---

### Task 3: WealthBars (rows of bars-from-zero)

**Files:**
- Create: `src/components/scale/WealthBars.tsx`

**Interfaces:**
- Consumes: `Landmark` from `@/lib/scale/scale-landmark-types`; `barStateAt`, `terminusX` from `@/lib/scale/scale-scroll`; `useLocale`; `formatCompact`.
- Produces: default export `WealthBars`; `interface WealthBarsProps { bars: Landmark[]; posDollars: number; viewportDollars: number; pxPerDollar: number }`.

- [ ] **Step 1: Write the component**

Create `src/components/scale/WealthBars.tsx`:

```tsx
"use client";

import type { Landmark } from "@/lib/scale/scale-landmark-types";
import { barStateAt, terminusX } from "@/lib/scale/scale-scroll";
import { useLocale } from "@/contexts/LocaleContext";
import { formatCompact } from "@/lib/format-currency";

export interface WealthBarsProps {
  bars: Landmark[];
  posDollars: number;
  viewportDollars: number;
  pxPerDollar: number;
}

const BAR_BG: Record<Landmark["category"], string> = {
  amount: "bg-accent",
  everyday: "bg-emerald-500",
  billionaire: "bg-amber-500",
  wealth: "bg-rose-500",
  publicgood: "bg-cyan-600",
  world: "bg-zinc-400",
};
const END_TEXT: Record<Landmark["category"], string> = {
  amount: "text-accent",
  everyday: "text-emerald-700",
  billionaire: "text-amber-700",
  wealth: "text-rose-700",
  publicgood: "text-cyan-700",
  world: "text-zinc-600",
};

/**
 * Rows of bars from $0. Biggest fortune on top. Each row shows one of three
 * states at the current travel position: running (fills the row, label pinned
 * right), ending (bar stops mid-row with its end-label), ended (faint stub left).
 */
export default function WealthBars({ bars, posDollars, viewportDollars, pxPerDollar }: WealthBarsProps) {
  const { locale } = useLocale();
  const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };
  const rows = [...bars].sort((a, b) => b.dollars - a.dollars);

  return (
    <div className="flex flex-col gap-1">
      {rows.map((l) => {
        const state = barStateAt(l.dollars, posDollars, viewportDollars);
        const endX = Math.max(0, terminusX(l.dollars, posDollars, pxPerDollar));
        return (
          <div
            key={l.id}
            data-testid="wealth-bar"
            data-state={state}
            className="relative h-9 w-full overflow-hidden rounded-sm bg-zinc-50"
          >
            {state === "running" && (
              <>
                <div className={`absolute inset-0 ${BAR_BG[l.category]} opacity-80`} />
                <div className="absolute inset-y-0 right-3 flex items-center gap-2 text-xs" title={l.source}>
                  <span className="font-medium text-white">{l.label}</span>
                  <span className="numeric text-white/85">{formatCompact(l.dollars, formatOpts)} &rarr;</span>
                </div>
              </>
            )}
            {state === "ending" && (
              <>
                <div className={`absolute inset-y-0 left-0 ${BAR_BG[l.category]} opacity-80`} style={{ width: `${endX}px` }} />
                <div
                  className="absolute inset-y-0 flex items-center gap-2 whitespace-nowrap pl-2 text-xs"
                  style={{ left: `${endX}px` }}
                  title={l.source}
                >
                  <span className={`font-medium ${END_TEXT[l.category]}`}>{l.label}</span>
                  <span className="numeric text-zinc-500">{formatCompact(l.dollars, formatOpts)}</span>
                </div>
              </>
            )}
            {state === "ended" && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-zinc-300" title={l.source}>
                <span className="truncate">
                  {l.label} &middot; ended {formatCompact(l.dollars, formatOpts)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify and commit**

Run: `npx tsc --noEmit && npm run lint`
Expected: tsc clean; no NEW lint referencing `WealthBars.tsx`.

```bash
git add src/components/scale/WealthBars.tsx
git commit -m "feat(scale): WealthBars rows of bars-from-zero"
```

---

### Task 4: WealthOverview + WealthControls

**Files:**
- Create: `src/components/scale/WealthOverview.tsx`
- Create: `src/components/scale/WealthControls.tsx`

**Interfaces:**
- `WealthOverview`: `interface WealthOverviewProps { bars: Landmark[]; posDollars: number; maxDollars: number; onSeek: (dollars: number) => void }`.
- `WealthControls`: `type WealthSpeed = "play" | "fast" | "warp"`; `interface WealthControlsProps { isPlaying: boolean; speed: WealthSpeed; beyond: Landmark[]; onTogglePlay: () => void; onSetSpeed: (s: WealthSpeed) => void; onSkipTo: (dollars: number) => void; onNextBarEnd: () => void; onJumpTo: (dollars: number) => void }`.

- [ ] **Step 1: Write WealthOverview**

Create `src/components/scale/WealthOverview.tsx`:

```tsx
"use client";

import type { Landmark } from "@/lib/scale/scale-landmark-types";
import { dollarsToSliderFraction, sliderFractionToDollars } from "@/lib/scale/scale-math";
import { useLocale } from "@/contexts/LocaleContext";
import { formatCompact } from "@/lib/format-currency";

export interface WealthOverviewProps {
  bars: Landmark[];
  posDollars: number;
  maxDollars: number;
  onSeek: (dollars: number) => void;
}

/** Compact log-scaled overview of all bar-ends + a position marker; click/drag to seek. */
export default function WealthOverview({ bars, posDollars, maxDollars, onSeek }: WealthOverviewProps) {
  const pct = (d: number) => `${Math.min(100, Math.max(0, dollarsToSliderFraction(d, maxDollars) * 100))}%`;
  const seek = (clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const frac = (clientX - rect.left) / rect.width;
    onSeek(sliderFractionToDollars(frac, maxDollars));
  };
  const { locale } = useLocale();
  const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const frac = dollarsToSliderFraction(posDollars, maxDollars);
    const step = 0.02;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onSeek(sliderFractionToDollars(Math.min(1, frac + step), maxDollars));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onSeek(sliderFractionToDollars(Math.max(0, frac - step), maxDollars));
    } else if (e.key === "Home") {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSeek(maxDollars);
    }
  };
  return (
    <div
      className="relative h-6 w-full cursor-pointer rounded-full bg-zinc-100"
      role="slider"
      aria-label="Overview — seek position"
      aria-valuemin={0}
      aria-valuemax={Math.round(maxDollars)}
      aria-valuenow={Math.round(posDollars)}
      aria-valuetext={formatCompact(Math.round(posDollars), formatOpts)}
      tabIndex={0}
      onClick={(e) => seek(e.clientX, e.currentTarget)}
      onKeyDown={onKeyDown}
    >
      {bars.map((l) => (
        <span key={l.id} className="absolute top-1.5 h-3 w-px bg-zinc-400" style={{ left: pct(l.dollars) }} aria-hidden="true" />
      ))}
      <span
        className="absolute top-0 h-6 w-[3px] -translate-x-1/2 rounded bg-accent shadow"
        style={{ left: pct(posDollars) }}
        aria-hidden="true"
      />
    </div>
  );
}
```

- [ ] **Step 2: Write WealthControls**

Create `src/components/scale/WealthControls.tsx`:

```tsx
"use client";

import type { Landmark } from "@/lib/scale/scale-landmark-types";
import { MILLION, BILLION } from "@/lib/scale/scale-math";
import { formatCompact } from "@/lib/format-currency";
import { useLocale } from "@/contexts/LocaleContext";

export type WealthSpeed = "play" | "fast" | "warp";

export interface WealthControlsProps {
  isPlaying: boolean;
  speed: WealthSpeed;
  beyond: Landmark[];
  onTogglePlay: () => void;
  onSetSpeed: (s: WealthSpeed) => void;
  onSkipTo: (dollars: number) => void;
  onNextBarEnd: () => void;
  onJumpTo: (dollars: number) => void;
}

const SPEEDS: { id: WealthSpeed; label: string }[] = [
  { id: "play", label: "1×" },
  { id: "fast", label: "Fast" },
  { id: "warp", label: "Warp" },
];

const pill =
  "inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export default function WealthControls({
  isPlaying,
  speed,
  beyond,
  onTogglePlay,
  onSetSpeed,
  onSkipTo,
  onNextBarEnd,
  onJumpTo,
}: WealthControlsProps) {
  const { locale } = useLocale();
  const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };
  return (
    <div className="flex flex-col gap-3">
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
        <button type="button" className={pill} onClick={onNextBarEnd}>Next bar end</button>
        <button type="button" className={pill} onClick={() => onSkipTo(MILLION)}>Skip to $1M</button>
        <button type="button" className={pill} onClick={() => onSkipTo(BILLION)}>Skip to $1B</button>
        {beyond.map((l) => (
          <button key={l.id} type="button" className={pill} onClick={() => onJumpTo(l.dollars)}>
            {l.label} ({formatCompact(l.dollars, formatOpts)}) &rarr;
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify and commit**

Run: `npx tsc --noEmit && npm run lint`
Expected: tsc clean; no NEW lint referencing the two files.

```bash
git add src/components/scale/WealthOverview.tsx src/components/scale/WealthControls.tsx
git commit -m "feat(scale): WealthOverview seek strip and WealthControls"
```

---

### Task 5: WealthScale orchestrator

**Files:**
- Create: `src/components/scale/WealthScale.tsx`

**Interfaces:**
- Consumes: `BillionaireEntry`; `useLocale`; `assembleLandmarks`; `PX_PER_DOLLAR`, `partitionLandmarks`, `nextBarEnd` from `@/lib/scale/scale-scroll`; `formatCurrency`; `ukBillionaires`; `WealthBars`, `WealthOverview`, `WealthControls` (+ `WealthSpeed`).
- Produces: default export `WealthScale`; `interface WealthScaleProps { entries: BillionaireEntry[] }`.

**Behavior:**
- `posDollars` travel state, clamped `[0, locale.scaleScrollMaxDollars]`.
- `viewportDollars = viewportWidth / PX_PER_DOLLAR` (viewport width measured via `ResizeObserver`, default 0).
- Wheel over the bars viewport: `posDollars += (deltaX + deltaY) / PX_PER_DOLLAR` (prevent default). Drag: pointer move `dx` → `posDollars -= dx / PX_PER_DOLLAR`.
- Auto-travel: rAF advances `posDollars` by `BASE_DOLLARS_PER_SEC * SPEED_MULT[speed] * dt`; auto-pause at the ceiling. Reduced-motion gates auto-travel only.
- Billionaire source per locale; `assembleLandmarks` then `partitionLandmarks(landmarks, locale.scaleScrollMaxDollars)`.

- [ ] **Step 1: Write the component**

Create `src/components/scale/WealthScale.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BillionaireEntry } from "@/data/billionaires.types";
import { useLocale } from "@/contexts/LocaleContext";
import { assembleLandmarks } from "@/lib/scale/scale-landmarks";
import { PX_PER_DOLLAR, partitionLandmarks, nextBarEnd } from "@/lib/scale/scale-scroll";
import { formatCurrency } from "@/lib/format-currency";
import { ukBillionaires } from "@/data/uk-billionaires";
import WealthBars from "@/components/scale/WealthBars";
import WealthOverview from "@/components/scale/WealthOverview";
import WealthControls, { type WealthSpeed } from "@/components/scale/WealthControls";

export interface WealthScaleProps {
  entries: BillionaireEntry[];
}

const BASE_DOLLARS_PER_SEC = 300_000;
const SPEED_MULT: Record<WealthSpeed, number> = { play: 1, fast: 40, warp: 2000 };

export default function WealthScale({ entries }: WealthScaleProps) {
  const { locale } = useLocale();
  const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };
  const maxDollars = locale.scaleScrollMaxDollars;

  const billionaireEntries = locale.id === "en-GB" ? ukBillionaires : entries;
  const { bars, beyond } = useMemo(() => {
    const all = assembleLandmarks({
      entries: billionaireEntries,
      comparisons: locale.comparisons,
      scaleLandmarks: locale.scaleLandmarks,
      topBillionaires: locale.scaleTopBillionaires,
    });
    return partitionLandmarks(all, maxDollars);
  }, [billionaireEntries, locale, maxDollars]);

  const [posDollars, setPosDollars] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<WealthSpeed>("play");
  const [viewportWidth, setViewportWidth] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const speedRef = useRef<WealthSpeed>("play");
  const dragRef = useRef<{ x: number } | null>(null);

  // Mirror state into refs in an effect (not during render) for the rAF loop.
  useEffect(() => {
    posRef.current = posDollars;
    speedRef.current = speed;
  });

  const viewportDollars = viewportWidth > 0 ? viewportWidth / PX_PER_DOLLAR : 0;
  const clamp = (d: number) => Math.min(maxDollars, Math.max(0, d));
  const seek = (d: number) => {
    setIsPlaying(false);
    setPosDollars(clamp(d));
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
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
      const next = posRef.current + BASE_DOLLARS_PER_SEC * SPEED_MULT[speedRef.current] * dt;
      if (next >= maxDollars) {
        setPosDollars(maxDollars);
        setIsPlaying(false);
        return;
      }
      setPosDollars(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [isPlaying, reducedMotion, maxDollars]);

  // Wheel must be a NON-PASSIVE native listener so preventDefault works (React's
  // onWheel can be passive, which would let the page scroll instead of the bars).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      setIsPlaying(false);
      setPosDollars((p) => Math.min(maxDollars, Math.max(0, p + (e.deltaX + e.deltaY) / PX_PER_DOLLAR)));
    };
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", onWheelNative);
  }, [maxDollars]);

  // Restart the journey when the locale (and its bar set / ceiling) changes.
  useEffect(() => {
    setPosDollars(0);
    setIsPlaying(false);
  }, [locale.id]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    dragRef.current.x = e.clientX;
    setIsPlaying(false);
    setPosDollars((p) => clamp(p - dx / PX_PER_DOLLAR));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };
  const jumpNextBarEnd = () => {
    const n = nextBarEnd(bars, posDollars);
    if (n != null) seek(n);
  };

  return (
    <section
      aria-label="Wealth to scale"
      className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-10"
    >
      <header className="text-center">
        <p className="section-kicker mb-2">Scale</p>
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Wealth, to scale</h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600">
          Every amount is a bar starting at zero. Travel right and watch the bars end —
          a salary stops almost at once; a billionaire&apos;s keeps going, and going.
        </p>
      </header>

      <div
        className="numeric text-center text-2xl font-semibold text-accent sm:text-3xl"
        role="status"
        aria-label="Current position"
      >
        {formatCurrency(Math.round(posDollars), formatOpts)}
      </div>

      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="w-full cursor-ew-resize touch-none select-none rounded-lg border border-zinc-200 bg-white p-2"
      >
        <WealthBars
          bars={bars}
          posDollars={posDollars}
          viewportDollars={viewportDollars}
          pxPerDollar={PX_PER_DOLLAR}
        />
      </div>

      <WealthOverview bars={bars} posDollars={posDollars} maxDollars={maxDollars} onSeek={seek} />

      <WealthControls
        isPlaying={isPlaying}
        speed={speed}
        beyond={beyond}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onSetSpeed={setSpeed}
        onSkipTo={seek}
        onNextBarEnd={jumpNextBarEnd}
        onJumpTo={seek}
      />

      {reducedMotion && (
        <p className="text-center text-xs text-zinc-500">
          Auto-travel is off (reduced motion). Scroll, drag, the overview, or the jump buttons still work.
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify and commit**

Run: `npx tsc --noEmit && npm run lint`
Expected: tsc clean; no NEW lint referencing `WealthScale.tsx` (the ref-mirror effect avoids the `react-hooks/refs` rule; the reduced-motion mount `setState` is the one tolerated pattern matching the repo, so the total stays at the pre-existing baseline + at most that single tolerated line — confirm no `react-hooks/refs` and no `exhaustive-deps` NEW errors).

```bash
git add src/components/scale/WealthScale.tsx
git commit -m "feat(scale): WealthScale orchestrator (travel, wheel/drag, auto-travel)"
```

---

### Task 6: Cutover — route, delete retired components, rewrite e2e

**Files:**
- Modify: `src/app/scale/page.tsx`
- Delete: `src/components/scale/ScaleJourney.tsx`, `ScaleTrack.tsx`, `ScaleMinimap.tsx`, `ScaleControls.tsx`
- Modify: `tests/e2e/scale.spec.ts`

**Interfaces:**
- Consumes: `WealthScale` from `@/components/scale/WealthScale`.

- [ ] **Step 1: Swap the route**

In `src/app/scale/page.tsx`, replace the import:

```tsx
import ScaleJourney from "@/components/scale/ScaleJourney";
```

with:

```tsx
import WealthScale from "@/components/scale/WealthScale";
```

and replace the render line `<ScaleJourney entries={entries} />` with:

```tsx
      <WealthScale entries={entries} />
```

Then update the `<noscript>` paragraph copy to describe the bars idea — replace the existing `<p className="mb-4 text-zinc-700">…</p>` block with:

```tsx
          <p className="mb-4 text-zinc-700">
            Every amount drawn as a bar from zero: a {formatCurrency(1_000_000)} bar is a sliver,
            a {formatCurrency(1_000_000_000)} bar is a thousand times longer, and a{" "}
            {formatCurrency(1_000_000_000_000)} bar is a thousand times longer again. The richest
            person today is worth about {formatCurrency(topNetWorth)}.
          </p>
```

(Keep the `topNetWorth` calc and the `BILLION`/`formatCurrency` imports — still used.)

- [ ] **Step 2: Delete the retired components**

```bash
git rm src/components/scale/ScaleJourney.tsx src/components/scale/ScaleTrack.tsx src/components/scale/ScaleMinimap.tsx src/components/scale/ScaleControls.tsx
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit && npm run build`
Expected: tsc clean (nothing imports the deleted files except the now-updated page); build succeeds with `/scale` static.

- [ ] **Step 4: Rewrite the e2e**

Replace the entire contents of `tests/e2e/scale.spec.ts` with:

```ts
import { test, expect } from "@playwright/test";

test.describe("Scale page (bars from zero)", () => {
  test("renders the wealth-to-scale region, heading, bars, and controls", async ({ page }) => {
    await page.goto("/scale");
    await expect(page.getByRole("region", { name: "Wealth to scale" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Wealth, to scale" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip to $1B" })).toBeVisible();
    // many bars render at the start
    expect(await page.getByTestId("wealth-bar").count()).toBeGreaterThan(8);
  });

  test("travelling ends bars: fewer remain 'running' after skipping to $1B", async ({ page }) => {
    await page.goto("/scale");
    const runningStart = await page.locator('[data-testid="wealth-bar"][data-state="running"]').count();
    await page.getByRole("button", { name: "Skip to $1B" }).click();
    await expect(page.getByRole("status", { name: "Current position" })).toContainText("B");
    const runningAfter = await page.locator('[data-testid="wealth-bar"][data-state="running"]').count();
    expect(runningAfter).toBeLessThan(runningStart);
  });

  test("UK locale shows a UK Rich List bar", async ({ page }) => {
    await page.goto("/scale");
    await page.getByRole("button", { name: "GBP" }).click();
    await expect(page.getByText("Hinduja family")).toBeVisible();
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

> NOTE: `formatCurrency` renders billions compactly (e.g. `$1B`), so the "$1B" assertion checks for `"B"`. The UK test relies on `WealthBars` rendering a running bar's label pinned at the right edge — at the start position every UK bar is "running", so "Hinduja family" is on screen without seeking. If the real default-locale compact output differs, adjust and re-run.

- [ ] **Step 5: Run the e2e**

Run: `npx playwright test tests/e2e/scale.spec.ts`
Expected: 4/4 pass. (If browsers missing: `npx playwright install chromium`. Pre-existing `wealthtracker.spec.ts` failures are out of scope.)

- [ ] **Step 6: Commit**

```bash
git add src/app/scale/page.tsx tests/e2e/scale.spec.ts
git commit -m "feat(scale): cut over /scale to bars-from-zero, retire camera-travel components"
```

---

## Final Verification

- [ ] `npm run test:unit` — all unit tests pass (incl. `scale-scroll`).
- [ ] `npx playwright test tests/e2e/scale.spec.ts` — 4/4 pass.
- [ ] `npx tsc --noEmit` — clean; `npm run build` — `/scale` static.
- [ ] **Runtime verification (REQUIRED — the prior model passed tests but failed in practice):** `npm run dev`, open `/scale`. Confirm: near $0 many bars fill the screen, each labelled; pressing Play (or scrolling) makes bars terminate one by one and the odometer climb; the screen empties to a few long bars in the billions; the overview marker moves; the UK toggle shows UK bars; "& beyond" jump (US GDP) works. Screenshot near-$0 and in-the-billions for both locales.

## Notes

- `PX_PER_DOLLAR` (1e-4), `BASE_DOLLARS_PER_SEC` (300k), and `SPEED_MULT` are tuning constants — adjust for the best "epic but not interminable" feel during the runtime verification.
- Rows are descending by value (biggest fortune on top). Running bars show their label pinned right; ending bars at the terminus; ended bars faint at the left.
- US scroll ends at $7T (Apple/healthcare/Forbes-400 inside; US GDP $29.2T is a "& beyond" jump). UK ends at £1.05T (Rich List 350 inside; nothing beyond currently).
