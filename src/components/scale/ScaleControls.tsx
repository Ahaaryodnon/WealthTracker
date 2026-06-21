"use client";

import { MILLION, BILLION, TRILLION, dollarsToSliderFraction, sliderFractionToDollars } from "@/lib/scale/scale-math";

export type ScaleSpeed = "play" | "fast" | "warp";

export interface ScaleControlsProps {
  isPlaying: boolean;
  speed: ScaleSpeed;
  cameraDollars: number;
  trackEnd: number;
  onTogglePlay: () => void;
  onSetSpeed: (s: ScaleSpeed) => void;
  onSkipTo: (dollars: number) => void;
  onScrub: (dollars: number) => void;
}

const SPEEDS: { id: ScaleSpeed; label: string }[] = [
  { id: "play", label: "1×" },
  { id: "fast", label: "Fast" },
  { id: "warp", label: "Warp" },
];

const SKIPS: { label: string; dollars: number }[] = [
  { label: "Skip to $1M", dollars: MILLION },
  { label: "Skip to $1B", dollars: BILLION },
  { label: "Skip to $1T", dollars: TRILLION },
];

const SLIDER_STEPS = 1000;

/** Presentational playback controls. All state lives in the parent (ScaleJourney). */
export default function ScaleControls({
  isPlaying,
  speed,
  cameraDollars,
  trackEnd,
  onTogglePlay,
  onSetSpeed,
  onSkipTo,
  onScrub,
}: ScaleControlsProps) {
  const sliderValue = Math.round(dollarsToSliderFraction(cameraDollars, trackEnd) * SLIDER_STEPS);

  return (
    <div className="flex flex-col gap-4">
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
        {SKIPS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onSkipTo(s.dollars)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {s.label}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Jump anywhere (log scale)
        </span>
        <input
          type="range"
          min={0}
          max={SLIDER_STEPS}
          step={1}
          value={sliderValue}
          onChange={(e) => onScrub(sliderFractionToDollars(Number(e.target.value) / SLIDER_STEPS, trackEnd))}
          aria-label="Jump to position on the scale"
          className="w-full accent-accent"
        />
      </label>
    </div>
  );
}
