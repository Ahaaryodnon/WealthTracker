# Story 1.3: Define data model and TypeScript types

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **developer**,
I want **TypeScript interfaces for the canonical billionaire dataset and metadata**,
so that **the app and pipeline share a single, type-safe data shape**.

---

## Acceptance Criteria

1. **Given** the Convex schema is defined  
   **When** I add types (e.g. in `src/data/billionaires.types.ts` or equivalent)  
   **Then** interfaces exist for each billionaire entry (e.g. name, net worth or per-source fields) and for metadata (`dataAsOf`, median salary)  
   **And** field names use camelCase; dates use ISO 8601 strings  
   **And** the same shape is usable by the app and by the pipeline/sync step (shared or mirrored types)

---

## Tasks / Subtasks

- [x] **Task 1: Create src/data/ and types file** (AC: #1)
  - [x] Ensure `src/data/` exists. Create `src/data/billionaires.types.ts` (or equivalent per architecture).
  - [x] Define interfaces for billionaire entry: e.g. `BillionaireEntry` with `name`, `netWorth` and/or per-source fields (`forbesNetWorth`, `bloombergNetWorth`), other identifiers as needed. Use PascalCase for interface names.
- [x] **Task 2: Define metadata interface** (AC: #1)
  - [x] Define metadata type (e.g. `WealthTrackerMetadata`) with `dataAsOf: string` (ISO 8601), `medianSalary: number` (or comparison baseline field). camelCase for all keys.
- [x] **Task 3: Canonical dataset shape** (AC: #1)
  - [x] Define a type for the full canonical dataset (e.g. `WealthTrackerData`: `{ dataAsOf, medianSalary, entries: BillionaireEntry[] }` or equivalent) so app and sync step can import and use the same shape.
- [x] **Task 4: Convex and pipeline alignment** (AC: #1)
  - [x] Ensure types mirror or align with `convex/schema.ts` (Story 1.2) so pipeline can validate against these types and sync can write typed data to `src/data/`. Shared types = one source of truth; pipeline and app both use these interfaces.
- [x] **Task 5: No runtime data file yet** (scope)
  - [x] Do not create `billionaires.ts` or `billionaires.json` with real data in this story; that is Story 1.5. Optional: export an empty array or placeholder from `src/data/billionaires.ts` that satisfies the types if the app already imports from `src/data/` in later stories; otherwise types-only is sufficient.

---

## Dev Notes

### Epic & business context

- **Epic 1:** Live Accumulator with real data. This story defines the contract for all data flow: Convex ↔ sync ↔ app.
- **FRs enabled:** FR9, FR10 (typed data for formula and display), FR14 (pipeline/sync use same shape).
- **Dependencies:** Story 1.2 (Convex schema) must exist. Story 1.4 (pipeline/sync) and 1.5 (seed) will use these types; Story 1.6/1.7 will consume data at build time.

### Developer context – guardrails

- **camelCase only** for all JSON/TS field names. No snake_case; architecture forbids it to avoid conversion in the app.
- **Dates:** ISO 8601 strings (e.g. `"2026-03-07"`). No Date objects in the serialized shape that sync writes.
- **Per-source fields:** If architecture specifies multiple sources (Forbes, Bloomberg), use e.g. `forbesNetWorth`, `bloombergNetWorth`; null when unavailable. Display value (e.g. average/median) is computed in code, not stored as a separate key if it can be derived.
- **Single source of truth:** Pipeline and sync should import types from `src/data/billionaires.types.ts` (or same module) so there is no drift between Convex schema, sync output, and app.

### Project structure notes

- **New:** `src/data/billionaires.types.ts` (and optionally `src/data/billionaires.ts` with empty/placeholder export if needed for build). No pipeline or sync implementation in this story.
- **References:** [Source: architecture.md — Data model, Format patterns, Pattern examples; epics.md — Story 1.3]

---

## Technical requirements (dev agent guardrails)

| Requirement | Detail |
|------------|--------|
| **Interfaces** | `BillionaireEntry`, metadata type (e.g. `WealthTrackerMetadata`), and full dataset type (e.g. `WealthTrackerData`). |
| **Naming** | PascalCase for types; camelCase for all property names. ISO 8601 for date strings. |
| **Shared use** | App imports from `src/data/`; pipeline and sync (Story 1.4) import same types for validation and output. |
| **Convex alignment** | Types should match or be trivially mappable to Convex schema from Story 1.2 (same field names and concepts). |

---

## Architecture compliance

- **Data model:** TypeScript interfaces in `src/data/`; camelCase keys; dates ISO 8601; per-source net worth fields when applicable. [Architecture: Data model, Format patterns]
- **One source of truth:** Same shape in Convex (schema), pipeline (validation), sync (output), and app (import). [Architecture: Data boundaries, Enforcement guidelines]
- **Pattern examples:** `BillionaireEntry`, `WealthTrackerData` with `dataAsOf`, `medianSalary`, entries with `name`, `netWorth` or per-source fields. [Architecture: Pattern examples]

---

## Library / framework requirements

- **TypeScript only.** No new runtime dependencies. Use standard TypeScript (strict mode if project has it).
- **No Convex client in app.** Types are plain TypeScript; Convex schema may use Convex-specific types but the app-facing shape is plain TS interfaces.

---

## File structure requirements (this story only)

**Must exist after implementation:**

- `src/data/billionaires.types.ts` (or equivalent) exporting entry, metadata, and full-dataset interfaces.

**Optional:** `src/data/billionaires.ts` exporting empty array or placeholder satisfying the types, if needed so Next.js build does not fail when components import from `@/data/billionaires` in later stories. Otherwise types-only is sufficient.

**Do not create in this story:** `scripts/update-data.ts`, `scripts/data-sync.ts`, or real data; those are Stories 1.4 and 1.5.

---

## Testing requirements

- **Type-check:** `npx tsc --noEmit` (or project build) passes. No automated unit tests required for types-only story per architecture.

---

## Project context reference

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Data model, Format patterns, Pattern examples.
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 1.3.

---

## Story completion status

- **Status:** review  
- **Next story:** 1.4 (Implement data pipeline and sync step) will use these types for validation and for writing `src/data/`.

---

## Dev Agent Record

### Agent Model Used

Dev story executed (Story 1-3).

### Debug Log References

### Completion Notes List

- Implemented `src/data/billionaires.types.ts`: `BillionaireEntry` (name, netWorth, forbesNetWorth, bloombergNetWorth, id), `WealthTrackerMetadata` (dataAsOf, medianSalary), `WealthTrackerData` (dataAsOf, medianSalary, entries). All camelCase; dates ISO 8601. Comment added for Convex alignment (convex/schema.ts should mirror these).
- Added optional `src/data/billionaires.ts` exporting `wealthTrackerData` placeholder (empty entries, zero medianSalary, empty dataAsOf) so later stories can import from `@/data/billionaires` without build failure.
- Type-check: `npx tsc --noEmit` passes. No unit tests required per story (types-only).

### File List

- src/data/billionaires.types.ts (new)
- src/data/billionaires.ts (new)
- _bmad-output/implementation-artifacts/1-3-define-data-model-and-typescript-types.md (updated)

## Change Log

- 2026-03-07: Story 1.3 implemented. Added `src/data/billionaires.types.ts` (BillionaireEntry, WealthTrackerMetadata, WealthTrackerData) and optional `src/data/billionaires.ts` placeholder. Type-check passes.
