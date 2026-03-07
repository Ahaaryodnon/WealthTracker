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

/** Forbes Real-Time Billionaires via rtb-api. Net worth in API is millions; we store in billions. */
const RTB_API_BASE = "https://raw.githubusercontent.com/komed3/rtb-api/main/api";
const TOP_N = 10;
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

async function fetchFromSources(): Promise<WealthTrackerData> {
  const latestRes = await fetch(`${RTB_API_BASE}/latest`, { signal: AbortSignal.timeout(15_000) });
  if (!latestRes.ok) {
    throw new Error(`Failed to fetch latest date: ${latestRes.status} ${latestRes.statusText}`);
  }
  const date = (await latestRes.text()).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date from API: ${date}`);
  }

  const listRes = await fetch(`${RTB_API_BASE}/list/rtb/${date}`, { signal: AbortSignal.timeout(30_000) });
  if (!listRes.ok) {
    throw new Error(`Failed to fetch list for ${date}: ${listRes.status} ${listRes.statusText}`);
  }
  const listJson = (await listRes.json()) as unknown;
  if (listJson === null || typeof listJson !== "object" || !Array.isArray((listJson as RtbListResponse).list)) {
    throw new Error("Invalid list response: missing or invalid list array");
  }
  const { list } = listJson as RtbListResponse;
  const top = list.slice(0, TOP_N);

  const entries: WealthTrackerData["entries"] = top.map((e) => {
    if (typeof e.name !== "string" || typeof e.networth !== "number") {
      throw new Error(`Invalid list entry: name=${typeof e.name} networth=${typeof e.networth}`);
    }
    const billions = e.networth / 1000;
    return {
      name: e.name,
      forbesNetWorth: billions,
      bloombergNetWorth: null,
    };
  });

  return {
    dataAsOf: date,
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
