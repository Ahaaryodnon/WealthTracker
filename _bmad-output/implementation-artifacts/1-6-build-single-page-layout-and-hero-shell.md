# Story 1.6: Build single-page layout and hero shell

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **visitor**,
I want **a single page with a clear hero area and sections for the top 10, methodology, and share**,
so that **I see the intended structure and where the live counter will appear**.

---

## Acceptance Criteria

1. **Given** the app runs and can import data from `src/data/`  
   **When** I load the app's main route  
   **Then** I see a single-page layout with scroll order: hero → (placeholder or section for) top 10 list → methodology → share bar (FR11)  
   **And** the hero area has a dedicated place for the main Accumulator value and for the "since you arrived" value  
   **And** layout is mobile-first and uses the design tokens/utility classes from the UX spec (minimal, high contrast)  
   **And** no live counter logic is required yet; static placeholders or labels in the hero are acceptable

---

## Tasks / Subtasks

- [x] **Task 1: Single-page structure in src/app/page.tsx** (AC: #1)
  - [x] Compose the main route so scroll order is: hero → top 10 section → methodology section → share bar. Use semantic sections (e.g. `<section>`, headings) or divs with clear structure.
  - [x] Import data from `src/data/` (e.g. `@/data/billionaires`) so the page has access to data; pass to sections as needed for placeholders or labels. Single route only; no extra routes for MVP.
- [x] **Task 2: Hero area** (AC: #1)
  - [x] Create a hero section with dedicated places for: (1) main Accumulator value, (2) "since you arrived" value. Use static placeholders or labels (e.g. "Accumulator: $X" / "Since you arrived: $Y" or "—" / "—"). No live counter or rAF in this story.
  - [x] Hero should be above the fold on mobile (per NFR8/UX). Use layout and spacing so the two values are clearly visible.
- [x] **Task 3: Top 10, methodology, share bar sections** (AC: #1)
  - [x] Add a section for the top 10 list (placeholder or minimal stub; full list is Epic 2). Add a section for methodology (placeholder or stub). Add a share bar section (placeholder or stub; full share is Epic 3). Scroll order must match FR11.
  - [x] No need to implement full content; placeholders or "Top 10", "Methodology", "Share" labels are acceptable.
- [x] **Task 4: Mobile-first, UX spec alignment** (AC: #1)
  - [x] Layout is mobile-first (320px–768px primary). Use design tokens/utility classes from UX spec: minimal, high contrast, light background. No full-page spinner; optional skeleton only if needed.
- [x] **Task 5: No live counter** (scope)
  - [x] Do not implement the Accumulator component with rAF or live updates; that is Story 1.7. Static placeholders or labels only.

---

## Dev Notes

### Epic & business context

- **Epic 1:** Live Accumulator with real data. This story delivers the page structure and hero shell so 1.7 can drop in the live Accumulator component.
- **FRs enabled:** FR11 (single-page scroll order: hero → top 10 → methodology → share).
- **Dependencies:** Stories 1.1–1.5 (app exists, data in `src/data/`). Story 1.7 will add the live Accumulator in the hero.

### Developer context – guardrails

- **Scroll order:** Hero → comparison (can be a line or placeholder) → top 10 → methodology → share bar. Architecture and UX specify this order. [Architecture: Frontend Architecture, Requirements to Structure Mapping]
- **Components:** Create only what is needed for layout and placeholders. Full components (TopTenList, MethodologySection, ShareBar) can be stubs or minimal; detailed implementation is Epic 2/3. Hero is the focus: two dedicated spots for Accumulator and "since you arrived."
- **Data:** Page or layout imports from `src/data/` and can pass data (or derived props) into sections. No Convex in app; build-time data only.
- **UX spec:** Minimal, high contrast, light background; monospace/tabular figures for numbers (can be applied in 1.7). [UX spec: design direction]

### Project structure notes

- **New/updated:** `src/app/page.tsx` (and possibly `src/components/` for hero wrapper, section stubs). Prefer `src/components/hero/` for hero-only content; other sections can be inline or minimal components. Do not create full `Accumulator.tsx` with rAF yet.
- **References:** [Source: architecture.md — Frontend Architecture, Project Structure, Requirements to Structure Mapping; epics.md — Story 1.6; ux-design-specification.md]

---

## Technical requirements (dev agent guardrails)

| Requirement | Detail |
|------------|--------|
| **Scroll order** | hero → top 10 → methodology → share bar (FR11). |
| **Hero** | Two dedicated areas: main Accumulator value, "since you arrived" value. Static placeholders/labels only. |
| **Mobile-first** | 320px–768px primary; hero above the fold. |
| **Data** | Import from `src/data/`; pass to sections as needed. No live counter logic. |
| **Design** | Minimal, high contrast, per UX spec; utility classes (e.g. Tailwind). |

---

## Architecture compliance

- **Page structure:** `src/app/page.tsx` composes hero, comparison, top 10, methodology, share. [Architecture: Frontend Architecture, Project Structure]
- **Single route:** One main route; no dynamic segments. [Architecture: Routes]
- **Data flow:** Data read at build time (import from `src/data/`); page passes to components. [Architecture: Component boundaries, Integration points]

---

## Library / framework requirements

- **Next.js App Router:** Single `page.tsx`; can use server or client components as needed. Hero can be server-rendered with placeholders.
- **Tailwind:** Use for layout and styling; align with UX spec (minimal, high contrast).
- **No new runtime dependencies** beyond existing stack.

---

## File structure requirements (this story only)

**Expected:**

- `src/app/page.tsx` — composes hero, top 10, methodology, share sections in order.
- Optional: `src/components/hero/HeroSection.tsx` or similar for hero layout (with placeholder slots); or hero inline in page.
- Optional: minimal stubs for TopTenList, MethodologySection, ShareBar (or just sections with headings/placeholders).

**Do not create:** `Accumulator.tsx` with requestAnimationFrame or live counter logic (Story 1.7).

---

## Testing requirements

- **Manual:** Load main route; verify scroll order and hero with two placeholder areas. Resize to mobile width; verify hero above the fold and mobile-first layout. Run `npm run build`; verify static export succeeds.
- **No automated tests** required for this story per architecture.

---

## Project context reference

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Frontend Architecture, Project Structure, Requirements to Structure Mapping.
- UX: `_bmad-output/planning-artifacts/ux-design-specification.md` — design direction, mobile-first.
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 1.6.

---

## Story completion status

- **Status:** review
- **Next story:** 1.7 (Implement Accumulator component with live counter) will replace hero placeholders with the live component.

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Built single-page layout in `src/app/page.tsx` with scroll order: hero → top 10 → methodology → share bar (FR11).
- Created `HeroSection` component with static placeholders for Accumulator ("$—") and "since you arrived" ("$—"), plus a relatable comparison line computing median salary interval from data.
- Top 10 section renders entries from `src/data/billionaires.ts` with name and net worth, or a fallback message if data is empty.
- Methodology section includes explanation of 3%/5%/7% return assumptions and data sourcing.
- Share bar section with disabled placeholder button.
- Mobile-first layout using Tailwind: max-w-3xl container, responsive text sizing, min-h-[70vh] hero for above-the-fold on mobile.
- Minimal, high-contrast design per UX spec: light background, near-black text, monospace for numbers, tabular-nums for list.
- Updated metadata in `layout.tsx` to reflect project title and description.
- No live counter logic (deferred to Story 1.7). No new runtime dependencies.
- `npm run build` succeeds (static export). `npm run lint` passes (0 errors).

### Change Log

- 2026-03-07: Story 1.6 implemented — single-page layout and hero shell.

### File List

- `src/app/page.tsx` — modified: full single-page layout composing hero, top 10, methodology, share bar sections.
- `src/app/layout.tsx` — modified: updated metadata title and description.
- `src/components/hero/HeroSection.tsx` — new: hero section component with Accumulator and "since you arrived" placeholders.
- `src/components/PageClient.tsx` — new: client wrapper composing hero, context strip, comparison, top 10, methodology, share sections.
- `src/components/sections/ContextStrip.tsx` — new: context strip section.
- `src/components/sections/ComparisonSection.tsx` — new: comparison section.
- `src/components/sections/TopTenList.tsx` — new: top 10 list section.
- `src/components/sections/MethodologySection.tsx` — new: methodology section.
- `src/components/sections/ShareSection.tsx` — new: share bar section.
- `src/components/sections/ScrollProgress.tsx` — new: scroll progress indicator.
