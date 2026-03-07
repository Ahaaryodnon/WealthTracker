"use client";

import { useRef, useState, useEffect } from "react";
import type { BillionaireEntry } from "@/data/billionaires.types";
import {
  combinedPassiveIncomePerSecond,
  accumulatedFromRate,
  getYtdElapsedSeconds,
} from "@/lib/passive-income-calc";
import { formatCurrency } from "@/lib/format-currency";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";

export interface AccumulatorProps {
  entries: BillionaireEntry[];
  dataAsOf: string;
  medianSalary: number;
  returnRate?: number;
  onSessionUpdate?: (
    sinceArrived: number,
    elapsedSeconds: number,
    ytdTotal?: number
  ) => void;
}

/** Elapsed seconds from dataAsOf (interpreted as UTC midnight) to now. */
function elapsedSecondsFrom(dateIso: string): number {
  const ref = new Date(dateIso + "T00:00:00Z").getTime();
  return Math.max(0, (Date.now() - ref) / 1000);
}

const TICK_MS = 1000 / 60;
const REDUCED_MOTION_TICK_MS = 2000;
const COUNT_UP_DURATION_MS = 1500;

export default function Accumulator({
  entries,
  dataAsOf,
  medianSalary: _medianSalary,
  returnRate = DEFAULT_RETURN_RATE,
  onSessionUpdate,
}: AccumulatorProps) {
  const rate = combinedPassiveIncomePerSecond(entries, returnRate);

  const [mainTotal, setMainTotal] = useState(0);
  const [sinceArrived, setSinceArrived] = useState(0);

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const sessionStartRef = useRef(0);
  const visibleRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const countUpStartRef = useRef(0);
  const onSessionUpdateRef = useRef(onSessionUpdate);

  useEffect(() => {
    onSessionUpdateRef.current = onSessionUpdate;
  }, [onSessionUpdate]);

  useEffect(() => {
    sessionStartRef.current = Date.now();
    countUpStartRef.current = Date.now();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    if (mq.matches) countUpStartRef.current = 0;
    const handleChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    function handleVisibility() {
      visibleRef.current = document.visibilityState === "visible";
      if (visibleRef.current) {
        lastTickRef.current = 0;
        loop();
      } else if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    function loop() {
      if (!visibleRef.current) return;
      const now = Date.now();
      const interval = reducedMotionRef.current
        ? REDUCED_MOTION_TICK_MS
        : TICK_MS;

      if (now - lastTickRef.current < interval) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      lastTickRef.current = now;

      const fromDataAsOf = elapsedSecondsFrom(dataAsOf);
      const fromSession = (now - sessionStartRef.current) / 1000;
      const realTotal = accumulatedFromRate(rate, fromDataAsOf);

      // Count-up animation on first render
      if (countUpStartRef.current > 0) {
        const elapsed = now - countUpStartRef.current;
        if (elapsed < COUNT_UP_DURATION_MS && !reducedMotionRef.current) {
          const progress = elapsed / COUNT_UP_DURATION_MS;
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setMainTotal(realTotal * eased);
          const sessionVal = accumulatedFromRate(rate, fromSession);
          setSinceArrived(sessionVal * eased);
          rafRef.current = requestAnimationFrame(loop);
          return;
        }
        countUpStartRef.current = 0;
      }

      setMainTotal(realTotal);
      const sessionVal = accumulatedFromRate(rate, fromSession);
      setSinceArrived(sessionVal);
      const ytdTotal = accumulatedFromRate(rate, getYtdElapsedSeconds());

      // Notify parent of session updates
      onSessionUpdateRef.current?.(sessionVal, fromSession, ytdTotal);

      rafRef.current = requestAnimationFrame(loop);
    }

    document.addEventListener("visibilitychange", handleVisibility);
    visibleRef.current = document.visibilityState === "visible";
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [dataAsOf, rate]);

  return (
    <div className="flex flex-col items-center">
      {/* Main Accumulator — the one dominant number */}
      <div className="mb-3" aria-live="polite" aria-atomic="true">
        <span
          className="font-mono text-6xl font-bold tracking-tight text-zinc-900 tabular-nums sm:text-8xl"
          role="status"
          aria-label="Combined passive income since data date"
        >
          {formatCurrency(mainTotal)}
        </span>
      </div>

      <p className="mb-6 text-sm text-zinc-500 sm:text-base">
        earned by the world&rsquo;s 10 richest people — without working
      </p>

      {/* "Since you arrived" badge */}
      <div
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="text-sm text-zinc-500">Since you arrived</span>
        <span
          className="font-mono text-lg font-semibold text-zinc-900 tabular-nums sm:text-xl"
          role="status"
          aria-label="Passive income accumulated since you opened this page"
        >
          {formatCurrency(sinceArrived)}
        </span>
      </div>
    </div>
  );
}
