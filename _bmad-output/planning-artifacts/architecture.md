---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-07'
inputDocuments:
  - "prd.md"
  - "product-brief-WealthTracker-2026-01-03.md"
  - "ux-design-specification.md"
  - "ux-design-directions.html"
workflowType: 'architecture'
project_name: 'WealthTracker-1'
user_name: 'Aaron'
date: '2026-03-07'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

- **Core experience:** Single-page app centred on a live Accumulator (combined passive income of top 10 billionaires) updating in real time, with a “since you arrived” session counter and one primary relatable comparison (e.g. “earns median salary every X seconds”).
- **Content blocks:** Top 10 list (names, net worth, passive income rate), methodology section (return assumptions 3%/5%/7%, sources, “Data as of”), share bar (one primary CTA; Web Share API or copy).
- **Data:** Static billionaire dataset (top 10, multi-source aggregated); client-side passive income calculation from net worth and return rate; median salary for comparisons; source citations and timestamps. MVP uses a static JSON file updated manually (e.g. weekly).
- **Interactions:** No auth or signup; no forms; value is immediate on load. Share and optional in-page “Methodology” link only. Real-time counter is display-only (no user control).
- **Scope:** One URL, one scroll hierarchy (hero → comparison → top 10 → methodology). No routes or tabs for MVP.

**Non-Functional Requirements:**

- **Performance:** Accumulator visible &lt; 2s on 3G; counter updates smooth (e.g. 60fps); FCP &lt; 1.5s, TTI &lt; 2.5s, LCP &lt; 2.5s. Initial JS bundle &lt; 100KB gzipped; total page &lt; 500KB gzipped. Real-time math and DOM updates must not block main thread.
- **SEO:** SSR or static generation for initial HTML; semantic structure; meta title/description and Open Graph; mobile-friendly; fast load (Core Web Vitals). Critical for journalist discoverability.
- **Accessibility:** WCAG 2.1 Level AA (contrast, focus, keyboard, screen reader, touch targets min 44×44px). Respect `prefers-reduced-motion` for counter updates.
- **Platform:** Web SPA, mobile-first (320px–768px primary); tablet/desktop as responsive enhancement. Chrome, Safari (iOS 14+), Firefox, Edge (last 2 versions). Graceful degradation if JS disabled (static value + short message).
- **Availability:** 99.5% uptime; static hosting (e.g. Vercel, Netlify) with CDN and SSL.

**Scale & Complexity:**

- **Primary domain:** Web front-end (SPA); client-side logic and static data for MVP.
- **Complexity level:** Low — single page, no backend, no auth, no multi-tenancy, no regulated industry compliance beyond accessibility.
- **Estimated architectural components:** One app shell; hero (Accumulator + “since you arrived” + comparison); top 10 list; methodology section; share bar; static data loader/calculator; optional service worker later.

### Technical Constraints & Dependencies

- **Architecture:** SPA with client-side only for MVP (no API or server runtime required for core features). Static hosting and CDN.
- **Data:** Single static JSON (or equivalent) with billionaire records; updated manually. Client computes passive income and “since you arrived” from in-memory state and timers.
- **Real-time:** Implemented with timers (e.g. `requestAnimationFrame` or `setInterval`) and deterministic formula: `(net_worth × return_rate) / (365 × 24 × 3600)` per second. Pause/resume on tab visibility to avoid background load.
- **UX stack:** Utility-first CSS (e.g. Tailwind); custom components only (no full UI library). Chosen design direction: Minimal (monospace counter, high contrast, light background).
- **Browser:** No offline requirement for MVP; optional service worker/PWA later. Share via Web Share API with copy fallback.

### Cross-Cutting Concerns Identified

- **Performance vs. real-time:** Smooth 60fps counter and &lt; 2s load require small critical JS, efficient DOM updates (e.g. single text node for counter), and no layout thrash. Choice of framework and update strategy affects both.
- **SEO vs. SPA:** Need SSR or static HTML for first paint and crawlers; client then hydrates for live counter. Affects choice of stack (e.g. Next.js static export, Astro, or vanilla with pre-rendered HTML).
- **Accessibility and live updates:** Counter and “since you arrived” need clear labels and optional `aria-live` or periodic announcements without overwhelming screen readers; respect reduced motion.
- **Data freshness and trust:** “Data as of” and methodology must be visible; static file implies a simple update process and possibly a future build step or script to refresh data.

