"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { BillionaireEntry } from "@/data/billionaires.types";
import { computeYtdTotal } from "@/lib/passive-income-calc";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";
import HeroSection from "./hero/HeroSection";
import StickyCounter from "./StickyCounter";
import SectionNav from "./SectionNav";
import ReturnRateSelector from "./ReturnRateSelector";
import Bridge from "./sections/Bridge";
import ContextStrip from "./sections/ContextStrip";
import ComparisonSection from "./sections/ComparisonSection";
import BudgetComparisonSection from "./sections/BudgetComparisonSection";
import SalaryCalculator from "./sections/SalaryCalculator";
import TopTenList from "./sections/TopTenList";
import MethodologySection from "./sections/MethodologySection";
import ShareSection from "./sections/ShareSection";
import ScrollProgress from "./sections/ScrollProgress";

interface PageClientProps {
  entries: BillionaireEntry[];
  dataAsOf: string;
  initialYtdTotal: number;
}

export default function PageClient({
  entries,
  dataAsOf,
  initialYtdTotal,
}: PageClientProps) {
  /* ── Global return rate ─────────────────────────────── */
  const [returnRate, setReturnRate] = useState(DEFAULT_RETURN_RATE);

  /* ── Session data from Accumulator ──────────────────── */
  const [sessionData, setSessionData] = useState(() => ({
    sinceArrived: 0,
    elapsedSeconds: 0,
    ytdTotal: initialYtdTotal || computeYtdTotal(entries, DEFAULT_RETURN_RATE),
    mainTotal: 0,
  }));

  const handleSessionUpdate = useCallback(
    (
      sinceArrived: number,
      elapsedSeconds: number,
      ytdTotal?: number,
      mainTotal?: number
    ) => {
      setSessionData((prev) => ({
        ...prev,
        sinceArrived,
        elapsedSeconds,
        ...(ytdTotal !== undefined && { ytdTotal }),
        ...(mainTotal !== undefined && { mainTotal }),
      }));
    },
    []
  );

  /* ── Hero exit detection for sticky counter ─────────── */
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroExited, setHeroExited] = useState(false);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroExited(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <ScrollProgress />
      <StickyCounter
        mainTotal={sessionData.mainTotal}
        sinceArrived={sessionData.sinceArrived}
        heroExited={heroExited}
      />
      <SectionNav />

      {/* ── ACT 1: THE HOOK (full-width dark hero) ──────── */}
      <div ref={heroRef}>
        <HeroSection
          entries={entries}
          dataAsOf={dataAsOf}
          returnRate={returnRate}
          onSessionUpdate={handleSessionUpdate}
        />
      </div>

      {/* ── Dark-to-light transition zone ───────────────── */}
      <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-[#f8fafc] pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <div className="flex justify-center pb-4 pt-8">
            <ReturnRateSelector value={returnRate} onChange={setReturnRate} />
          </div>
        </div>
      </div>

      {/* ── Content sections (light bg) ────────────────── */}
      <div className="relative mx-auto max-w-3xl px-4 sm:px-8">

        <Bridge>But how fast is fast?</Bridge>

        <ContextStrip
          entries={entries}
          ytdTotal={sessionData.ytdTotal}
          returnRate={returnRate}
        />

        <Bridge>To understand the speed, compare it to your life.</Bridge>

        <ComparisonSection entries={entries} returnRate={returnRate} />

        <Bridge>Now multiply that across public institutions.</Bridge>

        <BudgetComparisonSection entries={entries} returnRate={returnRate} />

        <Bridge>Now make it personal.</Bridge>

        <SalaryCalculator entries={entries} returnRate={returnRate} />

        <Bridge>Here&rsquo;s who&rsquo;s earning it.</Bridge>

        <TopTenList entries={entries} returnRate={returnRate} />

        <Bridge>We built this with public data. Here&rsquo;s how.</Bridge>

        <MethodologySection dataAsOf={dataAsOf} />

        <Bridge>One more thing before you go.</Bridge>

        <ShareSection
          sinceArrived={sessionData.sinceArrived}
          elapsedSeconds={sessionData.elapsedSeconds}
        />

        <footer className="border-t border-zinc-100 mt-0 py-8 text-center text-xs text-zinc-400">
          The Inequality Calculator &middot; theinequalitycalculator.com &middot; Data from
          Forbes Real-Time Billionaires
        </footer>
      </div>
    </>
  );
}
