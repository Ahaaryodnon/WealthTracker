# Story 1.4: Implement data pipeline and sync step

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **developer**,
I want **a runnable pipeline that fetches from sources, validates, and writes to Convex, and a sync step that writes Convex data to src/data/**,
so that **billionaire data can be updated and consumed by the app at build time**.

---

## Acceptance Criteria

1. **Given** Convex and the data model exist  
   **When** I run the pipeline script (e.g. `npm run update-data`)  
   **Then** it fetches from defined sources (e.g. Forbes, Bloomberg, or documented placeholders), validates data against the shared types, and writes to Convex  
   **And** on validation failure the script exits non-zero and does not overwrite Convex with invalid data  
2. **When** I run the sync step (e.g. `npm run data:sync`)  
   **Then** it reads the canonical dataset from Convex and writes it to `src/data/` (e.g. `billionaires.ts` or `.json`) in the same typed shape  
   **And** on Convex read failure the sync does not overwrite `src/data/` with partial or invalid data  
3. **And** both scripts are documented (e.g. in README or architecture) and use `CONVEX_URL` from environment

---

## Tasks / Subtasks

- [x] **Task 1: Pipeline script (scripts/)** (AC: #1, #3)
  - [x] Create `scripts/update-data.ts` (or kebab-case equivalent, e.g. `update-billionaires.ts`). Use Node/TS; runnable via `npm run update-data` (add script to `package.json`).
  - [x] Fetch from defined sources (Forbes, Bloomberg, or documented placeholders/mock data). Document sources and any terms-of-use constraints in README or architecture.
  - [x] Parse and validate fetched data against shared types from `src/data/billionaires.types.ts` (or shared module). If validation fails: exit non-zero, log clearly, do not write to Convex.
  - [x] Write validated data to Convex (Convex client/SDK). Use `CONVEX_URL` from environment (e.g. `process.env.CONVEX_URL`); fail if missing.
- [x] **Task 2: Sync step script** (AC: #2, #3)
  - [x] Create `scripts/data-sync.ts` (or equivalent name). Runnable via `npm run data:sync`.
  - [x] Read canonical dataset from Convex. On read failure: do not overwrite `src/data/`; exit non-zero and log.
  - [x] Write output to `src/data/` in the same typed shape (e.g. `billionaires.ts` or `billionaires.json`). Use shared types so output is type-safe. Do not write partial or invalid data.
  - [x] Use `CONVEX_URL` from environment.
- [x] **Task 3: Documentation** (AC: #3)
  - [x] Document in README (or linked architecture) what `update-data` and `data:sync` do, that they require `CONVEX_URL`, and when to run them (e.g. before build, or in CI).
- [x] **Task 4: No app runtime Convex** (scope)
  - [x] Do not add Convex provider or client to the Next.js app. App continues to consume only `src/data/` at build time.

---

## Dev Notes

### Epic & business context

- **Epic 1:** Live Accumulator with real data. This story delivers the data supply chain: sources → pipeline → Convex → sync → `src/data/`.
- **FRs enabled:** FR14 (pipeline + sync), FR9 (app consumes `src/data/` at build time).
- **Dependencies:** Stories 1.1, 1.2, 1.3 must be done. Story 1.5 (seed) will use pipeline + sync to populate initial data.

### Developer context – guardrails

- **Pipeline on failure:** Exit non-zero; do not overwrite Convex with invalid data. Prefer no write on error. [Architecture: Process patterns]
- **Sync on failure:** Do not overwrite `src/data/` on Convex read failure or with invalid data. Last good data remains. [Architecture: Process patterns, Avoid]
- **Script location:** `scripts/` at repo root; kebab-case file names. [Architecture: Naming patterns, Structure patterns]
- **Shared types:** Pipeline and sync import from `src/data/` (or shared types path) so validation and output stay aligned. [Architecture: Enforcement guidelines]

### Project structure notes

- **New:** `scripts/update-data.ts`, `scripts/data-sync.ts`, npm scripts `update-data` and `data:sync`.
- **References:** [Source: architecture.md — Data Sourcing and Verification, Implementation Patterns, Pattern examples; epics.md — Story 1.4]

---

## Technical requirements (dev agent guardrails)

| Requirement | Detail |
|------------|--------|
| **Pipeline** | `npm run update-data` → fetch, validate (shared types), write to Convex. Exit non-zero on validation failure; no write on failure. |
| **Sync** | `npm run data:sync` → read from Convex, write to `src/data/` in typed shape. No overwrite on Convex read failure. |
| **CONVEX_URL** | Both scripts read from environment. Document in README and `.env.local.example`. |
| **Output format** | Same shape as `WealthTrackerData` / billionaires.types; camelCase, ISO dates. File: `billionaires.ts` or `.json` per architecture. |

---

## Architecture compliance

- **Pipeline:** Runnable script (e.g. `scripts/update-data.ts`); fetches, validates, writes to Convex; exits 1 on validation failure. [Architecture: Data Sourcing, Process patterns, Pattern examples]
- **Sync:** Script reads Convex, writes `src/data/`; does not overwrite on failure. [Architecture: Data Architecture, Pattern examples, Avoid]
- **Naming:** Kebab-case script names; npm scripts `update-data` or `data:update`, `data:sync`. [Architecture: Naming patterns]

---

## Library / framework requirements

- **Convex:** Use Convex Node/TS client for pipeline (write) and sync (read). Follow current Convex docs for server/backend usage.
- **TypeScript:** Scripts can be run with `tsx` or compiled to JS; ensure `package.json` scripts invoke the correct entry (e.g. `tsx scripts/update-data.ts`).
- **No new app dependencies.** Pipeline and sync are Node scripts; Next.js app unchanged.

---

## File structure requirements (this story only)

**Must exist after implementation:**

- `scripts/update-data.ts` (or equivalent kebab-case name)
- `scripts/data-sync.ts` (or equivalent)
- `package.json` scripts: `update-data`, `data:sync`
- README or doc update describing pipeline and sync and `CONVEX_URL`

**Do not add:** Convex provider in app; no `src/data/` content beyond what sync writes (real data is Story 1.5).

---

## Testing requirements

- **Manual:** Run `npm run update-data` with valid `CONVEX_URL` (and mock/placeholder sources if needed); expect success or documented failure. Run `npm run data:sync`; expect `src/data/` to be written when Convex has data. Run pipeline with invalid data; expect non-zero exit and no Convex overwrite.
- **No automated tests required** for this story per architecture; optional `scripts/__tests__/` later.

---

## Project context reference

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Data Sourcing and Verification, Process patterns, Pattern examples.
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 1.4.

---

## Story completion status

- **Status:** review  
- **Next story:** 1.5 (Seed initial billionaire data) will use pipeline and sync to populate Convex and `src/data/`.

---

## Dev Agent Record

### Agent Model Used

(To be filled when dev-story runs.)

### Debug Log References

### Completion Notes List

- Pipeline: `scripts/update-data.ts` — loads `.env.local`, validates CONVEX_URL, fetches placeholder data (mock), validates against WealthTrackerData, calls Convex mutation `data.replaceCanonicalData`. Exits 1 on validation or mutation failure; does not write to Convex on failure.
- Sync: `scripts/data-sync.ts` — loads `.env.local`, validates CONVEX_URL, calls Convex query `data.getCanonicalData`; if null (no metadata) exits 1 and does not overwrite `src/data/`. Writes `src/data/billionaires.ts` with typed export.
- Convex: `convex/data.ts` — mutation `replaceCanonicalData` (replace all billionaires + metadata), query `getCanonicalData` (return full canonical shape for sync).
- README: Data pipeline and sync section added; CONVEX_URL and when to run documented.
- No Convex provider or client added to the app; verified no Convex usage in `src/`.
- Story says no automated tests required; manual verification: build passes.

### File List

- convex/data.ts
- scripts/update-data.ts
- scripts/data-sync.ts
- package.json (scripts update-data, data:sync; devDependencies dotenv, tsx)
- README.md (Data pipeline and sync section)
- .env.local.example (CONVEX_URL documented)
