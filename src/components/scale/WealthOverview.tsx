"use client";

import type { Landmark } from "@/lib/scale/scale-landmark-types";
import { dollarsToSliderFraction, sliderFractionToDollars } from "@/lib/scale/scale-math";
import { useLocale } from "@/contexts/LocaleContext";
import { formatCompact } from "@/lib/format-currency";

export interface WealthOverviewProps {
  bars: Landmark[];
  posDollars: number;
  maxDollars: number;
  onSeek: (dollars: number) => void;
}

/** Compact log-scaled overview of all bar-ends + a position marker; click/drag to seek. */
export default function WealthOverview({ bars, posDollars, maxDollars, onSeek }: WealthOverviewProps) {
  const pct = (d: number) => `${Math.min(100, Math.max(0, dollarsToSliderFraction(d, maxDollars) * 100))}%`;
  const seek = (clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const frac = (clientX - rect.left) / rect.width;
    onSeek(sliderFractionToDollars(frac, maxDollars));
  };
  const { locale } = useLocale();
  const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const frac = dollarsToSliderFraction(posDollars, maxDollars);
    const step = 0.02;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onSeek(sliderFractionToDollars(Math.min(1, frac + step), maxDollars));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onSeek(sliderFractionToDollars(Math.max(0, frac - step), maxDollars));
    } else if (e.key === "Home") {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSeek(maxDollars);
    }
  };
  return (
    <div
      className="relative h-6 w-full cursor-pointer rounded-full bg-zinc-100"
      role="slider"
      aria-label="Overview — seek position"
      aria-valuemin={0}
      aria-valuemax={Math.round(maxDollars)}
      aria-valuenow={Math.round(posDollars)}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-valuetext={formatCompact(Math.round(posDollars), formatOpts)}
      onClick={(e) => seek(e.clientX, e.currentTarget)}
    >
      {bars.map((l) => (
        <span key={l.id} className="absolute top-1.5 h-3 w-px bg-zinc-400" style={{ left: pct(l.dollars) }} aria-hidden="true" />
      ))}
      <span
        className="absolute top-0 h-6 w-[3px] -translate-x-1/2 rounded bg-accent shadow"
        style={{ left: pct(posDollars) }}
        aria-hidden="true"
      />
    </div>
  );
}
