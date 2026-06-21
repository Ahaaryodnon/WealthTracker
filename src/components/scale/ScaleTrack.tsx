"use client";

import type { Landmark } from "@/lib/scale/scale-landmarks";
import { dollarsToX } from "@/lib/scale/scale-math";
import { useLocale } from "@/contexts/LocaleContext";
import { formatCompact } from "@/lib/format-currency";

export interface ScaleTrackProps {
  landmarks: Landmark[];
  cameraDollars: number;
  pxPerDollar: number;
  viewportWidth: number;
}

const CATEGORY_COLOR: Record<Landmark["category"], string> = {
  amount: "text-accent",
  everyday: "text-emerald-600",
  billionaire: "text-amber-600",
  world: "text-zinc-500",
};

const RENDER_MARGIN = 200;

/** The visible window of the linear axis. Only landmarks near the camera are drawn. */
export default function ScaleTrack({ landmarks, cameraDollars, pxPerDollar, viewportWidth }: ScaleTrackProps) {
  const { locale } = useLocale();
  const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };
  const centerX = viewportWidth / 2;

  const visible = landmarks.filter((l) => {
    const x = dollarsToX(l.dollars - cameraDollars, pxPerDollar) + centerX;
    return x >= -RENDER_MARGIN && x <= viewportWidth + RENDER_MARGIN;
  });

  return (
    <div className="relative h-64 w-full overflow-hidden border-y border-zinc-200 bg-gradient-to-b from-zinc-50 to-white">
      {/* center baseline */}
      <div className="absolute left-0 top-1/2 h-px w-full bg-zinc-200" aria-hidden="true" />

      {visible.map((l) => {
        const x = dollarsToX(l.dollars - cameraDollars, pxPerDollar) + centerX;
        const isAmount = l.category === "amount";
        return (
          <div
            key={l.id}
            className="absolute top-0 flex h-full flex-col items-center"
            style={{ left: `${x}px`, transform: "translateX(-50%)" }}
          >
            <div className={`mt-6 max-w-[160px] text-center ${isAmount ? "font-semibold" : ""}`}>
              <p className={`text-sm ${CATEGORY_COLOR[l.category]}`}>{l.label}</p>
              <p className="numeric text-xs text-zinc-500">{formatCompact(l.dollars, formatOpts)}</p>
            </div>
            <div className={`mt-auto mb-0 h-1/2 w-px ${isAmount ? "bg-accent" : "bg-zinc-300"}`} />
          </div>
        );
      })}
    </div>
  );
}
