# Story 2.4: Methodology section and source citations

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **visitor**,
I want **a methodology section explaining return assumptions, sources, and "Data as of"**,
so that **I can trust and cite the numbers**.

---

## Acceptance Criteria

1. **Given** the app has metadata (e.g. `dataAsOf`, sources) and a defined methodology  
   **When** I scroll to the methodology section  
   **Then** I see return assumptions (e.g. 3%/5%/7%) explained clearly (FR6)  
   **And** I see source citations (e.g. Forbes, Bloomberg) and a "Data as of [date]" timestamp (FR8)  
   **And** the section is scannable and linkable (e.g. anchor for "Methodology"); optional in-page link from hero  
   **And** the section uses semantic headings and is accessible  
   **And** methodology copy and sources align with the architecture and PRD

---

## Tasks / Subtasks

- [x] **Task 1: Return assumptions (3%/5%/7%)** (AC: #1)
  - [x] Explain return assumptions clearly: e.g. 3%, 5%, 7% as conservative/moderate/aggressive or equivalent framing. State which rate is used for the main display (e.g. 5% per architecture). Copy aligned with PRD and architecture. [Source: architecture.md, prd.md]
- [x] **Task 2: Source citations and "Data as of"** (AC: #1)
  - [x] List source citations (e.g. Forbes, Bloomberg, or as per data pipeline). Display "Data as of [date]" using `dataAsOf` from metadata (ISO date formatted for display). FR8. [Source: epics.md, architecture — Data Sourcing and Verification]
- [x] **Task 3: Scannable, linkable, accessible** (AC: #1)
  - [x] Section has semantic headings (e.g. h2 "How we calculate this", subheadings for assumptions/sources). Add id (e.g. `id="methodology"`) for in-page anchor; optional in-page link from hero (e.g. "Methodology" or "How we calculate this"). Accessible: contrast, structure for screen readers. [Source: ux-design-specification.md]
- [x] **Task 4: Align with architecture and PRD** (AC: #1)
  - [x] Methodology text and source list must match architecture (e.g. Forbes, Bloomberg, pipeline); no conflicting claims. PRD: "transparent calculation explanation", "source citations and timestamps".

---

## Dev Notes

### Epic & business context

- **Epic 2:** Understanding and credibility. Methodology and sources build trust (journalists, policy readers).
- **FRs delivered:** FR6 (return assumptions), FR8 (source citations, "Data as of").
- **Dependencies:** Data model has `dataAsOf`; pipeline/sources documented in architecture. MethodologySection component already exists; verify and extend to fully meet AC.

### Developer context – guardrails

- **Existing component.** `src/components/sections/MethodologySection.tsx` exists; receives `dataAsOf`. It currently shows short methodology and expandable "See full methodology". Verify/add: (1) explicit 3%/5%/7% explanation, (2) source citations (Forbes, etc.), (3) prominent "Data as of [date]", (4) anchor id and optional hero link. [Source: MethodologySection.tsx, architecture.md]
- **Copy source.** Use architecture and PRD for exact source names and return-rate narrative; do not invent sources. [Source: architecture.md — Data Sourcing and Verification; prd.md]

### Project structure notes

- **Existing:** `src/components/sections/MethodologySection.tsx`, `src/data/billionaires.types.ts` (metadata.dataAsOf), PageClient passes `dataAsOf`.
- **Updated:** MethodologySection content and structure; optionally add anchor link in HeroSection or ContextStrip.

---

## Technical requirements (dev agent guardrails)

| Requirement | Detail |
|------------|--------|
| **Return assumptions** | Explain 3%, 5%, 7%; state which is used (e.g. 5% per DEFAULT_RETURN_RATE). |
| **Sources** | List Forbes, Bloomberg (or as per pipeline); match architecture. |
| **Data as of** | Display `dataAsOf` from metadata; format for locale (e.g. "Data as of 7 March 2026"). |
| **Anchor** | Section has `id="methodology"` (or similar); optional `<a href="#methodology">` in hero. |
| **Semantics** | Use `<section>`, `<h2>`, subheadings; no generic div-only structure. |

---

## Architecture compliance

- **Requirements to Structure Mapping:** Methodology section → `MethodologySection.tsx`. [Architecture]
- **Data:** dataAsOf from metadata; no new data source. [Architecture: Data boundaries]

---

## File structure requirements (this story only)

**Touch:** `src/components/sections/MethodologySection.tsx` (content and structure). Optionally hero/ContextStrip for in-page link.

---

## Testing requirements

- **Manual:** Scroll to methodology; verify 3%/5%/7% text, source list, "Data as of" date; click in-page link if present; check heading hierarchy and contrast.
- **Accessibility:** Heading order, screen reader pass.

---

## References

- Epics: `_bmad-output/planning-artifacts/epics.md` Story 2.4. Architecture: `_bmad-output/planning-artifacts/architecture.md`. PRD: `_bmad-output/planning-artifacts/prd.md`. UX: `_bmad-output/planning-artifacts/ux-design-specification.md`.

---

## Dev Agent Record

### Agent Model Used

Claude (dev-story for 2-4).

### Completion Notes List

- **Task 1:** Intro copy now states the main display uses 5% and references 3%/5%/7%; expandable table labels 5% as "Base (used for main display)" and includes short intro "We use three scenarios; the main display uses the 5% (base) rate."
- **Task 2:** "Data as of" displayed prominently above the first paragraph via `formatDataAsOf(isoDate)` (Intl.DateTimeFormat en-GB, e.g. "7 March 2026"). Sources section lists Forbes Real-Time Billionaires (primary), Bloomberg Billionaires Index (when available), US Census Bureau for median salary.
- **Task 3:** Section has `id="methodology"`; hero footnote includes `<a href="#methodology">Methodology</a>` with focus ring; semantic `<section>`, `<h2>`, `<h3>`; decorative chevron has `aria-hidden`.
- **Task 4:** Copy aligned with architecture (Forbes, Bloomberg, pipeline); no new or conflicting sources.

### File List

- `src/components/sections/MethodologySection.tsx` — return assumptions 3%/5%/7%, sources, Data as of; uses shared `formatDataAsOf` from `src/lib/format-date.ts`
- `src/components/hero/HeroSection.tsx` — added in-page link `<a href="#methodology">Methodology</a>`; uses shared `formatDataAsOf` for "Data as of" display
- `src/lib/format-date.ts` — shared `formatDataAsOf` (code review: consistent date formatting, invalid-date guard)
