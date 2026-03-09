/**
 * Pipeline script: fetch from multiple sources, validate, write to Convex.
 * Run: npm run update-data
 * Requires CONVEX_URL in environment (e.g. from .env.local).
 * Optional extra sources (see scripts/DATA_SOURCES.md for format and availability):
 * - BLOOMBERG_SOURCE_URL
 * - HURUN_SOURCE_URL
 * - CEOWORLD_SOURCE_URL
 */
import * as fs from "fs";
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
  if (typeof o.slug !== "string") return false;
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

const TOP_N = 100;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 400;
const SUPPLEMENTAL_MIN_ENTRIES = 5;
/** US median personal income (approx); used for comparison baseline. Update or source separately if needed. */
const DEFAULT_MEDIAN_SALARY = 59_384;
/** Concurrency limit for profile fetches. */
const PROFILE_FETCH_CONCURRENCY = 5;
const PROFILE_FETCH_DELAY_MS = 300;

type SourceId = "forbes" | "bloomberg" | "hurun" | "ceoworld";

interface RtbListEntry {
  name: string;
  networth: number;
  uri?: string;
  rank?: number;
  citizenship?: string;
  source?: string;
  industries?: string[];
  organization?: string;
  title?: string;
  age?: number;
  gender?: string;
  selfMade?: boolean;
  squareImage?: string;
}

interface RtbListResponse {
  date: string;
  list: RtbListEntry[];
}

interface RtbProfileResponse {
  name?: string;
  bio?: string[];
  bios?: string[];
  about?: string[];
  abpiGraphics?: string[];
}

interface SourceEntry {
  name: string;
  netWorthBillions: number;
  slug?: string;
  rank?: number;
  citizenship?: string;
  source?: string;
  industries?: string[];
  organization?: string;
  title?: string;
  age?: number;
  gender?: string;
  selfMade?: boolean;
  imageUrl?: string;
}

interface SourceDataset {
  source: SourceId;
  dataAsOf: string;
  entries: SourceEntry[];
}

interface AggregatedEntry {
  name: string;
  slug: string;
  rank?: number;
  forbesNetWorth?: number;
  bloombergNetWorth?: number;
  hurunNetWorth?: number;
  ceoworldNetWorth?: number;
  citizenship?: string;
  source?: string;
  industries?: string[];
  organization?: string;
  title?: string;
  age?: number;
  gender?: string;
  selfMade?: boolean;
  imageUrl?: string;
  bio?: string[];
  about?: string[];
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

/** Generate a URL-safe slug from a name. */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
  const entries: SourceEntry[] = list.slice(0, TOP_N).map((entry, index) => ({
    name: entry.name,
    netWorthBillions: entry.networth / 1000,
    slug: entry.uri || nameToSlug(entry.name),
    rank: entry.rank ?? index + 1,
    citizenship: typeof entry.citizenship === "string" ? entry.citizenship : undefined,
    source: typeof entry.source === "string" ? entry.source : undefined,
    industries: Array.isArray(entry.industries) ? entry.industries : undefined,
    organization: typeof entry.organization === "string" ? entry.organization : undefined,
    title: typeof entry.title === "string" ? entry.title : undefined,
    age: typeof entry.age === "number" ? entry.age : undefined,
    gender: typeof entry.gender === "string" ? entry.gender : undefined,
    selfMade: typeof entry.selfMade === "boolean" ? entry.selfMade : undefined,
    imageUrl: typeof entry.squareImage === "string" ? entry.squareImage : undefined,
  }));
  validateSourceEntries(entries, "forbes", Math.min(TOP_N, 10));
  return { source: "forbes", dataAsOf: date, entries };
}

/** Fetch profile bio data for enrichment. Non-critical — failures are logged and skipped. */
async function fetchProfileBio(
  baseUrl: string,
  uri: string
): Promise<{ bio?: string[]; about?: string[] }> {
  try {
    const res = await fetchWithRetry(`${baseUrl}/profile/${uri}/bio`, 10_000);
    const data = (await res.json()) as unknown;
    if (data === null || typeof data !== "object") return {};
    const profile = data as RtbProfileResponse;
    const bio = Array.isArray(profile.bio) ? profile.bio.filter((s): s is string => typeof s === "string") :
      Array.isArray(profile.bios) ? profile.bios.filter((s): s is string => typeof s === "string") : undefined;
    const about = Array.isArray(profile.about) ? profile.about.filter((s): s is string => typeof s === "string") : undefined;
    return { bio, about };
  } catch {
    return {};
  }
}