### MVP Scope: Data Pipeline Included

**Decision:** MVP scope includes building out the data pipeline, not only the consumer app. Delivered in MVP:

- **Data sourcing:** Defined list of sources (e.g. Forbes, Bloomberg, and/or other public sources); documented in methodology and in architecture.
- **Data acquisition:** Implemented way to obtain and update the dataset — e.g. manual process with a script, or a runnable pipeline (local or CI) that fetches/parses from chosen sources and outputs the canonical dataset.
- **Data verification:** Ability to verify and cite data (e.g. per-source values where applicable, "Data as of" date, and a clear review step before data is used in the app).
- **Data model:** Typed structure (e.g. TypeScript interfaces) for the canonical dataset, including fields needed for sourcing and verification (sources, dates, comparison baseline).

The app still consumes a static file (e.g. `src/data/`) at build time; the pipeline produces or updates that file so that "the data" is a built artifact with a defined, repeatable process.

---

## Starter Template Evaluation

### Primary Technology Domain

**Web application (SPA with static/SSG)** — single-page experience, SEO via static HTML, client-side live counter. Aligns with PRD (SPA, static hosting) and UX (Tailwind, minimal, mobile-first).

### Starter Options Considered

- **create-next-app@latest (Next.js)** — React, TypeScript, Tailwind, App Router, ESLint by default; first-class Vercel deployment; supports `output: 'export'` for static export (SEO without a Node server). Selected.
- **Vite + React + TypeScript** — Lighter dev experience but would require a separate SSG/pre-render plugin for SEO; more manual setup for equivalent outcome.
- **Remix** — Strong but more server-oriented; static export possible; less aligned with "static JSON + client-only counter" and Vercel's default Next.js path.

### Selected Starter: create-next-app (Next.js)

**Rationale for selection**

- **React + TypeScript + Tailwind** out of the box, matching stated stack and UX (utility-first, custom components).
- **Static export** via `output: 'export'` gives crawler-friendly HTML and Core Web Vitals without a runtime server.
- **Vercel** is the default deployment target; no extra config.
- **Single-page flow** maps to one main route (e.g. `/`) with client components for the Accumulator and "since you arrived."
- **Bundle and performance** are manageable with Next.js tooling (code splitting, optimizations) and a small, focused page.

**Initialization command**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

*(Or run without `.` and pass a project name to create a new folder. Omit `--tailwind` or `--eslint` only if you intend to change those later.)*

**Architectural decisions provided by starter**

**Language & runtime**

- TypeScript enabled by default; strictness configurable in `tsconfig.json`.
- Node for build; static export produces static assets (no Node at runtime on Vercel when using static export).

**Styling**

- Tailwind CSS wired (PostCSS, content paths, theme). Matches UX spec (utility-first, custom Accumulator/comparison/top 10/methodology/share components).

**Build and output**

- Next.js App Router; `next build` with `output: 'export'` in `next.config` produces the `out/` static site.
- For WealthTracker MVP, the main UI lives in a single route (e.g. `src/app/page.tsx`) with client components for the live counter.

**Testing**

- No test runner included by default; add Vitest or Jest when ready.

**Linting / formatting**

- ESLint with Next.js config; no Prettier by default (add if desired).

**Code organization**

- `src/app/` for routes and layouts; `src/components/` (or similar) for Accumulator, "since you arrived," comparison, top 10, methodology, share bar. Clear place for static data (e.g. `src/data/` or `public/`).

**Development experience**

- `next dev` with fast refresh; `next build` and `next start` (or deploy `out/` to Vercel). Import alias `@/*` for `src/`.

