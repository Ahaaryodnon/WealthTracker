import type { BillionaireEntry } from "@/data/billionaires.types";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import { DEFAULT_RETURN_RATE, COMPARISONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format-currency";

interface ComparisonSectionProps {
  entries: BillionaireEntry[];
}

export default function ComparisonSection({ entries }: ComparisonSectionProps) {
  const perSecond = combinedPassiveIncomePerSecond(entries, DEFAULT_RETURN_RATE);
  const perDay = perSecond * 86400;

  return (
    <section
      aria-label="Scale comparisons"
      className="border-t border-zinc-200 py-16 sm:py-24"
    >
      <h2 className="mb-3 text-center text-lg font-medium text-zinc-900">
        What does that buy?
      </h2>
      <p className="mb-10 text-center text-sm text-zinc-500">
        Their combined daily passive income: {formatCurrency(Math.round(perDay))}
      </p>

      <div className="space-y-8">
        {COMPARISONS.map((comp) => {
          const seconds = perSecond > 0 ? comp.value / perSecond : 0;
          const multiple = perDay > 0 ? perDay / comp.value : 0;

          // Bar: comparison value as fraction of daily earnings; min width so segment is visible
          const barPercent = Math.min(100, Math.max(1, (comp.value / perDay) * 100));

          return (
            <div key={comp.label}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-medium text-zinc-700">
                  {comp.label}
                </span>
                <span className="text-xs tabular-nums text-zinc-500">
                  {formatCurrency(comp.value)}
                </span>
              </div>

              {/* Single bar: left = one comparison unit, right = rest of daily earnings */}
              <div className="mb-2 flex h-8 w-full overflow-hidden rounded-lg">
                <div
                  className="shrink-0 bg-zinc-400"
                  style={{ width: `${barPercent}%`, minWidth: barPercent < 100 ? 6 : 0 }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 bg-zinc-900" aria-hidden />
              </div>

              <p className="text-sm text-zinc-600">
                Earned every{" "}
                <span className="font-semibold tabular-nums text-zinc-900">
                  {seconds < 60
                    ? `${Math.round(seconds)} seconds`
                    : seconds < 3600
                      ? `${(seconds / 60).toFixed(1)} minutes`
                      : `${(seconds / 3600).toFixed(1)} hours`}
                </span>
                {" "}&middot;{" "}
                <span className="text-zinc-400">
                  {Math.round(multiple).toLocaleString()}× per day
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
