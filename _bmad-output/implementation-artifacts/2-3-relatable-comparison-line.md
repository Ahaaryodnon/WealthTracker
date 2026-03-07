# Story 2.3: Relatable comparison line

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **visitor**,
I want **one clear comparison (e.g. "X earns a median annual salary every Y minutes")**,
so that **the scale of passive income is relatable**.

---

## Acceptance Criteria

1. **Given** the app has billionaire data and a comparison baseline (e.g. median salary) from metadata  
   **When** I view the page  
   **Then** I see one relatable comparison line, e.g. a named entity and "earns [baseline] every [time interval]" (FR5)  
   **And** the comparison uses the same data and assumptions as the Accumulator  
   **And** the line is in plain language and is visible in or near the hero (per UX scroll order)  
   **And** if data is missing, the line is hidden or a safe fallback is shown

---

## Tasks / Subtasks

- [x] **Task 1: Single relatable comparison line** (AC: #1)
  - [x] Display one clear comparison: e.g. "[Named entity] earns [baseline, e.g. median annual salary] every [Y seconds/minutes]." Use `medianSalary` from metadata; use same return rate and entries as Accumulator. Compute time for one entity (e.g. top-ranked billionaire) to "earn" median salary: `medianSalary / passiveIncomePerSecondForEntity` = seconds; format as human-readable (e.g. "47 seconds" or "1.2 minutes").
  - [x] Plain language; visible in or near the hero (hero area or first section below). UX: "one clear comparison line" as shareable takeaway; scroll order hero → comparison → top 10 → methodology. [Source: ux-design-specification.md]
- [x] **Task 2: Data and consistency** (AC: #1)
  - [x] Use `entries`, `medianSalary` from same source as Accumulator; `DEFAULT_RETURN_RATE`. Per-entity passive income per second: `combinedPassiveIncomePerSecond([entry], DEFAULT_RETURN_RATE)` for the chosen entity (e.g. first in list). If `entries` or `medianSalary` missing/invalid, hide line or show fallback (e.g. "Comparison unavailable").
- [x] **Task 3: Accessibility and styling** (AC: #1)
  - [x] Semantic markup (e.g. inside section or paragraph); sufficient contrast and readable font per UX. No interactive requirement for this line.

---

## Dev Notes

### Epic & business context

- **Epic 2:** Understanding and credibility. One relatable comparison drives the "aha moment" (e.g. "earns your salary every X minutes").
- **FRs delivered:** FR5 (one relatable comparison).
- **Dependencies:** Epic 1 (data, metadata.medianSalary). HeroSection or ComparisonSection may already show comparison content; verify it matches this AC (one named entity + "earns [baseline] every [time]").

### Developer context – guardrails

- **Existing code.** HeroSection and/or ContextStrip may already render a comparison line (e.g. "earns median salary every X minutes"). If present, verify it uses medianSalary and same formula; if not, add or move one clear line into hero/near-hero. [Source: HeroSection, ContextStrip, ComparisonSection]
- **Reuse libs.** `combinedPassiveIncomePerSecond([entry], DEFAULT_RETURN_RATE)`, `formatCurrency`/duration formatting as needed. [Architecture: Pattern examples]
- **PRD/UX.** "One clear comparison"; "earns your annual salary every X minutes"; visible in or near hero. [Source: prd.md, ux-design-specification.md]

### Project structure notes

- **Existing:** `src/components/hero/HeroSection.tsx`, `src/components/sections/ContextStrip.tsx`, `src/components/sections/ComparisonSection.tsx`, `src/lib/passive-income-calc.ts`, `src/lib/constants.ts`, `src/data/billionaires.types.ts` (medianSalary in metadata).
- **Updated:** HeroSection, ContextStrip, or ComparisonSection — ensure exactly one primary comparison line matching AC; remove or demote duplicate messaging if any.

---

## Technical requirements (dev agent guardrails)

| Requirement | Detail |
|------------|--------|
| **Baseline** | Use `medianSalary` from metadata (e.g. wealthTrackerData.medianSalary). |
| **Entity** | Use one named entity (e.g. first entry in list or "The top 10 combined"); PRD examples use "X earns … every Y minutes" — can be top billionaire or combined. |
| **Formula** | Passive income per second for chosen entity/group; time = baseline / perSecond; format as seconds or minutes. |
| **Fallback** | If no entries or medianSalary ≤ 0, hide line or show short fallback text. |

---

## Architecture compliance

- **Data flow:** Props from page (entries, medianSalary); build-time data. [Architecture: Data boundaries]
- **Placement:** In or near hero; no new route. [Architecture: Requirements to Structure Mapping — ComparisonLine / hero]

---

## File structure requirements (this story only)

**Touch:** HeroSection and/or ContextStrip (and optionally ComparisonSection) so one clear comparison line is present and matches AC. Reuse passive-income-calc and constants.

---

## Testing requirements

- **Manual:** Check one line is visible in/near hero; copy is plain language; value matches (medianSalary / passiveIncomePerSecond for chosen entity). Test with empty data for fallback.
- **Optional:** Unit test for time calculation given fixed entry and medianSalary.

---

## References

- Epics: `_bmad-output/planning-artifacts/epics.md` Story 2.3. UX: `_bmad-output/planning-artifacts/ux-design-specification.md`. Architecture: `_bmad-output/planning-artifacts/architecture.md`.

---

## Dev Agent Record

### Agent Model Used

Dev-story workflow (Amelia); story 2-3 (relatable comparison line).

### Completion Notes List

- **Task 1–3:** Single comparison line added in `HeroSection`: first-ranked billionaire by name + "earns a median annual salary every [X seconds / Y minutes]." Time = `medianSalary / combinedPassiveIncomePerSecond([firstEntry], DEFAULT_RETURN_RATE)`; formatted via `formatComparisonDuration` (< 60s → "X seconds", else "Y.Y minutes"). Line only rendered when `entries.length > 0`, `medianSalary > 0`, and `secondsToEarnMedian > 0`; otherwise hidden (no fallback text per "hide or fallback" — chose hide).
- **Placement:** In hero, below Accumulator, above "Data as of" — visible in hero per AC. Scroll order unchanged (hero → ContextStrip → …).
- **Data:** Same `entries`, `medianSalary`, `DEFAULT_RETURN_RATE` as Accumulator; no new data source.
- **A11y:** `<p role="status">`, semantic inside existing section; text-sm, zinc-600/800/900 for contrast; tabular-nums on duration.
- **Tests:** No automated tests per story; manual verification. Lint and build passed.

### File List

- `src/components/hero/HeroSection.tsx` (updated: comparison line, formatComparisonDuration, conditional render)