**Note:** Project initialization using this command should be the first implementation story.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data store: Convex (primary); app consumes `src/data/` at build time via sync step (hybrid).
- Data: canonical dataset synced to `src/data/`; typed (TypeScript interfaces); Convex schema aligned.
- Data pipeline (MVP): sourcing, acquisition, verification; pipeline writes to Convex; sync step (Convex → `src/data/`) runs before/during build.
- Frontend: single `requestAnimationFrame` loop for Accumulator and "since you arrived"; pause when tab hidden; one client component owns the loop.
- Infrastructure: config in data file; Vercel default CI.

**Important Decisions (Shape Architecture):**
- No backend, no API, no auth for MVP.
- Accumulator uses fixed reference time (e.g. data-as-of); "since you arrived" uses session start.
- Multiple data sources (Forbes, Bloomberg, cross-check) with per-source storage and computed display value for verification and methodology.

**Deferred Decisions (Post-MVP):**
- Test runner (Vitest/Jest), PWA/service worker, analytics, A/B testing.

### Data Architecture

- **Data store: Convex.** Convex is the primary data store for billionaire data and metadata (e.g. `dataAsOf`, comparison baseline). Tables/schema in Convex hold the canonical dataset; the pipeline writes to Convex. **Database location:** Convex project (hosted); connection via Convex SDK and `CONVEX_URL` (or deployment URL) in environment for pipeline and for any build-time sync step.
- **App consumption (hybrid):** The Next.js app continues to consume data at **build time** from `src/data/` so static export and no-runtime-DB semantics are preserved. A **sync step** (e.g. script or Convex function + script) runs before or during build: reads from Convex and writes the canonical snapshot to `src/data/` (e.g. `billionaires.ts` or `.json`). The app imports that file; no Convex client in the browser for MVP unless we later switch to runtime reads.
- **Location & format (app-facing):** Single canonical dataset in `src/data/` (e.g. `billionaires.ts` or typed JSON). Build-time import; no runtime fetch for the app in the hybrid model.
- **Data model:** TypeScript interfaces for each entry (e.g. name, net worth per source or computed, source labels) and for metadata: `dataAsOf` (ISO date), comparison baseline (e.g. median salary). Per-source net worth fields when multiple sources (e.g. `forbes`, `bloomberg`) so we can compute average/median and show methodology. Same shape in Convex (tables/documents) and in `src/data/` so types are shared.
- **Validation:** Typed structures; optional runtime check on load. Human review step before data is committed for release. Pipeline validates before writing to Convex; sync step can re-validate when writing `src/data/`.
- **Updates:** Pipeline fetches from sources, validates, and writes to Convex. Sync step (e.g. `npm run data:sync` or CI) reads from Convex and writes `src/data/` for the Next.js build. Optional: Convex mutations/functions to expose pipeline results; or pipeline uses Convex client directly to write tables.

### Data Sourcing and Verification (MVP)

- **Sources:** Multiple sources for MVP: Forbes (primary), Bloomberg (when available), and one cross-check (e.g. Wikipedia or other public source). Methodology and architecture document the list; methodology page shows "Data as of" and source attribution.
- **Acquisition:** Runnable pipeline as part of MVP: e.g. script or tool (Node/TS) run locally or in CI (`npm run update-data` or similar) that fetches/parses from defined sources, validates, and **writes to Convex** (primary store). A separate **sync step** (`npm run data:sync` or equivalent) reads from Convex and writes the snapshot to `src/data/` for the Next.js build. Pipeline and sync can be manual-triggered or scheduled (e.g. weekly CI). Exact sites and parsing method to be implemented in line with their terms of use.
- **Verification:** Store per-source values where available in Convex and in the synced `src/data/` shape; compute display value (e.g. average or median) for net worth; show source breakdown in methodology. "Data as of" and source list in UI; human review before each release. Data model supports auditability (per-source fields, timestamp).

