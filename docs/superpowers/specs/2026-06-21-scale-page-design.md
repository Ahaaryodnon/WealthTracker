# Scale Page — A Journey from a Million to a Trillion

**Date:** 2026-06-21
**Status:** Approved design, pending spec review
**Route:** `/scale`

## Purpose

Give visitors a visceral, spatial understanding of how vastly different a
**million**, a **billion**, and a **trillion** are. People routinely treat these
words as "big, bigger, biggest" without grasping that a billion is 1,000× a
million and a trillion is 1,000× a billion. This page makes the gap impossible
to ignore by mapping dollars to physical distance on a fixed-zoom horizontal
axis and letting the user travel it.

This is a deep-dive companion to the home page, not a replacement for its
existing "Scale" strip (`ContextStrip`).

## Core Mechanic

A single horizontal axis where **$1 = a fixed width**. The zoom never changes —
that invariance is the entire point. At a zoom where $1M occupies a small but
visible block on screen, $1B sits 1,000× farther away and $1T sits 1,000,000×
farther away.

The user presses **Play** and the camera auto-travels left → right at a
**strictly proportional, constant visual speed** (pixels per second). A million
flies past almost immediately; reaching a billion takes a long time; a trillion
is absurdly, almost unreachably far. The "this never ends" feeling is the
intended gut-punch.

### Honesty model

The travel is always strictly proportional — we never distort distances. Because
a truly proportional trillion is far too distant to watch end-to-end at a
readable pixel rate, the design provides **escape hatches** rather than cheating
the scale:

- **Speed toggle:** 1× / Fast / **Warp**. Warp is simply a much higher constant
  px/sec — still proportional, just faster. Holding Warp lets the odometer race
  upward while the user *still* feels how long it takes, reinforcing magnitude.
- **Skip to $1B / Skip to $1T** buttons. Choosing to skip *is* part of the
  lesson — the user gives up on traversing the distance manually.
- **Scrubber** for free navigation.

Two always-visible "truth meters" keep magnitude honest regardless of playback
speed:

1. **Odometer** — the true dollar value at the camera's current position,
   counting up. Locale-formatted.
2. **Minimap** — a compressed view of the entire $0 → $1T track with the camera
   position marked. On this full-track view the $1M and $1B flags are crammed
   almost exactly on top of $0, visually proving how tiny they are next to $1T.

### Default tuning

`PX_PER_DOLLAR` and the 1× speed are chosen so the **opening stretch is
rewarding**: the everyday-money milestones through to the $1M flag play out over
a satisfying ~10–15 seconds of rich, passing landmarks. Beyond a million the
landmarks thin out and the user naturally reaches for Warp or Skip — at which
point the minimap shows they've barely moved off zero. Exact constants are an
implementation detail to be tuned during build; the **proportions are never
altered**.

## Landmarks

Flags planted at their true dollar positions, revealed as the camera passes.
Four categories:

1. **The three amounts** — bold, primary flags at **$1M**, **$1B**, **$1T**.
2. **Everyday money milestones** — clustered near the start, e.g. median salary
   (~$60k), median home (~$400k), a lottery jackpot, average lifetime earnings.
   Sourced from locale packs where available (e.g. `medianSalary`).
3. **Billionaire net worths** — pulled from `src/data/billionaires.ts`. At
   minimum the #1 billionaire, showing where the richest person lands between
   $1B and $1T. (May include top 3 if visually uncluttered.)
4. **Big-world references** — out near the trillion end, e.g. a large company
   valuation, a country's GDP, total global wealth.

All monetary values respect the active locale via `useLocale` +
`formatCompact` / `formatCurrency`.

## Accessibility & Fallbacks

- **`prefers-reduced-motion`:** no auto-animation. Render a static, labeled track
  with the scrubber and skip buttons so the content is fully explorable without
  motion.
- **No-JS:** a static labeled summary of the three amounts and key landmarks
  (mirrors the existing `<noscript>` approach on the home page). The interactive
  travel is progressive enhancement.
- Controls are keyboard-operable with proper labels; the scrubber is a native
  range input or an ARIA slider.

## Technical Approach

- **Route:** `src/app/scale/page.tsx` — a server component that renders the
  client journey component and supplies static landmark data. Static export
  compatible (no runtime server). Add page `metadata` (title/description/OG)
  mirroring `layout.tsx` conventions.
- **Client component:** `src/components/scale/ScaleJourney.tsx` (`"use client"`).
  Owns camera state, the `requestAnimationFrame` travel loop, playback controls,
  odometer, and minimap.
- **Virtualized rendering:** the true track spans millions of pixels — far past
  browser element-size caps — so we do **not** render a real full-width element.
  The camera is a `dollars` offset; on each frame we compute which landmarks fall
  within the current viewport window (`[cameraDollars, cameraDollars +
  viewportDollars]`) and absolutely-position only those via `dollars → x`. This
  keeps the DOM tiny at any zoom-equivalent position.
- **Landmark data module:** `src/lib/scale/scale-landmarks.ts` — a typed list
  merging static milestones, locale-derived values, and the top billionaire(s)
  from `billionaires.ts`. Each landmark: `{ id, label, dollars, category }`.
- **Reuse:** `formatCurrency`/`formatCompact` (`src/lib/format-currency.ts`),
  `useLocale` (`src/contexts/LocaleContext.tsx`, already wrapping all routes via
  root layout), `useScrollReveal`/`useCountUp` patterns, existing Tailwind design
  tokens (`bg-accent`, section kickers, etc.).
- **Entry points:** add a CTA link in `ContextStrip.tsx` ("See how big a trillion
  really is →") and a link on the billionaires page.

## Components & Responsibilities

- `app/scale/page.tsx` — route shell, metadata, `<noscript>` fallback, renders
  `ScaleJourney`. Passes top billionaire(s) from the dataset.
- `components/scale/ScaleJourney.tsx` — orchestrator: camera/animation state,
  controls, composes Track + Odometer + Minimap.
- `components/scale/ScaleTrack.tsx` — the windowed axis; positions visible
  landmarks. (May be merged into `ScaleJourney` if small.)
- `components/scale/ScaleMinimap.tsx` — full $0→$1T compressed overview with
  camera marker.
- `components/scale/ScaleControls.tsx` — play/pause, speed toggle, skip buttons,
  scrubber.
- `lib/scale/scale-landmarks.ts` — landmark data assembly (pure, testable).

Each unit has one clear purpose and a narrow interface (mostly `dollars`,
`cameraDollars`, and callbacks). The landmark assembly and the `dollars → x`
math are pure functions and unit-testable independently of the DOM.

## Out of Scope (YAGNI)

- Time-based framings ("count to a billion"), object-stacking metaphors, or
  logarithmic views — the spatial/distance mechanic is the chosen approach.
- Editing or expanding the home page's existing Scale section beyond adding one
  CTA link.
- New locale data beyond what already exists plus a small set of static
  milestones that aren't locale-sensitive.

## Open Items for Spec Review

- **Route name:** `/scale` assumed. Alternative considered: `/million-vs-billion`.
- Exact default `PX_PER_DOLLAR` and 1× speed — tuned during implementation,
  proportions fixed.
