"use client";

import { useEffect, useState, useRef } from "react";

interface ComparisonTimerProps {
  /** Duration of one earning cycle in seconds */
  cycleSeconds: number;
  /** Label shown inside the ring */
  label: string;
  /** Size in pixels (default 80) */
  size?: number;
}

/**
 * SVG circular timer that fills over cycleSeconds, then resets.
 * Shows a countdown inside and a visual ring progress.
 */
export default function ComparisonTimer({
  cycleSeconds,
  label,
  size = 80,
}: ComparisonTimerProps) {
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(cycleSeconds);
  const startRef = useRef(Date.now());
  const rafRef = useRef(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const cycleMs = cycleSeconds * 1000;
    startRef.current = Date.now();

    function tick() {
      if (reducedMotionRef.current) {
        setProgress(1);
        setCountdown(0);
        return;
      }

      const elapsed = (Date.now() - startRef.current) % cycleMs;
      const p = Math.min(1, elapsed / cycleMs);
      setProgress(p);
      setCountdown(Math.max(0, cycleSeconds - elapsed / 1000));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cycleSeconds]);

  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const formattedCountdown =
    countdown >= 60
      ? `${Math.floor(countdown / 60)}:${String(Math.floor(countdown % 60)).padStart(2, "0")}`
      : countdown >= 10
        ? `${Math.floor(countdown)}s`
        : `${countdown.toFixed(1)}s`;

  return (
    <div
      className="relative inline-flex flex-col items-center"
      role="timer"
      aria-label={`${label}: resets every ${cycleSeconds} seconds`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="comparison-timer -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-100"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="timer-ring"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: dashOffset,
            transition: progress < 0.02 ? "none" : undefined,
          }}
        />
      </svg>
      {/* Countdown text centered */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="font-mono text-xs font-semibold tabular-nums text-blue-700">
          {formattedCountdown}
        </span>
      </div>
    </div>
  );
}
