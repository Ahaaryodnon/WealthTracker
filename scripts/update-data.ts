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
import {
  fetchBloombergSource,
  fetchForbesSource,
  formatSourceLog,
  mergeSources,
  type SourceFetchLog,
} from "./update-data.lib";

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
  if (o.id !== undefined && typeof o.id !== "string") return false;
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

async function main(): Promise<void> {
  const logs: SourceFetchLog[] = [];

  const forbes = await fetchForbesSource();
  logs.push({
    source: "forbes",
    status: "ok",
    fetchedAt: forbes.fetchedAt,
    dataAsOf: forbes.dataAsOf,
    entryCount: forbes.entries.length,
  });

  let bloomberg = null;
  try {
    bloomberg = await fetchBloombergSource();
    logs.push({
      source: "bloomberg",
      status: "ok",
      fetchedAt: bloomberg.fetchedAt,
      dataAsOf: bloomberg.dataAsOf,
      entryCount: bloomberg.entries.length,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logs.push({
      source: "bloomberg",
      status: "failed",
      fetchedAt: new Date().toISOString(),
      error,
    });
  }

  for (const log of logs) {
    console.log(formatSourceLog(log));
  }

  const raw = mergeSources(forbes, bloomberg);
  if (!validateWealthTrackerData(raw)) {
    console.error("Validation failed: data does not match WealthTrackerData shape.");
    process.exit(1);
  }

  const data = {
    dataAsOf: raw.dataAsOf,
    medianSalary: raw.medianSalary,
    entries: raw.entries.map((e) => ({
      slug: e.id ?? undefined,
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
