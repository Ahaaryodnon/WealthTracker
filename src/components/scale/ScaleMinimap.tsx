"use client";

import type { Landmark } from "@/lib/scale/scale-landmarks";

export interface ScaleMinimapProps {
  landmarks: Landmark[];
  cameraDollars: number;
  trackEnd: number;
}

/**
 * Full $0 → trackEnd overview, drawn on a LINEAR scale so the honesty lands:
 * the million and billion flags cram almost exactly onto $0 next to a trillion.
 */
export default function ScaleMinimap({ landmarks, cameraDollars, trackEnd }: ScaleMinimapProps) {
  const pct = (d: number) => `${Math.min(100, Math.max(0, (d / trackEnd) * 100))}%`;
  const amounts = landmarks.filter((l) => l.category === "amount");

  return (
    <div className="w-full">
      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-400">
        Full scale ($0 → {Math.round(trackEnd / 1_000_000_000_000)}T+) — linear
      </p>
      <div className="relative h-8 w-full rounded-full bg-zinc-100" aria-hidden="true">
        {amounts.map((l) => (
          <span
            key={l.id}
            className="absolute top-0 h-8 w-px bg-accent/60"
            style={{ left: pct(l.dollars) }}
          />
        ))}
        {/* Camera position marker */}
        <span
          className="absolute top-[-2px] h-[36px] w-[3px] rounded-full bg-accent shadow"
          style={{ left: pct(cameraDollars) }}
        />
      </div>
      <p className="mt-1 text-[11px] text-zinc-500">
        The $1M and $1B marks sit almost on top of $0 — that gap is the whole point.
      </p>
    </div>
  );
}
