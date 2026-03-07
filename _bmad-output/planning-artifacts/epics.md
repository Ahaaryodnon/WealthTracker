---
stepsCompleted: [1, '1-requirements-extracted', 2, '2-epics-approved', 3, '3-stories-created', 4, '4-final-validation']
inputDocuments:
  - "prd.md"
  - "architecture.md"
  - "ux-design-specification.md"
---

# WealthTracker-1 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for WealthTracker-1, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Display a live Accumulator showing the combined passive income of the top 10 billionaires, updating in real time.
FR2: Display a "since you arrived" session counter showing passive income accrued since the user landed on the page.
FR3: Display year-to-date cumulative total of combined passive income for the top 10.
FR4: Display a top 10 list with names, net worth, and individual passive income rates (e.g. per minute).
FR5: Display at least one relatable comparison (e.g. "earns median salary every X minutes/seconds").
FR6: Provide a methodology section explaining return assumptions (3%/5%/7%), sources, and "Data as of" timestamp.
FR7: Provide share functionality (Web Share API or copy link/copy) with one primary CTA.
FR8: Display source citations and data timestamps for credibility.
FR9: Consume billionaire data from a canonical dataset at build time (import from src/data/); data produced by pipeline and sync step from Convex.
FR10: Calculate passive income client-side using formula (net_worth × return_rate) / (365 × 24 × 3600) with a fixed reference time (data-as-of).
FR11: Implement a single-page layout with scroll order: hero (Accumulator + since you arrived + comparison) → top 10 list → methodology → share bar.
FR12: Support graceful degradation when JavaScript is disabled (static value + short message).
FR13: Pause or throttle counter updates when the document/tab is hidden.
FR14: Provide a runnable data pipeline that fetches from defined sources, validates, and writes to Convex; and a sync step that reads from Convex and writes to src/data/ for the app build.

### NonFunctional Requirements

NFR1: Accumulator visible within 2 seconds on 3G connection; FCP < 1.5s, TTI < 2.5s, LCP < 2.5s.
NFR2: Counter updates smoothly at 60fps (no jank or stuttering); client-side calculations must not block main thread.
NFR3: Initial JavaScript bundle < 100KB gzipped; total page weight < 500KB gzipped.
NFR4: Billionaire net worth data updated at least weekly; "Data as of" displayed in UI.
NFR5: 99.5% availability (allows for maintenance windows); static hosting with CDN and SSL.
NFR6: SEO: Server-side rendering or static generation for initial HTML; semantic structure; meta title, description, and Open Graph; mobile-friendly; fast load (Core Web Vitals).
NFR7: WCAG 2.1 Level AA: colour contrast (4.5:1 text, 3:1 UI), keyboard access, focus indicators, screen reader support, touch targets minimum 44×44px; respect prefers-reduced-motion for counter.
NFR8: Mobile-first responsive design: primary 320px–768px; tablet 768px–1023px; desktop 1024px+; Accumulator above the fold on mobile.
NFR9: Browser support: Chrome, Safari (iOS 14+), Firefox, Edge (last 2 versions); graceful degradation for older browsers (static display if JS fails).
NFR10: No authentication or user accounts for MVP; public, read-only; no API keys or secrets in client.

### Additional Requirements

- **Starter template (Epic 1 Story 1):** Initialize project with `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`; add `output: 'export'` to next.config for static export.
- **Data store:** Convex is primary data store; pipeline writes to Convex; sync step (e.g. `npm run data:sync`) reads from Convex and writes `src/data/` for Next.js build; app consumes only `src/data/` at build time (hybrid model).
- **Data pipeline (MVP):** Data sourcing (e.g. Forbes, Bloomberg, cross-check), acquisition (runnable script/CI), verification (per-source values, "Data as of", human review); pipeline writes to Convex; sync step before/during build.
- **Data model:** TypeScript interfaces; camelCase keys; dates ISO 8601; per-source net worth fields where applicable; shared types for app, pipeline, and Convex schema.
- **Frontend:** One client component owns a single `requestAnimationFrame` loop for both Accumulator and "since you arrived"; pause when document hidden; update single text node per tick to avoid layout thrash.
- **Infrastructure:** Vercel for app; Convex for database; `CONVEX_URL` in env for pipeline and sync only (not in browser for MVP hybrid).
- **UX design direction:** Minimal — monospace counter, high contrast, light background; one primary CTA (Share); tabular figures for numbers.
- **In-page scroll order:** Hero → comparison line → top 10 → methodology → share bar; optional in-page link to scroll to Methodology.
- **Error/loading:** No full-page spinner; optional skeleton for counter/list; if data or JS fails: static value + "Data as of [date]" or "Enable JavaScript for live updates."

