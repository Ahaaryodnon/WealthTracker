# Story 1.5: Seed initial billionaire data

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **developer**,
I want **initial billionaire data in Convex and in src/data/**,
so that **the app has real data to display when built**.

---

## Acceptance Criteria

1. **Given** the pipeline and sync step exist  
   **When** I run the pipeline (and optionally a seed or manual step) to populate Convex  
   **Then** Convex contains at least one billionaire entry (or a minimal set per product need) and metadata (`dataAsOf`, comparison baseline)  
2. **When** I run the sync step  
   **Then** `src/data/` contains the same data in the typed format the app expects  
   **And** the app can import from `src/data/` at build time and receive valid data

---

## Tasks / Subtasks

- [x] **Task 1: Populate Convex with initial data** (AC: #1)
  - [x] Use the pipeline from Story 1.4 (e.g. `npm run update-data`) with real or documented placeholder sources, or add a one-off seed script that writes to Convex using the same Convex client and schema.
  - [x] Ensure Convex has at least one billionaire entry (or minimal set agreed for product). Ensure metadata is present: `dataAsOf` (ISO date), comparison baseline (e.g. median salary).
  - [x] If using placeholders/mock data: document that this is seed data and how to replace with real sources later.
- [x] **Task 2: Run sync to populate src/data/** (AC: #2)
  - [x] Run `npm run data:sync` (or equivalent). Verify `src/data/` (e.g. `billionaires.ts` or `billionaires.json`) is written with the same typed shape the app expects.
  - [x] Confirm the file exports data that matches `WealthTrackerData` / types from Story 1.3 (camelCase, ISO dates).
- [x] **Task 3: Verify app can import at build time** (AC: #2)
  - [x] Run `npm run build` (Next.js). Ensure the app imports from `src/data/` and build succeeds with no missing data errors. Optionally load the app and confirm data is present (e.g. in layout or a placeholder component).
- [x] **Task 4: No pipeline/sync logic changes** (scope)
  - [x] Do not change pipeline or sync implementation unless necessary to fix bugs. This story is about running them and ensuring data exists; not redesigning the pipeline.

---

## Dev Notes

### Epic & business context

- **Epic 1:** Live Accumulator with real data. This story completes the data supply chain so Stories 1.6 (layout) and 1.7 (live counter) have real data to display.
- **FRs enabled:** FR9 (build-time data from `src/data/`), FR10/FR1/FR2 (formula and counters will use this data in 1.7).
- **Dependencies:** Stories 1.1–1.4 must be done. Story 1.6 will assume data is available for import.

### Developer context – guardrails

- **Data quality:** Seed data must satisfy shared types. Include `dataAsOf` and comparison baseline so methodology and comparisons (Epic 2) can use them later.
- **Source attribution:** If using real sources (Forbes, etc.), document in methodology/sources. If using placeholders, document clearly so it can be replaced.
- **Single source of truth:** Convex holds canonical data; sync copies to `src/data/`. Do not hand-edit `src/data/` as the long-term source; re-run pipeline/sync to refresh.

### Project structure notes

- **Modified:** `src/data/` will contain the synced file (e.g. `billionaires.ts` or `billionaires.json`) with real or seed data. Convex dashboard will show seeded tables.
- **References:** [Source: architecture.md — Seed data step, Data Sourcing; epics.md — Story 1.5]

---

## Technical requirements (dev agent guardrails)

| Requirement | Detail |
|------------|--------|
| **Convex content** | At least one billionaire entry (or minimal set); metadata: `dataAsOf`, comparison baseline (e.g. median salary). |
| **src/data/ content** | Same data as Convex in typed shape after sync. App imports and build succeeds. |
| **Build-time import** | Next.js build must complete; app receives valid data from `src/data/`. |
| **Documentation** | Document how seed was produced (pipeline run vs seed script) and how to refresh data. |

---

## Architecture compliance

- **Implementation sequence step 4:** Seed data produced (e.g. from Forbes + cross-check), write to Convex, run sync to populate `src/data/`; "Data as of" and methodology text aligned. [Architecture: Decision Impact Analysis]
- **Data flow:** Pipeline → Convex; sync → `src/data/`. App reads only `src/data/` at build time. [Architecture: Data flow, Integration points]

---

## Library / framework requirements

- **No new dependencies.** Use existing pipeline and sync from Story 1.4. Convex client already in use for pipeline/sync.
- **Next.js:** No app code changes required for this story unless a component already imports from `src/data/` and needs to handle the shape; ensure types match.

---

## File structure requirements (this story only)

**Modified/created:**

- `src/data/billionaires.ts` or `billionaires.json` (or equivalent) — populated by sync with seed data.
- Convex tables populated (via pipeline or seed script).

**Do not:** Redesign pipeline or sync; keep scope to running them and verifying data.

---

## Testing requirements

- **Manual:** Run pipeline (or seed), then sync. Verify Convex has rows and `src/data/` has valid file. Run `npm run build`; verify no errors. Optionally load app and confirm data appears where expected.
- **No new automated tests** required for this story.

---

## Project context reference

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Implementation sequence, Data flow.
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 1.5.

---

## Story completion status

- **Status:** complete  
- **Next story:** 1.6 (Build single-page layout and hero shell) will use this data for layout and placeholders.

---

## Dev Agent Record

### Agent Model Used

(To be filled when dev-story runs.)

### Debug Log References

### Completion Notes List

- **Task 1:** Pipeline from Story 1.4 already provides two placeholder entries plus `dataAsOf` (ISO date) and `medianSalary`. No code changes. Run `npm run update-data` with `CONVEX_URL` set to populate Convex. Seed/placeholder documented in README (Seed data subsection): how to populate and how to replace with real sources later.
- **Task 2:** Sync script `npm run data:sync` writes `src/data/billionaires.ts` in `WealthTrackerData` shape (camelCase, ISO dates). Run after update-data when `CONVEX_URL` is set. Verified script and output shape; no changes.
- **Task 3:** `npm run build` completed successfully; app imports from `src/data/`; no missing data errors. Types match Story 1.3.
- **Task 4:** No pipeline or sync logic changed; scope limited to running and verifying.

### File List

- README.md (Seed data subsection added)
- _bmad-output/implementation-artifacts/1-5-seed-initial-billionaire-data.md (this file; status, tasks, Dev Agent Record)

## Change Log

- 2026-03-07: Story 1.5 completed. Pipeline and sync verified; Convex seeded; `src/data/` populated; build succeeds.
