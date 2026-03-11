/**
 * Optional Firecrawl-based scraper for supplemental billionaire sources (Hurun, CEOWORLD).
 * Writes JSON in the format expected by update-data (see scripts/DATA_SOURCES.md).
 *
 * Run: npm run scrape-sources:firecrawl [-- --source=hurun|ceoworld|all] [--output=dir]
 * Requires: firecrawl-cli (npm install -g firecrawl-cli or devDep) and FIRECRAWL_API_KEY or firecrawl login.
 *
 * Use scraped files by setting env vars to file paths before update-data, e.g.:
 *   HURUN_SOURCE_URL=./scripts/data/hurun.json npm run update-data
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import {
  buildPayload,
  dedupeEntries,
  normalizeText,
  parseNetWorthBillionsFromText,
} from "./scrape-source-utils";

const DEFAULT_OUTPUT_DIR = path.resolve(process.cwd(), "scripts", "data");
const DEFAULT_TOP_N = 100;
const FIRECRAWL_OUTPUT_DIR = path.resolve(process.cwd(), ".firecrawl");

type FirecrawlSourceId = "hurun" | "ceoworld";

interface FirecrawlSourceConfig {
  id: FirecrawlSourceId;
  name: string;
  url: string;
  topN?: number;
}

const FIRECRAWL_SOURCE_CONFIGS: FirecrawlSourceConfig[] = [
  {
    id: "hurun",
    name: "Hurun Global Rich List",
    url: "https://www.hurun.net/en-US/Rank/HsRankDetails?pagetype=global",
    topN: DEFAULT_TOP_N,
  },
  {
    id: "ceoworld",
    name: "CEOWORLD Richest",
    url: "https://ceoworld.biz/2025/09/18/worlds-richest-people-2025-the-top-billionaires-globally/",
    topN: DEFAULT_TOP_N,
  },
];

/**
 * Parse markdown content (e.g. from Firecrawl scrape) into name + netWorthBillions entries.
 * Handles markdown tables (| col | col |) and fallback line patterns.
 */
function parseMarkdownToEntries(
  markdown: string,
  topN: number
): Array<{ name: string; netWorthBillions: number }> {
  const entries: Array<{ name: string; netWorthBillions: number }> = [];
  const lines = markdown.split(/\r?\n/);

  // Try markdown table: rows like | 1 | Elon Musk | $200 B |
  const tableRows: string[][] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\|.+\|$/.test(trimmed)) {
      const cells = trimmed
        .split("|")
        .map((c) => normalizeText(c))
        .filter((c) => c.length > 0);
      if (cells.length >= 2) tableRows.push(cells);
    }
  }

  if (tableRows.length >= 2) {
    // First row often header; find name and net worth columns by content
    const header = tableRows[0].map((c) => c.toLowerCase());
    let nameCol = -1;
    let worthCol = -1;
    for (let i = 0; i < header.length; i++) {
      if (
        (header[i].includes("name") || header[i].includes("person") || header[i].includes("billionaire")) &&
        nameCol === -1
      ) {
        nameCol = i;
      }
      if (
        (header[i].includes("worth") || header[i].includes("wealth") || header[i].includes("net") || header[i].includes("value") || header[i].includes("$")) &&
        worthCol === -1
      ) {
        worthCol = i;
      }
    }
    if (nameCol === -1) nameCol = 1;
    if (worthCol === -1) {
      for (let i = 0; i < header.length; i++) {
        if (i !== nameCol && parseNetWorthBillionsFromText(header[i]) != null) {
          worthCol = i;
          break;
        }
      }
      if (worthCol === -1) worthCol = nameCol === 1 ? 2 : 1;
    }
    for (let r = 1; r < tableRows.length && entries.length < topN; r++) {
      const row = tableRows[r];
      const name = normalizeText(row[nameCol] ?? row[0] ?? "");
      const worthText = row[worthCol] ?? row[worthCol + 1] ?? row.join(" ");
      const netWorthBillions = parseNetWorthBillionsFromText(worthText);
      if (name && name.length < 80 && netWorthBillions != null && netWorthBillions > 0) {
        entries.push({ name, netWorthBillions });
      }
    }
  }

  // Fallback: lines containing "$X B" or "X billion" and a preceding name-like token
  if (entries.length < 5) {
    const worthPattern = /\$?\s*([0-9]+(?:[.,][0-9]+)?)\s*(?:B|bn|billion)/gi;
    for (const line of lines) {
      const match = line.match(worthPattern);
      if (!match) continue;
      const worthStr = match[0];
      const netWorthBillions = parseNetWorthBillionsFromText(worthStr);
      if (netWorthBillions == null || netWorthBillions <= 0) continue;
      const beforeWorth = line.slice(0, line.toLowerCase().indexOf(worthStr.toLowerCase())).trim();
      const nameMatch = beforeWorth.match(/(?:^|\|\s*|\d+\.\s*)([A-Z][A-Za-z.'\u2019&-]+(?:\s+[A-Z][A-Za-z.'\u2019&-]+){1,4})\s*[-|:]/);
      const name = normalizeText(nameMatch ? nameMatch[1] ?? "" : beforeWorth.replace(/^\d+\.\s*/, "").split(/\||\t/)[0] ?? "");
      if (name && name.length >= 2 && name.length < 80) {
        entries.push({ name, netWorthBillions });
      }
    }
  }

  return dedupeEntries(entries).slice(0, topN);
}

