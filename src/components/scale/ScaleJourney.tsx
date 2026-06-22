"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BillionaireEntry } from "@/data/billionaires.types";
import { useLocale } from "@/contexts/LocaleContext";
import { assembleLandmarks, trackEndDollars } from "@/lib/scale/scale-landmarks";
import { MILLION } from "@/lib/scale/scale-math";
import { formatCurrency } from "@/lib/format-currency";
import { ukBillionaires } from "@/data/uk-billionaires";
import ScaleControls, { type ScaleSpeed } from "@/components/scale/ScaleControls";
import ScaleMinimap from "@/components/scale/ScaleMinimap";
import ScaleTrack from "@/components/scale/ScaleTrack";

export interface ScaleJourneyProps {
  entries: BillionaireEntry[];
}

const PX_PER_DOLLAR = 1.2e-3;
const BASE_PX_PER_SEC = 220;
const SPEED_MULT: Record<ScaleSpeed, number> = { play: 1, fast: 80, warp: 4000 };

export default function ScaleJourney({ entries }: ScaleJourneyProps) {
  const { locale } = useLocale();
  const formatOpts = { numberLocale: locale.numberLocale, currency: locale.currency };

  // UK uses the hand-maintained Rich List; every other locale uses the global dataset.
  const billionaireEntries = locale.id === "en-GB" ? ukBillionaires : entries;
  const landmarks = useMemo(
    () =>
      assembleLandmarks({
        entries: billionaireEntries,
        comparisons: locale.comparisons,
        scaleLandmarks: locale.scaleLandmarks,
        topBillionaires: locale.scaleTopBillionaires,
      }),
    [billionaireEntries, locale]
  );
  const trackEnd = useMemo(() => trackEndDollars(landmarks), [landmarks]);

  const [cameraDollars, setCameraDollars] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<ScaleSpeed>("play");
  const [viewportWidth, setViewportWidth] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  // Mutable mirrors so the rAF loop reads fresh values without re-subscribing.
  const cameraRef = useRef(0);
  const speedRef = useRef<ScaleSpeed>("play");
  // Mirror latest state into refs so the rAF loop reads fresh values without re-subscribing.
  useEffect(() => {
    cameraRef.current = cameraDollars;
    speedRef.current = speed;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    if (mq.matches) setCameraDollars(MILLION);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => setViewportWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!isPlaying || reducedMotion) return;

    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const dollarsPerSec = (BASE_PX_PER_SEC * SPEED_MULT[speedRef.current]) / PX_PER_DOLLAR;
      const next = cameraRef.current + dollarsPerSec * dt;
      if (next >= trackEnd) {
        setCameraDollars(trackEnd);
        setIsPlaying(false);
        return;
      }
      setCameraDollars(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [isPlaying, reducedMotion, trackEnd]);

  const jumpTo = (dollars: number) => {
    setIsPlaying(false);
    setCameraDollars(Math.min(trackEnd, Math.max(0, dollars)));
  };

  return (
    <section
      id="scale-journey"
      aria-label="Million, billion, trillion scale journey"
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10"
    >
      <header className="text-center">
        <p className="section-kicker mb-2">Scale</p>
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
          A million, a billion, a trillion
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600">
          Each dollar is a fixed distance. Press play and watch how far a billion
          really is from a million — and how a trillion dwarfs them both.
        </p>
      </header>

      <div
        className="numeric text-center text-2xl font-semibold text-accent sm:text-3xl"
        role="status"
        aria-label="Current position on the scale"
      >
        {formatCurrency(Math.round(cameraDollars), formatOpts)}
      </div>

      <div ref={trackRef} className="w-full">
        <ScaleTrack
          landmarks={landmarks}
          cameraDollars={cameraDollars}
          pxPerDollar={PX_PER_DOLLAR}
          viewportWidth={viewportWidth}
        />
      </div>

      <ScaleMinimap landmarks={landmarks} cameraDollars={cameraDollars} trackEnd={trackEnd} />

      <ScaleControls
        isPlaying={isPlaying}
        speed={speed}
        cameraDollars={cameraDollars}
        trackEnd={trackEnd}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onSetSpeed={setSpeed}
        onSkipTo={jumpTo}
        onScrub={jumpTo}
      />

      {reducedMotion && (
        <p className="text-center text-xs text-zinc-500">
          Auto-travel is disabled because your system prefers reduced motion. Use the
          skip buttons and slider to explore.
        </p>
      )}
    </section>
  );
}
