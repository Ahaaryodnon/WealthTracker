/**
 * Pipeline script: fetch from sources, validate, write to Convex.
 * Run: npm run update-data
 * Requires CONVEX_URL in environment (e.g. from .env.local).
 * On validation failure exits non-zero and does not write to Convex.
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
  if (o.bloombergNetWorth !== undefined && o.bloombergNetWorth !== null && typeof o.bloombergNetWorth !== "number") return false;
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

/**
 * Canonical data source: Forbes Real-Time Billionaires via rtb-api.
 * Net worth in API is millions; we store in billions.
 *
 * Delivery endpoints below are mirrors/CDN routes of the same source for transport resilience.
 */
const RTB_DELIVERY_ENDPOINTS = [
  { name: "primary-github-raw", baseUrl: "https://raw.githubusercontent.com/komed3/rtb-api/main/api" },
  { name: "fallback-statically-main", baseUrl: "https://cdn.statically.io/gh/komed3/rtb-api/main/api" },
  { name: "fallback-jsdelivr-main", baseUrl: "https://cdn.jsdelivr.net/gh/komed3/rtb-api@main/api" },
] as const;

const TOP_N = 10;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 400;
/** US median personal income (approx); used for comparison baseline. Update or source separately if needed. */
const DEFAULT_MEDIAN_SALARY = 59_384;

interface RtbListEntry {
  name: string;
  networth: number;
}

interface RtbListResponse {
  date: string;
  list: RtbListEntry[];
}

interface EndpointSuccess {
  endpointName: string;
  data: WealthTrackerData;
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

function validateListEntries(entries: RtbListEntry[], endpointName: string): void {
  if (entries.length < TOP_N) {
    throw new Error(`[${endpointName}] not enough list entries (${entries.length}/${TOP_N})`);
  }
  const top = entries.slice(0, TOP_N);
  const seen = new Set<string>();
  for (const entry of top) {
    if (typeof entry.name !== "string" || entry.name.trim().length === 0) {
      throw new Error(`[${endpointName}] invalid entry name`);
    }
    if (typeof entry.networth !== "number" || !Number.isFinite(entry.networth) || entry.networth <= 0) {
      throw new Error(`[${endpointName}] invalid net worth for ${entry.name}`);
    }
    const key = entry.name.trim().toLowerCase();
    if (seen.has(key)) {
      throw new Error(`[${endpointName}] duplicate name in top ${TOP_N}: ${entry.name}`);
    }
    seen.add(key);
  }
}

async function fetchFromEndpoint(endpoint: (typeof RTB_DELIVERY_ENDPOINTS)[number]): Promise<EndpointSuccess> {
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
  const { list } = listJson as RtbListResponse;
  validateListEntries(list, endpoint.name);
  const top = list.slice(0, TOP_N);

  const entries: WealthTrackerData["entries"] = top.map((e) => {
    const billions = e.networth / 1000;
    return {
      name: e.name,
      forbesNetWorth: billions,
      bloombergNetWorth: null,
    };
  });

  return {
    endpointName: endpoint.name,
    data: {
      dataAsOf: date,
      medianSalary: DEFAULT_MEDIAN_SALARY,
      entries,
    },
  };
}

async function fetchFromSources(): Promise<WealthTrackerData> {
  const successes: EndpointSuccess[] = [];
  const failures: string[] = [];

  for (const endpoint of RTB_DELIVERY_ENDPOINTS) {
    try {
      const result = await fetchFromEndpoint(endpoint);
      successes.push(result);
      console.log(`[endpoint:${endpoint.name}] ok (${result.data.dataAsOf})`);
      // Use first successful endpoint in priority order.
      return result.data;
    } catch (error: unknown) {
      const message = `[endpoint:${endpoint.name}] failed: ${toErrorMessage(error)}`;
      failures.push(message);
      console.warn(message);
    }
  }

  throw new Error(`All endpoints for canonical source failed.\n${failures.join("\n")}`);
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
