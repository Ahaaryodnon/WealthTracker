import type { BillionaireEntry } from "@/data/billionaires.types";
import { getNetWorth } from "@/lib/billionaire-utils";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import { formatCurrency } from "@/lib/format-currency";
import { DEFAULT_RETURN_RATE, COMPARISONS } from "@/lib/constants";

interface WealthContextProps {
  entry: BillionaireEntry;
  medianSalary: number;
}

function formatTimeShort(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
  return `${(seconds / 86400).toFixed(1)} days`;
}

export default function WealthContext({ entry, medianSalary }: WealthContextProps) {
  const nw = getNetWorth(entry);
  const perSecond = combinedPassiveIncomePerSecond([entry], DEFAULT_RETURN_RATE);

  if (perSecond <= 0) return null;

  const comparisons = [
    { label: "Median US salary", value: medianSalary, source: COMPARISONS[0].source },
    ...COMPARISONS.slice(1),
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-medium text-zinc-500">Wealth in context</h2>

      <div className="space-y-3">
        {comparisons.map((comp) => {
          const seconds = comp.value / perSecond;
          return (
            <div key={comp.label} className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-zinc-600">{comp.label}</span>
              <div className="text-right">
                <span className="font-mono text-sm font-semibold tabular-nums text-zinc-900">
                  {formatTimeShort(seconds)}
                </span>
                <span className="ml-1 text-xs text-zinc-400">
                  ({formatCurrency(comp.value)})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        Time to earn each amount through passive income at {Math.round(DEFAULT_RETURN_RATE * 100)}% annual return on ${nw.toFixed(1)}B net worth.
      </p>
    </div>
  );
}
