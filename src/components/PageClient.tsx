"use client";

import { useState, useCallback } from "react";
import type { BillionaireEntry } from "@/data/billionaires.types";
import { computeYtdTotal } from "@/lib/passive-income-calc";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";
import HeroSection from "./hero/HeroSection";
import ContextStrip from "./sections/ContextStrip";
import ComparisonSection from "./sections/ComparisonSection";
import TopTenList from "./sections/TopTenList";
import MethodologySection from "./sections/MethodologySection";
import ShareSection from "./sections/ShareSection";
import ScrollProgress from "./sections/ScrollProgress";

interface PageClientProps {
  entries: BillionaireEntry[];
  medianSalary: number;
  dataAsOf: string;
}

export default function PageClient({
  entries,
  medianSalary,
  dataAsOf,
}: PageClientProps) {
  const [sessionData, setSessionData] = useState(() => ({
    sinceArrived: 0,
    elapsedSeconds: 0,
    ytdTotal: computeYtdTotal(entries, DEFAULT_RETURN_RATE),
  }));

  const handleSessionUpdate = useCallback(
    (
      sinceArrived: number,
      elapsedSeconds: number,
      ytdTotal?: number
    ) => {
      setSessionData((prev) => ({
        ...prev,
        sinceArrived,
        elapsedSeconds,
        ...(ytdTotal !== undefined && { ytdTotal }),
      }));
    },
    []
  );

  return (
    <>
      <ScrollProgress />

      <div className="mx-auto min-h-screen max-w-3xl bg-zinc-50 px-4 sm:px-8">
        <HeroSection
          entries={entries}
          medianSalary={medianSalary}
          dataAsOf={dataAsOf}
          onSessionUpdate={handleSessionUpdate}
        />

        <ContextStrip entries={entries} ytdTotal={sessionData.ytdTotal} />

        <ComparisonSection entries={entries} />

        <TopTenList entries={entries} medianSalary={medianSalary} />

        <MethodologySection dataAsOf={dataAsOf} />

        <ShareSection
          sinceArrived={sessionData.sinceArrived}
          elapsedSeconds={sessionData.elapsedSeconds}
        />

        <footer className="border-t border-zinc-200 py-8 text-center text-xs text-zinc-400">
          WealthTracker &middot; A calculator for inequality &middot; Data from
          Forbes Real-Time Billionaires
        </footer>
      </div>
    </>
  );
}