function parseArgs(): { sources: FirecrawlSourceId[]; outputDir: string } {
  const args = process.argv.slice(2);
  let sourceArg = "all";
  let outputDir = DEFAULT_OUTPUT_DIR;
  for (const arg of args) {
    if (arg.startsWith("--source=")) sourceArg = arg.slice("--source=".length).toLowerCase();
    if (arg.startsWith("--output=")) outputDir = path.resolve(process.cwd(), arg.slice("--output=".length));
  }
  const sources: FirecrawlSourceId[] =
    sourceArg === "all" ? ["hurun", "ceoworld"] : (sourceArg.split(",").map((s) => s.trim()) as FirecrawlSourceId[]);
  return { sources, outputDir };
}

function runFirecrawlScrape(url: string, outputPath: string): void {
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  execSync(`npx -y firecrawl-cli scrape "${url}" -o "${outputPath}"`, {
    stdio: "inherit",
    maxBuffer: 10 * 1024 * 1024,
  });
}

function runSource(
  config: FirecrawlSourceConfig,
  outputDir: string
): { path: string; count: number } | null {
  const topN = config.topN ?? DEFAULT_TOP_N;
  console.log(`[${config.id}] Scraping ${config.name} with Firecrawl...`);
  const scrapeOutPath = path.join(FIRECRAWL_OUTPUT_DIR, `${config.id}.md`);

  try {
    runFirecrawlScrape(config.url, scrapeOutPath);
  } catch (err) {
    console.error(`[${config.id}] Firecrawl scrape failed:`, err instanceof Error ? err.message : err);
    return null;
  }

  let markdown: string;
  try {
    markdown = fs.readFileSync(scrapeOutPath, "utf-8");
  } catch (err) {
    console.error(`[${config.id}] Failed to read scraped file:`, err instanceof Error ? err.message : err);
    return null;
  }

  const entries = parseMarkdownToEntries(markdown, topN);
  if (entries.length < 5) {
    console.warn(
      `[${config.id}] Only ${entries.length} entries extracted; site structure may have changed. Check .firecrawl/${config.id}.md.`
    );
  }

  const dataAsOf = new Date().toISOString().slice(0, 10);
  const payload = buildPayload(entries, dataAsOf);
  fs.mkdirSync(outputDir, { recursive: true });
  const outPath = path.join(outputDir, `${config.id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`[${config.id}] Wrote ${entries.length} entries to ${outPath}`);
  return { path: outPath, count: entries.length };
}

async function main(): Promise<void> {
  const { sources, outputDir } = parseArgs();
  console.log(`Firecrawl scraping: ${sources.join(", ")} → ${outputDir}`);

  if (!fs.existsSync(FIRECRAWL_OUTPUT_DIR)) {
    fs.mkdirSync(FIRECRAWL_OUTPUT_DIR, { recursive: true });
  }

  const configs = FIRECRAWL_SOURCE_CONFIGS.filter((c) => sources.includes(c.id));
  if (configs.length === 0) {
    console.error("No valid sources. Use --source=hurun|ceoworld|all");
    process.exit(1);
  }

  for (const config of configs) {
    runSource(config, outputDir);
  }

  console.log("Done. Use the output files as HURUN_SOURCE_URL / CEOWORLD_SOURCE_URL (file path) when running update-data.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
