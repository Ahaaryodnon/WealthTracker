"use client";

import { useEffect, useState, useRef } from "react";

interface ComparisonCycleBarProps {
  /** Duration of one "earned" cycle in seconds (e.g. 15 for "earned every 15 seconds"). */
  cycleSeconds: number;
}

/**
 * Animated bar that fills from 0% to 100% over cycleSeconds, then resets.
 * Gives a visible sense of "earning" one comparison unit over that interval.
 */
export default function ComparisonCycleBar({ cycleSeconds }: ComparisonCycleBarProps) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const cycleMs = cycleSeconds * 1000;
    startRef.current = Date.now();

    const tick = () => {
      const elapsed = (Date.now() - startRef.current) % cycleMs;
      const next = Math.min(1, elapsed / cycleMs);
      setProgress(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cycleSeconds]);

  return (
    <div
      className="mb-2 flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progress toward next amount earned"
    >
      <div
        className="shrink-0 rounded-full shadow-[0_0_24px_rgba(59,130,246,0.28)]"
        style={{
          width: `${progress * 100}%`,
          minWidth: progress > 0 ? 4 : 0,
          background: "linear-gradient(90deg, #1e40af, #60a5fa 75%, #f59e0b)",
        }}
      />
    </div>
  );
}
