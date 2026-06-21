"use client";

import { useRef, useState, useEffect } from "react";
import type { BillionaireEntry } from "@/data/billionaires.types";
import { useLocale } from "@/contexts/LocaleContext";
import {
  combinedPassiveIncomePerSecond,
  accumulatedFromRate,
} from "@/lib/passive-income-calc";
import { formatCurrency } from "@/lib/format-currency";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";

interface IndividualAccumulatorProps {
  entry: BillionaireEntry;
  dataAsOf: string;
}

const TICK_MS = 1000 / 60;

export default function IndividualAccumulator({ entry, dataAsOf }: IndividualAccumulatorProps) {
  const { locale } = useLocale();
  const rateUsd = combinedPassiveIncomePerSecond([entry], DEFAULT_RETURN_RATE);
  const toLocal = locale.exchangeRateFromUsd;
  const rate = rateUsd * toLocal;
  const perMinute = rate * 60;
  const perHour = rate * 3600;
  const perDay = rate * 86400;
  const formatOpts = {
    numberLocale: locale.numberLocale,
    currency: locale.currency,
  };

  const [sinceArrived, setSinceArrived] = useState(0);
  const rafRef = useRef<number | null>(null);
  const sessionStartRef = useRef(0);
  const lastTickRef = useRef(0);

  useEffect(() => {
    sessionStartRef.current = Date.now();

    function loop() {
      const now = Date.now();
      if (now - lastTickRef.current < TICK_MS) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      lastTickRef.current = now;
      const fromSession = (now - sessionStartRef.current) / 1000;
      setSinceArrived(accumulatedFromRate(rateUsd, fromSession) * toLocal);
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [rateUsd, dataAsOf, toLocal]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-medium text-zinc-500">
        Passive income at {Math.round(DEFAULT_RETURN_RATE * 100)}% annual return
      </h2>

      <div className="mb-4" aria-live="polite">
        <p className="text-xs text-zinc-400 mb-1">Since you arrived</p>
        <p className="numeric text-3xl font-bold text-zinc-900 sm:text-4xl">
          {formatCurrency(sinceArrived, formatOpts)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-zinc-400">Per second</p>
          <p className="numeric text-sm font-semibold text-zinc-900">
            {formatCurrency(Math.round(rate), formatOpts)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Per minute</p>
          <p className="numeric text-sm font-semibold text-zinc-900">
            {formatCurrency(Math.round(perMinute), formatOpts)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Per hour</p>
          <p className="numeric text-sm font-semibold text-zinc-900">
            {formatCurrency(Math.round(perHour), formatOpts)}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-100">
        <p className="text-xs text-zinc-400">Per day</p>
        <p className="numeric text-lg font-semibold text-zinc-900">
          {formatCurrency(Math.round(perDay), formatOpts)}
        </p>
      </div>
    </div>
  );
}
