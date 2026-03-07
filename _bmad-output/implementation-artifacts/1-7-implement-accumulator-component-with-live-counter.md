# Story 1.7: Implement Accumulator component with live counter

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **visitor**,
I want **the combined passive income of the top 10 to tick up in real time and a "since you arrived" counter**,
so that **I feel the scale of inequality as it happens**.

---

## Acceptance Criteria

1. **Given** the hero shell exists and the app imports billionaire data and metadata from `src/data/`  
   **When** I load the page  
   **Then** one client component (e.g. `Accumulator`) owns a single `requestAnimationFrame` loop that computes and displays the combined passive income and the "since you arrived" value (FR1, FR2)  
   **And** passive income per second is computed as `(net_worth × return_rate) / (365 × 24 × 3600)` using a fixed reference time (e.g. `dataAsOf`) for the main total and session start for "since you arrived" (FR10)  
   **And** when the tab or document is hidden, the loop pauses or throttles (FR13)  
   **And** the counter updates smoothly (e.g. 60fps, single text node or minimal DOM updates) so the main thread is not blocked (NFR2)  
   **And** currency and numbers are formatted for display (e.g. tabular figures) per UX spec  
   **And** the component is accessible (labels, optional `aria-live` or reduced announcements; respect `prefers-reduced-motion` where applicable)

---

## Tasks / Subtasks

