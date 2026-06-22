/**
 * Pure helpers for the bars-from-zero "1 pixel wealth" scale. No DOM, no React.
 * Every value is a bar from $0; the viewport is a window [pos, pos+viewportDollars]
 * in dollar space at a fixed pixels-per-dollar zoom.
 */
import type { Landmark } from "@/lib/scale/scale-landmark-types";
import { dollarsToX } from "@/lib/scale/scale-math";

export const PX_PER_DOLLAR = 1e-4; // 1px = $10,000 (tunable)

export type BarState = "ended" | "ending" | "running";

/** Split into scrollable bars (value <= ceiling) and "& beyond" markers (value > ceiling). */
export function partitionLandmarks(
  landmarks: Landmark[],
  ceilingDollars: number,
): { bars: Landmark[]; beyond: Landmark[] } {
  const bars: Landmark[] = [];
  const beyond: Landmark[] = [];
  for (const l of landmarks) {
    if (l.dollars <= ceilingDollars) bars.push(l);
    else beyond.push(l);
  }
  return { bars, beyond };
}

/** Where a bar's end sits relative to the viewport window [pos, pos+viewportDollars]. */
export function barStateAt(
  valueDollars: number,
  posDollars: number,
  viewportDollars: number,
): BarState {
  if (valueDollars < posDollars) return "ended";
  if (valueDollars > posDollars + viewportDollars) return "running";
  return "ending";
}

/** On-screen x (px) of a bar's terminus given the current travel position. */
export function terminusX(valueDollars: number, posDollars: number, pxPerDollar: number): number {
  return dollarsToX(valueDollars - posDollars, pxPerDollar);
}

/** Smallest landmark value strictly greater than pos (for "jump to next bar-end"); null if none. */
export function nextBarEnd(landmarks: Landmark[], posDollars: number): number | null {
  let best: number | null = null;
  for (const l of landmarks) {
    if (l.dollars > posDollars && (best === null || l.dollars < best)) best = l.dollars;
  }
  return best;
}
