"use client";

import { useState, useMemo } from "react";
import type { BillionaireEntry } from "@/data/billionaires.types";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import { DEFAULT_RETURN_RATE, BUDGET_ITEMS } from "@/lib/constants";
import { formatCompact, formatNumber } from "@/lib/format-currency";
import { useScrollReveal } from "@/lib/useScrollReveal";

interface BudgetComparisonSectionProps {
  entries: BillionaireEntry[];
  returnRate?: number;
}

type ViewMode = "income" | "wealth";

export default function BudgetComparisonSection({
  entries,
  returnRate = DEFAULT_RETURN_RATE,
}: BudgetComparisonSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("income");
  const sectionRef = useScrollReveal<HTMLElement>();

  const perSecond = combinedPassiveIncomePerSecond(entries, returnRate);
  const annualPassiveIncome = perSecond * 365 * 24 * 3600;
  const combinedNetWorth =
    entries.reduce((sum, e) => sum + (e.netWorth ?? 0), 0) * 1e9;

  const baseAmount =
    viewMode === "income" ? annualPassiveIncome : combinedNetWorth;
  const baseLabel =
    viewMode === "income" ? "annual passive income" : "combined net worth";

  // Sort by years fundable (descending) so most impactful comes first
  const sortedItems = useMemo(
    () =>
      [...BUDGET_ITEMS].sort(
        (a, b) => baseAmount / a.annualCost - (baseAmount / b.annualCost)
      ).reverse(),
    [baseAmount]
  );

  // Combined metric: how many of ALL items could be funded simultaneously
  const totalAnnualCost = BUDGET_ITEMS.reduce((s, i) => s + i.annualCost, 0);
  const combinedCoveragePercent = Math.min(
    (baseAmount / totalAnnualCost) * 100,
    100
  );
  const combinedYears = baseAmount / totalAnnualCost;

  return (
    <section
      ref={sectionRef}
      id="budget"
      aria-label="Public budget comparisons"
      className="reveal py-20 sm:py-32"
    >
      <p className="section-kicker mb-3 text-center">Public Goods</p>
      <h2 className="section-title mb-3 text-center">What could this fund?</h2>
      <p className="section-lead mb-6 text-center text-sm sm:text-base">
        Their {baseLabel}:{" "}
        <span className="font-semibold tabular-nums text-zinc-700">
          {formatCompact(baseAmount)}
        </span>
      </p>

      {/* Toggle */}
      <div className="mb-8 flex justify-center">
        <div className="rate-pill">
          <button
            onClick={() => setViewMode("income")}
            data-active={viewMode === "income" ? "true" : undefined}
          >
            Passive income
          </button>
          <button
            onClick={() => setViewMode("wealth")}
            data-active={viewMode === "wealth" ? "true" : undefined}
          >
            Net worth
          </button>
        </div>
      </div>

      {/* ── Combined coverage bar ──────────────────────── */}
      <div className="mb-8 rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              All {BUDGET_ITEMS.length} programmes combined
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Total annual cost:{" "}
              <span className="numeric font-semibold text-zinc-700">
                {formatCompact(totalAnnualCost)}
              </span>
            </p>
          </div>
          <p className="numeric text-xl font-bold text-emerald-700 sm:text-2xl">
            {combinedYears >= 1
              ? `${combinedYears.toFixed(1)} yrs`
              : `${combinedCoveragePercent.toFixed(0)}%`}
          </p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min(combinedCoveragePercent, 100)}%` }}
            role="progressbar"
            aria-valuenow={Math.round(combinedCoveragePercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${Math.round(combinedCoveragePercent)}% of all programmes`}
          />
        </div>
        {combinedYears >= 1 && (
          <p className="mt-2 text-xs text-zinc-400">
            Could run every programme on this list for {combinedYears.toFixed(1)} years simultaneously.
          </p>
        )}
      </div>

      {/* ── Individual items ───────────────────────────── */}
      <div className="space-y-3">
        {sortedItems.map((item) => {
          const yearsCanFund = baseAmount / item.annualCost;
          const percentOfBudget = (baseAmount / item.annualCost) * 100;
          const barWidth = Math.min(percentOfBudget, 100);
          const canFullyFund = yearsCanFund >= 1;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">
                      {item.icon}
                    </span>
                    <h3 className="text-sm font-medium text-zinc-900">
                      {item.label}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {item.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {canFullyFund ? (
                    <p className="numeric text-lg font-bold text-emerald-700">
                      {yearsCanFund >= 10
                        ? `${formatNumber(Math.round(yearsCanFund))} yrs`
                        : `${yearsCanFund.toFixed(1)} yrs`}
                    </p>
                  ) : (
                    <p className="numeric text-lg font-bold text-amber-600">
                      {percentOfBudget.toFixed(0)}%
                    </p>
                  )}
                  <p className="text-[10px] text-zinc-400">
                    {formatCompact(item.annualCost)}/yr
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    canFullyFund ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                  style={{ width: `${barWidth}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(percentOfBudget)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${Math.round(percentOfBudget)}% of ${item.label} budget`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-zinc-400">
        Budget figures are approximate annual US federal allocations.
        {viewMode === "income"
          ? ` Passive income assumes a ${Math.round(returnRate * 100)}% annual return.`
          : " Net worth is not liquid; this is illustrative."}
      </p>
    </section>
  );
}