### Additional Requirements Coverage

| Additional requirement | Related FR/NFR | Planned epic / implementation area |
|------------------------|----------------|-------------------------------------|
| Starter template (Epic 1 Story 1) | — | Epic 1 – Project init: first story |
| Data store (Convex, sync → src/data/) | FR9, FR14 | Epic 1 – Data pipeline & Convex setup |
| Data pipeline (MVP): sourcing, acquisition, verification | FR14 | Epic 1 – Data pipeline & Convex setup |
| Data model (TypeScript, camelCase, ISO, per-source) | FR9, FR14 | Epic 1 – Data model & pipeline |
| Frontend: one rAF loop, pause when hidden | FR1, FR2, FR13, NFR2 | Epic 3 – Live counter component |
| Infrastructure (Vercel, Convex, CONVEX_URL) | NFR5 | Epic 1 – Init & deployment config |
| UX design direction (Minimal, monospace, one Share CTA) | FR7, FR11 | Epic 2 – App layout & components; Epic 4 – Polish |
| In-page scroll order (hero → comparison → top 10 → methodology → share) | FR11 | Epic 2 – App layout & page structure |
| Error/loading (no full-page spinner, skeleton, static fallback) | FR12, NFR9 | Epic 2 – Layout; Epic 4 – Polish & reliability |

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Live Accumulator (real-time combined passive income) |
| FR2 | Epic 1 | "Since you arrived" session counter |
| FR3 | Epic 2 | Year-to-date cumulative total |
| FR4 | Epic 2 | Top 10 list (names, net worth, rates) |
| FR5 | Epic 2 | One relatable comparison (e.g. salary every X minutes) |
| FR6 | Epic 2 | Methodology section (assumptions, sources, "Data as of") |
| FR7 | Epic 3 | Share (Web Share API or copy) |
| FR8 | Epic 2 | Source citations and timestamps |
| FR9 | Epic 1 | Build-time data from src/data/ (pipeline + sync from Convex) |
| FR10 | Epic 1 | Client-side passive income formula and fixed reference time |
| FR11 | Epic 1 | Single-page scroll order (hero → top 10 → methodology → share) |
| FR12 | Epic 3 | Graceful degradation when JS disabled |
| FR13 | Epic 1 | Pause/throttle counter when tab hidden |
| FR14 | Epic 1 | Data pipeline + sync (sources → Convex → src/data/) |

## Epic List

### Epic 1: Live Accumulator with real data
Users can open the app and see the combined passive income of the top 10 billionaires updating in real time, with a "since you arrived" counter, backed by real sourced data.
**FRs covered:** FR1, FR2, FR9, FR10, FR11, FR13, FR14

### Epic 2: Understanding and credibility
Users can see who drives the total, how it's calculated, and one relatable comparison so the numbers feel understandable and trustworthy.
**FRs covered:** FR3, FR4, FR5, FR6, FR8

### Epic 3: Share and reliability
Users can share the calculator and experience it reliably (fast, accessible, with clear fallbacks).
**FRs covered:** FR7, FR12 + NFR1–NFR10

---

## Epic 1: Live Accumulator with real data

Users can open the app and see the combined passive income of the top 10 billionaires updating in real time, with a "since you arrived" counter, backed by real sourced data.

### Story 1.1: Initialize Next.js app with static export

As a **developer**,
I want **a Next.js app with TypeScript, Tailwind, and static export configured**,
So that **the project is runnable and ready for static deployment with SEO-friendly HTML**.

**Acceptance Criteria:**

**Given** the project repo is cloned and Node is available  
**When** I run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (or equivalent for existing folder)  
**Then** the app has `src/app/`, TypeScript, Tailwind, and ESLint configured  
**And** `next.config` includes `output: 'export'` so `next build` produces static assets in `out/`  
**And** `npm run dev` serves the app and `npm run build` succeeds

---

### Story 1.2: Add Convex and define schema

As a **developer**,
I want **Convex added to the project with a schema for billionaire data and metadata**,
So that **canonical data can be stored and synced for the app**.

**Acceptance Criteria:**

**Given** the Next.js app exists  
**When** I run `npx convex init` (or equivalent) and define the schema  
**Then** `convex/schema.ts` exists with tables for billionaire entries and metadata (e.g. `dataAsOf`, comparison baseline)  
**And** `.env.local` (and `.env.local.example`) document `CONVEX_URL` for pipeline and sync use  
**And** Convex dashboard/deployment is configured so the schema can be used by the pipeline

