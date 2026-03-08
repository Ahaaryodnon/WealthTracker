/**
 * Pipeline script: fetch from multiple sources, validate, write to Convex.
 * Run: npm run update-data
 * Requires CONVEX_URL in environment (e.g. from .env.local).
 * Optional extra sources:
 * - BLOOMBERG_SOURCE_URL
 * - HURUN_SOURCE_URL
 * - CEOWORLD_SOURCE_URL
 */
import * as path from "path";
import { config } from "dotenv";
config({ path: path.resolve(process.cwd(), ".env.local") });
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { WealthTrackerData, BillionaireEntry } from "../src/data/billionaires.types";

const envUrl = process.env.CONVEX_URL;
if (!envUrl || typeof envUrl !== "string") {
  console.error("CONVEX_URL is required. Set it in .env.local or the environment.");
  process.exit(1);
}
const CONVEX_URL: string = envUrl;

function validateEntry(obj: unknown): obj is BillionaireEntry {
  if (obj === null || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.name !== "string") return false;
  if (o.netWorth !== undefined && typeof o.netWorth !== "number") return false;
  if (o.forbesNetWorth !== undefined && o.forbesNetWorth !== null && typeof o.forbesNetWorth !== "number") return false;
  if (o.bloombergNetWorth !== undefined && o.bloombergNetWorth !== null && typeof o.bloombergNetWorth !== "number")
    return false;
  if (o.hurunNetWorth !== undefined && o.hurunNetWorth !== null && typeof o.hurunNetWorth !== "number") return false;
  if (o.ceoworldNetWorth !== undefined && o.ceoworldNetWorth !== null && typeof o.ceoworldNetWorth !== "number")
    return false;
  return true;
}

function validateWealthTrackerData(obj: unknown): obj is WealthTrackerData {
  if (obj === null || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.dataAsOf !== "string") return false;
  if (typeof o.medianSalary !== "number") return false;
  if (!Array.isArray(o.entries)) return false;
  if (!o.entries.every(validateEntry)) return false;
  return true;
}

/** Canonical source (Forbes via rtb-api) with mirrored endpoints for transport resilience. */
const FORBES_DELIVERY_ENDPOINTS = [
  { name: "primary-github-raw", baseUrl: "https://raw.githubusercontent.com/komed3/rtb-api/main/api" },
  { name: "fallback-statically-main", baseUrl: "https://cdn.statically.io/gh/komed3/rtb-api/main/api" },
  { name: "fallback-jsdelivr-main", baseUrl: "https://cdn.jsdelivr.net/gh/komed3/rtb-api@main/api" },
] as const;

const TOP_N = 10;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 400;
const SUPPLEMENTAL_MIN_ENTRIES = 5;
/** US median personal income (approx); used for comparison baseline. Update or source separately if needed. */
const DEFAULT_MEDIAN_SALARY = 59_384;

type SourceId = "forbes" | "bloomberg" | "hurun" | "ceoworld";

interface RtbListEntry {
  name: string;
  networth: number;
}

interface RtbListResponse {
  date: string;
  list: RtbListEntry[];
}

interface SourceEntry {
  name: string;
  netWorthBillions: number;
}

interface SourceDataset {
  source: SourceId;
  dataAsOf: string;
  entries: SourceEntry[];
}

interface AggregatedEntry {
  name: string;
  forbesNetWorth?: number;
  bloombergNetWorth?: number;
  hurunNetWorth?: number;
  ceoworldNetWorth?: number;
}

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, timeoutMs: number): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      return res;
    } catch (error: unknown) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        const backoff = RETRY_BASE_DELAY_MS * 2 ** attempt;
        await wait(backoff);
      }
    }
  }

  throw new Error(`Failed after retries (${url}): ${toErrorMessage(lastError)}`);
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function parseNumericValue(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[$,]/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readNumberField(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = parseNumericValue(obj[key]);
    if (value != null) return value;
  }
  return null;
}

function parseNetWorthBillions(raw: Record<string, unknown>): number | null {
  const explicitBillions = readNumberField(raw, [
    "netWorthBillions",
    "worthBillions",
    "wealthBillions",
  ]);
  if (explicitBillions != null) return explicitBillions;

  const inMillions = readNumberField(raw, [
    "netWorthMillions",
    "worthMillions",
    "wealthMillions",
  ]);
  if (inMillions != null) return inMillions / 1000;

  const generic = readNumberField(raw, ["netWorth", "worth", "wealth", "value"]);
  if (generic == null) return null;
  return generic > 1000 ? generic / 1000 : generic;
}

