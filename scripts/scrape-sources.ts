/**
 * Optional web scraper for supplemental billionaire sources (Bloomberg, Hurun, CEOWORLD).
 * Writes JSON in the format expected by update-data (see scripts/DATA_SOURCES.md).
 *
 * Run: npx tsx scripts/scrape-sources.ts [--source=bloomberg|hurun|ceoworld|all] [--output=dir]
 * Requires: Playwright browsers (npx playwright install chromium).
 *
 * Use scraped files by setting env vars to file paths before update-data, e.g.:
 *   BLOOMBERG_SOURCE_URL=./scripts/data/bloomberg.json npm run update-data
 */

import * as fs from "fs";
import * as path from "path";
import { chromium, type Browser, type Page } from "playwright";

const DEFAULT_OUTPUT_DIR = path.resolve(process.cwd(), "scripts", "data");
const DEFAULT_TOP_N = 100;

type ScraperId = "bloomberg" | "hurun" | "ceoworld";

interface ScraperConfig {
  id: ScraperId;
  name: string;
  url: string;
  /** Max entries to scrape (default DEFAULT_TOP_N). */
  topN?: number;
  /** Playwright: wait for this selector before extracting (optional). */
  waitSelector?: string;
  /** Playwright: timeout for page load (ms). */
  timeout?: number;
  /** Extract entries from the page. Return array of { name, netWorthBillions }. */
  extract: (page: Page, topN: number) => Promise<Array<{ name: string; netWorthBillions: number }>>;
}

interface CliOptions {
  sources: ScraperId[];
  outputDir: string;
  headed: boolean;
  solveTimeoutMs: number;
}

/** Parse a string like "$123.4 B" or "123.4" into billions (number). */
function parseNetWorthBillionsFromText(text: string): number | null {
  const cleaned = text.replace(/[$,%\s]/g, "").replace(",", ".").toLowerCase();
  if (cleaned.includes("b") || cleaned.includes("bn") || cleaned.includes("billion")) {
    const num = parseFloat(cleaned.replace(/[a-z]/g, ""));
    return Number.isFinite(num) ? num : null;
  }
  if (cleaned.includes("m") || cleaned.includes("mn") || cleaned.includes("million")) {
    const num = parseFloat(cleaned.replace(/[a-z]/g, ""));
    return Number.isFinite(num) ? num / 1000 : null;
  }
  const num = parseFloat(cleaned);
  if (!Number.isFinite(num)) return null;
  return num > 1000 ? num / 1000 : num;
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function dedupeEntries(entries: Array<{ name: string; netWorthBillions: number }>): Array<{ name: string; netWorthBillions: number }> {
  const seen = new Set<string>();
  const deduped: Array<{ name: string; netWorthBillions: number }> = [];
  for (const entry of entries) {
    const key = entry.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!entry.name || seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }
  return deduped;
}

async function clickFirstVisibleButton(page: Page, labels: string[]): Promise<boolean> {
  for (const label of labels) {
    const locator = page.getByRole("button", { name: label, exact: true }).first();
    if (await locator.count()) {
      try {
        await locator.click({ timeout: 2000 });
        return true;
      } catch {
        // Keep trying other labels.
      }
    }
  }
  return false;
}

async function dismissConsent(page: Page, source: ScraperId): Promise<void> {
  if (source === "bloomberg") {
    await clickFirstVisibleButton(page, ["No, I Do Not Accept", "Yes, I Accept", "Accept"]);
  }
  if (source === "ceoworld") {
    await clickFirstVisibleButton(page, ["Do not consent", "Consent", "Manage options"]);
    await clickFirstVisibleButton(page, ["No thanks", "Close"]);
  }
}

async function isBloombergBotBlock(page: Page): Promise<boolean> {
  const text = normalizeText((await page.locator("body").innerText().catch(() => "")) ?? "");
  return (
    text.includes("We've detected unusual activity from your computer network") ||
    text.includes("let us know you're not a robot") ||
    (await page.title()).includes("Are you a robot")
  );
}

async function waitForBloombergChallengeToClear(page: Page, solveTimeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < solveTimeoutMs) {
    if (!(await isBloombergBotBlock(page))) return;
    await page.waitForTimeout(2000);
  }
}

async function extractTableCells(page: Page, selector: string): Promise<string[][]> {
  return page.locator(selector).evaluateAll((rows) =>
    rows.map((row) =>
      Array.from(row.querySelectorAll("td, th"))
        .map((cell) => (cell.textContent ?? "").replace(/\s+/g, " ").trim())
        .filter(Boolean)
    )
  );
}

function extractHurunName(cellText: string): string {
  const cleaned = normalizeText(cellText)
    .replace(/(Male|Female|Age|岁).*$/i, "")
    .replace(/\b\d{1,3}\b.*$/, "")
    .trim();
  const words = cleaned
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => /[A-Za-z]/.test(part));
  return words.slice(0, 4).join(" ");
}

