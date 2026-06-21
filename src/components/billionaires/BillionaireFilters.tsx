"use client";

import { useState, useMemo } from "react";
import type { BillionaireEntry } from "@/data/billionaires.types";
import { getNetWorth } from "@/lib/billionaire-utils";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";
import { formatCompact, formatCurrency } from "@/lib/format-currency";
import Link from "next/link";

interface BillionaireFiltersProps {
  entries: BillionaireEntry[];
  countries: string[];
}

type SortField = "rank" | "netWorth" | "income";

export default function BillionaireFilters({ entries, countries }: BillionaireFiltersProps) {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("rank");

  const filtered = useMemo(() => {
    let result = entries;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.source?.toLowerCase().includes(q) ||
          e.organization?.toLowerCase().includes(q)
      );
    }

    if (country) {
      result = result.filter((e) => e.citizenship === country);
    }

    if (sortBy === "netWorth") {
      result = [...result].sort((a, b) => getNetWorth(b) - getNetWorth(a));
    } else if (sortBy === "income") {
      result = [...result].sort(
        (a, b) =>
          combinedPassiveIncomePerSecond([b], DEFAULT_RETURN_RATE) -
          combinedPassiveIncomePerSecond([a], DEFAULT_RETURN_RATE)
      );
    }
    // "rank" is the default order from the data

    return result;
  }, [entries, search, country, sortBy]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search by name, source, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortField)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        >
          <option value="rank">Sort by rank</option>
          <option value="netWorth">Sort by net worth</option>
          <option value="income">Sort by income rate</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          No billionaires match your search.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => {
            const nw = getNetWorth(entry);
            const perMinute =
              combinedPassiveIncomePerSecond([entry], DEFAULT_RETURN_RATE) * 60;

            return (
              <Link
                key={entry.slug}
                href={`/billionaires/${entry.slug}`}
                className="group rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <div className="flex items-start gap-3">
                  {entry.imageUrl ? (
                    <img
                      src={entry.imageUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover bg-zinc-200 shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-zinc-200 shrink-0 flex items-center justify-center text-xs font-medium text-zinc-500">
                      {entry.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-xs tabular-nums text-zinc-400">
                        #{entry.rank}
                      </span>
                      <span className="text-sm font-medium text-zinc-900 truncate group-hover:underline">
                        {entry.name}
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <span className="font-mono text-sm tabular-nums text-zinc-500">
                        {formatCompact(nw * 1e9)}
                      </span>
                      <span className="font-mono text-xs font-semibold tabular-nums text-zinc-700">
                        {formatCurrency(Math.round(perMinute))}/min
                      </span>
                    </div>
                    {(entry.citizenship || entry.source) && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {entry.citizenship && (
                          <span className="text-[10px] text-zinc-400">
                            {entry.citizenship}
                          </span>
                        )}
                        {entry.source && (
                          <span className="text-[10px] text-zinc-400">
                            &middot; {entry.source}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-zinc-400">
        Showing {filtered.length} of {entries.length} billionaires
      </p>
    </>
  );
}