---

### Story 1.3: Define data model and TypeScript types

As a **developer**,
I want **TypeScript interfaces for the canonical billionaire dataset and metadata**,
So that **the app and pipeline share a single, type-safe data shape**.

**Acceptance Criteria:**

**Given** the Convex schema is defined  
**When** I add types (e.g. in `src/data/billionaires.types.ts` or equivalent)  
**Then** interfaces exist for each billionaire entry (e.g. name, net worth or per-source fields) and for metadata (`dataAsOf`, median salary)  
**And** field names use camelCase; dates use ISO 8601 strings  
**And** the same shape is usable by the app and by the pipeline/sync step (shared or mirrored types)

---

### Story 1.4: Implement data pipeline and sync step

As a **developer**,
I want **a runnable pipeline that fetches from sources, validates, and writes to Convex, and a sync step that writes Convex data to src/data/**,
So that **billionaire data can be updated and consumed by the app at build time**.

**Acceptance Criteria:**

**Given** Convex and the data model exist  
**When** I run the pipeline script (e.g. `npm run update-data`)  
**Then** it fetches from defined sources (e.g. Forbes, Bloomberg, or documented placeholders), validates data against the shared types, and writes to Convex  
**And** on validation failure the script exits non-zero and does not overwrite Convex with invalid data  
**When** I run the sync step (e.g. `npm run data:sync`)  
**Then** it reads the canonical dataset from Convex and writes it to `src/data/` (e.g. `billionaires.ts` or `.json`) in the same typed shape  
**And** on Convex read failure the sync does not overwrite `src/data/` with partial or invalid data  
**And** both scripts are documented (e.g. in README or architecture) and use `CONVEX_URL` from environment

---

### Story 1.5: Seed initial billionaire data

As a **developer**,
I want **initial billionaire data in Convex and in src/data/**,
So that **the app has real data to display when built**.

**Acceptance Criteria:**

**Given** the pipeline and sync step exist  
**When** I run the pipeline (and optionally a seed or manual step) to populate Convex  
**Then** Convex contains at least one billionaire entry (or a minimal set per product need) and metadata (`dataAsOf`, comparison baseline)  
**When** I run the sync step  
**Then** `src/data/` contains the same data in the typed format the app expects  
**And** the app can import from `src/data/` at build time and receive valid data

---

### Story 1.6: Build single-page layout and hero shell

As a **visitor**,
I want **a single page with a clear hero area and sections for the top 10, methodology, and share**,
So that **I see the intended structure and where the live counter will appear**.

**Acceptance Criteria:**

**Given** the app runs and can import data from `src/data/`  
**When** I load the app’s main route  
**Then** I see a single-page layout with scroll order: hero → (placeholder or section for) top 10 list → methodology → share bar (FR11)  
**And** the hero area has a dedicated place for the main Accumulator value and for the "since you arrived" value  
**And** layout is mobile-first and uses the design tokens/utility classes from the UX spec (minimal, high contrast)  
**And** no live counter logic is required yet; static placeholders or labels in the hero are acceptable

---

### Story 1.7: Implement Accumulator component with live counter

As a **visitor**,
I want **the combined passive income of the top 10 to tick up in real time and a "since you arrived" counter**,
So that **I feel the scale of inequality as it happens**.

**Acceptance Criteria:**

**Given** the hero shell exists and the app imports billionaire data and metadata from `src/data/`  
**When** I load the page  
**Then** one client component (e.g. `Accumulator`) owns a single `requestAnimationFrame` loop that computes and displays the combined passive income and the "since you arrived" value (FR1, FR2)  
**And** passive income per second is computed as `(net_worth × return_rate) / (365 × 24 × 3600)` using a fixed reference time (e.g. `dataAsOf`) for the main total and session start for "since you arrived" (FR10)  
**And** when the tab or document is hidden, the loop pauses or throttles (FR13)  
**And** the counter updates smoothly (e.g. 60fps, single text node or minimal DOM updates) so the main thread is not blocked (NFR2)  
**And** currency and numbers are formatted for display (e.g. tabular figures) per UX spec  
**And** the component is accessible (labels, optional `aria-live` or reduced announcements; respect `prefers-reduced-motion` where applicable)

---

### Epic 1: QA & test focus

**Purpose:** Test scenarios, edge cases, and verification notes so Epic 1 can be validated and regression-tested. Use for manual checks and (optionally) E2E/unit tests.

| Story | Happy path / smoke | Edge cases & failure modes | Verify |
|-------|--------------------|----------------------------|--------|
| **1.1** Init | `npm run dev` serves; `npm run build` produces `out/`; no runtime errors. | Build with `output: 'export'`; `out/` contains static HTML/JS. | Lint + build pass; open built site. |
| **1.2** Convex | Schema deploys; `.env.local.example` documents `CONVEX_URL`. | Missing `CONVEX_URL` → pipeline/sync fail with clear message (no silent overwrite). | Convex dashboard shows tables; run sync once. |
| **1.3** Data model | Types align with Convex schema and app imports. | Invalid/missing fields in pipeline output → type errors or validation failure. | Pipeline and sync use same types; no shape mismatch. |
| **1.4** Pipeline & sync | `npm run update-data` fetches, validates, writes to Convex; `npm run data:sync` writes `src/data/`; both use `CONVEX_URL`. | Validation failure → exit non-zero, no Convex write; Convex read failure → no overwrite of `src/data/`. | Run update-data with bad data (e.g. empty/malformed) → non-zero exit; run data:sync with Convex down → no overwrite. |
| **1.5** Seed data | Convex has ≥1 entry + metadata; sync produces valid `src/data/`; app imports and renders. | Empty Convex → sync still writes valid shape (empty array + metadata) or fails safely. | Build app after sync; page loads without runtime error. |
| **1.6** Layout & hero | Single page, hero → top 10 → methodology → share; hero has places for Accumulator and "since you arrived". | Mobile 320px and desktop 1024px; no layout shift when counter is added in 1.7. | Visual check; scroll order; responsive. |
| **1.7** Accumulator | Both numbers tick; formula matches `(net_worth × return_rate) / (365×24×3600)`; tab hidden → pause; visible again → resume. | Empty `entries` → no crash, static or zero; `prefers-reduced-motion` → throttled or static; JS disabled → static value + message (FR12). | Manual: tab away/back; reduced motion; run build and load static export. |

**Cross-story checks (Epic 1):**

- **Data integrity:** Pipeline → Convex → sync → `src/data/` → app: no shape mismatch; "Data as of" and entries consistent.
- **Performance:** Single rAF loop; no second component with its own timer; counter does not block main thread (smooth 60fps when visible).
- **Accessibility:** Labels and/or sr-only text for main total and "since you arrived"; `aria-live` for updates; reduced motion respected.
- **Static export:** `npm run build` and serve `out/` — page loads, data appears, counter runs (or static fallback when JS disabled).

**Suggested automation (optional):**

- **1.1:** CI step: `npm run build` (and optionally `npm run lint`).
- **1.4:** Scripted: run pipeline with invalid input → assert exit code ≠ 0; run sync with no Convex → assert no overwrite of `src/data/` or exit ≠ 0.
- **1.7:** E2E: load page → assert accumulator and "since you arrived" elements present and updating (or static if reduced motion); optional: assert visibility pause (e.g. mock `document.visibilityState`).

---

## Epic 2: Understanding and credibility

Users can see who drives the total, how it's calculated, and one relatable comparison so the numbers feel understandable and trustworthy.

### Story 2.1: Top 10 list (names, net worth, passive income rate)

As a **visitor**,
I want **to see a list of the top 10 billionaires with name, net worth, and passive income per minute**,
So that **I understand who drives the combined total**.

**Acceptance Criteria:**

**Given** the app has billionaire data from `src/data/`  
**When** I scroll to the top 10 section  
**Then** I see up to 10 rows, each showing name, net worth (formatted), and passive income rate (e.g. per minute) (FR4)  
**And** the list uses the same data and return assumption as the Accumulator  
**And** the list is readable on mobile and desktop (responsive); optional loading/skeleton if needed  
**And** the list is marked up with semantic HTML and is accessible (e.g. headings or table headers as appropriate)

---

### Story 2.2: Year-to-date cumulative total

As a **visitor**,
I want **to see how much combined passive income the top 10 have earned since the start of the year**,
So that **I have a citable, time-bound figure**.

**Acceptance Criteria:**

**Given** the app has billionaire data and `dataAsOf` (and return rate)  
**When** I view the page  
**Then** the year-to-date cumulative total is displayed (from 1 Jan of current year to the data reference time or current time, per product rule) (FR3)  
**And** the value is computed from the same formula and data as the Accumulator  
**And** the value is formatted as currency and is visible in the hero or a dedicated section (per UX)

---

### Story 2.3: Relatable comparison line

As a **visitor**,
I want **one clear comparison (e.g. "X earns a median annual salary every Y minutes")**,
So that **the scale of passive income is relatable**.

**Acceptance Criteria:**

**Given** the app has billionaire data and a comparison baseline (e.g. median salary) from metadata  
**When** I view the page  
**Then** I see one relatable comparison line, e.g. a named entity and "earns [baseline] every [time interval]" (FR5)  
**And** the comparison uses the same data and assumptions as the Accumulator  
**And** the line is in plain language and is visible in or near the hero (per UX scroll order)  
**And** if data is missing, the line is hidden or a safe fallback is shown

---

### Story 2.4: Methodology section and source citations

As a **visitor**,
I want **a methodology section explaining return assumptions, sources, and "Data as of"**,
So that **I can trust and cite the numbers**.

**Acceptance Criteria:**

**Given** the app has metadata (e.g. `dataAsOf`, sources) and a defined methodology  
**When** I scroll to the methodology section  
**Then** I see return assumptions (e.g. 3%/5%/7%) explained clearly (FR6)  
**And** I see source citations (e.g. Forbes, Bloomberg) and a "Data as of [date]" timestamp (FR8)  
**And** the section is scannable and linkable (e.g. anchor for "Methodology"); optional in-page link from hero  
**And** the section uses semantic headings and is accessible  
**And** methodology copy and sources align with the architecture and PRD

---

## Epic 3: Share and reliability

Users can share the calculator and experience it reliably (fast, accessible, with clear fallbacks).

### Story 3.1: Share bar (Web Share API or copy)

As a **visitor**,
I want **one primary action to share the page (native share or copy link)**,
So that **I can easily pass the experience to others**.

**Acceptance Criteria:**

**Given** I am on the WealthTracker page  
**When** I tap or click the Share CTA (e.g. "Share" button)  
**Then** the app uses the Web Share API when available, or falls back to copying the link (or a prepared message) to the clipboard (FR7)  
**And** the button has a clear label, is keyboard-focusable, and has a minimum 44×44px touch target (NFR7)  
**And** after copy, I get brief feedback (e.g. "Link copied") that is accessible (e.g. live region or focus management)  
**And** there is only one primary share CTA per the UX spec (no competing primary buttons in the hero)

---

### Story 3.2: Graceful degradation when JavaScript is disabled

As a **visitor without JavaScript**,
I want **to see a static total and a short message**,
So that **I still get the data and know why the counter is not live**.

**Acceptance Criteria:**

**Given** JavaScript is disabled or the counter script fails  
**When** I load the page  
**Then** I see a static value for the combined passive income (e.g. at page load or at a fixed time) (FR12)  
**And** I see a short, clear message (e.g. "Enable JavaScript for live updates" or "Data as of [date]")  
**And** the page does not show a broken or empty hero; the layout remains usable (NFR9)  
**And** critical content (methodology, top 10 if rendered server-side or in initial HTML) remains available where possible

---

### Story 3.3: Performance and SEO

As a **visitor and as a search engine**,
I want **the Accumulator to appear quickly and the page to be indexable**,
So that **the experience feels instant and the site can be discovered**.

**Acceptance Criteria:**

**Given** the app is built with static export  
**When** I load the page on a 3G-like connection  
**Then** the Accumulator (or its placeholder) is visible within 2 seconds; FCP &lt; 1.5s, TTI &lt; 2.5s, LCP &lt; 2.5s where feasible (NFR1)  
**And** the initial JavaScript bundle is under 100KB gzipped and total page weight under 500KB gzipped where feasible (NFR3)  
**And** the page has semantic HTML, a descriptive title and meta description, and Open Graph tags (NFR6)  
**And** the page is mobile-friendly and passes Core Web Vitals checks in line with the PRD  
**And** the main route is server-rendered or statically generated so crawlers receive content (NFR6)

---

### Story 3.4: Accessibility (WCAG 2.1 AA)

As a **visitor using a keyboard, screen reader, or reduced motion**,
I want **the calculator to be usable and understandable**,
So that **everyone can access the experience**.

**Acceptance Criteria:**

**Given** I use keyboard only, a screen reader, or prefer reduced motion  
**When** I use the page  
**Then** all interactive elements (e.g. Share) are focusable and operable by keyboard with visible focus indicators (NFR7)  
**And** colour contrast meets WCAG 2.1 AA (4.5:1 for text, 3:1 for UI components)  
**And** the Accumulator and "since you arrived" have clear, concise labels; live updates respect `prefers-reduced-motion` (e.g. less frequent or static) (NFR7)  
**And** touch targets are at least 44×44px; link and button text is descriptive (no "click here") (NFR7)  
**And** the layout remains usable when text is resized to 200% (NFR7)  
**And** automated checks (e.g. axe-core or Lighthouse) report no critical accessibility failures on the main flow
