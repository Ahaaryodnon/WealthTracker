"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { BillionaireEntry } from "@/data/billionaires.types";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";
import { formatCurrency, formatCompact } from "@/lib/format-currency";
import { useScrollReveal } from "@/lib/useScrollReveal";

interface TopTenListProps {
  entries: BillionaireEntry[];
  medianSalary: number;
  returnRate?: number;
}

type SortKey = "networth" | "perminute" | "persecond";

function getNetWorth(entry: BillionaireEntry): number {
  return entry.netWorth ?? entry.forbesNetWorth ?? entry.bloombergNetWorth ?? 0;
}

export default function TopTenList({
  entries,
  medianSalary,
  returnRate = DEFAULT_RETURN_RATE,
}: TopTenListProps) {
  const [sortKey, setSortKey] = useState<SortKey>("networth");
  const sectionRef = useScrollReveal<HTMLElement>();

  const totalNetWorth = entries.reduce((sum, e) => sum + getNetWorth(e), 0);

  const enriched = useMemo(
    () =>
      entries.map((entry) => {
        const nw = getNetWorth(entry);
        const perSecond = combinedPassiveIncomePerSecond([entry], returnRate);
        const perMinute = perSecond * 60;
        const salarySeconds =
          perSecond > 0 && medianSalary > 0 ? medianSalary / perSecond : 0;
        const sharePercent =
          totalNetWorth > 0 ? (nw / totalNetWorth) * 100 : 0;
        return { entry, nw, perSecond, perMinute, salarySeconds, sharePercent };
      }),
    [entries, returnRate, medianSalary, totalNetWorth]
  );

  const sorted = useMemo(() => {
    const arr = [...enriched];
    if (sortKey === "perminute" || sortKey === "persecond") {
      arr.sort((a, b) => b.perMinute - a.perMinute);
    } else {
      arr.sort((a, b) => b.nw - a.nw);
    }
    return arr;
  }, [enriched, sortKey]);

  if (entries.length === 0) {
    return (
      <section aria-label="Top 10 Billionaires" className="py-20 sm:py-32">
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
      ref={sectionRef}
      id="leaderboard"
      aria-label="Top 10 Billionaires"
      className="reveal py-20 sm:py-32"
    >
      <p className="section-kicker mb-3 text-center">Leaderboard</p>
      <h2 className="section-title mb-2 text-center">
        Who&rsquo;s earning right now
      </h2>
      <p className="section-lead mb-8 text-center text-sm sm:text-base">
        Individual passive income at {Math.round(returnRate * 100)}% annual return
      </p>

      {/* Sort controls */}
      <div className="mb-6 flex justify-center">
        <div className="rate-pill">
          {(
            [
              ["networth", "Net worth"],
              ["perminute", "$/min"],
              ["persecond", "$/sec"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              data-active={sortKey === key ? "true" : undefined}
              onClick={() => setSortKey(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm">
        <ol>
          {sorted.map(
            ({ entry, nw, perMinute, perSecond, salarySeconds, sharePercent }, i) => {
              const salaryLabel =
                salarySeconds < 60
                  ? `${Math.round(salarySeconds)}s`
                  : `${(salarySeconds / 60).toFixed(1)}m`;
              const metricValue =
                sortKey === "networth"
                  ? formatCompact(nw * 1e9)
                  : sortKey === "persecond"
                    ? `${formatCurrency(Math.round(perSecond))}/sec`
                    : `${formatCurrency(Math.round(perMinute))}/min`;
              const metricDetail =
                sortKey === "networth"
                  ? `${sharePercent.toFixed(1)}% of top 10 wealth`
                  : `Salary in ${salaryLabel}`;

              return (
                <li
                  key={entry.name}
                  className={`flex items-center gap-3 px-4 py-4 transition-colors hover:bg-zinc-50 sm:gap-4 sm:px-5 ${
                    i > 0 ? "border-t border-zinc-50" : ""
                  }`}
                >
                  {/* Rank */}
                  <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-zinc-400 text-right">
                    {i + 1}
                  </span>

                  {/* Avatar */}
                  {entry.imageUrl ? (
                    <img
                      src={entry.imageUrl}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full bg-zinc-100 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-400">
                      {entry.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}

                  {/* Name + org */}
                  <div className="min-w-0 flex-1">
                    {entry.slug ? (
                      <Link
                        href={`/billionaires/${entry.slug}`}
                        className="block truncate text-sm font-medium text-zinc-900 hover:underline"
                      >
                        {entry.name}
                      </Link>
                    ) : (
                      <span className="block truncate text-sm font-medium text-zinc-900">
                        {entry.name}
                      </span>
                    )}
                    {entry.organization && (
                      <p className="truncate text-xs text-zinc-400">
                        {entry.organization}
                      </p>
                    )}

                    {/* Proportion bar */}
                    <div className="mt-1.5 h-1 w-full rounded-full bg-zinc-100">
                      <div
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                          width: `${sharePercent}%`,
                          background:
                            "linear-gradient(90deg, #2563eb, #3b82f6)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-semibold tabular-nums text-zinc-900">
                      {metricValue}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {metricDetail}
                    </p>
                  </div>
                </li>
              );
            }
          )}
        </ol>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/billionaires"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:shadow-md"
        >
          View all billionaires &rarr;
        </Link>
      </div>
    </section>
  );
}
