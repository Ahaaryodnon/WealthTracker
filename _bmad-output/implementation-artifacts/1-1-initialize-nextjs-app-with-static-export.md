# Story 1.1: Initialize Next.js app with static export

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **developer**,
I want **a Next.js app with TypeScript, Tailwind, and static export configured**,
so that **the project is runnable and ready for static deployment with SEO-friendly HTML**.

---

## Acceptance Criteria

1. **Given** the project repo is cloned and Node is available  
   **When** I run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (or equivalent for existing folder)  
   **Then** the app has `src/app/`, TypeScript, Tailwind, and ESLint configured  
   **And** `next.config` includes `output: 'export'` so `next build` produces static assets in `out/`  
   **And** `npm run dev` serves the app and `npm run build` succeeds

---

## Tasks / Subtasks

- [x] **Task 1: Run create-next-app** (AC: #1)
  - [x] Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` in project root (use `.` if initializing in existing folder, or omit and pass project name for new folder).
  - [x] Confirm `src/app/` exists with `layout.tsx`, `page.tsx`, `globals.css`.
  - [x] Confirm TypeScript (`tsconfig.json`), Tailwind (PostCSS/content paths), and ESLint are present.
- [x] **Task 2: Enable static export** (AC: #1)
  - [x] Open `next.config.ts` (or `next.config.js`/`next.config.mjs` per create-next-app output).
  - [x] Add `output: 'export'` to the config object so `next build` outputs to `out/`.
  - [x] Do not use `distDir` unless explicitly required; default `out/` is correct per architecture.
- [x] **Task 3: Verify run scripts** (AC: #1)
  - [x] Run `npm run dev` and confirm app serves (e.g. http://localhost:3000).
  - [x] Run `npm run build` and confirm it completes; confirm `out/` directory exists with static HTML/CSS/JS.

---

## Dev Notes

### Epic & business context

- **Epic 1:** Live Accumulator with real data. This story is the **first implementation story** and establishes the app shell; all later stories (Convex, data pipeline, hero, live counter) depend on it.
- **FRs enabled by this story:** Enables NFR6 (SEO via static HTML), NFR5 (static hosting), and the single-page layout (FR11) that will be built in later stories.
- **Dependencies:** None. Story 1.2 (Convex) and 1.3+ assume this app exists.

### Developer context – guardrails

- **Do not** add Convex, data pipeline, or custom components in this story. Only init + static export.
- **Do not** remove or change TypeScript, Tailwind, or ESLint unless the product owner explicitly requests it; architecture assumes this stack.
- **Import alias:** Keep `@/*` pointing to `src/` so future code can use `@/components`, `@/data`, `@/lib` per architecture.
- **Single route:** Leave the default single route (`src/app/page.tsx`); the layout (hero → top 10 → methodology → share) is Story 1.6.

### Project structure notes (after this story)

- **Present:** `src/app/`, `src/` (with app only); root configs: `next.config.*`, `tailwind.config.*`, `tsconfig.json`, `.eslintrc.json` (or equivalent).
- **Not yet present (later stories):** `convex/`, `scripts/`, `src/components/`, `src/data/`, `src/lib/`, `.env.local.example`. Do not create them in 1.1.
- **Alignment:** Matches architecture “Implementation sequence” step 1 and “Complete Project Directory Structure” for the init phase only.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 1.1, Epic 1, Additional Requirements (Starter template).
- [Source: _bmad-output/planning-artifacts/architecture.md] — Starter Template Evaluation, Selected Starter (create-next-app), Initialization command, Build and output, Code organization, Implementation sequence step 1.
- [Source: Next.js Static Exports] — `output: 'export'` in next.config; default output directory `out/`.

---

## Technical requirements (dev agent guardrails)

| Requirement | Detail |
|------------|--------|
| **Initialization command** | `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` |
| **Static export** | Add to next.config: `output: 'export'`. Use `next.config.ts` or whatever create-next-app generated. |
| **Output directory** | Default `out/`; do not change unless product requirement. |
| **Scripts** | `npm run dev` and `npm run build` must succeed. No new npm scripts required in this story. |
| **Scope** | No new dependencies beyond create-next-app defaults. No Convex, no pipeline, no custom components. |

---

## Architecture compliance

- **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, ESLint. Matches architecture “Selected Starter” and “Language & runtime” / “Styling” / “Linting”.
- **Build:** Static export only. `next build` must produce static assets in `out/` for Vercel/deployment without a Node server. Matches “Infrastructure & Deployment” and “Build and output”.
- **Code organization:** `src/app/` for routes and layouts; `src/` as root for app code with `@/*` alias. Components/data/lib are added in later stories. Matches “Code organization” and “Project Structure & Boundaries”.
- **First implementation story:** Architecture states: “Project initialization using this command should be the first implementation story.” This is that story.

---

## Library / framework requirements

- **Next.js:** Use the version installed by `create-next-app@latest`. Do not downgrade or pin unless a known issue is documented.
- **next.config:** For static export, set `output: 'export'`. In TypeScript configs use `output: 'export'` as a const; in JS use `module.exports = { output: 'export', ... }`.
- **Static export behavior:** With `output: 'export'`, `next build` pre-renders all routes to HTML and writes to `out/`. No server-side features (e.g. dynamic routes that require server) in MVP; single page is static.
- **Tailwind / ESLint:** Leave defaults from create-next-app; no extra config in this story.

---

## File structure requirements (this story only)

**Files/dirs that must exist after implementation:**

- `package.json` (with scripts: dev, build, start, lint)
- `next.config.ts` (or .js/.mjs) with `output: 'export'`
- `tsconfig.json`
- `tailwind.config.ts`, `postcss.config.mjs` (or equivalent)
- `.eslintrc.json` (or equivalent)
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- `src/app/favicon.ico` or `public/favicon.ico` (per create-next-app)
- `.gitignore` (include `out/`, `.env*.local`, `node_modules`)

**Do not create in this story:** `convex/`, `scripts/`, `src/components/`, `src/data/`, `src/lib/`, `.env.local` or `.env.local.example`.

---

## Testing requirements

- **Manual verification only for 1.1:** No automated tests are required by architecture for this story. Test runner (e.g. Vitest/Jest) is a deferred decision.
- **Definition of done:** `npm run build` completes successfully and `out/` contains static HTML (e.g. `index.html`) and assets. `npm run dev` serves the app without errors.

---

## Project context reference

- **project-context.md:** Not present in repo. Use this story file plus `_bmad-output/planning-artifacts/architecture.md` and `_bmad-output/planning-artifacts/epics.md` as the source of truth for scope and structure.
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md` — Starter Template, Implementation sequence, Project Directory Structure, File Organization Patterns.

---

## Story completion status

- **Status:** ready-for-dev  
- **Ultimate context engine analysis completed** — comprehensive developer guide created for Story 1.1.  
- **Next story:** 1.2 (Add Convex and define schema) will assume this app exists and will add `convex/`, schema, and env example.

---

## Dev Agent Record

### Agent Model Used

Cursor / BMAD Dev Agent (Amelia).

### Debug Log References

- create-next-app failed when run with `.` (project root) because directory name "WealthTracker-1" contains capitals (npm naming restriction). Workaround: created app in temp dir `wealthtracker-temp`, then moved contents to root via rsync (excluding .git), set package name to `wealthtracker-1` in package.json.

### Completion Notes List

- **Task 1:** Initialized Next.js via `npx create-next-app@latest wealthtracker-temp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes`, then moved files to project root. Confirmed `src/app/layout.tsx`, `page.tsx`, `globals.css`, `favicon.ico`; `tsconfig.json` with `@/*` → `./src/*`; Tailwind (postcss.config.mjs); ESLint (eslint.config.mjs).
- **Task 2:** Added `output: "export"` to `next.config.ts`. Package name set to `wealthtracker-1` in package.json.
- **Task 3:** `npm run build` completed successfully; `out/` contains `index.html` and static assets. `npm run dev` serves app at http://localhost:3000 (verified with curl 200). No automated tests per story (manual verification only).

### File List

- package.json (created; name set to wealthtracker-1)
- package-lock.json (created)
- next.config.ts (created; output: "export" added)
- next-env.d.ts (created)
- tsconfig.json (created; paths "@/*" → "./src/*")
- eslint.config.mjs (created)
- postcss.config.mjs (created)
- .gitignore (created; includes /out/, .env*, node_modules)
- src/app/layout.tsx (created)
- src/app/page.tsx (created)
- src/app/globals.css (created)
- src/app/favicon.ico (created)
- public/ (created; next.svg, vercel.svg, etc.)
- README.md (created by create-next-app)
