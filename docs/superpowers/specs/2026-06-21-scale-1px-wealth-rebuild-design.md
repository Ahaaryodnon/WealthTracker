# Scale Page Rebuild — "1 Pixel Wealth" Bars-From-Zero

**Date:** 2026-06-21
**Status:** Approved design, pending spec review
**Supersedes the interaction model of:** `docs/superpowers/specs/2026-06-21-scale-page-design.md` (the camera-travel `/scale` page)
**Keeps the data model of:** `docs/superpowers/specs/2026-06-21-scale-landmarks-expansion-design.md`

## Why

Runtime verification of the current `/scale` page (camera auto-travel over a fixed-zoom axis with point-flags) showed it fails its purpose: across the entire $1M–$32T range the viewport is an **empty track** with only a ticking number — magnitude is never *shown*, only counted. (Confirmed: at $1.8B the track renders zero landmarks.)

This rebuild adopts the "1 pixel wealth" model the user referenced: every value is a **filled bar starting at $0**, so you are always inside the big bars and there is never empty void. As you travel, bars **end one by one** — a median income terminates almost immediately; billionaire and wealth-total bars keep going for screen after screen. The screen visibly empties until only the largest fortunes remain on screen. That gradual emptying is the inequality, shown not told.

## Core Mechanic

- **Bars from zero.** Each landmark is a thin, category-colored horizontal bar from virtual $0 to its dollar value, laid out in stacked **rows**. Length = magnitude.
- **Travel right** through a fixed-zoom space (`~1px = $10,000`, tunable). A $30k income is a ~3px speck; $1M ≈ 100px; $1B ≈ 100,000px; the richest fortunes are hundreds of millions of px — an epic journey.
- **Bars terminate as you pass their value.** At any travel position the screen shows: bars already ended (gone, behind you), bars ending within the viewport (drawn with their terminus + end-label), and bars still running (filling the row edge-to-edge). Fast travel stays engaging precisely because bars keep terminating — no blank screen.
- The reading: near $0 you see ~15–18 stacked bars; "in the billions" only a handful remain — everyone else's wealth ended long ago.

## Range & "& Beyond"

- The travel spans `$0 → scaleScrollMaxDollars` (a per-locale ceiling set just above the biggest fortune/total): **US ≈ $7,000,000,000,000** (past the Forbes 400 combined $6.6T; Apple $3.5T and US healthcare $4.9T are bars within it); **UK ≈ £1,050,000,000,000** (past the Rich List 350 £772.8bn, with the £1T flag as the natural far end).
- Landmarks with `dollars > scaleScrollMaxDollars` (US: US GDP $29.2T) become **"& beyond" jump markers** at the far end: "keep going 4× further →", which teleport the position to them. (UK currently has none above its ceiling; the partition handles zero gracefully.)

## Movement

