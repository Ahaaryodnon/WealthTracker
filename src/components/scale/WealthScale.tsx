"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BillionaireEntry } from "@/data/billionaires.types";
import { useLocale } from "@/contexts/LocaleContext";
import { assembleLandmarks } from "@/lib/scale/scale-landmarks";
import { PX_PER_DOLLAR, partitionLandmarks, nextBarEnd } from "@/lib/scale/scale-scroll";
import { formatCurrency } from "@/lib/format-currency";
import { ukBillionaires } from "@/data/uk-billionaires";
import WealthBars from "@/components/scale/WealthBars";
import WealthOverview from "@/components/scale/WealthOverview";
import WealthControls, { type WealthSpeed } from "@/components/scale/WealthControls";

export interface WealthScaleProps {
  entries: BillionaireEntry[];
}

const BASE_DOLLARS_PER_SEC = 300_000;
const SPEED_MULT: Record<WealthSpeed, number> = { play: 1, fast: 40, warp: 2000 };

export default function WealthScale({ entries }: WealthScaleProps) {
  const { locale } = useLocale();
  const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };
  const maxDollars = locale.scaleScrollMaxDollars;

  const billionaireEntries = locale.id === "en-GB" ? ukBillionaires : entries;
  const { bars, beyond } = useMemo(() => {
    const all = assembleLandmarks({
      entries: billionaireEntries,
      comparisons: locale.comparisons,
      scaleLandmarks: locale.scaleLandmarks,
      topBillionaires: locale.scaleTopBillionaires,
    });
    return partitionLandmarks(all, maxDollars);
  }, [billionaireEntries, locale, maxDollars]);

  const [posDollars, setPosDollars] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<WealthSpeed>("play");
  const [viewportWidth, setViewportWidth] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const speedRef = useRef<WealthSpeed>("play");
  const dragRef = useRef<{ x: number } | null>(null);

  // Mirror state into refs in an effect (not during render) for the rAF loop.
  useEffect(() => {
    posRef.current = posDollars;
    speedRef.current = speed;
  });

  const viewportDollars = viewportWidth > 0 ? viewportWidth / PX_PER_DOLLAR : 0;
  const clamp = (d: number) => Math.min(maxDollars, Math.max(0, d));
  const seek = (d: number) => {
    setIsPlaying(false);
    setPosDollars(clamp(d));
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewportWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Restart the journey when the locale (and its bar set / ceiling) changes.
  useEffect(() => {
    setPosDollars(0);
    setIsPlaying(false);
  }, [locale.id]);

  useEffect(() => {
    if (!isPlaying || reducedMotion) return;
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      const next = posRef.current + BASE_DOLLARS_PER_SEC * SPEED_MULT[speedRef.current] * dt;
      if (next >= maxDollars) {
        setPosDollars(maxDollars);
        setIsPlaying(false);
        return;
      }
      setPosDollars(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [isPlaying, reducedMotion, maxDollars]);

  // Wheel must be a NON-PASSIVE native listener so preventDefault works (React's
  // onWheel can be passive, which would let the page scroll instead of the bars).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      setIsPlaying(false);
      setPosDollars((p) => Math.min(maxDollars, Math.max(0, p + (e.deltaX + e.deltaY) / PX_PER_DOLLAR)));
    };
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", onWheelNative);
  }, [maxDollars]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    dragRef.current.x = e.clientX;
    setIsPlaying(false);
    setPosDollars((p) => clamp(p - dx / PX_PER_DOLLAR));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };
  const jumpNextBarEnd = () => {
    const n = nextBarEnd(bars, posDollars);
    if (n != null) seek(n);
  };

  return (
    <section
      aria-label="Wealth to scale"
      className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-10"
    >
      <header className="text-center">
        <p className="section-kicker mb-2">Scale</p>
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Wealth, to scale</h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600">
          Every amount is a bar starting at zero. Travel right and watch the bars end —
          a salary stops almost at once; a billionaire&apos;s keeps going, and going.
        </p>
      </header>

      <div
        className="numeric text-center text-2xl font-semibold text-accent sm:text-3xl"
        role="status"
        aria-label="Current position"
      >
        {formatCurrency(Math.round(posDollars), formatOpts)}
      </div>

      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="w-full cursor-ew-resize touch-none select-none rounded-lg border border-zinc-200 bg-white p-2"
      >
        <WealthBars
          bars={bars}
          posDollars={posDollars}
          viewportDollars={viewportDollars}
          pxPerDollar={PX_PER_DOLLAR}
        />
      </div>

      <WealthOverview bars={bars} posDollars={posDollars} maxDollars={maxDollars} onSeek={seek} />

      <WealthControls
        isPlaying={isPlaying}
        speed={speed}
        beyond={beyond}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onSetSpeed={setSpeed}
        onSkipTo={seek}
        onNextBarEnd={jumpNextBarEnd}
        onJumpTo={seek}
      />

      {reducedMotion && (
        <p className="text-center text-xs text-zinc-500">
          Auto-travel is off (reduced motion). Scroll, drag, the overview, or the jump buttons still work.
        </p>
      )}
    </section>
  );
}