/** Bloomberg Billionaires Index: table with name and net worth columns. */
async function extractBloomberg(page: Page, topN: number): Promise<Array<{ name: string; netWorthBillions: number }>> {
  const entries: Array<{ name: string; netWorthBillions: number }> = [];
  if (await isBloombergBotBlock(page)) {
    throw new Error(
      "Bloomberg served an anti-bot challenge. Re-run with --headed and solve the check manually, or leave BLOOMBERG_SOURCE_URL unset."
    );
  }
  await dismissConsent(page, "bloomberg");
  await page.waitForSelector('table tbody tr, [data-testid*="billionaire"], [class*="table"] tbody tr', { timeout: 30_000 }).catch(() => {});

  const tableRows = await extractTableCells(page, 'table tbody tr, [class*="Table"] tbody tr, [class*="table"] tbody tr');
  for (const cells of tableRows.slice(0, topN)) {
    const name = normalizeText(cells[1] ?? "");
    const netWorthBillions = parseNetWorthBillionsFromText(cells[2] ?? cells.join(" "));
    if (name && netWorthBillions != null && netWorthBillions > 0) {
      entries.push({ name, netWorthBillions });
    }
  }

  if (entries.length < 5) {
    const fallbackEntries = await page.locator('a[href*="/billionaires/"], a[href*="/profiles/"]').evaluateAll((links) =>
      links.map((link) => {
        const name = (link.textContent ?? "").replace(/\s+/g, " ").trim();
        const container = link.closest("tr, li, article, section, div");
        const text = (container?.textContent ?? "").replace(/\s+/g, " ").trim();
        return { name, text };
      })
    );

    for (const candidate of fallbackEntries.slice(0, topN * 3)) {
      if (!candidate.name || candidate.name.length > 80) continue;
      const netWorthBillions = parseNetWorthBillionsFromText(candidate.text);
      if (netWorthBillions != null && netWorthBillions > 0) {
        entries.push({ name: candidate.name, netWorthBillions });
      }
    }
  }

  return dedupeEntries(entries).slice(0, topN);
}

/** Hurun Global Rich List: table or list layout. */
async function extractHurun(page: Page, topN: number): Promise<Array<{ name: string; netWorthBillions: number }>> {
  const entries: Array<{ name: string; netWorthBillions: number }> = [];
  await page.waitForSelector("table tbody tr", { timeout: 25_000 }).catch(() => {});

  const rows = await extractTableCells(page, "table tbody tr");
  for (const cells of rows.slice(0, topN)) {
    if (cells.length < 4) continue;
    const name = extractHurunName(cells[3] ?? "");
    const valueText = cells[2] ?? "";
    const netWorthBillions = parseNetWorthBillionsFromText(valueText);
    if (name && netWorthBillions != null && netWorthBillions > 0) {
      entries.push({ name, netWorthBillions });
    }
  }
  return dedupeEntries(entries).slice(0, topN);
}

/** CEOWORLD richest list: table or article list. */
async function extractCeoworld(page: Page, topN: number): Promise<Array<{ name: string; netWorthBillions: number }>> {
  const entries: Array<{ name: string; netWorthBillions: number }> = [];
  await dismissConsent(page, "ceoworld");
  await page.waitForSelector('table tbody tr, article, [class*="entry"], .post, .td-post-content', { timeout: 25_000 }).catch(() => {});

  const tableRows = await extractTableCells(page, "table tbody tr, table tr");
  for (const cells of tableRows.slice(0, topN)) {
    const name = normalizeText(cells[1] ?? cells[0] ?? "");
    const valueText = cells[2] ?? cells[1] ?? cells.join(" ");
    const netWorthBillions = parseNetWorthBillionsFromText(valueText);
    if (name && netWorthBillions != null && netWorthBillions > 0 && name.length < 80) {
      entries.push({ name, netWorthBillions });
    }
  }

  if (entries.length < 5) {
    const articleText = normalizeText(
      ((await page.textContent("article, .entry-content, .post-content, .td-post-content").catch(() => "")) ?? "")
    );
    const sentences = articleText.split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      const worthMatch = sentence.match(/\$([0-9]+(?:[.,][0-9]+)?)\s*billion/i);
      if (!worthMatch || worthMatch.index == null) continue;
      const beforeWorth = sentence.slice(0, worthMatch.index);
      const nameMatches = beforeWorth.match(/[A-Z][A-Za-z.'’&-]+(?:\s+[A-Z][A-Za-z.'’&-]+){1,4}/g);
      const name = normalizeText(nameMatches?.at(-1) ?? "");
      const netWorthBillions = Number.parseFloat(worthMatch[1].replace(",", "."));
      if (name && Number.isFinite(netWorthBillions) && netWorthBillions > 0) {
        entries.push({ name, netWorthBillions });
      }
    }
  }

  return dedupeEntries(entries).slice(0, topN);
}

