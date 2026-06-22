"use client";

import type { Landmark } from "@/lib/scale/scale-landmark-types";
import { barStateAt, terminusX } from "@/lib/scale/scale-scroll";
import { useLocale } from "@/contexts/LocaleContext";
import { formatCompact } from "@/lib/format-currency";

export interface WealthBarsProps {
  bars: Landmark[];
  posDollars: number;
  viewportDollars: number;
  pxPerDollar: number;
}

const BAR_BG: Record<Landmark["category"], string> = {
  amount: "bg-accent",
  everyday: "bg-emerald-500",
  billionaire: "bg-amber-500",
  wealth: "bg-rose-500",
  publicgood: "bg-cyan-600",
  world: "bg-zinc-400",
};
const END_TEXT: Record<Landmark["category"], string> = {
  amount: "text-accent",
  everyday: "text-emerald-700",
  billionaire: "text-amber-700",
  wealth: "text-rose-700",
  publicgood: "text-cyan-700",
  world: "text-zinc-600",
};

/**
 * Rows of bars from $0. Biggest fortune on top. Each row shows one of three
 * states at the current travel position: running (fills the row, label pinned
 * right), ending (bar stops mid-row with its end-label), ended (faint stub left).
 */
export default function WealthBars({ bars, posDollars, viewportDollars, pxPerDollar }: WealthBarsProps) {
  const { locale } = useLocale();
  const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };
  const rows = [...bars].sort((a, b) => b.dollars - a.dollars);

  return (
    <div className="flex flex-col gap-1">
      {rows.map((l) => {
        const state = barStateAt(l.dollars, posDollars, viewportDollars);
        const endX = Math.max(0, terminusX(l.dollars, posDollars, pxPerDollar));
        return (
          <div
            key={l.id}
            data-testid="wealth-bar"
            data-state={state}
            className="relative h-9 w-full overflow-hidden rounded-sm bg-zinc-50"
          >
            {state === "running" && (
              <>
                <div className={`absolute inset-0 ${BAR_BG[l.category]} opacity-80`} />
                <div className="absolute inset-y-0 right-3 flex items-center gap-2 text-xs" title={l.source}>
                  <span className="font-medium text-white">{l.label}</span>
                  <span className="numeric text-white/85">{formatCompact(l.dollars, formatOpts)} &rarr;</span>
                </div>
              </>
            )}
            {state === "ending" && (
              <>
                <div className={`absolute inset-y-0 left-0 ${BAR_BG[l.category]} opacity-80`} style={{ width: `${endX}px` }} />
                <div
                  className="absolute inset-y-0 flex items-center gap-2 whitespace-nowrap pl-2 text-xs"
                  style={{ left: `${endX}px` }}
                  title={l.source}
                >
                  <span className={`font-medium ${END_TEXT[l.category]}`}>{l.label}</span>
                  <span className="numeric text-zinc-500">{formatCompact(l.dollars, formatOpts)}</span>
                </div>
              </>
            )}
            {state === "ended" && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-zinc-300" title={l.source}>
                <span className="truncate">
                  {l.label} &middot; ended {formatCompact(l.dollars, formatOpts)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