- **Manual:** horizontal wheel/trackpad and click-drag nudge the travel position. The **overview strip** (below) doubles as a scrubber — click/drag it to seek anywhere.
- **Auto-travel:** play/pause + speed (1× / Fast / Warp). rAF advances the position; engaging at any speed because bars terminate continuously. Auto-pauses at the ceiling.
- **Jumps:** "next bar-end" (advance to the next landmark's terminus), "skip to $1M / $1B", and the "& beyond" markers.
- **Reduced motion:** no auto-travel; manual wheel/drag/overview-seek and jumps still work (content fully explorable). Honors `prefers-reduced-motion`, live-updating.

## Layout & Feedback

```
   You are at  ▸ $4.2M ◂                                   [▶ Auto]  [1× Fast Warp]
   ┌───────────────────────────────────────────────────────────────────────┐
   │ Median US income        (ended $59K)                                   │
   │ Lifetime earnings   ▓▓  (ended $3.8M, just behind)                     │
   │ End homelessness    ████████████████████████████████████…  →          │
   │ Forbes 400 entry    ███████████████████████████████████…   →          │
   │ Apple market cap    ██████████████████████████████████████…  →         │
   │ Musk (richest)      ██████████████████████████████████████…  →         │
   └───────────────────────────────────────────────────────────────────────┘
   Overview (all bars, log) ▕▁▂▃▅▇█▆▃▁  ● you are here          & beyond: US GDP →
   [⤓ next bar-end]  [↦ $1M]  [↦ $1B]
```

- **Odometer:** live "you are at $X" (locale-formatted), updates as you travel.
- **Rows:** label + value shown at each bar's right end (its terminus). Hovering a bar shows its `source` (provenance). Bars far behind fade; the end-label of a just-passed bar lingers briefly at the left.
- **Overview strip:** a compact, log-scaled view of *all* bars at once (the speck-vs-giant contrast in one glance) with a position marker; clickable/draggable to seek.

## Data Model (reused + one addition)

Reused unchanged: `src/lib/scale/scale-landmarks.ts` + `scale-landmark-types.ts` (`Landmark { id, label, dollars, category, source? }`, 6 categories), `assembleLandmarks`, the US/UK `scaleLandmarks` sets and `scaleTopBillionaires` in the locale packs, `src/data/uk-billionaires.ts`, and the category→color mapping.

Addition to `LocaleConfig` (`src/lib/locale/types.ts`) and both packs:

```ts
  /** The bars-from-zero travel spans $0 → this ceiling (nominal, locale currency). Landmarks above it are "& beyond" jump markers. */
  scaleScrollMaxDollars: number;
```
`en-US`: `7_000_000_000_000`; `en-GB`: `1_050_000_000_000`.

## New Pure Helpers — `src/lib/scale/scale-scroll.ts`

Dependency-light, unit-tested (`tsx --test`). All take an explicit `pxPerDollar` for testability.

```ts
import type { Landmark } from "@/lib/scale/scale-landmark-types";

export const PX_PER_DOLLAR = 1e-4; // 1px = $10,000 (tunable)

export type BarState = "ended" | "ending" | "running";

/** Partition into scrollable bars (<= ceiling) and "beyond" jump markers (> ceiling). */
export function partitionLandmarks(
  landmarks: Landmark[],
  ceilingDollars: number,
): { bars: Landmark[]; beyond: Landmark[] };

/** Where a bar stands relative to the viewport window [posDollars, posDollars + viewportDollars]. */
export function barStateAt(
  valueDollars: number,
  posDollars: number,
  viewportDollars: number,
): BarState; // value < pos -> "ended"; value > pos+viewport -> "running"; else "ending"

/** On-screen x (px) of a bar's terminus given current travel position. */
export function terminusX(valueDollars: number, posDollars: number, pxPerDollar: number): number;

/** Smallest landmark value strictly greater than posDollars (for "jump to next bar-end"); null if none. */
export function nextBarEnd(landmarks: Landmark[], posDollars: number): number | null;
```

(`dollarsToX` from `scale-math.ts` is reused for px math; `terminusX` wraps it.)

## Components — `src/components/scale/`

- **`WealthScale.tsx`** (`"use client"`, orchestrator, prop `entries: BillionaireEntry[]`): owns `posDollars` travel state; measures viewport width (`ResizeObserver`) → `viewportDollars = viewportWidth / PX_PER_DOLLAR`; handles wheel + drag → clamp `posDollars` to `[0, scaleScrollMaxDollars]`; auto-travel via rAF (ref-mirror pattern, mirrored in an effect — not during render — per the lint rule learned earlier); `prefers-reduced-motion` with live listener. Selects billionaire source per locale (`locale.id === "en-GB" ? ukBillionaires : entries`) and calls `assembleLandmarks`, then `partitionLandmarks`. Composes the odometer, bars, overview, controls.
- **`WealthBars.tsx`**: renders the bar rows from `{ bars, posDollars, viewportDollars, pxPerDollar }`; per row uses `barStateAt`/`terminusX` to draw the running fill / terminus + end-label / faded-ended state. Category color; `title={source}`.
- **`WealthOverview.tsx`**: compact log-scaled all-bars view + position marker; emits a seek callback on click/drag.
- **`WealthControls.tsx`**: auto-travel play/pause + speed toggle, next-bar-end, skip-to-$1M/$1B, and the "& beyond" jump buttons. (Adapts the retired `ScaleControls`.)

Movement uses wheel/drag/auto-travel/overview-seek — **no native scrollbar** (a true-zoom spacer would exceed browser element-size caps; virtualization renders only the visible slice).

## Route & Fallbacks

- `src/app/scale/page.tsx`: render `<WealthScale entries={entries} />` instead of `<ScaleJourney>`. Keep the `<noscript>` static fallback (update copy to describe the bars idea).

## Retire

Delete the camera-travel components — `ScaleJourney.tsx`, `ScaleTrack.tsx`, `ScaleMinimap.tsx`, `ScaleControls.tsx` — and their roles move to the new components. The pure `scale-math.ts` (constants, `dollarsToX`, slider helpers) and the entire data layer stay.

## Testing

- **Unit (`tsx --test`):** `src/lib/scale/scale-scroll.test.ts` — `partitionLandmarks` (ceiling split, empty-beyond case), `barStateAt` (the three states at boundaries), `terminusX`, `nextBarEnd` (including null at/after the max). Wire into `test:unit`.
- **E2E (`tests/e2e/scale.spec.ts`, rewritten):** the page renders multiple bars; auto-travel (or a wheel/seek action) advances the odometer and reduces the count of "running" bars (bars terminate); a jump control moves the position; the UK locale toggle shows UK billionaire bars (e.g. "Hinduja family").
- **Runtime verification (required before "done"):** run `next dev`, drive `/scale`, and screenshot the bars-ending effect at several positions (near $0: many bars; in the billions: few) for both locales.

## Out of Scope (YAGNI)

- A true native scrollbar (virtualization + overview-seek cover navigation).
- FX conversion (figures stay nominal in the active currency).
- New landmark data (this is a rendering/interaction rebuild; the data layer is reused as-is).
- Animated bar-fill transitions beyond what travel naturally produces.

## Open Items for Spec Review

- `PX_PER_DOLLAR` (1e-4) and the auto-travel speed curve are tuning constants — adjust during build for the best "epic but not interminable" feel.
- Row ordering: descending by value (biggest fortune on top) vs ascending — pick during build; descending reads as "the longest bars dominate."
- `scaleScrollMaxDollars` (US $7T / UK £1.05T) ceilings are knobs.
