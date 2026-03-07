import Accumulator from "./Accumulator";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";
import { formatDataAsOf } from "@/lib/format-date";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import type { BillionaireEntry } from "@/data/billionaires.types";

interface HeroSectionProps {
  entries: BillionaireEntry[];
  medianSalary: number;
  dataAsOf: string;
  onSessionUpdate?: (
    sinceArrived: number,
    elapsedSeconds: number,
    ytdTotal?: number
  ) => void;
}

/** Format seconds as "X seconds" or "Y minutes" for the relatable comparison line. */
function formatComparisonDuration(totalSeconds: number): string {
  if (totalSeconds < 60) {
    const secs = Math.round(totalSeconds);
    return `${secs} second${secs !== 1 ? "s" : ""}`;
  }
  const mins = totalSeconds / 60;
  return `${mins.toFixed(1)} minute${mins !== 1 ? "s" : ""}`;
}

export default function HeroSection({
  entries,
  medianSalary,
  dataAsOf,
  onSessionUpdate,
}: HeroSectionProps) {
  const firstEntry = entries.length > 0 ? entries[0] : null;
  const perSecond =
    firstEntry !== null
      ? combinedPassiveIncomePerSecond([firstEntry], DEFAULT_RETURN_RATE)
      : 0;
  const secondsToEarnMedian =
    perSecond > 0 && medianSalary > 0 ? medianSalary / perSecond : 0;
  const showComparison =
    firstEntry !== null && medianSalary > 0 && secondsToEarnMedian > 0;

  return (
    <section
      aria-label="Wealth Accumulator"
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center sm:px-8"
    >
      <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
        Right now, while you read this
      </p>

      <Accumulator
        entries={entries}
        dataAsOf={dataAsOf}
        medianSalary={medianSalary}
        onSessionUpdate={onSessionUpdate}
      />

      {showComparison && (
        <p className="mt-6 text-sm text-zinc-600" role="status">
          <span className="font-medium text-zinc-800">{firstEntry!.name}</span>
          {" earns a median annual salary every "}
          <span className="font-mono tabular-nums text-zinc-900">
            {formatComparisonDuration(secondsToEarnMedian)}
          </span>
          .
        </p>
      )}

      <p className="mt-10 text-xs text-zinc-400">
        Data as of {formatDataAsOf(dataAsOf) || "—"} &middot;{" "}
        {Math.round(DEFAULT_RETURN_RATE * 100)}% annual return assumption
        &middot; Forbes Real-Time Billionaires &middot;{" "}
        <a
          href="#methodology"
          className="underline hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 rounded"
        >
          Methodology
        </a>
      </p>

      {/* Scroll indicator */}
      <div className="mt-12 animate-bounce text-zinc-300" aria-hidden="true">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