**Alternative: runtime Convex.** Instead of the hybrid (sync → `src/data/` → build-time import), the app can read from Convex at **runtime**: use the Convex React client in the Next app, query Convex (e.g. `useQuery` for the canonical dataset) in the page or in the Accumulator’s parent, and pass the result as props. **Implications:** (1) Full static export is no longer possible for that route unless you use a different deployment mode (e.g. server-rendered or hybrid Next.js with a server component that fetches from Convex and passes to client). (2) The app needs `CONVEX_URL` (or Convex provider) in the browser; Convex is designed for this. (3) Data can be updated in Convex and reflected on the next load (or in real time if using reactive queries) without a sync step or rebuild. (4) SEO: ensure the page that shows the Accumulator is still server-rendered or pre-rendered with data so crawlers see content (e.g. fetch in a server component or in `getStaticProps`/equivalent and pass to client). If you adopt this alternative, remove or repurpose the sync step, add the Convex provider and queries to the app, and document the chosen deployment/rendering strategy for SEO.

### Authentication & Security

- **MVP:** No authentication or user accounts. Public, read-only. No API keys or secrets in client; no backend to secure.
- **Later:** If added, handle outside this architecture; document in a future iteration.

### API & Communication

- **MVP:** No API layer. All data from static import. Share via Web Share API and/or copy; no server round-trips.
- **Later:** Any future API to be designed in a later architecture pass.

### Frontend Architecture

- **Counter updates:** One `requestAnimationFrame` loop in a single client component. Compute elapsed time from a fixed reference (e.g. data-as-of) for the main Accumulator so the value is deterministic and shareable; use session start for "since you arrived." Pause or throttle when document is hidden.
- **State/refs:** Refs for the tick loop and last update time; minimal React state for displayed values (or derive from refs on tick). Update a single text node (or minimal DOM) per tick to avoid layout thrash.
- **Components:** One client component owns the rAF loop and drives both Accumulator and "since you arrived." Rest of layout can be server or client as needed. Single main route (e.g. `src/app/page.tsx`); scroll order: hero → comparison → top 10 → methodology → share.
- **Accessibility:** Labels for counters; optional `aria-live` or periodic announcement; respect `prefers-reduced-motion`. Touch targets and focus per UX spec.

### Infrastructure & Deployment

- **Hosting:** Vercel for the Next.js app. **Convex** for the database (hosted; separate Convex project/deployment). Next.js static export (`output: 'export'`); deploy from repo or `out/` as appropriate.
- **Config:** Pipeline and sync step require **Convex**: `CONVEX_URL` (or Convex deployment URL) in environment (e.g. `.env.local` for local, CI secrets for pipeline/sync). "Data as of" and comparison baseline live in Convex and are synced into the static data file; app still reads only from `src/data/` at build time.
- **CI:** Vercel default (build on push). Optional: run ESLint in CI. Data pipeline writes to Convex; sync step (before or during build) pulls from Convex into `src/data/`. Pipeline and sync can be separate CI jobs (e.g. weekly `update-data` then `data:sync`, then build).
- **Monitoring:** Defer to post-MVP.

### Decision Impact Analysis

**Implementation sequence:**
1. **Init:** Run `create-next-app@latest` with TypeScript, Tailwind, ESLint, App Router, `src-dir` (first implementation story).
2. **Convex:** Add Convex to the project (`npx convex init` or equivalent); define schema (e.g. `billionaires` table, metadata for `dataAsOf`, median salary). Set `CONVEX_URL` in `.env.local` and in CI for pipeline/sync.
3. **Data model & pipeline:** Define TypeScript interfaces and canonical data shape (aligned with Convex schema). Implement runnable pipeline (sources, fetch/parse, validate, **write to Convex**). Implement **sync step** (read from Convex, write `src/data/` for the app). Document sources and verification steps.
4. **Seed data:** Produce initial canonical dataset (e.g. from Forbes + chosen cross-check), write to Convex, run sync to populate `src/data/`; "Data as of" and methodology text aligned.
5. **App layout & static content:** Page structure, methodology copy, top 10 list from data (import from `src/data/`), share bar.
6. **Live counter:** Single client component with rAF loop, elapsed-time math, pause when hidden; wire to data and display Accumulator and "since you arrived."
7. **Polish:** Comparisons from data, "Data as of" in UI, accessibility and performance checks.

**Cross-component dependencies:** (2) and (3) feed (4); (4) feeds (5) and (6) via `src/data/`. Pipeline and sync use Convex; app only reads from `src/data/` at build time. Pipeline and app share the same data types.

