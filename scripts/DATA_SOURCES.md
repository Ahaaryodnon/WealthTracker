# Supplemental data sources (update-data pipeline)

## Pipeline overview

End-to-end flow:

1. **Acquisition** – Forbes (primary) is fetched from rtb-api by `scripts/update-data.ts`. Supplemental sources (Bloomberg, Hurun, CEOWORLD) have no public API; you either leave them unset or **produce JSON yourself** via scraping or a hosted feed.
2. **Canonical write** – `scripts/update-data.ts` validates and merges all sources, enriches bios from Forbes, then writes the canonical dataset to Convex via `api.data.replaceCanonicalData`.
3. **Static sync** – `scripts/data-sync.ts` reads from Convex (`api.data.getCanonicalData`) and regenerates `src/data/billionaires.ts` for the Next.js build.

**Firecrawl’s insertion point:** Upstream of step 1. Firecrawl (or the Playwright scraper) runs **before** `update-data`. It only needs to write JSON files that match the contract below and that `BLOOMBERG_SOURCE_URL` / `HURUN_SOURCE_URL` / `CEOWORLD_SOURCE_URL` can point to. No changes to Convex or the app are required.

---

The `update-data` script can merge net-worth data from multiple sources. Forbes (via rtb-api) is the primary source. These optional env vars add **Bloomberg**, **Hurun**, and **CEOWORLD** for cross-source averaging:

- `BLOOMBERG_SOURCE_URL`
- `HURUN_SOURCE_URL`
- `CEOWORLD_SOURCE_URL`

Each must point to a URL that returns **JSON** in one of these shapes:

1. **Root array** of person objects, or  
2. **Object** with an array in `entries`, `list`, or `data` (optional top-level `dataAsOf`: `YYYY-MM-DD`).

Each person object must include:

- `name` (string)
- One of: `netWorth`, `netWorthBillions`, `netWorthMillions`, `worth`, `wealth`, `value`  
  (values &gt; 1000 are treated as millions and converted to billions).

Example minimal payload:

```json
{
  "dataAsOf": "2025-03-01",
  "entries": [
    { "name": "Elon Musk", "netWorth": 200 },
    { "name": "Jeff Bezos", "netWorthBillions": 180 }
  ]
}
```

---

## Source availability

There are **no public, drop-in JSON APIs** for Bloomberg, Hurun, or CEOWORLD. Summary:

| Env var | Official source | Public API? | Options |
|--------|------------------|-------------|---------|
| **BLOOMBERG_SOURCE_URL** | [Bloomberg Billionaires Index](https://www.bloomberg.com/billionaires/) | No | Leave unset, or host your own JSON (e.g. from a licensed feed or custom scraper). |
| **HURUN_SOURCE_URL** | [Hurun Global Rich List](https://www.hurun.net/en-US/Rank/HsRankDetails?pagetype=global) | No | Leave unset, or build a one-off export / scraper and serve JSON yourself. |
| **CEOWORLD_SOURCE_URL** | [CEOWORLD richest lists](https://ceoworld.biz/) | No | Same as above; no public API. |

So in practice you can:

1. **Leave all three unset** – pipeline runs Forbes-only (current default).
2. **Web scraping (recommended)** – use the built-in scraper to produce local JSON, then point the env vars at those files (see below).
3. **Self-host JSON** – export or scrape one of the above sites (respecting ToS and robots.txt), then set the env var to your JSON URL (e.g. `https://your-domain.com/bloomberg-billionaires.json`).
4. **Use a paid data provider** – if you have a Bloomberg terminal, data license, or other vendor that exposes billionaire rankings via API, transform their response into the expected JSON and host it, then set the corresponding env var.

The primary source (Forbes via [rtb-api](https://github.com/komed3/rtb-api)) does not expose Bloomberg/Hurun/CEOWORLD; it is Forbes-only.

---

## When to use Firecrawl vs Playwright

| Tool | Best for | Notes |
|------|----------|--------|
| **Firecrawl** | Hurun, CEOWORLD | Cloud-based scrape; no local browser. Requires Firecrawl API key. Good when you want to avoid Playwright for these sources. |
| **Playwright** | Bloomberg, or all three | Local Chromium; supports headed mode for Bloomberg’s anti-bot. Use `scrape-sources:headed` if Bloomberg blocks headless. Also used for e2e tests. |

You can mix: e.g. run Firecrawl for Hurun/CEOWORLD and Playwright only for Bloomberg.

---

## Web scraping option (Playwright)

The repo includes an optional scraper that uses Playwright to fetch Bloomberg, Hurun, and CEOWORLD pages and write JSON in the format expected by the pipeline.

**Setup:** Ensure Playwright browsers are installed (needed for e2e tests anyway):

```bash
npx playwright install chromium
```

**Run the scraper:**

```bash
npm run scrape-sources                    # all three sources → scripts/data/
npm run scrape-sources:headed            # headed browser for manual challenges
npm run scrape-sources -- --source=bloomberg
npm run scrape-sources -- --source=hurun,ceoworld --output=./my-data
```

Output files: `scripts/data/bloomberg.json`, `scripts/data/hurun.json`, `scripts/data/ceoworld.json` (or your `--output` dir).

**Use scraped data in the pipeline:**

Set the env vars to the **file path** (relative to project root or absolute) or a `file://` URL, then run update-data:

```bash
# .env.local or inline:
# BLOOMBERG_SOURCE_URL=./scripts/data/bloomberg.json
# HURUN_SOURCE_URL=./scripts/data/hurun.json
# CEOWORLD_SOURCE_URL=./scripts/data/ceoworld.json

npm run update-data
```

Or inline:

```bash
BLOOMBERG_SOURCE_URL=./scripts/data/bloomberg.json npm run update-data
```

**Bloomberg note:** Bloomberg may serve an anti-bot page to headless Playwright. When that happens, the scraper now fails clearly instead of writing empty data. You can try:

```bash
npm run scrape-sources:headed -- --source=bloomberg
```

This opens a visible browser so you can manually complete any challenge. The script will wait for the Bloomberg page to become scrapeable before continuing.

**Caveats:** Site markup changes often; if a source returns very few entries, update the selectors in `scripts/scrape-sources.ts`. Respect each site’s terms of use and robots.txt; run scrapers sparingly (e.g. daily at most).

---

## Firecrawl scraping option

A second scraper uses the [Firecrawl](https://firecrawl.dev) CLI to fetch **Hurun** and **CEOWORLD** only (Bloomberg is not included; use Playwright for that). It writes the same JSON contract to `scripts/data/` (or `--output`), so the pipeline and env vars are unchanged.

**Setup:**

1. Install the Firecrawl CLI (or use the project devDependency via npx):
   ```bash
   npm install -g firecrawl-cli
   ```
2. Authenticate (one-time). Either set `FIRECRAWL_API_KEY` in your environment, or run:
   ```bash
   firecrawl login --browser
   ```
   The browser will open to complete auth.

**Run the scraper:**

```bash
npm run scrape-sources:firecrawl                  # Hurun + CEOWORLD → scripts/data/
npm run scrape-sources:firecrawl -- --source=hurun
npm run scrape-sources:firecrawl -- --source=ceoworld --output=./my-data
```

Output files: `scripts/data/hurun.json`, `scripts/data/ceoworld.json` (or your `--output` dir). Scraped markdown is written to `.firecrawl/` (gitignored) for debugging.

**Use scraped data in the pipeline:** Same as Playwright. Point the env vars at the JSON files, then run `npm run update-data` (see “Use scraped data in the pipeline” above).

**Caveats:** Firecrawl consumes API credits per scrape. If a source returns very few entries, inspect `.firecrawl/<source>.md` and adjust parsing in `scripts/scrape-sources-firecrawl.ts` if the site structure changed.

---

## Recommended operator workflow

1. **Scrape** – Run one or both scrapers so that the JSON files you want exist under `scripts/data/` (or your `--output` dir).
2. **Review** – Optionally open the generated `.json` files and confirm entry count and names look reasonable.
3. **Update canonical data** – Set the env vars to those file paths and run `npm run update-data` to merge into Convex.
4. **Sync static data** – Run `npm run data:sync` to regenerate `src/data/billionaires.ts` for the Next.js build (or let `build:ci` run sync then build).