- [x] **Task 1: Create Accumulator client component** (AC: #1)
  - [x] Create `src/components/hero/Accumulator.tsx` as a client component (`"use client"`). One component owns the entire tick loop; do not split into two components with separate rAF or setInterval loops.
  - [x] Accept props: data (entries + metadata from `src/data/`), e.g. `dataAsOf`, entries array, and optionally return rate (or use constant from `src/lib/constants.ts`). Define `AccumulatorProps` interface.
- [x] **Task 2: Single requestAnimationFrame loop** (AC: #1, NFR2)
  - [x] Use one `requestAnimationFrame` loop to compute and update both: (1) combined passive income (main Accumulator), (2) "since you arrived" value. Use refs for the loop handle and last update time; minimal React state for displayed values (or derive from refs on tick).
  - [x] Main total: compute elapsed seconds from a fixed reference time (e.g. `dataAsOf` from metadata). Formula: passive income per second = `(sum of net_worth × return_rate) / (365 × 24 × 3600)`; total = rate × elapsed seconds from dataAsOf.
  - [x] "Since you arrived": use session start (e.g. timestamp when component mounted or first visible). Same per-second rate; elapsed = now - session start.
  - [x] Update a single text node (or minimal DOM) per tick to avoid layout thrash. Do not block the main thread.
- [x] **Task 3: Pause or throttle when tab hidden** (AC: #1, FR13)
  - [x] Use `document.visibilityState` or `visibilitychange` (or Page Visibility API). When document is hidden: pause the rAF loop or throttle (e.g. stop requesting frames). When visible again: resume. Do not run full 60fps updates in background.
- [x] **Task 4: Formatting and UX** (AC: #1)
  - [x] Format currency and numbers for display (e.g. tabular figures per UX spec). Use or create `src/lib/format-currency.ts` (or equivalent). Use or create `src/lib/passive-income-calc.ts` for the formula and elapsed-time math if helpful; keep logic in one place.
  - [x] Apply minimal, high-contrast styling per UX spec; monospace/tabular for numbers.
- [x] **Task 5: Accessibility** (AC: #1)
  - [x] Add clear, concise labels for the main Accumulator and "since you arrived" (e.g. visible or sr-only). Use `aria-live="polite"` (or similar) for live region so screen readers get updates without overwhelming; consider reduced announcement frequency.
  - [x] Respect `prefers-reduced-motion`: when user prefers reduced motion, throttle updates (e.g. update less frequently) or show static value so the counter does not animate aggressively.
- [x] **Task 6: Wire into page** (AC: #1)
  - [x] In `src/app/page.tsx` (or hero section), import data from `src/data/` and pass to `Accumulator`. Replace the static placeholders from Story 1.6 with the live component. Ensure data is available at build time (page or parent can be server component that passes data to client Accumulator).

---

## Dev Notes

### Epic & business context

- **Epic 1:** Live Accumulator with real data. This story completes the core experience: live counter and "since you arrived" with real data.
- **FRs delivered:** FR1 (live Accumulator), FR2 ("since you arrived"), FR10 (formula, fixed reference time), FR13 (pause when hidden). NFR2 (smooth 60fps).
- **Dependencies:** Stories 1.1–1.6 (app, data, hero shell). No Epic 2/3 features in this story (no comparison line content, no share implementation).

### Developer context – guardrails

- **One component, one loop.** Architecture forbids two separate components each with their own rAF or setInterval. [Architecture: Frontend Architecture, Enforcement guidelines, Avoid]
- **Fixed reference for main total:** Use `dataAsOf` (or equivalent from metadata) so the main Accumulator value is deterministic and shareable (same for everyone at the same moment). Session start is only for "since you arrived." [Architecture: Frontend Architecture, Important decisions]
- **Formula:** Passive income per second = `(net_worth × return_rate) / (365 × 24 × 3600)`. Sum over all entries for combined rate. Return rate from metadata or constant (e.g. 5% or config). [Epics: Story 1.7 AC; Architecture: Real-time]
- **No Convex in browser.** Data comes from props (build-time import in parent). [Architecture: Data boundaries]

### Project structure notes

- **New:** `src/components/hero/Accumulator.tsx`, optionally `src/lib/passive-income-calc.ts`, `src/lib/format-currency.ts`, `src/lib/constants.ts` (e.g. `DEFAULT_RETURN_RATE`).
- **Updated:** `src/app/page.tsx` (or hero section) to render `<Accumulator />` with data props.
- **References:** [Source: architecture.md — Frontend Architecture, Naming patterns, Pattern examples, Requirements to Structure Mapping; epics.md — Story 1.7; ux-design-specification.md]

---

## Technical requirements (dev agent guardrails)

| Requirement | Detail |
|------------|--------|
| **Single rAF loop** | One client component; one requestAnimationFrame loop for both main total and "since you arrived." |
| **Formula** | Per-second rate = `(net_worth × return_rate) / (365 × 24 × 3600)`; sum over entries. Main total: rate × (now - dataAsOf) in seconds; "since you arrived": rate × (now - sessionStart). |
| **Fixed reference** | Main total uses `dataAsOf`; "since you arrived" uses session start (e.g. mount time). |
| **Visibility** | Pause or throttle when `document.visibilityState === 'hidden'`. |
| **Performance** | Single text node or minimal DOM per tick; 60fps; no main-thread blocking. |
| **Formatting** | Tabular figures; currency formatting per UX spec. |
| **Accessibility** | Labels; aria-live (polite); prefers-reduced-motion respected (throttle or static). |

---

## Architecture compliance

- **Component:** `src/components/hero/Accumulator.tsx` with default export `Accumulator`, props `AccumulatorProps`; single rAF loop for main total and "since you arrived." [Architecture: Pattern examples, Requirements to Structure Mapping]
- **State/refs:** Refs for tick loop and last update time; minimal React state for displayed values. [Architecture: Frontend Architecture]
- **Accessibility:** Labels; optional aria-live; respect prefers-reduced-motion. [Architecture: Frontend Architecture]
- **Data flow:** Page/layout imports from `src/data/`; passes data to Accumulator. No Convex in app. [Architecture: Component boundaries, Data flow]

---

## Library / framework requirements

- **React:** Client component only for Accumulator. Use refs and state appropriately; avoid unnecessary re-renders (e.g. update only the displayed value on tick).
- **Next.js:** Parent can be server component that imports data and passes to client Accumulator. Static export unchanged.
- **No new UI libraries** unless already in project. Use Tailwind for styling; tabular figures via CSS (e.g. `font-variant-numeric: tabular-nums`).

---

## File structure requirements (this story only)

**Must exist after implementation:**

- `src/components/hero/Accumulator.tsx` — client component, one rAF loop, both counters.
- Optional: `src/lib/passive-income-calc.ts` (formula and elapsed-time helpers), `src/lib/format-currency.ts`, `src/lib/constants.ts`.

**Updated:**

- `src/app/page.tsx` (or hero section) — render `<Accumulator data={...} />` with data from `src/data/`.

**Do not:** Create a second component for "since you arrived" with its own loop; keep one component, one loop.

---

## Testing requirements

- **Manual:** Load page; verify both numbers update smoothly. Switch tab (hide document); verify counter pauses or throttles. Return to tab; verify resume. Check reduced motion: enable prefers-reduced-motion and verify behavior (throttled or static). Run `npm run build`; verify static export still works.
- **No automated tests** required for this story per architecture; optional co-located test later.

**QA scenarios (Epic 1):** See `_bmad-output/planning-artifacts/epics.md` → Epic 1: QA & test focus. For this story, additionally verify:
  - **Empty data:** `entries` empty or missing → no crash; show zero or static fallback.
  - **JS disabled:** Static value + short message (e.g. "Enable JavaScript for live updates") per FR12.
  - **Formula:** Spot-check one known net worth + return rate → per-second rate matches `(net_worth × return_rate) / (365 × 24 × 3600)`; combined total and "since you arrived" use same rate.
  - **Single loop:** Only one component drives both counters; no duplicate timers (devtools or code review).

---

## Project context reference

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Frontend Architecture, Pattern examples, Requirements to Structure Mapping.
- UX: `_bmad-output/planning-artifacts/ux-design-specification.md` — design direction, performance as UX.
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 1.7.

---

## Story completion status

- **Status:** review  
- **Epic 1 complete:** After this story, Epic 1 (Live Accumulator with real data) is fully delivered. Epic 2 (Understanding and credibility) and Epic 3 (Share and reliability) follow.

---

## Dev Agent Record

### Agent Model Used

Dev story executed (Story 1.7).

### Debug Log References

( none )

### Completion Notes List

- **Accumulator:** Single client component with one `requestAnimationFrame` loop; computes main total from `dataAsOf` and "since you arrived" from session start (set in effect on mount). Page Visibility API pauses loop when tab hidden; resumes when visible.
- **Lib:** `src/lib/constants.ts` (DEFAULT_RETURN_RATE 0.05), `src/lib/passive-income-calc.ts` (combinedPassiveIncomePerSecond, accumulatedFromRate), `src/lib/format-currency.ts` (formatCurrency with Intl.NumberFormat).
- **Accessibility:** sr-only description for main counter; `aria-live="polite"` and `role="status"` on both live regions; `prefers-reduced-motion` respected via 2s throttle (REDUCED_MOTION_TICK_MS) instead of 60fps.
- **Wire-up:** `HeroSection` now accepts `entries`, `medianSalary`, `dataAsOf`; renders `<Accumulator entries={...} dataAsOf={...} />` and comparison line. `page.tsx` passes `entries` (no longer totalNetWorth).
- **Tests:** No automated tests per story; `npm run lint` and `npm run build` pass.
- **Code review (AI) follow-up:** FR12 graceful degradation: added `<noscript>` static fallback in `src/app/page.tsx` with build-time snapshot total and "Enable JavaScript for live updates." formatCurrency: use compact for ≥1e9, simplified branches; dataAsOf comment added in Accumulator.

### File List

- `src/lib/constants.ts` (new)
- `src/lib/passive-income-calc.ts` (new)
- `src/lib/format-currency.ts` (new)
- `src/components/hero/Accumulator.tsx` (new)
- `src/components/hero/HeroSection.tsx` (updated)
- `src/app/page.tsx` (updated: FR12 noscript static fallback, static snapshot computation)
