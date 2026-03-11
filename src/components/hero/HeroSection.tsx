import Accumulator from "./Accumulator";
import HeroContextLine from "./HeroContextLine";
import EarningsParticles from "./EarningsParticles";
import { useLocale } from "@/contexts/LocaleContext";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";
import { formatDataAsOf } from "@/lib/format-date";
import { formatCompact } from "@/lib/format-currency";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import type { BillionaireEntry } from "@/data/billionaires.types";

interface HeroSectionProps {
  entries: BillionaireEntry[];
  dataAsOf: string;
  returnRate?: number;
  onSessionUpdate?: (
    sinceArrived: number,
    elapsedSeconds: number,
    ytdTotal?: number,
    mainTotal?: number
  ) => void;
}

export default function HeroSection({
  entries,
  dataAsOf,
  returnRate = DEFAULT_RETURN_RATE,
  onSessionUpdate,
}: HeroSectionProps) {
  const { locale } = useLocale();
  const perSecond = combinedPassiveIncomePerSecond(entries, returnRate);
  const medianItem = locale.comparisons.find((c) => c.id === "medianSalary");
  const teacherItem = locale.comparisons.find((c) => c.id === "teacherSalary");
  const medianSalary = medianItem?.value ?? 0;

  const facts: string[] = [];
  if (perSecond > 0 && medianSalary > 0 && medianItem) {
    const secsForSalary = medianSalary / perSecond;
    if (secsForSalary < 60) {
      facts.push(
        `A ${medianItem.label.toLowerCase()} — earned every ${Math.round(secsForSalary)} seconds.`
      );
    } else {
      facts.push(
        `A ${medianItem.label.toLowerCase()} — earned every ${(secsForSalary / 60).toFixed(1)} minutes.`
      );
    }
  }
  if (perSecond > 0 && teacherItem) {
    const secsForTeacher = teacherItem.value / perSecond;
    facts.push(
      `A teacher's annual salary — every ${Math.round(secsForTeacher)} seconds.`
    );
  }
  if (perSecond > 0) {
    const perHourUsd = perSecond * 3600;
    const perHourLocal = perHourUsd * locale.exchangeRateFromUsd;
    const opts = { numberLocale: locale.numberLocale, currency: locale.currency };
    facts.push(
      `${formatCompact(perHourLocal, opts)} every hour. Without lifting a finger.`
    );
  }

  return (
    <section
      id="hero"
      aria-label="Wealth Accumulator"
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center sm:px-8"
    >
      {/* Dark cinematic background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.08),transparent_50%)]" />
      </div>

      {/* Ambient earnings particles */}
      <EarningsParticles count={18} />

      {/* Kicker */}
      <p className="mb-6 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
        Right now, while you read this
      </p>

      {/* Headline */}
      <h1 className="font-editorial mx-auto max-w-2xl text-4xl leading-[0.95] text-white sm:text-6xl lg:text-7xl">
        Wealth compounds{" "}
        <span className="text-gradient-hero">on a different scale.</span>
      </h1>

      <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
        Watch how quickly the world&apos;s ten richest fortunes generate income
        — then compare that pace with everyday life.
      </p>

      {/* Main accumulator — the dominant element */}
      <div className="mt-10 w-full">
        <Accumulator
          entries={entries}
          dataAsOf={dataAsOf}
          returnRate={returnRate}
          onSessionUpdate={onSessionUpdate}
        />
      </div>

      {/* Rotating contextual fact */}
      {facts.length > 0 && <HeroContextLine facts={facts} />}

      {/* Source line */}
      <p className="mt-8 text-xs text-slate-500">
        Data as of {formatDataAsOf(dataAsOf, locale.dateLocale) || "—"} &middot;{" "}
        {Math.round(returnRate * 100)}% annual return assumption &middot;
        Forbes Real-Time Billionaires &middot;{" "}
        <a
          href="#methodology"
          className="rounded underline decoration-slate-600 underline-offset-4 transition-colors hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Methodology
        </a>
      </p>

      {/* Scroll hint */}
      <div className="mt-12 flex flex-col items-center gap-2" aria-hidden="true">
        <span className="text-xs tracking-wide text-slate-500">
          Scroll to understand the scale
        </span>
        <div className="h-8 w-px bg-gradient-to-b from-slate-500 to-transparent" />
      </div>
    </section>
  );
}