### Future Migrations

- **Runtime Convex:** Remove the sync step (and any CI that runs it); add Convex provider and queries in the app; document how the Accumulator page is server- or pre-rendered for SEO.
- **Adding routes:** Use Next.js dynamic segments (e.g. `[slug]`) per convention.
- **Adding tests:** Choose test runner and file convention (co-located vs `__tests__`) in the first test story and document in this section.

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical conflict points identified:** Naming (files, components, data fields), project structure (components, data, pipeline, Convex, tests), data and date formats, loading/error handling. Convex is the database (pipeline writes, sync reads); app consumes only `src/data/` at build time — patterns focus on app, pipeline, and sync consistency.

### Naming Patterns

**File and directory naming:**
- **Components:** PascalCase file names matching the component: `Accumulator.tsx` (owns the rAF loop and renders both main total and "since you arrived"—one file, one client component), `TopTenList.tsx`, etc. One component per file; default export is the component.
- **Data and types:** `src/data/` — canonical data file(s) named by domain: e.g. `billionaires.ts` or `billionaires.json`; types in same file or `billionaires.types.ts`. Sync step writes to this path; app imports from here. Pipeline writes to Convex.
- **Pipeline scripts:** `scripts/` at repo root for runnable data pipeline (e.g. `scripts/update-data.ts` or `update-billionaires.ts`). Use kebab-case for script names. npm script: `update-data` or `data:update`.
- **Utilities:** `src/lib/` or `src/utils/`; file names kebab-case (e.g. `format-currency.ts`, `passive-income-calc.ts`). Export named functions.

**Code naming:**
- **React components:** PascalCase. Props interfaces: `ComponentNameProps` or `AccumulatorProps`.
- **Functions and variables:** camelCase. Constants that are config: UPPER_SNAKE_CASE only when truly constant (e.g. `DEFAULT_RETURN_RATE`).
- **Data model (TypeScript):** Interfaces PascalCase (e.g. `BillionaireEntry`, `WealthTrackerData`). JSON field names in canonical data: **camelCase** so they match TypeScript and avoid conversion in the app.

**Routes:**
- Single route for MVP: `src/app/page.tsx` for `/`. No dynamic segments yet; if added later, use `[slug]` (Next.js convention).

### Structure Patterns

**Project organization:**
- **App:** `src/app/` — `page.tsx`, `layout.tsx`, `globals.css`. No route folders beyond app for MVP.
- **Components:** `src/components/` — flat or grouped by feature (e.g. `hero/Accumulator.tsx`, `methodology/MethodologySection.tsx`). Prefer one level of grouping if the list grows; avoid deep nesting.
- **Data:** `src/data/` — typed data and/or JSON consumed at build time. Sync step writes the canonical snapshot here; pipeline writes to Convex. Do not commit generated artifacts that duplicate untyped copies elsewhere.
- **Pipeline:** `scripts/` at repo root — data update script(s); they may import shared types from `src/data/` or a shared types path so pipeline and app stay aligned.
- **Tests:** Co-located `*.test.ts` / `*.test.tsx` next to the module, or a single `__tests__` beside `src/`. Same convention for pipeline: `scripts/__tests__/` or `scripts/*.test.ts`. Pick one and document it.
- **Static assets:** `public/` for images/favicon; app references by path from root (e.g. `/favicon.ico`).

**Config and env:**
- `next.config.ts` (or `.js`) at repo root. **Convex:** `.env.local` (and CI secrets) for `CONVEX_URL`; used by pipeline and sync step. App does not read Convex at runtime in the hybrid model; config for "Data as of" and baseline lives in Convex and is synced into `src/data/`.

### Format Patterns

**Data and JSON:**
- **Canonical data:** camelCase keys; dates as ISO 8601 strings (e.g. `"dataAsOf": "2026-03-07"`). Numbers as numbers; no stringified numerals.
- **Per-source fields:** Same casing (camelCase), e.g. `forbesNetWorth`, `bloombergNetWorth`; null when unavailable. Display value computed in code (average/median) and not duplicated as a key if it can be derived.
- **Types:** Mirror the above in TypeScript interfaces; one source of truth for the shape (shared by app and pipeline).

