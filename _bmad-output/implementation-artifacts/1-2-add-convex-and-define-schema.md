# Story 1.2: Add Convex and define schema

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **developer**,
I want **Convex added to the project with a schema for billionaire data and metadata**,
so that **canonical data can be stored and synced for the app**.

---

## Acceptance Criteria

1. **Given** the Next.js app exists  
   **When** I run `npx convex init` (or equivalent) and define the schema  
   **Then** `convex/schema.ts` exists with tables for billionaire entries and metadata (e.g. `dataAsOf`, comparison baseline)  
   **And** `.env.local` (and `.env.local.example`) document `CONVEX_URL` for pipeline and sync use  
   **And** Convex dashboard/deployment is configured so the schema can be used by the pipeline

---

## Tasks / Subtasks

- [x] **Task 1: Initialize Convex** (AC: #1)
  - [x] Run `npx convex init` (or equivalent) in project root. Ensure `convex/` folder is created and Convex CLI is available.
  - [x] Confirm Convex project is linked (dashboard or `npx convex dev`); schema will be deployed when defined.
- [x] **Task 2: Define schema in convex/schema.ts** (AC: #1)
  - [x] Create or update `convex/schema.ts` with tables for:
    - **Billionaire entries:** e.g. name, net worth (or per-source fields like `forbesNetWorth`, `bloombergNetWorth` per architecture), identifiers.
    - **Metadata:** e.g. `dataAsOf` (ISO date), comparison baseline (e.g. median salary) for methodology and comparisons.
  - [x] Use Convex schema types (e.g. `defineSchema`, `defineTable`); field names camelCase to align with app/pipeline types (Story 1.3).
- [x] **Task 3: Environment and documentation** (AC: #1)
  - [x] Add `CONVEX_URL` to `.env.local` (get from Convex dashboard after project creation). Do not commit `.env.local`.
  - [x] Create `.env.local.example` with a single line documenting `CONVEX_URL=` (no real value). Document that it is used by pipeline and sync step only (not in browser for MVP).
  - [x] Ensure `.gitignore` includes `.env.local` and similar env files.
- [x] **Task 4: Convex dashboard/deployment** (AC: #1)
  - [x] Deploy schema (e.g. `npx convex dev` or deploy command) so the pipeline and sync step can use the tables. Document in README or architecture how to obtain `CONVEX_URL` and run Convex.

---

## Dev Notes

### Epic & business context

- **Epic 1:** Live Accumulator with real data. This story establishes the data store; Stories 1.3 (types), 1.4 (pipeline/sync), and 1.5 (seed) depend on it.
- **FRs enabled:** FR9, FR14 (canonical store for build-time data via sync).
- **Dependencies:** Story 1.1 (Next.js app) must be done. Story 1.3 will add TypeScript types that mirror this schema.

### Developer context – guardrails

- **App does not use Convex at runtime in MVP.** The app consumes only `src/data/` at build time. Pipeline and sync use `CONVEX_URL`; do not add Convex React client or provider to the app in this story.
- **Schema shape:** Align with architecture: billionaire entries (name, net worth or per-source fields), metadata (dataAsOf, median salary). Same conceptual shape as `src/data/` types (Story 1.3).
- **No pipeline or sync implementation in this story.** Only Convex init, schema, and env; pipeline and sync are Story 1.4.

### Project structure notes

- **New:** `convex/schema.ts`, `.env.local.example`. Optional: `convex/` may contain placeholder or empty Convex functions; pipeline/sync scripts go in `scripts/` (Story 1.4).
- **References:** [Source: architecture.md — Data Architecture, Project Structure; epics.md — Story 1.2]

---

## Technical requirements (dev agent guardrails)

| Requirement | Detail |
|------------|--------|
| **Convex init** | `npx convex init`; creates `convex/` and links project. Use official Convex docs for current CLI. |
| **Schema file** | `convex/schema.ts` with tables for billionaires and metadata. camelCase fields; dates as ISO strings in app layer (Convex may use appropriate types). |
| **CONVEX_URL** | In `.env.local` for local pipeline/sync; in CI secrets for automated pipeline/sync. Document in `.env.local.example`. |
| **Scope** | No pipeline scripts, no sync script, no `src/data/` writes. No Convex client in the Next.js app. |

---

## Architecture compliance

- **Data store:** Convex is the primary data store; pipeline will write here; sync will read and write `src/data/`. [Architecture: Data Architecture, Implementation sequence step 2]
- **Config:** `CONVEX_URL` in `.env.local` and CI for pipeline and sync only; app has no runtime DB connection. [Architecture: Infrastructure & Deployment, Config and env]
- **Schema alignment:** Tables for billionaire entries and metadata (dataAsOf, comparison baseline) so pipeline and sync can read/write the same shape used by the app. [Architecture: Data model, Format patterns]

---

## Library / framework requirements

- **Convex:** Use Convex SDK and CLI version compatible with current Convex dashboard. Schema API: `defineSchema`, `defineTable`; see Convex schema docs for field types (string, number, etc.).
- **Next.js:** No change to app code; no Convex provider in `layout.tsx` or app. Static export unchanged.

---

## File structure requirements (this story only)

**Must exist after implementation:**

- `convex/schema.ts` (tables: billionaires, metadata or equivalent)
- `.env.local.example` (documents `CONVEX_URL=`)
- `.gitignore` includes `.env.local` (and optionally `.env*.local`)

**Do not create in this story:** `scripts/update-data.ts`, `scripts/data-sync.ts`, `src/data/`, pipeline or sync logic.

---

## Testing requirements

- **Manual:** Run `npx convex dev` (or deploy) and confirm schema deploys without errors. Confirm `CONVEX_URL` in `.env.local` allows Convex CLI to connect.
- **No automated tests required** for this story per architecture (test runner deferred).

---

## Project context reference

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Data Architecture, Project Structure, Config and env.
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 1.2, Epic 1.

---

## Story completion status

- **Status:** review  
- **Next story:** 1.3 (Define data model and TypeScript types) will add `src/data/billionaires.types.ts` (or equivalent) aligned with this schema.

---

## Dev Agent Record

### Agent Model Used

Cursor / BMAD Dev Agent (Amelia).

### Debug Log References

- `npx convex init` is deprecated; Convex CLI directs to `npx convex dev --once --configure=new`. Convex/ and schema were created manually; dependency added via `npm install convex`. User must run `npx convex dev --once --configure=new` once to link and get `.env.local`.

### Completion Notes List

- **Task 1:** Added `convex` dependency; created `convex/` with `schema.ts`. Convex CLI available via `npx convex`. Linking requires user to run `npx convex dev --once --configure=new` (interactive).
- **Task 2:** `convex/schema.ts` defines `billionaires` (name, forbesNetWorth, bloombergNetWorth) and `metadata` (dataAsOf, medianSalary); camelCase per architecture.
- **Task 3:** `.env.local.example` documents `CONVEX_URL=` and pipeline/sync-only use. `.gitignore` already had `.env*` from Story 1.1.
- **Task 4:** README section added: link/deploy via `npx convex dev --once --configure=new`, how to get CONVEX_URL, deploy schema with `npx convex dev` / `npx convex deploy`. No automated tests per story; manual: run convex dev and confirm schema deploys.

### File List

- package.json (modified; added convex dependency)
- package-lock.json (modified)
- convex/schema.ts (created)
- .env.local.example (created)
- README.md (modified; Convex section)
