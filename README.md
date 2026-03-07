This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Initial setup (new contributors)

**If you are cloning this repo** (not creating a new app from scratch), the app is already initialized; run `npm install` and skip to [Convex](#convex-data-store) and [Data pipeline](#data-pipeline-and-sync).

**If you need to re-run create-next-app** (e.g. in a new folder): npm disallows package names with uppercase characters. If your project directory has capitals (e.g. `WealthTracker-1`), running `npx create-next-app@latest . ...` in that folder can fail. Workaround: create the app in a temporary lowercase directory (e.g. `npx create-next-app@latest wealthtracker-temp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes`), then move the contents into your project root (e.g. with `rsync` or copy, excluding `.git`), and set `"name": "wealthtracker-1"` (or your preferred lowercase name) in `package.json`.

**Convex:** The project uses Convex for the data store. The older `npx convex init` is deprecated. Use the flow in [Convex (data store)](#convex-data-store) below.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Convex (data store)

The app uses [Convex](https://convex.dev) as the canonical data store for billionaire data and metadata. The Next.js app does **not** use Convex at runtime in the MVP; it consumes static data from `src/data/` at build time. Pipeline and sync scripts use Convex.

- **Link and deploy (required for pipeline/sync):** Run `npx convex dev --once --configure=new` in the project root. This will prompt you to log in (or create an account), create a Convex project, and write `.env.local` with your deployment URL. Do not commit `.env.local`. (The legacy `npx convex init` is deprecated; use this command instead.)
- **Get CONVEX_URL:** After linking, `.env.local` will contain the Convex deployment configuration. For pipeline and sync (e.g. CI), set `CONVEX_URL` (or the variable Convex writes) in your environment or CI secrets. See `.env.local.example` for the expected variable name.
- **Deploy schema:** Once linked, `npx convex dev` watches and pushes schema/functions; `npx convex deploy` deploys to production. The schema in `convex/schema.ts` defines the `billionaires` and `metadata` tables used by the pipeline and sync step.

## Data pipeline and sync

Both scripts require **CONVEX_URL** in the environment (e.g. from `.env.local`). Load it with `dotenv` or set it in CI secrets.

- **`npm run update-data`** — Pipeline: fetches from **Forbes Real-Time Billionaires** via [rtb-api](https://github.com/komed3/rtb-api) (free, no API key). Takes the top 10 by rank, validates against `src/data/billionaires.types.ts`, and writes to Convex. Net worth from the API is in millions and is stored in billions. On validation or fetch failure the script exits non-zero and does **not** write to Convex.
- **`npm run data:sync`** — Sync step: reads the canonical dataset from Convex and writes it to `src/data/billionaires.ts` in the same typed shape. On Convex read failure the script exits non-zero and does **not** overwrite `src/data/`.

**When to run:** Run `data:sync` before every production build (locally or in CI) so the static export uses the latest Convex snapshot. Run `update-data` when you want to refresh data from sources (e.g. weekly or on-demand). See `.env.local.example` for the expected variable name.

**Data sources:** Billionaire list and net worth from [rtb-api](https://github.com/komed3/rtb-api) (Forbes real-time data; free to use, no API key). Median salary for the comparison baseline is a configured constant in the pipeline (US median; update in `scripts/update-data.ts` if needed).

## CI and verification

- **Baseline check:** Run `npm run check` to run lint and build (suitable for CI). Ensures the app builds and passes ESLint.
- **Optional pipeline/sync failure verification:** To confirm the pipeline does not overwrite Convex on invalid data: run `npm run update-data` with invalid or missing env (e.g. unset `CONVEX_URL` or point to a broken URL) and confirm the script exits non-zero and Convex is not overwritten. To confirm the sync step does not overwrite `src/data/` on Convex failure: with Convex unreachable or empty, run `npm run data:sync` and confirm it exits non-zero and does not overwrite `src/data/billionaires.ts`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