**No API in MVP:** N/A. If an API is added later, define response/error format then.

### Process Patterns

**Loading and error states (app):**
- **Counter:** Optional brief loading state (skeleton or placeholder) until first value; no full-page spinner. If data fails to load or is missing: show static fallback and short message ("Data temporarily unavailable" / "Data as of [date]") so the page remains usable.
- **Pipeline:** On failure, script exits non-zero and logs clearly; does not overwrite `src/data/` with partial or invalid data. Prefer "no write" on error so the last good data remains.

**Validation:**
- **App:** TypeScript for types; optional runtime check when importing data if needed.
- **Pipeline:** Validate fetched/parsed data against the same TypeScript types (or a shared schema) before writing; fail fast with a clear message.

### Enforcement Guidelines

**All agents MUST:**
- Use the naming and structure above so components, data, and scripts stay discoverable and consistent.
- Keep app consumption to `src/data/` (camelCase, ISO dates); Convex holds canonical data; pipeline writes to Convex; sync writes the same shape to `src/data/`.
- Use one client component for the rAF-driven counter; do not split into two components with separate loops.

**Pattern enforcement:**
- ESLint (and optional TypeScript strict mode) for code style; review PRs for structure and naming. Document any one-off exception in a comment and in the architecture doc if it becomes a precedent.

### Pattern Examples

**Good:**
- `src/components/hero/Accumulator.tsx` with default export `Accumulator`, props `AccumulatorProps`, and a single rAF loop for main total and "since you arrived."
- `src/data/billionaires.ts` exporting `BillionaireEntry[]` and `WealthTrackerData` with `dataAsOf: string`, `medianSalary: number`, entries with `name`, `netWorth` (or per-source fields), all camelCase.
- `scripts/update-data.ts` reading from configured sources, validating, and writing to Convex; `scripts/data-sync.ts` reading from Convex and writing `src/data/billionaires.ts` (or `.json`). Pipeline exits 1 on validation failure; sync does not overwrite on Convex read failure.

**Avoid:**
- Mixing kebab-case and PascalCase for component file names (e.g. `accumulator.tsx` next to `TopTenList.tsx`).
- snake_case in the canonical JSON/TS data (forces conversion in the app).
- Two separate components each running their own rAF or setInterval for the two counters.
- Sync step overwriting `src/data/` on Convex read failure or with invalid data; pipeline writing unvalidated data to Convex.

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
WealthTracker-1/
├── README.md
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .eslintrc.json
├── .gitignore
├── .env.local.example                # CONVEX_URL (for pipeline + sync; not in app runtime for hybrid)
├── .github/
│   └── workflows/
│       └── ci.yml                    # optional: lint + build; pipeline/sync can run here
├── convex/
│   ├── schema.ts                     # Convex schema (billionaires, metadata)
│   └── (Convex functions if used by pipeline/sync)
├── scripts/
│   ├── update-data.ts                # pipeline: fetch, parse, validate, write to Convex
│   ├── data-sync.ts                  # sync: read from Convex, write src/data/ for Next build
│   └── __tests__/
│       └── update-data.test.ts       # optional
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                  # single route: hero → comparison → top10 → methodology → share
│   ├── components/
│   │   ├── hero/
│   │   │   ├── Accumulator.tsx       # client: single rAF loop, main total + "since you arrived"
│   │   │   └── Accumulator.test.tsx
│   │   ├── ComparisonLine.tsx
│   │   ├── TopTenList.tsx
│   │   ├── MethodologySection.tsx
│   │   └── ShareBar.tsx
│   ├── data/
│   │   ├── billionaires.ts           # canonical data + types (or billionaires.json + .types.ts)
│   │   └── billionaires.types.ts     # if types split out
│   └── lib/
│       ├── format-currency.ts
│       ├── passive-income-calc.ts     # rate, elapsed time → display values
│       └── constants.ts              # DEFAULT_RETURN_RATE etc.
├── public/
│   ├── favicon.ico
│   └── (images if any)
└── _bmad-output/
    └── planning-artifacts/
        └── (this architecture and other planning docs)
