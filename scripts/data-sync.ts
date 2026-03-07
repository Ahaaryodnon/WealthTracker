/**
 * Sync step: read canonical dataset from Convex, write to src/data/ in typed shape.
 * Run: npm run data:sync
 * Requires CONVEX_URL in environment (e.g. from .env.local).
 * On Convex read failure does not overwrite src/data/; exits non-zero.
 */
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

config({ path: path.resolve(process.cwd(), ".env.local") });

const envUrl = process.env.CONVEX_URL;
if (!envUrl || typeof envUrl !== "string") {
  console.error("CONVEX_URL is required. Set it in .env.local or the environment.");
  process.exit(1);
}
const CONVEX_URL: string = envUrl;

const DATA_FILE = path.resolve(process.cwd(), "src/data/billionaires.ts");

async function main(): Promise<void> {
  const client = new ConvexHttpClient(CONVEX_URL);
  const data = await client.query(api.data.getCanonicalData, {});

  if (data === null) {
    console.error("Sync failed: no metadata in Convex (empty or not yet seeded). Not overwriting src/data/.");
    process.exit(1);
  }

  const dataStr = JSON.stringify(data, null, 2).replace(/"([^"]+)":/g, "$1:");
  const content = `/**
 * Canonical billionaire dataset consumed at build time.
 * Populated by sync step (Story 1.4) from Convex; seed data is Story 1.5.
 * Do not edit by hand; run \`npm run data:sync\` after Convex updates.
 */
import type { WealthTrackerData } from "./billionaires.types";

export const wealthTrackerData: WealthTrackerData = ${dataStr};
`;

  fs.writeFileSync(DATA_FILE, content, "utf8");
  console.log("Sync complete: src/data/billionaires.ts written.");
}

main().catch((err: Error) => {
  console.error("Sync failed:", err.message);
  process.exit(1);
});
