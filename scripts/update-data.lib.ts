import type { BillionaireEntry, WealthTrackerData } from "../src/data/billionaires.types";

export const RTB_API_BASE = "https://raw.githubusercontent.com/komed3/rtb-api/main/api";
export const BLOOMBERG_BILLIONAIRES_URL = "https://www.bloomberg.com/billionaires/";
export const TOP_N = 10;
export const DEFAULT_MEDIAN_SALARY = 59_384;

const BLOOMBERG_HEADERS: HeadersInit = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
  pragma: "no-cache",
};

const NAME_ALIASES: Record<string, string> = {
  "bernard arnault": "bernard-arnault",
  "bernard arnault family": "bernard-arnault",
  "bernard arnault and family": "bernard-arnault",
  "bill gates": "bill-gates",
  "carlos slim": "carlos-slim",
  "carlos slim helu": "carlos-slim",
  "carlos slim helu family": "carlos-slim",
  "jeff bezos": "jeff-bezos",
  "jeffrey bezos": "jeff-bezos",
  "jensen huang": "jensen-huang",
  "jen-hsun huang": "jensen-huang",
  "jen hsun huang": "jensen-huang",
  "jim walton": "jim-walton",
  "jim walton family": "jim-walton",
  "larry ellison": "larry-ellison",
  "lawrence ellison": "larry-ellison",
  "larry page": "larry-page",
  "lawrence page": "larry-page",
  "mark zuckerberg": "mark-zuckerberg",
  "michael dell": "michael-dell",
  "mukesh ambani": "mukesh-ambani",
  "mukesh ambani family": "mukesh-ambani",
  "rob walton": "rob-walton",
  "rob walton family": "rob-walton",
  "sam walton": "rob-walton",
  "samuel walton": "rob-walton",
  "samuel r walton": "rob-walton",
  "sergey brin": "sergey-brin",
  "steve ballmer": "steve-ballmer",
  "warren buffett": "warren-buffett",
};

const BLOOMBERG_ROW_SPLIT = '<div class="table-row">';
const BLOOMBERG_ROW_RANK = /<div class="table-cell t-rank">\s*([0-9]+)\s*<\/div>/;
const BLOOMBERG_ROW_NAME = /<div class="table-cell t-name"><a [^>]*>\s*([^<]+?)<\/a><\/div>/;
const BLOOMBERG_ROW_NET_WORTH = /<div class="table-cell active t-nw">\s*([^<]+?)\s*<\/div>/;
const BLOOMBERG_AS_OF = /<time[^>]*datetime="([^"]+)"/;

export type SourceStatus = "ok" | "missing" | "failed";

export interface SourceFetchLog {
  source: "forbes" | "bloomberg";
  status: SourceStatus;
  fetchedAt: string;
  dataAsOf?: string;
  entryCount?: number;
  error?: string;
}

export interface ForbesSourceEntry {
  slug: string;
  name: string;
  forbesNetWorth: number;
}

export interface ForbesSourceData {
  dataAsOf: string;
  fetchedAt: string;
  entries: ForbesSourceEntry[];
}

export interface BloombergSourceEntry {
  slug: string;
  rank: number;
  name: string;
  bloombergNetWorth: number;
}

export interface BloombergSourceData {
  dataAsOf: string;
  fetchedAt: string;
  entries: BloombergSourceEntry[];
}

interface RtbListEntry {
  name: string;
  networth: number;
}

interface RtbListResponse {
  date: string;
  list: RtbListEntry[];
}