```

### Architectural Boundaries

**API boundaries:** None in MVP for the app. App consumes only static data from `src/data/`. Pipeline writes to Convex (Convex SDK); sync step reads from Convex and writes to the filesystem. Convex is the database; no custom API layer.

**Component boundaries:**
- **Page:** `src/app/page.tsx` composes hero, comparison, top 10, methodology, share. Passes data (or data-derived props) from layout/page into components. Single client boundary: the hero (Accumulator) owns the rAF loop and receives data-as-of and rates as props.
- **Hero:** One client component (`Accumulator`) that owns the tick loop and renders both the main total and "since you arrived." No other component drives time-based updates.
- **Data flow:** Data is read at build time (import from `src/data/`). Page or layout imports and passes into components; no global state required for MVP.

**Data boundaries:**
- **Canonical data (source of truth):** Convex. Pipeline writes to Convex; sync step reads from Convex and writes `src/data/`. App reads only `src/data/` at build time (hybrid model). Shared TypeScript types keep Convex schema, pipeline, sync output, and app aligned.
- **Database location:** Convex (hosted). Connection via `CONVEX_URL` in env for pipeline and sync; app has no runtime DB connection. Static export produces `out/` with no server.

### Requirements to Structure Mapping

| Requirement / FR | Location |
|------------------|----------|
| Live Accumulator + "since you arrived" | `src/components/hero/Accumulator.tsx` |
| Relatable comparison line | `src/components/ComparisonLine.tsx` |
| Top 10 list | `src/components/TopTenList.tsx` |
| Methodology section | `src/components/MethodologySection.tsx` |
| Share bar | `src/components/ShareBar.tsx` |
| Data model + canonical dataset | `src/data/billionaires.ts` (and types) |
| Data pipeline (sourcing, verification) | `scripts/update-data.ts` (writes to Convex) |
| Data sync (Convex → app) | `scripts/data-sync.ts` (reads Convex, writes `src/data/`) |
| Convex schema & DB | `convex/schema.ts` (and Convex dashboard/deployment) |
| Passive income calculation | `src/lib/passive-income-calc.ts` |
| Formatting (currency, numbers) | `src/lib/format-currency.ts` |
| Single page layout | `src/app/page.tsx`, `layout.tsx` |

**Cross-cutting:** Types shared by app, pipeline, and Convex schema live in `src/data/` (e.g. `billionaires.types.ts`) or are mirrored in `convex/schema.ts`. Constants (e.g. return rate) in `src/lib/constants.ts`. Env: `CONVEX_URL` for pipeline and sync only.

### Integration Points

**Internal:** Page imports data and components; components receive props. No event bus or global store for MVP. Accumulator receives `dataAsOf`, entries (or computed rates), and optional callbacks if needed later.

**External:** Pipeline fetches from Forbes, Bloomberg, cross-check source; writes to Convex. Sync step reads from Convex and writes `src/data/`. App has no runtime external calls.

**Data flow:** Pipeline → Convex; sync (before/during build) → `src/data/`. Build time: app imports `src/data/billionaires.ts` → page/layout passes to components. Runtime: Accumulator runs rAF loop using data-as-of and session start; no further data fetch.

### File Organization Patterns

**Config:** Root-level `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `.eslintrc.json`. App has no runtime env. Pipeline and sync use `.env.local` (CONVEX_URL); provide `.env.local.example` in repo.

**Source:** `src/app` (routes/layout), `src/components` (by feature/area: hero, then flat for the rest), `src/data` (canonical data + types), `src/lib` (pure utils and constants).

**Tests:** Co-located `*.test.ts` / `*.test.tsx` next to the module, or `__tests__` alongside the code under test. One convention project-wide.

**Assets:** `public/` for favicon and static images; reference by root path.

### Development Workflow Integration

