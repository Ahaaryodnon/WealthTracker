"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/format-currency";

interface StickyCounterProps {
  mainTotal: number;
  sinceArrived: number;
  heroExited: boolean;
}

/**
 * Compact sticky bar that appears once the hero scrolls out of view.
 * Shows the running total + "since you arrived" counter.
 */
export default function StickyCounter({
  mainTotal,
  sinceArrived,
  heroExited,
}: StickyCounterProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (heroExited) {
      // Small delay to avoid jarring pop-in
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [heroExited]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
      role="status"
      aria-label="Live wealth accumulation"
    >
      <div className="mx-auto flex h-11 max-w-3xl items-center justify-between gap-4 px-4 sm:px-8">
        {/* Backdrop */}
        <div className="absolute inset-0 border-b border-white/10 bg-slate-900/90 backdrop-blur-lg" />

        {/* Content */}
        <div className="relative flex items-center gap-2">
          <span className="live-dot" aria-hidden="true" />
          <span className="numeric text-sm font-semibold text-white/90">
            {formatCurrency(mainTotal)}
          </span>
          <span className="hidden text-xs text-white/40 sm:inline">earned</span>
        </div>

        <div className="relative flex items-center gap-2">
          <span className="text-xs text-white/40">Since you arrived</span>
          <span className="numeric text-sm font-semibold text-emerald-400">
            {formatCurrency(sinceArrived)}
          </span>
        </div>
      </div>
    </div>
  );
}