/** Fetch profile bios in batches with concurrency control. */
async function enrichWithProfiles(
  entries: AggregatedEntry[],
  baseUrl: string
): Promise<void> {
  console.log(`[profiles] Fetching bios for ${entries.length} entries (concurrency: ${PROFILE_FETCH_CONCURRENCY})...`);
  let fetched = 0;
  let skipped = 0;

  for (let i = 0; i < entries.length; i += PROFILE_FETCH_CONCURRENCY) {
    const batch = entries.slice(i, i + PROFILE_FETCH_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (entry) => {
        const profile = await fetchProfileBio(baseUrl, entry.slug);
        return { entry, profile };
      })
    );
    for (const { entry, profile } of results) {
      if (profile.bio && profile.bio.length > 0) {
        entry.bio = profile.bio;
        fetched++;
      } else {
        skipped++;
      }
      if (profile.about && profile.about.length > 0) {
        entry.about = profile.about;
      }
    }
    if (i + PROFILE_FETCH_CONCURRENCY < entries.length) {
      await wait(PROFILE_FETCH_DELAY_MS);
    }
  }
  console.log(`[profiles] Done: ${fetched} bios fetched, ${skipped} skipped.`);
}

/** Load JSON payload from URL (http/https) or from a local file (file:// or path). */
async function loadPayloadFromSourceUrl(source: SourceId, url: string): Promise<unknown> {
  const trimmed = url.trim();
  const isFile =
    trimmed.startsWith("file:") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("/") ||
    (!trimmed.includes("://") && trimmed.length > 0);
  if (isFile) {
    const filePath = trimmed.startsWith("file:")
      ? path.resolve(new URL(trimmed).pathname)
      : path.resolve(process.cwd(), trimmed);
    if (!fs.existsSync(filePath)) {
      throw new Error(`[${source}] file not found: ${filePath}`);
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as unknown;
  }
  const res = await fetchWithRetry(url, 20_000);
  return (await res.json()) as unknown;
}

async function fetchConfiguredSource(source: SourceId, url: string): Promise<SourceDataset> {
  const payload = await loadPayloadFromSourceUrl(source, url);
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

function mergeDatasets(datasets: SourceDataset[]): AggregatedEntry[] {
  const merged = new Map<string, AggregatedEntry>();

  for (const dataset of datasets) {
    for (const entry of dataset.entries) {
      const key = normalizeName(entry.name);
      const existing = merged.get(key) ?? { name: entry.name, slug: entry.slug || nameToSlug(entry.name) };
      if (!existing.name || dataset.source === "forbes") {
        existing.name = entry.name;
      }

      if (dataset.source === "forbes") {
        existing.forbesNetWorth = entry.netWorthBillions;
        // Preserve profile fields from Forbes (canonical source)
        if (entry.slug) existing.slug = entry.slug;
        if (entry.rank != null) existing.rank = entry.rank;
        if (entry.citizenship) existing.citizenship = entry.citizenship;
        if (entry.source) existing.source = entry.source;
        if (entry.industries) existing.industries = entry.industries;
        if (entry.organization) existing.organization = entry.organization;
        if (entry.title) existing.title = entry.title;
        if (entry.age != null) existing.age = entry.age;
        if (entry.gender) existing.gender = entry.gender;
        if (entry.selfMade != null) existing.selfMade = entry.selfMade;
        if (entry.imageUrl) existing.imageUrl = entry.imageUrl;
      }
      if (dataset.source === "bloomberg") existing.bloombergNetWorth = entry.netWorthBillions;
      if (dataset.source === "hurun") existing.hurunNetWorth = entry.netWorthBillions;
      if (dataset.source === "ceoworld") existing.ceoworldNetWorth = entry.netWorthBillions;
      merged.set(key, existing);
    }
  }

  const entries = Array.from(merged.values())
    .sort((a, b) => {
      const aNetWorth = getComputedNetWorth(a);
      const bNetWorth = getComputedNetWorth(b);
      return bNetWorth - aNetWorth;
    })
    .slice(0, TOP_N);

  // Assign ranks based on sorted position
  entries.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  if (entries.length < Math.min(TOP_N, 10)) {
    throw new Error(`Merged dataset has insufficient entries (${entries.length})`);
  }

  return entries;
}

function getComputedNetWorth(entry: AggregatedEntry): number {
  const values = [
    entry.forbesNetWorth,
    entry.bloombergNetWorth,
    entry.hurunNetWorth,
    entry.ceoworldNetWorth,
  ].filter((v): v is number => v != null);
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

async function fetchFromSources(): Promise<{ data: WealthTrackerData; aggregated: AggregatedEntry[] }> {
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

  const aggregated = mergeDatasets(datasets);
  const dataAsOf = datasets
    .map((d) => d.dataAsOf)
    .filter(isValidIsoDate)
    .sort()
    .at(-1) ?? new Date().toISOString().slice(0, 10);

  const entries: BillionaireEntry[] = aggregated.map((entry) => ({
    name: entry.name,
    slug: entry.slug,
    rank: entry.rank,
    forbesNetWorth: entry.forbesNetWorth ?? null,
    bloombergNetWorth: entry.bloombergNetWorth ?? null,
    hurunNetWorth: entry.hurunNetWorth ?? null,
    ceoworldNetWorth: entry.ceoworldNetWorth ?? null,
    netWorth: getComputedNetWorth(entry) || undefined,
    citizenship: entry.citizenship,
    source: entry.source,
    industries: entry.industries,
    organization: entry.organization,
    title: entry.title,
    age: entry.age,
    gender: entry.gender,
    selfMade: entry.selfMade,
    imageUrl: entry.imageUrl,
    bio: entry.bio,
    about: entry.about,
  }));

  return {
    data: { dataAsOf, medianSalary: DEFAULT_MEDIAN_SALARY, entries },
    aggregated,
  };
}

async function main(): Promise<void> {
  const { data, aggregated } = await fetchFromSources();

  // Enrich with profile bios from rtb-api
  const baseUrl = FORBES_DELIVERY_ENDPOINTS[0].baseUrl;
  await enrichWithProfiles(aggregated, baseUrl);

  // Copy bio/about back to data entries
  for (let i = 0; i < data.entries.length; i++) {
    const agg = aggregated[i];
    if (agg.bio) data.entries[i].bio = agg.bio;
    if (agg.about) data.entries[i].about = agg.about;
  }

  if (!validateWealthTrackerData(data)) {
    console.error("Validation failed: data does not match WealthTrackerData shape.");
    process.exit(1);
  }

  const convexData = {
    dataAsOf: data.dataAsOf,
    medianSalary: data.medianSalary,
    entries: data.entries.map((e) => ({
      name: e.name,
      slug: e.slug,
      rank: e.rank,
      forbesNetWorth: e.forbesNetWorth ?? undefined,
      bloombergNetWorth: e.bloombergNetWorth ?? undefined,
      hurunNetWorth: e.hurunNetWorth ?? undefined,
      ceoworldNetWorth: e.ceoworldNetWorth ?? undefined,
      citizenship: e.citizenship,
      source: e.source,
      industries: e.industries,
      organization: e.organization,
      title: e.title,
      age: e.age,
      gender: e.gender,
      selfMade: e.selfMade,
      imageUrl: e.imageUrl,
      bio: e.bio,
      about: e.about,
    })),
  };

  const client = new ConvexHttpClient(CONVEX_URL);
  await client.mutation(api.data.replaceCanonicalData, { data: convexData });
  console.log(`Pipeline complete: ${data.entries.length} entries written to Convex.`);
}

main().catch((err: Error) => {
  console.error("Pipeline failed:", err.message);
  process.exit(1);
});