**Development:** `npm run dev` (Next.js) serves the app. Pipeline: `npm run update-data` (writes to Convex). Sync: `npm run data:sync` (Convex → `src/data/`). Run sync when Convex data changes; app reads whatever is in `src/data/` at build time. Run `data:sync` before every production build (locally or in CI) so the static export reflects the latest Convex snapshot.

**Build:** `next build` with `output: 'export'` produces `out/`. Data is inlined/bundled from `src/data/` at build time.

**Deployment:** Vercel builds from repo; output is static. Optional CI workflow runs lint and build; data pipeline can be scheduled or on-demand and commits updated `src/data/` (or run in CI and commit in a separate step).

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision compatibility:** Next.js (static export), TypeScript, Tailwind, Vercel, and client-only data consumption are aligned. Pipeline writes to Convex; sync step writes to `src/data/`; app imports at build time. Single rAF counter component and fixed/session time bases are consistent. No conflicting technology or pattern choices.

**Pattern consistency:** Naming (PascalCase components, kebab-case scripts, camelCase data), structure (`src/app`, `src/components`, `src/data`, `scripts/`), and process (pipeline fail-safe, optional loading state) support the decisions. No contradictory conventions.

**Structure alignment:** Directory tree matches decisions: single route, hero with Accumulator, data and pipeline separation, shared types. Boundaries (no API, static data only, one client counter) are respected.

### Requirements Coverage Validation ✅

**Functional requirements coverage:** Live Accumulator and "since you arrived" → `Accumulator.tsx` and rAF loop. Top 10, methodology, share, comparisons → mapped components and data. Data sourcing and verification → pipeline and data model. Single page, no auth → structure and boundaries. All FRs have a clear implementation location.

**Non-functional requirements coverage:** Performance (bundle, rAF, pause on hide) and SEO (static export) are addressed. WCAG 2.1 AA and touch targets are in patterns and UX. Config in data file; Vercel and CI documented. No gaps for MVP NFRs.

### Implementation Readiness Validation ✅

**Decision completeness:** Stack, data model, pipeline, frontend strategy, and infrastructure are documented with enough detail for implementation. Versions and commands (create-next-app, output: 'export') are specified.

**Structure completeness:** Full project tree with file-level detail; requirements-to-structure table; integration points and data flow described. Component boundaries and single-counter rule are clear.

**Pattern completeness:** Naming, structure, format, and process patterns cover app and pipeline. Examples and anti-patterns given. Enforcement guidelines and single client component rule are stated.

### Gap Analysis Results

**Critical gaps:** None. Implementation can proceed.

**Important gaps:** None blocking. Optional: add a short "Runbook" (how to run pipeline, how to add a source) in docs when pipeline is implemented.

**Nice-to-have:** Test runner choice (Vitest vs Jest) and test file convention (co-located vs `__tests__`) are "pick one"; documented as one convention project-wide. Can be fixed in first test story.

### Validation Issues Addressed

No blocking issues found. Architecture is coherent, requirements are covered, and patterns/structure are sufficient for AI agents to implement consistently.

### Architecture Completeness Checklist

**✅ Requirements analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall status:** READY FOR IMPLEMENTATION

**Confidence level:** High — validation confirms coherence, requirements coverage, and implementation readiness.

**Key strengths:** Clear single-page and data boundaries; pipeline and app share types and location; one counter component and time-base rules prevent divergence; naming and structure are defined so multiple agents can work consistently.

**Areas for future enhancement:** Runbook for pipeline and sources; test runner and convention locked in on first test story; optional E2E and monitoring later.

### Implementation Handoff

**AI agent guidelines:**
- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently (naming, structure, formats, process).
- Respect project structure and boundaries (one Accumulator client component, data only in `src/data/`, pipeline in `scripts/`).
- Refer to this document for all architectural questions.

**First implementation priority:** (1) Run `npx create-next-app@latest` with TypeScript, Tailwind, ESLint, App Router, `src-dir`, then add `output: 'export'` to `next.config` for static export. (2) Add Convex (`npx convex init`), define schema, set `CONVEX_URL` in `.env.local`. (3) Implement pipeline (write to Convex) and sync step (Convex → `src/data/`).
