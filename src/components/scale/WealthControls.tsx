"use client";

import type { Landmark } from "@/lib/scale/scale-landmark-types";
import { MILLION, BILLION } from "@/lib/scale/scale-math";
import { formatCompact } from "@/lib/format-currency";
import { useLocale } from "@/contexts/LocaleContext";

export type WealthSpeed = "play" | "fast" | "warp";

export interface WealthControlsProps {
  isPlaying: boolean;
  speed: WealthSpeed;
  beyond: Landmark[];
  onTogglePlay: () => void;
  onSetSpeed: (s: WealthSpeed) => void;
  onSkipTo: (dollars: number) => void;
  onNextBarEnd: () => void;
  onJumpTo: (dollars: number) => void;
}

const SPEEDS: { id: WealthSpeed; label: string }[] = [
  { id: "play", label: "1×" },
  { id: "fast", label: "Fast" },
  { id: "warp", label: "Warp" },
];

const pill =
  "inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export default function WealthControls({
  isPlaying,
  speed,
  beyond,
  onTogglePlay,
  onSetSpeed,
  onSkipTo,
  onNextBarEnd,
  onJumpTo,
}: WealthControlsProps) {
  const { locale } = useLocale();
  const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-pressed={isPlaying}
          className="inline-flex h-11 min-w-[96px] items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-white shadow-md transition-colors hover:bg-accent-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <div className="inline-flex overflow-hidden rounded-full border border-zinc-200" role="group" aria-label="Travel speed">
          {SPEEDS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSetSpeed(s.id)}
              aria-pressed={speed === s.id}
              className={`h-11 px-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                speed === s.id ? "bg-accent text-white" : "bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={pill} onClick={onNextBarEnd}>Next bar end</button>
        <button type="button" className={pill} onClick={() => onSkipTo(MILLION)}>Skip to $1M</button>
        <button type="button" className={pill} onClick={() => onSkipTo(BILLION)}>Skip to $1B</button>
        {beyond.map((l) => (
          <button key={l.id} type="button" className={pill} onClick={() => onJumpTo(l.dollars)}>
            {l.label} ({formatCompact(l.dollars, formatOpts)}) &rarr;
          </button>
        ))}
      </div>
    </div>
  );
}
