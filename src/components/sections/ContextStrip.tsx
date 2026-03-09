"use client";

import type { BillionaireEntry } from "@/data/billionaires.types";
import { useLocale } from "@/contexts/LocaleContext";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";
import { formatCurrency, type FormatLocaleOptions } from "@/lib/format-currency";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useCountUp } from "@/lib/useCountUp";

interface ContextStripProps {
  entries: BillionaireEntry[];
  /** Year-to-date cumulative total (from Accumulator tick). */
  ytdTotal?: number;
  returnRate?: number;
}

/** Individual rate card with count-up animation */
function RateCard({
  rawValue,
  unit,
  context,
  index,
  formatOpts,
}: {
  rawValue: number;
  unit: string;
  context: string;
  index: number;
  formatOpts: FormatLocaleOptions;
}) {
  const targetDisplay = formatCurrency(Math.round(rawValue), formatOpts);
  const isLongValue = targetDisplay.length >= 11;
  const [ref, display] = useCountUp<HTMLParagraphElement>({
    end: rawValue,
    duration: 1400,
    formatter: (v) => formatCurrency(Math.round(v), formatOpts),
  });

  return (
    <div
      className="glass-panel-subtle card-lift flex h-full flex-col items-center cursor-default rounded-3xl p-6 text-center"
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <p
        ref={ref}
        className={`numeric inline-flex items-center justify-center whitespace-nowrap font-bold leading-none text-zinc-900 ${
          isLongValue
            ? "text-[clamp(1.45rem,2.4vw,1.9rem)] tracking-[-0.05em]"
            : "text-[clamp(1.7rem,4vw,2.25rem)] tracking-tight"
        }`}
      >
        {display}
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
        {unit}
      </p>
      <p className="font-editorial mt-4 text-sm italic leading-relaxed text-zinc-500">
        {context}
      </p>
    </div>
  );
}

export default function ContextStrip({
  entries,
  ytdTotal = 0,
  returnRate = DEFAULT_RETURN_RATE,
}: ContextStripProps) {
  const { locale } = useLocale();
  const sectionRef = useScrollReveal<HTMLElement>();
  const perSecondUsd = combinedPassiveIncomePerSecond(entries, returnRate);
  const rate = locale.exchangeRateFromUsd;
  const perSecond = Math.round(perSecondUsd * rate);
  const perMinute = Math.round(perSecondUsd * 60 * rate);
  const perHour = Math.round(perSecondUsd * 3600 * rate);
  const formatOpts = {
    numberLocale: locale.numberLocale,
    currency: locale.currency,
  };
  const ytdLocal = Math.round(ytdTotal * rate);

  const cards = [
    {
      rawValue: perSecond,
      unit: "every second",
      context: "More than a minimum-wage worker earns in a week.",
    },
    {
      rawValue: perMinute,
      unit: "every minute",
      context: "A year of median salary. Gone in 60 seconds.",
    },
    {
      rawValue: perHour,
      unit: "every hour",
      context: "More than most surgeons earn in a decade.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="scale"
      aria-label="Earning rate breakdown"
      className="reveal py-20 sm:py-32"
    >
      {ytdLocal > 0 && (
        <div
          role="region"
          aria-label="Year-to-date cumulative total"
          className="mb-12 text-center"
        >
          <p className="section-kicker mb-3">So far this year</p>
          <div className="glass-panel mx-auto max-w-lg rounded-3xl px-6 py-5">
            <p
              className="numeric text-2xl font-bold text-zinc-900 sm:text-3xl"
              role="status"
            >
              {formatCurrency(ytdLocal, formatOpts)}
            </p>
          </div>
        </div>
      )}

      <p className="section-kicker mb-3 text-center">Scale</p>
      <h2 className="section-title mb-3 text-center">How fast is that?</h2>
      <p className="section-lead mx-auto mb-12 max-w-xl text-center text-sm leading-relaxed sm:text-base">
        Their wealth isn&apos;t just large. It moves at a speed that breaks normal
        intuitions about time, work, and value.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {cards.map((card, i) => (
          <RateCard
            key={card.unit}
            rawValue={card.rawValue}
            unit={card.unit}
            context={card.context}
            index={i}
            formatOpts={formatOpts}
          />
        ))}
      </div>
    </section>
  );
}
