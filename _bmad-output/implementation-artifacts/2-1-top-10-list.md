# Story 2.1: Top 10 list (names, net worth, passive income rate)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **visitor**,
I want **to see a list of the top 10 billionaires with name, net worth, and passive income per minute**,
so that **I understand who drives the combined total**.

---

## Acceptance Criteria

1. **Given** the app has billionaire data from `src/data/`  
   **When** I scroll to the top 10 section  
   **Then** I see up to 10 rows, each showing name, net worth (formatted), and passive income rate (e.g. per minute) (FR4)  
   **And** the list uses the same data and return assumption as the Accumulator  
   **And** the list is readable on mobile and desktop (responsive); optional loading/skeleton if needed  
   **And** the list is marked up with semantic HTML and is accessible (e.g. headings or table headers as appropriate)

---

## Tasks / Subtasks

- [x] **Task 1: Top 10 section and data source** (AC: #1)
  - [x] Ensure a dedicated section for the top 10 list exists in the page scroll order (hero → comparison → top 10 → methodology → share). PageClient already composes `<TopTenList entries={...} />`; confirm placement and section semantics.
  - [x] Pass `entries` (and if needed `medianSalary`) from page data; data comes from `src/data/` at build time (same as Accumulator). Use `DEFAULT_RETURN_RATE` from `src/lib/constants.ts` so the list matches the Accumulator’s return assumption.
- [x] **Task 2: List content — name, net worth, passive income per minute** (AC: #1)
  - [x] Each row: display name, net worth (formatted, e.g. compact for billions), and passive income per minute. Per-minute = per-second rate × 60; per-second = `(net_worth × return_rate) / (365 × 24 × 3600)` — reuse `combinedPassiveIncomePerSecond([entry], DEFAULT_RETURN_RATE)` from `src/lib/passive-income-calc.ts` for one entry.
  - [x] Format currency/numbers with `src/lib/format-currency.ts` (e.g. `formatCurrency`, `formatCompact`); use tabular figures for numbers per UX spec.
- [x] **Task 3: Responsive and optional loading** (AC: #1)
  - [x] Layout works on mobile (320px–768px) and desktop (1024px+); single column list, readable text. Optional: skeleton or “Loading…” placeholder if data is async (current app uses build-time data so may be N/A); empty state if `entries.length === 0` (e.g. “No data available” or “Run npm run data:sync”).
- [x] **Task 4: Semantic HTML and accessibility** (AC: #1)
  - [x] Use semantic structure: `<section aria-label="Top 10 Billionaires">`, heading (e.g. `<h2>`), and either a list (`<ol>`/`<li>`) or a table with proper `<th>` scope so screen readers can associate headers with cells. Ensure colour contrast and touch targets if any interactive elements (WCAG 2.1 AA).

---

## Dev Notes

### Epic & business context

- **Epic 2:** Understanding and credibility. This story delivers “who drives the total” so the Accumulator number feels grounded.
- **FRs delivered:** FR4 (top 10 list with names, net worth, passive income rate).
- **Dependencies:** Epic 1 complete (data in `src/data/`, hero and Accumulator in place). Same data and return rate as Accumulator.

### Developer context – guardrails

- **Reuse existing libs.** Do not reimplement passive income math; use `combinedPassiveIncomePerSecond` from `src/lib/passive-income-calc.ts` and `DEFAULT_RETURN_RATE` from `src/lib/constants.ts`. Use `formatCurrency` / `formatCompact` from `src/lib/format-currency.ts`. [Architecture: Pattern examples; Story 1.7 completion]
- **Net worth resolution.** Entries may have `netWorth`, `forbesNetWorth`, or `bloombergNetWorth`; resolve the same way as elsewhere (e.g. `entry.netWorth ?? entry.forbesNetWorth ?? entry.bloombergNetWorth ?? 0`). Net worth in data is in **billions**; multiply by 1e9 for dollar display. [Source: billionaires.types.ts, passive-income-calc]
- **Existing component.** `src/components/sections/TopTenList.tsx` already exists and is wired in `PageClient`. It shows name, net worth (formatCompact), passive income per minute, uses same data and DEFAULT_RETURN_RATE, has section/ol/li, empty state, and responsive layout. **Verify** it fully meets the acceptance criteria above (including semantic headings/table if preferred, and any optional loading/skeleton). If it does, mark story done; if not, extend or refactor to satisfy AC and UX (minimal, high contrast, tabular figures).

### Project structure notes

- **Existing:** `src/components/sections/TopTenList.tsx`, `src/lib/passive-income-calc.ts`, `src/lib/format-currency.ts`, `src/lib/constants.ts`, `src/data/billionaires.types.ts`.
- **Updated:** None required if TopTenList already meets AC; otherwise update TopTenList only. PageClient already passes `entries` and `medianSalary` to TopTenList.
- **References:** [Source: architecture.md — Requirements to Structure Mapping, Naming patterns; epics.md — Story 2.1; ux-design-specification.md — Top 10 list, Design Direction Minimal]

---

## Technical requirements (dev agent guardrails)

| Requirement | Detail |
|------------|--------|
| **Data source** | Same `entries` from `src/data/` as Accumulator; build-time import in parent; no Convex in browser. |
| **Return assumption** | Use `DEFAULT_RETURN_RATE` (0.05) from `src/lib/constants.ts` so list matches Accumulator. |
| **Formula** | Per-second rate = `(net_worth_billions × 1e9 × return_rate) / (365 × 24 × 3600)`. Per-minute = per-second × 60. Use `combinedPassiveIncomePerSecond([entry], DEFAULT_RETURN_RATE)` for one entry. |
| **Formatting** | Tabular figures; currency via `formatCurrency` / `formatCompact`. Net worth in billions → multiply by 1e9 for dollars. |
| **Semantic HTML** | Section with heading; list (ol/li) or table with proper th/scope; aria-label for section. |
| **Responsive** | Mobile-first; readable on 320px–768px and 1024px+; no horizontal scroll for content. |
| **Empty state** | If `entries.length === 0`, show short message (e.g. “No data available” or hint to run data:sync). |

---

## Architecture compliance

- **Component:** `src/components/sections/TopTenList.tsx` — already present; verify or implement to show name, net worth, passive income per minute. [Architecture: Requirements to Structure Mapping, Naming patterns]
- **Data flow:** Page/layout imports from `src/data/`; passes `entries` (and `medianSalary` if needed) to TopTenList. No Convex in app. [Architecture: Data boundaries, Component boundaries]
- **No new rAF/timers:** This component is display-only; no requestAnimationFrame or setInterval. [Architecture: Frontend Architecture]

---

## Library / framework requirements

- **React:** Can be server or client component; no need for client if only rendering props. Current TopTenList is client for expand state; if simplified to list-only, server component is fine.
- **Next.js:** Static export unchanged; data from build-time import.
- **Tailwind:** Use existing design tokens (zinc palette, font-mono, tabular-nums) per UX Minimal direction.

---

## File structure requirements (this story only)

**Must exist after implementation:**

- `src/components/sections/TopTenList.tsx` — displays up to 10 rows: name, net worth (formatted), passive income per minute; semantic section + list or table; responsive; empty state.

**May reuse unchanged:**

- `src/lib/passive-income-calc.ts`, `src/lib/format-currency.ts`, `src/lib/constants.ts`, `src/data/billionaires.types.ts`, `src/components/PageClient.tsx`.

**Do not:** Add a second data source or duplicate passive-income formula logic.

---

## Testing requirements

- **Manual:** Load page; scroll to top 10 section; verify up to 10 rows with name, net worth, and $X/min; verify same order and numbers as data; resize to mobile and desktop; verify empty state when entries are empty (e.g. mock empty array). Check heading and list/table semantics (e.g. screen reader or axe).
- **No automated tests** required for this story unless already present; optional co-located test later.

**QA (Epic 2):** See `_bmad-output/planning-artifacts/epics.md` → Epic 2. For this story: list uses same data and return rate as Accumulator; readable and accessible.

---

## Previous story intelligence (Epic 1)

- **Story 1.7 (Accumulator):** One client component with one rAF loop; formula in `passive-income-calc.ts`; `formatCurrency`/tabular figures; data from `src/data/` via props; no Convex in browser. TopTenList should use the same `entries`, `DEFAULT_RETURN_RATE`, and formatting helpers so the list and Accumulator stay in sync.
- **HeroSection** passes `entries`, `medianSalary`, `dataAsOf`; PageClient passes same to ContextStrip, ComparisonSection, TopTenList, MethodologySection. TopTenList already receives `entries` and `medianSalary`; ensure it does not require different props for this story.

---

## Project context reference

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Requirements to Structure Mapping, Frontend Architecture, Naming patterns.
- UX: `_bmad-output/planning-artifacts/ux-design-specification.md` — Top 10 list component, Minimal direction, tabular figures.
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 2.1, Epic 2.

---

## Story completion status

- **Status:** review  
- **Note:** TopTenList.tsx verified against AC; implementation complete (section, name/net worth/per-min, DEFAULT_RETURN_RATE, formatCompact/formatCurrency, semantic ol/li, empty state, aria-label on row). Ready for code review.

---

## Dev Agent Record

### Agent Model Used

Dev-story workflow (Amelia); story 2-1 specified by user.

### Debug Log References

( none )

### Completion Notes List

- **Verification:** TopTenList.tsx already implemented and met AC: section order in PageClient (Hero → ContextStrip → Comparison → TopTenList → Methodology → Share), entries + medianSalary from build-time data, DEFAULT_RETURN_RATE and combinedPassiveIncomePerSecond([entry], DEFAULT_RETURN_RATE)*60, formatCompact/formatCurrency, tabular-nums, section + h2 + ol/li, empty state, responsive layout.
- **Change:** Added per-row `aria-label` on the list row button for screen readers (name, net worth, $X/min, plus "details expanded" when open). No automated tests added (story: "No automated tests required for this story unless already present"). Lint and build passed.

### File List

- `src/components/sections/TopTenList.tsx` (modified: aria-label on row button)
