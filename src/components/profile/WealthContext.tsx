"use client";

import type { BillionaireEntry } from "@/data/billionaires.types";
import { getNetWorth } from "@/lib/billionaire-utils";
import { useLocale } from "@/contexts/LocaleContext";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import { formatCurrency } from "@/lib/format-currency";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";

interface WealthContextProps {
  entry: BillionaireEntry;
}

function formatTimeShort(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
  return `${(seconds / 86400).toFixed(1)} days`;
}

export default function WealthContext({ entry }: WealthContextProps) {
  const { locale } = useLocale();
  const nw = getNetWorth(entry);
  const perSecondUsd = combinedPassiveIncomePerSecond([entry], DEFAULT_RETURN_RATE);
  const perSecondLocal = perSecondUsd * locale.exchangeRateFromUsd;

  if (perSecondLocal <= 0) return null;

  const formatOpts = {
    numberLocale: locale.numberLocale,
    currency: locale.currency,
  };
  const nwLocal = nw * locale.exchangeRateFromUsd;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-medium text-zinc-500">Wealth in context</h2>

      <div className="space-y-3">
        {locale.comparisons.map((comp) => {
          const seconds = comp.value / perSecondLocal;
          return (
            <div key={comp.id} className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-zinc-600">{comp.label}</span>
              <div className="text-right">
                <span className="numeric text-sm font-semibold text-zinc-900">
                  {formatTimeShort(seconds)}
                </span>
                <span className="ml-1 text-xs text-zinc-400">
                  ({formatCurrency(comp.value, formatOpts)})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        Time to earn each amount through passive income at {Math.round(DEFAULT_RETURN_RATE * 100)}% annual return on {locale.currencySymbol}{nwLocal.toFixed(1)}B net worth.
      </p>
    </div>
  );
}
