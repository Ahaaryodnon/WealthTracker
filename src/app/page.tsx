import { wealthTrackerData } from "@/data/billionaires";
import PageClient from "@/components/PageClient";
import {
  combinedPassiveIncomePerSecond,
  accumulatedFromRate,
} from "@/lib/passive-income-calc";
import { formatCurrency } from "@/lib/format-currency";
import { formatDataAsOf } from "@/lib/format-date";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";

function staticTotalAtBuild(entries: typeof wealthTrackerData.entries, dataAsOf: string): number {
  const ref = new Date(dataAsOf + "T00:00:00Z").getTime();
  const elapsedSeconds = Math.max(0, (Date.now() - ref) / 1000);
  const rate = combinedPassiveIncomePerSecond(entries, DEFAULT_RETURN_RATE);
  return accumulatedFromRate(rate, elapsedSeconds);
}

export default function Home() {
  const { entries, medianSalary, dataAsOf } = wealthTrackerData;
  const staticSnapshot = staticTotalAtBuild(entries, dataAsOf);

  return (
    <>
      <noscript>
        <div
          className="min-h-screen bg-zinc-50 px-4 py-16 text-center font-sans"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-400">
            Static snapshot (JavaScript disabled)
          </p>
          <p className="mb-4 font-mono text-4xl font-bold tabular-nums text-zinc-900">
            {formatCurrency(staticSnapshot)}
          </p>
          <p className="mb-2 text-sm text-zinc-600">
            Combined passive income of the top 10 · Data as of{" "}
            {formatDataAsOf(dataAsOf) || "—"}
          </p>
          <p className="text-sm text-zinc-500">
            Enable JavaScript for live updates.
          </p>
        </div>
      </noscript>
      <PageClient
        entries={entries}
        medianSalary={medianSalary}
        dataAsOf={dataAsOf}
      />
    </>
  );
}