export function normalizeBillionaireName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/\s*&\s*family\b/gi, "")
    .replace(/\s+and\s+family\b/gi, "")
    .replace(/&/g, " and ")
    .replace(/\bfamily\b/gi, "")
    .replace(/\bthe\b/gi, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\band$/gi, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function deriveBillionaireId(name: string): string {
  const normalized = normalizeBillionaireName(name);
  const alias = NAME_ALIASES[normalized];
  if (alias) {
    return alias;
  }

  return normalized
    .replace(/\band\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s/g, "-");
}

export function parseMoneyToBillions(raw: string): number {
  const cleaned = raw.replace(/\s+/g, "").replace(/,/g, "");
  const match = cleaned.match(/^\$([0-9]+(?:\.[0-9]+)?)([MBT])$/i);
  if (!match) {
    throw new Error(`Unsupported money value: ${raw}`);
  }

  const value = Number(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === "T") return value * 1000;
  if (unit === "B") return value;
  return value / 1000;
}

export function coerceIsoDate(raw: string): string {
  const normalized = raw.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  const date = new Date(normalized);
  if (Number.isNaN(date.valueOf())) {
    throw new Error(`Invalid datetime value: ${raw}`);
  }

  return date.toISOString().slice(0, 10);
}

export function parseBloombergHtml(html: string): BloombergSourceData {
  const asOfMatch = html.match(BLOOMBERG_AS_OF);
  if (!asOfMatch) {
    throw new Error("Bloomberg parser could not find the as-of timestamp.");
  }

  const entries = html
    .split(BLOOMBERG_ROW_SPLIT)
    .slice(1)
    .map((chunk) => {
      const rankMatch = chunk.match(BLOOMBERG_ROW_RANK);
      const nameMatch = chunk.match(BLOOMBERG_ROW_NAME);
      const netWorthMatch = chunk.match(BLOOMBERG_ROW_NET_WORTH);
      if (!rankMatch || !nameMatch || !netWorthMatch) {
        return null;
      }

      const name = decodeHtmlEntities(nameMatch[1].trim());
      return {
        rank: Number(rankMatch[1]),
        name,
        slug: deriveBillionaireId(name),
        bloombergNetWorth: parseMoneyToBillions(netWorthMatch[1].trim()),
      } satisfies BloombergSourceEntry;
    })
    .filter((entry): entry is BloombergSourceEntry => entry !== null);

  if (entries.length === 0) {
    throw new Error("Bloomberg parser did not extract any billionaire rows.");
  }

  return {
    dataAsOf: coerceIsoDate(asOfMatch[1]),
    fetchedAt: new Date().toISOString(),
    entries,
  };
}

export async function fetchForbesSource(fetchImpl: typeof fetch = fetch): Promise<ForbesSourceData> {
  const fetchedAt = new Date().toISOString();
  const latestRes = await fetchImpl(`${RTB_API_BASE}/latest`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!latestRes.ok) {
    throw new Error(`Failed to fetch latest date: ${latestRes.status} ${latestRes.statusText}`);
  }

  const date = (await latestRes.text()).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date from API: ${date}`);
  }

  const listRes = await fetchImpl(`${RTB_API_BASE}/list/rtb/${date}`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!listRes.ok) {
    throw new Error(`Failed to fetch list for ${date}: ${listRes.status} ${listRes.statusText}`);
  }

  const listJson = (await listRes.json()) as unknown;
  if (listJson === null || typeof listJson !== "object" || !Array.isArray((listJson as RtbListResponse).list)) {
    throw new Error("Invalid list response: missing or invalid list array");
  }

  const entries = (listJson as RtbListResponse).list.slice(0, TOP_N).map((entry) => {
    if (typeof entry.name !== "string" || typeof entry.networth !== "number") {
      throw new Error(`Invalid list entry: name=${typeof entry.name} networth=${typeof entry.networth}`);
    }

    return {
      slug: deriveBillionaireId(entry.name),
      name: entry.name,
      forbesNetWorth: entry.networth / 1000,
    } satisfies ForbesSourceEntry;
  });

  return {
    dataAsOf: date,
    fetchedAt,
    entries,
  };
}

export async function fetchBloombergSource(fetchImpl: typeof fetch = fetch): Promise<BloombergSourceData> {
  const res = await fetchImpl(BLOOMBERG_BILLIONAIRES_URL, {
    headers: BLOOMBERG_HEADERS,
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Bloomberg page: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  return parseBloombergHtml(html);
}

export function mergeSources(
  forbes: ForbesSourceData,
  bloomberg: BloombergSourceData | null
): WealthTrackerData {
  const bloombergMatches = new Map<string, BloombergSourceEntry[]>();
  for (const entry of bloomberg?.entries ?? []) {
    const existing = bloombergMatches.get(entry.slug);
    if (existing) {
      existing.push(entry);
    } else {
      bloombergMatches.set(entry.slug, [entry]);
    }
  }

  const entries: BillionaireEntry[] = forbes.entries.map((entry) => {
    const matches = bloombergMatches.get(entry.slug) ?? [];
    const bloombergNetWorth = matches.length === 1 ? matches[0].bloombergNetWorth : null;

    return {
      slug: entry.slug,
      name: entry.name,
      forbesNetWorth: entry.forbesNetWorth,
      bloombergNetWorth,
    };
  });

  return {
    dataAsOf: forbes.dataAsOf,
    medianSalary: DEFAULT_MEDIAN_SALARY,
    entries,
  };
}

export function formatSourceLog(log: SourceFetchLog): string {
  const parts = [
    `source=${log.source}`,
    `status=${log.status}`,
    `fetchedAt=${log.fetchedAt}`,
  ];

  if (log.dataAsOf) {
    parts.push(`dataAsOf=${log.dataAsOf}`);
  }
  if (typeof log.entryCount === "number") {
    parts.push(`entryCount=${log.entryCount}`);
  }
  if (log.error) {
    parts.push(`error=${log.error}`);
  }

  return parts.join(" ");
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