function parseSourceEntries(rawEntries: unknown, source: SourceId): SourceEntry[] {
  if (!Array.isArray(rawEntries)) {
    throw new Error(`[${source}] entries must be an array`);
  }

  const parsed: SourceEntry[] = [];
  for (const item of rawEntries) {
    if (item === null || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const netWorthBillions = parseNetWorthBillions(record);
    if (!name || netWorthBillions == null || !Number.isFinite(netWorthBillions) || netWorthBillions <= 0) {
      continue;
    }
    parsed.push({ name, netWorthBillions });
  }

  return parsed;
}

function validateSourceEntries(entries: SourceEntry[], source: SourceId, minimumEntries: number): void {
  if (entries.length < minimumEntries) {
    throw new Error(`[${source}] not enough valid entries (${entries.length}/${minimumEntries})`);
  }
  const top = entries.slice(0, TOP_N);
  const seen = new Set<string>();
  for (const entry of top) {
    const key = normalizeName(entry.name);
    if (seen.has(key)) {
      throw new Error(`[${source}] duplicate name in top ${TOP_N}: ${entry.name}`);
    }
    seen.add(key);
  }
}

function parseDateFromPayload(payload: Record<string, unknown>): string | null {
  const value = payload.dataAsOf;
  return typeof value === "string" && isValidIsoDate(value) ? value : null;
}

async function fetchForbesDataset(): Promise<SourceDataset> {
  const failures: string[] = [];
  for (const endpoint of FORBES_DELIVERY_ENDPOINTS) {
    try {
      const dataset = await fetchForbesFromEndpoint(endpoint);
      console.log(`[source:forbes] endpoint ${endpoint.name} ok (${dataset.dataAsOf})`);
      return dataset;
    } catch (error: unknown) {
      const message = `[source:forbes][endpoint:${endpoint.name}] failed: ${toErrorMessage(error)}`;
      failures.push(message);
      console.warn(message);
    }
  }
  throw new Error(`Forbes source failed across all endpoints.\n${failures.join("\n")}`);
}

async function fetchForbesFromEndpoint(
  endpoint: (typeof FORBES_DELIVERY_ENDPOINTS)[number]
): Promise<SourceDataset> {
  const latestRes = await fetchWithRetry(`${endpoint.baseUrl}/latest`, 15_000);
  const date = (await latestRes.text()).trim();
  if (!isValidIsoDate(date)) {
    throw new Error(`[${endpoint.name}] invalid date from API: ${date}`);
  }

  const listRes = await fetchWithRetry(`${endpoint.baseUrl}/list/rtb/${date}`, 30_000);
  const listJson = (await listRes.json()) as unknown;
  if (listJson === null || typeof listJson !== "object" || !Array.isArray((listJson as RtbListResponse).list)) {
    throw new Error(`[${endpoint.name}] invalid list response: missing or invalid list array`);
  }

  const list = (listJson as RtbListResponse).list;
  const entries = list.slice(0, TOP_N).map((entry) => ({
    name: entry.name,
    netWorthBillions: entry.networth / 1000,
  }));
  validateSourceEntries(entries, "forbes", TOP_N);
  return { source: "forbes", dataAsOf: date, entries };
}

async function fetchConfiguredSource(source: SourceId, url: string): Promise<SourceDataset> {
  const res = await fetchWithRetry(url, 20_000);
  const payload = (await res.json()) as unknown;
  if (payload === null || typeof payload !== "object") {
    throw new Error(`[${source}] invalid payload shape; expected object or array`);
  }

  if (Array.isArray(payload)) {
    const entries = parseSourceEntries(payload, source);
    validateSourceEntries(entries, source, SUPPLEMENTAL_MIN_ENTRIES);
    return {
      source,
      dataAsOf: new Date().toISOString().slice(0, 10),
      entries,
    };
  }

  const record = payload as Record<string, unknown>;
  const entries = parseSourceEntries(record.entries ?? record.list ?? record.data, source);
  validateSourceEntries(entries, source, SUPPLEMENTAL_MIN_ENTRIES);
  const dataAsOf = parseDateFromPayload(record) ?? new Date().toISOString().slice(0, 10);
  return { source, dataAsOf, entries };
}

function mergeDatasets(datasets: SourceDataset[]): WealthTrackerData["entries"] {
  const merged = new Map<string, AggregatedEntry>();

  for (const dataset of datasets) {
    for (const entry of dataset.entries) {
      const key = normalizeName(entry.name);
      const existing = merged.get(key) ?? { name: entry.name };
      if (!existing.name || dataset.source === "forbes") {
        existing.name = entry.name;
      }

      if (dataset.source === "forbes") existing.forbesNetWorth = entry.netWorthBillions;
      if (dataset.source === "bloomberg") existing.bloombergNetWorth = entry.netWorthBillions;
      if (dataset.source === "hurun") existing.hurunNetWorth = entry.netWorthBillions;
      if (dataset.source === "ceoworld") existing.ceoworldNetWorth = entry.netWorthBillions;
      merged.set(key, existing);
    }
  }

  const entries = Array.from(merged.values())
    .map((entry) => {
      const values = [
        entry.forbesNetWorth,
        entry.bloombergNetWorth,
        entry.hurunNetWorth,
        entry.ceoworldNetWorth,
      ].filter((v): v is number => v != null);
      const netWorth = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;
      return {
        name: entry.name,
        forbesNetWorth: entry.forbesNetWorth ?? null,
        bloombergNetWorth: entry.bloombergNetWorth ?? null,
        hurunNetWorth: entry.hurunNetWorth ?? null,
        ceoworldNetWorth: entry.ceoworldNetWorth ?? null,
        netWorth,
      };
    })
    .sort((a, b) => (b.netWorth ?? 0) - (a.netWorth ?? 0))
    .slice(0, TOP_N);

  if (entries.length < TOP_N) {
    throw new Error(`Merged dataset has insufficient entries (${entries.length}/${TOP_N})`);
  }

  return entries;
}

async function fetchFromSources(): Promise<WealthTrackerData> {
  const datasets: SourceDataset[] = [];
  const errors: string[] = [];
  const optionalSources: Array<{ source: SourceId; envName: string; url: string | undefined }> = [
    { source: "bloomberg", envName: "BLOOMBERG_SOURCE_URL", url: process.env.BLOOMBERG_SOURCE_URL },
    { source: "hurun", envName: "HURUN_SOURCE_URL", url: process.env.HURUN_SOURCE_URL },
    { source: "ceoworld", envName: "CEOWORLD_SOURCE_URL", url: process.env.CEOWORLD_SOURCE_URL },
  ];

  const forbesDataset = await fetchForbesDataset();
  datasets.push(forbesDataset);

  for (const sourceConfig of optionalSources) {
    if (!sourceConfig.url) {
      console.log(`[source:${sourceConfig.source}] skipped (${sourceConfig.envName} not set)`);
      continue;
    }
    try {
      const dataset = await fetchConfiguredSource(sourceConfig.source, sourceConfig.url);
      datasets.push(dataset);
      console.log(`[source:${sourceConfig.source}] ok (${dataset.entries.length} entries, ${dataset.dataAsOf})`);
    } catch (error: unknown) {
      const message = `[source:${sourceConfig.source}] failed: ${toErrorMessage(error)}`;
      errors.push(message);
      console.warn(message);
    }
  }

  if (datasets.length < 2) {
    console.warn("Only one source succeeded; set supplemental source URLs for stronger cross-source resilience.");
  }
  if (errors.length > 0) {
    console.warn(`Supplemental source failures:\n${errors.join("\n")}`);
  }

  const entries = mergeDatasets(datasets);
  const dataAsOf = datasets
    .map((d) => d.dataAsOf)
    .filter(isValidIsoDate)
    .sort()
    .at(-1) ?? new Date().toISOString().slice(0, 10);

  return {
    dataAsOf,
    medianSalary: DEFAULT_MEDIAN_SALARY,
    entries,
  };
}

async function main(): Promise<void> {
  const raw = await fetchFromSources();
  if (!validateWealthTrackerData(raw)) {
    console.error("Validation failed: data does not match WealthTrackerData shape.");
    process.exit(1);
  }

  const data = {
    dataAsOf: raw.dataAsOf,
    medianSalary: raw.medianSalary,
    entries: raw.entries.map((e) => ({
      name: e.name,
      forbesNetWorth: e.forbesNetWorth ?? undefined,
      bloombergNetWorth: e.bloombergNetWorth ?? undefined,
      hurunNetWorth: e.hurunNetWorth ?? undefined,
      ceoworldNetWorth: e.ceoworldNetWorth ?? undefined,
    })),
  };

  const client = new ConvexHttpClient(CONVEX_URL);
  await client.mutation(api.data.replaceCanonicalData, { data });
  console.log("Pipeline complete: data written to Convex.");
}

main().catch((err: Error) => {
  console.error("Pipeline failed:", err.message);
  process.exit(1);
});
