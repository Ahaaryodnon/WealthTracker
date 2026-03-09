"use client";

import { useState, useMemo, useCallback } from "react";
import type { BillionaireEntry } from "@/data/billionaires.types";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";
import { formatCurrency, formatNumber, formatDuration } from "@/lib/format-currency";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useCountUp } from "@/lib/useCountUp";

interface SalaryCalculatorProps {
  entries: BillionaireEntry[];
  returnRate?: number;
  medianSalary?: number;
}

/** Quick presets for salary input */
const PRESETS = [
  { label: "Minimum wage", value: 15_080, note: "$7.25/hr" },
  { label: "Median US", value: 59_384, note: "Census" },
  { label: "Software engineer", value: 130_000, note: "avg" },
  { label: "Doctor", value: 260_000, note: "avg" },
] as const;

function formatTimeToEarn(seconds: number): string {
  if (seconds < 1) return "less than a second";
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return s > 0 ? `${m}m ${s}s` : `${m} minute${m !== 1 ? "s" : ""}`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h} hour${h !== 1 ? "s" : ""}`;
  }
  const d = seconds / 86400;
  if (d < 365) return `${d.toFixed(1)} days`;
  const y = d / 365;
  return `${y.toFixed(1)} years`;
}

export default function SalaryCalculator({
  entries,
  returnRate = DEFAULT_RETURN_RATE,
  medianSalary = 59_384,
}: SalaryCalculatorProps) {
  const sectionRef = useScrollReveal<HTMLElement>();
  const [salary, setSalary] = useState(medianSalary);
  const [inputValue, setInputValue] = useState(
    medianSalary.toLocaleString("en-US")
  );

  const perSecond = combinedPassiveIncomePerSecond(entries, returnRate);

  const stats = useMemo(() => {
    if (perSecond <= 0 || salary <= 0) {
      return {
        timeToEarn: 0,
        timeToEarnLabel: "—",
        yearsOfSalary: 0,
        dailyMultiple: 0,
        perMinuteOfSalary: 0,
      };
    }

    const timeToEarn = salary / perSecond;
    const annualPassiveIncome = perSecond * 365 * 24 * 3600;
    const yearsOfSalary = annualPassiveIncome / salary;
    const dailyPassive = perSecond * 86400;
    const dailySalary = salary / 365;
    const dailyMultiple = dailyPassive / dailySalary;
    const perMinutePassive = perSecond * 60;
    const minutesOfSalary = perMinutePassive / (salary / (365 * 24 * 60));

    return {
      timeToEarn,
      timeToEarnLabel: formatTimeToEarn(timeToEarn),
      yearsOfSalary: Math.round(yearsOfSalary),
      dailyMultiple: Math.round(dailyMultiple),
      perMinuteOfSalary: minutesOfSalary,
    };
  }, [perSecond, salary]);

  // Count-up for the "years of salary" stat
  const [yearsRef, yearsDisplay] = useCountUp<HTMLParagraphElement>({
    end: stats.yearsOfSalary,
    duration: 1200,
    formatter: (v) => formatNumber(Math.round(v)),
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      const num = parseInt(raw, 10);

      if (raw === "") {
        setInputValue("");
        setSalary(0);
        return;
      }

      setInputValue(num.toLocaleString("en-US"));
      if (!isNaN(num) && num > 0) {
        setSalary(num);
      }
    },
    []
  );

  const handlePreset = useCallback((value: number) => {
    setSalary(value);
    setInputValue(value.toLocaleString("en-US"));
  }, []);

  return (
    <section
      ref={sectionRef}
      id="calculator"
      aria-label="Salary comparison calculator"
      className="reveal py-20 sm:py-32"
    >
      <p className="section-kicker mb-3 text-center">Make It Personal</p>
      <h2 className="section-title mb-3 text-center">How long to earn yours?</h2>
      <p className="section-lead mx-auto mb-10 max-w-xl text-center text-sm sm:text-base">
        Enter your annual salary. See how quickly their passive income matches
        what you work all year for.
      </p>

      <div className="mx-auto max-w-lg">
        {/* Input area */}
        <div className="glass-panel rounded-3xl p-6">
          <label
            htmlFor="salary-input"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400"
          >
            Your annual salary
          </label>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-zinc-400">
              $
            </span>
            <input
              id="salary-input"
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-zinc-200 bg-white py-4 pl-9 pr-4 font-mono text-2xl font-bold tabular-nums text-zinc-900 shadow-sm outline-none transition-shadow focus:border-blue-300 focus:ring-2 focus:ring-blue-100 sm:text-3xl"
              placeholder="59,384"
              aria-describedby="salary-description"
            />
          </div>

          <p id="salary-description" className="sr-only">
            Enter your annual salary in US dollars to see comparisons
          </p>

          {/* Presets */}
          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePreset(preset.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  salary === preset.value
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
                }`}
              >
                {preset.label}
                <span className="ml-1 text-[10px] text-zinc-400">
                  {preset.note}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {salary > 0 && perSecond > 0 && (
          <div className="mt-6 space-y-4">
            {/* Main stat: time to earn your salary */}
            <div className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                They passively earn your salary in
              </p>
              <p className="mt-3 font-mono text-4xl font-bold tabular-nums text-blue-900 sm:text-5xl">
                {stats.timeToEarnLabel}
              </p>
              <p className="mt-2 text-sm text-blue-600/60">
                What takes you a year of work
              </p>
            </div>

            {/* Secondary stats grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-100 bg-white p-5 text-center shadow-sm">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Years of your salary
                </p>
                <p
                  ref={yearsRef}
                  className="mt-2 font-mono text-2xl font-bold tabular-nums text-zinc-900 sm:text-3xl"
                >
                  {yearsDisplay}
                </p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  earned per year passively
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-100 bg-white p-5 text-center shadow-sm">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Daily earning multiple
                </p>
                <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-zinc-900 sm:text-3xl">
                  {formatNumber(stats.dailyMultiple)}&times;
                </p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  your daily pay
                </p>
              </div>
            </div>

            {/* Narrative sentence */}
            <div className="rounded-2xl bg-zinc-50 px-5 py-4 text-center">
              <p className="font-editorial text-sm italic leading-relaxed text-zinc-600">
                In the time it takes you to earn{" "}
                <span className="font-semibold text-zinc-800">
                  {formatCurrency(salary)}
                </span>
                , these 10 people passively accumulate{" "}
                <span className="font-semibold text-zinc-800">
                  {formatCurrency(
                    Math.round(
                      perSecond *
                        365 *
                        24 *
                        3600
                    )
                  )}
                </span>
                . That&rsquo;s{" "}
                <span className="font-semibold text-blue-700">
                  {formatNumber(stats.yearsOfSalary)} years
                </span>{" "}
                of your work — every single year, without lifting a finger.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
