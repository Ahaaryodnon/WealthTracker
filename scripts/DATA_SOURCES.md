# Supplemental data sources (update-data pipeline)

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

## Web scraping option

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