const SCRAPER_CONFIGS: ScraperConfig[] = [
  {
    id: "bloomberg",
    name: "Bloomberg Billionaires Index",
    url: "https://www.bloomberg.com/billionaires/",
    timeout: 35_000,
    waitSelector: 'table tbody tr, [class*="table"]',
    extract: extractBloomberg,
  },
  {
    id: "hurun",
    name: "Hurun Global Rich List",
    url: "https://www.hurun.net/en-US/Rank/HsRankDetails?pagetype=global",
    timeout: 30_000,
    waitSelector: "table tbody tr",
    extract: extractHurun,
  },
  {
    id: "ceoworld",
    name: "CEOWORLD Richest",
    url: "https://ceoworld.biz/2025/09/18/worlds-richest-people-2025-the-top-billionaires-globally/",
    timeout: 25_000,
    waitSelector: "table tbody tr",
    extract: extractCeoworld,
  },
];

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  let sourceArg = "all";
  let outputDir = DEFAULT_OUTPUT_DIR;
  let headed = false;
  let solveTimeoutMs = 120_000;
  for (const arg of args) {
    if (arg.startsWith("--source=")) sourceArg = arg.slice("--source=".length).toLowerCase();
    if (arg.startsWith("--output=")) outputDir = path.resolve(process.cwd(), arg.slice("--output=".length));
    if (arg === "--headed") headed = true;
    if (arg.startsWith("--solve-timeout-ms=")) solveTimeoutMs = Number.parseInt(arg.slice("--solve-timeout-ms=".length), 10);
  }
  const sources: ScraperId[] =
    sourceArg === "all" ? ["bloomberg", "hurun", "ceoworld"] : (sourceArg.split(",").map((s) => s.trim()) as ScraperId[]);
  return { sources, outputDir, headed, solveTimeoutMs };
}

function buildPayload(entries: Array<{ name: string; netWorthBillions: number }>, dataAsOf: string) {
  return {
    dataAsOf,
    entries: entries.map((e) => ({ name: e.name, netWorthBillions: e.netWorthBillions })),
  };
}

async function runScraper(
  browser: Browser,
  config: ScraperConfig,
  outputDir: string,
  options: CliOptions
): Promise<{ path: string; count: number } | null> {
  const topN = config.topN ?? DEFAULT_TOP_N;
  console.log(`[${config.id}] Opening ${config.name}...`);
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  try {
    await page.goto(config.url, { waitUntil: "domcontentloaded", timeout: config.timeout ?? 30_000 });
    if (config.id === "bloomberg" && options.headed && (await isBloombergBotBlock(page))) {
      console.log("[bloomberg] Waiting for manual anti-bot solve in headed browser...");
      await waitForBloombergChallengeToClear(page, options.solveTimeoutMs);
    }
    if (config.waitSelector) {
      await page.waitForSelector(config.waitSelector, { timeout: 15_000 }).catch(() => {});
    }
    await new Promise((r) => setTimeout(r, 2000));

    const entries = await config.extract(page, topN);
    await context.close();

    if (entries.length < 5) {
      console.warn(`[${config.id}] Only ${entries.length} entries extracted; site structure may have changed. Update selectors in scripts/scrape-sources.ts.`);
    }

    const dataAsOf = new Date().toISOString().slice(0, 10);
    const payload = buildPayload(entries, dataAsOf);
    fs.mkdirSync(outputDir, { recursive: true });
    const outPath = path.join(outputDir, `${config.id}.json`);
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf-8");
    console.log(`[${config.id}] Wrote ${entries.length} entries to ${outPath}`);
    return { path: outPath, count: entries.length };
  } catch (error) {
    console.error(`[${config.id}] Failed:`, error instanceof Error ? error.message : error);
    await context.close();
    return null;
  }
}

async function main(): Promise<void> {
  const options = parseArgs();
  const { sources, outputDir, headed } = options;
  console.log(`Scraping sources: ${sources.join(", ")} → ${outputDir}${headed ? " (headed)" : ""}`);

  const configs = SCRAPER_CONFIGS.filter((c) => sources.includes(c.id));
  if (configs.length === 0) {
    console.error("No valid sources. Use --source=bloomberg|hurun|ceoworld|all");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: !headed });
  try {
    for (const config of configs) {
      await runScraper(browser, config, outputDir, options);
    }
  } finally {
    await browser.close();
  }

  console.log("Done. Use the output files as BLOOMBERG_SOURCE_URL etc. (file path or file:// URL) when running update-data.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
