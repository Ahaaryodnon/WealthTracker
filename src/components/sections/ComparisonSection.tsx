"use client";

import type { BillionaireEntry } from "@/data/billionaires.types";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import { DEFAULT_RETURN_RATE, COMPARISONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format-currency";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useCountUp } from "@/lib/useCountUp";
import ComparisonCycleBar from "./ComparisonCycleBar";
import ComparisonTimer from "./ComparisonTimer";

/** Human-readable effort descriptions for each comparison */
const EFFORT_LABELS: Record<string, string> = {
  "Median US salary": "1 year of work",
  "Average US home price": "30-year mortgage",
  "Teacher's annual salary (US avg)": "1 year of teaching",
};

interface ComparisonSectionProps {
  entries: BillionaireEntry[];
  returnRate?: number;
}

/** Individual comparison card with count-up animation */
function ComparisonCard({
  comp,
  perSecond,
  index,
}: {
  comp: (typeof COMPARISONS)[number];
  perSecond: number;
  index: number;
}) {
  const seconds = perSecond > 0 ? comp.value / perSecond : 0;
  const cycleSeconds =
    Number.isFinite(seconds) && seconds > 0 ? seconds : 1;
  const effortLabel = EFFORT_LABELS[comp.label] ?? "";

  const timeLabel =
    seconds < 60
      ? `${Math.round(seconds)} seconds`
      : seconds < 3600
        ? `${(seconds / 60).toFixed(1)} minutes`
        : `${(seconds / 3600).toFixed(1)} hours`;

  // Count-up the dollar value on scroll
  const [countRef, countDisplay] = useCountUp<HTMLParagraphElement>({
    end: comp.value,
    duration: 1200,
    formatter: (v) => formatCurrency(Math.round(v)),
  });

  return (
    <div
      className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm"
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Two-column comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {/* Left: What you work for */}
        <div className="border-b border-zinc-100 p-5 sm:border-r sm:border-b-0 sm:p-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            What you work for
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-700">
            {comp.label}
          </p>
          <p
            ref={countRef}
            className="numeric mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl"
          >
            {countDisplay}
          </p>
          {effortLabel && (
            <p className="mt-1 text-xs text-zinc-400">{effortLabel}</p>
          )}
        </div>

        {/* Right: How long it takes them */}
        <div className="bg-blue-50/50 p-5 sm:p-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-blue-400">
            Their passive income
          </p>

          <div className="mt-2 flex items-center gap-4">
            <div className="flex-1">
              <p className="numeric text-2xl font-bold text-blue-900 sm:text-3xl">
                {timeLabel}
              </p>
              <p className="mt-1 text-xs text-blue-600/60">
                of passive income
              </p>
            </div>

            {/* Circular timer */}
            <ComparisonTimer
              cycleSeconds={cycleSeconds}
              label={comp.label}
              size={64}
            />
          </div>

          {/* Cycle bar */}
          <div className="mt-4">
            <ComparisonCycleBar cycleSeconds={cycleSeconds} />
          </div>
        </div>
      </div>

      {/* Source */}
      <div className="border-t border-zinc-50 bg-zinc-50/50 px-5 py-2">
        <p className="text-[10px] text-zinc-300">
          Source: {comp.source}
        </p>
      </div>
    </div>
  );
}

export default function ComparisonSection({
  entries,
  returnRate = DEFAULT_RETURN_RATE,
}: ComparisonSectionProps) {
  const sectionRef = useScrollReveal<HTMLElement>();
  const perSecond = combinedPassiveIncomePerSecond(entries, returnRate);

  return (
    <section
      ref={sectionRef}
      id="comparisons"
      aria-label="Scale comparisons"
      className="reveal py-20 sm:py-32"
    >
      <p className="section-kicker mb-3 text-center">Your Life vs Their Seconds</p>
      <h2 className="section-title mb-3 text-center">What does that buy?</h2>
      <p className="section-lead mb-12 text-center text-sm sm:text-base">
        Side by side: what you work for, and how long it takes them.
      </p>

      <div className="space-y-6">
        {COMPARISONS.map((comp, i) => (
          <ComparisonCard
            key={comp.label}
            comp={comp}
            perSecond={perSecond}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
