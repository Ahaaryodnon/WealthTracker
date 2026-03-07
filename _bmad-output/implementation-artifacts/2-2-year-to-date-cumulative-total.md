# Story 2.2: Year-to-date cumulative total

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **visitor**,
I want **to see how much combined passive income the top 10 have earned since the start of the year**,
so that **I have a citable, time-bound figure**.

---

## Acceptance Criteria

1. **Given** the app has billionaire data and `dataAsOf` (and return rate)  
   **When** I view the page  
   **Then** the year-to-date cumulative total is displayed (from 1 Jan of current year to the data reference time or current time, per product rule) (FR3)  
   **And** the value is computed from the same formula and data as the Accumulator  
   **And** the value is formatted as currency and is visible in the hero or a dedicated section (per UX)

---

## Tasks / Subtasks

- [x] **Task 1: Compute YTD cumulative total** (AC: #1)
  - [x] YTD period: from 1 January of the current year to the data reference time (e.g. `dataAsOf` date) or to "now" for live display — align with product rule (architecture/PRD: "year-to-date cumulative total"). If using fixed reference: elapsed seconds from Jan 1 00:00:00 of current year to `dataAsOf`; if using live: same start, end = now (ensure same formula as Accumulator for consistency).
  - [x] Use same formula as Accumulator: combined passive income per second = `combinedPassiveIncomePerSecond(entries, DEFAULT_RETURN_RATE)`; YTD total = rate × elapsed seconds in the YTD window. Reuse `accumulatedFromRate` from `src/lib/passive-income-calc.ts`.
- [x] **Task 2: Display and placement** (AC: #1)
  - [x] Show the YTD value formatted as currency (`formatCurrency` from `src/lib/format-currency.ts`); tabular figures per UX. Place in hero or a dedicated section per UX scroll order (hero → comparison → top 10 → methodology → share). ContextStrip or a small block in/near the hero is acceptable.
- [x] **Task 3: Data and consistency** (AC: #1)
  - [x] Receive `entries`, `dataAsOf`, and use `DEFAULT_RETURN_RATE` from `src/lib/constants.ts`; no separate data source. Ensure build-time data from `src/data/`; page passes props from same source as Accumulator.

---

## Dev Notes

### Epic & business context

- **Epic 2:** Understanding and credibility. YTD gives a citable, time-bound figure (e.g. for journalists).
- **FRs delivered:** FR3 (year-to-date cumulative total).
- **Dependencies:** Epic 1 (data, Accumulator). Same data and formula as Accumulator.

### Developer context – guardrails

- **Reuse libs.** Use `combinedPassiveIncomePerSecond` and `accumulatedFromRate` from `src/lib/passive-income-calc.ts`, `DEFAULT_RETURN_RATE` from `src/lib/constants.ts`, `formatCurrency` from `src/lib/format-currency.ts`. [Architecture: Pattern examples]
- **YTD window.** Product rule: "from 1 Jan of current year to the data reference time or current time." If the app uses a fixed reference (dataAsOf) for the main Accumulator, YTD can be from Jan 1 to dataAsOf for a citable snapshot, or Jan 1 to now for a live YTD; document choice. [Source: epics.md Story 2.2; PRD]
- **Existing layout.** Hero (HeroSection), ContextStrip, ComparisonSection, TopTenList, MethodologySection, ShareSection. YTD can live in ContextStrip, HeroSection, or a small dedicated line/section between hero and comparison. [Source: PageClient.tsx]

### Project structure notes

- **Existing:** `src/lib/passive-income-calc.ts`, `src/lib/format-currency.ts`, `src/lib/constants.ts`, `src/components/hero/HeroSection.tsx`, `src/components/sections/ContextStrip.tsx`, `src/components/PageClient.tsx`.
- **Updated:** One or more of: HeroSection, ContextStrip, or new small component for YTD; PageClient if new component. Prefer minimal change (e.g. add YTD to ContextStrip or hero).

---

## Technical requirements (dev agent guardrails)

| Requirement | Detail |
|------------|--------|
| **Formula** | Same as Accumulator: per-second rate = `combinedPassiveIncomePerSecond(entries, DEFAULT_RETURN_RATE)`; YTD = `accumulatedFromRate(rate, ytdElapsedSeconds)`. |
| **YTD window** | Start: Jan 1 00:00:00 UTC of current year. End: dataAsOf (fixed) or now (live) — align with product/PRD. |
| **Formatting** | Currency via `formatCurrency`; tabular figures. |
| **Placement** | Hero or dedicated section; visible without scrolling past hero if possible (per UX). |

---

## Architecture compliance

- **Data flow:** Same as Accumulator — props from page, build-time `src/data/`. No Convex in browser. [Architecture: Data boundaries]
- **No new rAF/timers:** YTD can be computed once (if using dataAsOf end) or updated on a tick if using "now"; if updated, prefer receiving from parent that already has tick data rather than duplicate loop. [Architecture: Frontend Architecture]

---

## File structure requirements (this story only)

**Must touch:** Hero and/or ContextStrip (or one new small component) to display YTD. Reuse `passive-income-calc`, `format-currency`, `constants`.

**Do not:** Duplicate passive-income formula or add a second data source.

---

## Testing requirements

- **Manual:** Verify YTD value matches hand calculation (Jan 1 to dataAsOf or now, same rate as Accumulator). Check placement and currency formatting. Resize for mobile/desktop.
- **Optional:** Snapshot or unit test for YTD calculation given fixed date range.

---

## References

- Architecture: `_bmad-output/planning-artifacts/architecture.md`. Epics: `_bmad-output/planning-artifacts/epics.md` Story 2.2. UX: `_bmad-output/planning-artifacts/ux-design-specification.md`.

---

## Dev Agent Record

### Agent Model Used

(Cursor / Dev agent — story 2-2 execution.)

### Completion Notes List

- **YTD window:** Jan 1 00:00:00 UTC of current year → now (live), aligned with Accumulator. `getYtdElapsedSeconds()` and `computeYtdTotal()` in `src/lib/passive-income-calc.ts`.
- **Data flow:** No new timer. Accumulator computes YTD each tick and passes `ytdTotal` via `onSessionUpdate(sinceArrived, elapsedSeconds, ytdTotal)`; PageClient stores and passes to ContextStrip.
- **Placement:** ContextStrip shows "So far this year" + `formatCurrency(ytdTotal)` with tabular-nums; region visible below hero (AC #1).
- **Tests:** E2e added for "Year-to-date cumulative total" region and currency; lint and build pass. (E2e requires port 3000 free or reuseExistingServer.)

### File List

- `src/lib/passive-income-calc.ts` — added `getYtdElapsedSeconds`, `computeYtdTotal`
- `src/components/hero/Accumulator.tsx` — extended `onSessionUpdate` with `ytdTotal`, compute YTD each tick
- `src/components/PageClient.tsx` — session state `ytdTotal`, initial YTD from `computeYtdTotal(entries, DEFAULT_RETURN_RATE)` on mount (code review: first-paint visibility), pass to ContextStrip
- `src/components/sections/ContextStrip.tsx` — `ytdTotal` prop, "So far this year" block with formatCurrency, tabular-nums, role="region"
- `tests/e2e/wealthtracker.spec.ts` — e2e test for YTD region
