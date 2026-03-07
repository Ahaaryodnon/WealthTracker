"use client";

import { useState } from "react";
import type { BillionaireEntry } from "@/data/billionaires.types";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";
import { formatCurrency, formatCompact } from "@/lib/format-currency";

interface TopTenListProps {
  entries: BillionaireEntry[];
  medianSalary: number;
}

function getNetWorth(entry: BillionaireEntry): number {
  return entry.netWorth ?? entry.forbesNetWorth ?? entry.bloombergNetWorth ?? 0;
}

export default function TopTenList({ entries, medianSalary }: TopTenListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const totalNetWorth = entries.reduce((sum, e) => sum + getNetWorth(e), 0);

  if (entries.length === 0) {
    return (
      <section
        aria-label="Top 10 Billionaires"
        className="border-t border-zinc-200 py-16 sm:py-24"
      >
        <p className="text-center text-zinc-500">
          No data available. Run{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
            npm run data:sync
          </code>{" "}
          to populate.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Top 10 Billionaires"
      className="border-t border-zinc-200 py-16 sm:py-24"
    >
      <h2 className="mb-2 text-center text-lg font-medium text-zinc-900">
        Who&rsquo;s earning right now
      </h2>
      <p className="mb-10 text-center text-sm text-zinc-500">
        Individual passive income at 5% annual return
      </p>

      <ol className="space-y-1">
        {entries.map((entry, i) => {
          const nw = getNetWorth(entry);
          const perMinute =
            combinedPassiveIncomePerSecond([entry], DEFAULT_RETURN_RATE) * 60;
          const sharePercent =
            totalNetWorth > 0 ? (nw / totalNetWorth) * 100 : 0;
          const salaryPerSecond = combinedPassiveIncomePerSecond(
            [entry],
            DEFAULT_RETURN_RATE
          );
          const salarySeconds =
            salaryPerSecond > 0 ? medianSalary / salaryPerSecond : 0;
          const isExpanded = expandedIndex === i;

          return (
            <li key={entry.name}>
              <button
                type="button"
                className="group w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-zinc-50"
                onClick={() =>
                  setExpandedIndex(isExpanded ? null : i)
                }
                aria-expanded={isExpanded}
                aria-label={`${entry.name}, net worth ${formatCompact(nw * 1e9)}, ${formatCurrency(Math.round(perMinute))} per minute${isExpanded ? "; details expanded" : ""}`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono text-xs tabular-nums text-zinc-400 w-5 shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-zinc-800 truncate">{entry.name}</span>
                  </div>
                  <div className="flex items-baseline gap-4 shrink-0">
                    <span className="font-mono text-sm tabular-nums text-zinc-500">
                      {formatCompact(nw * 1e9)}
                    </span>
                    <span className="font-mono text-sm font-semibold tabular-nums text-zinc-900">
                      {formatCurrency(Math.round(perMinute))}/min
                    </span>
                  </div>
                </div>

                {/* Proportion bar */}
                <div className="mt-2 ml-8">
                  <div className="h-1.5 w-full rounded-full bg-zinc-100">
                    <div
                      className="h-1.5 rounded-full bg-zinc-900 transition-all duration-500"
                      style={{ width: `${sharePercent}%` }}
                    />
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="mt-3 ml-8 grid grid-cols-2 gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-zinc-400">Per second</p>
                      <p className="font-mono tabular-nums text-zinc-900">
                        {formatCurrency(Math.round(salaryPerSecond))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Per minute</p>
                      <p className="font-mono tabular-nums text-zinc-900">
                        {formatCurrency(Math.round(perMinute))}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-xs text-zinc-400">
                        Earns your salary every
                      </p>
                      <p className="font-mono tabular-nums text-zinc-900">
                        {salarySeconds < 60
                          ? `${Math.round(salarySeconds)}s`
                          : `${(salarySeconds / 60).toFixed(1)} min`}
                      </p>
                    </div>
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
