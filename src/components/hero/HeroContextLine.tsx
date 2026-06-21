"use client";

import { useState, useEffect, useRef } from "react";

interface HeroContextLineProps {
  facts: string[];
  /** Seconds between rotations (default 5) */
  intervalSeconds?: number;
}

/**
 * Cycles through an array of contextual facts with a fade transition.
 * Shown below the accumulator in the hero.
 */
export default function HeroContextLine({
  facts,
  intervalSeconds = 5,
}: HeroContextLineProps) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (facts.length <= 1) return;

    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % facts.length);
        setFading(false);
      }, 400); // fade out duration
    }, intervalSeconds * 1000);

    return () => clearInterval(timerRef.current);
  }, [facts.length, intervalSeconds]);

  return (
    <p
      className={`mt-6 inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/40 px-5 py-3 text-sm text-slate-300 backdrop-blur-sm transition-opacity duration-400 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="live-dot" aria-hidden="true" />
      {facts[index]}
    </p>
  );
}
