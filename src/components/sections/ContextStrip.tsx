import type { BillionaireEntry } from "@/data/billionaires.types";
import { combinedPassiveIncomePerSecond } from "@/lib/passive-income-calc";
import { DEFAULT_RETURN_RATE } from "@/lib/constants";
import { formatCurrency } from "@/lib/format-currency";

interface ContextStripProps {
  entries: BillionaireEntry[];
  /** Year-to-date cumulative total (from Accumulator tick). */
  ytdTotal?: number;
}

export default function ContextStrip({
  entries,
  ytdTotal = 0,
}: ContextStripProps) {
  const perSecond = combinedPassiveIncomePerSecond(entries, DEFAULT_RETURN_RATE);
  const perMinute = perSecond * 60;
  const perHour = perMinute * 60;

  const cards = [
    {
      rate: formatCurrency(Math.round(perSecond)),
      unit: "every second",
    },
    {
      rate: formatCurrency(Math.round(perMinute)),
      unit: "every minute",
      note: "More than most people earn in a year",
    },
    {
      rate: formatCurrency(Math.round(perHour)),
      unit: "every hour",
      note: "More than a doctor earns in a decade",
    },
  ];

  return (
    <section
      aria-label="Earning rate breakdown"
      className="border-t border-zinc-200 py-16 sm:py-24"
    >
      {ytdTotal > 0 && (
        <div
          role="region"
          aria-label="Year-to-date cumulative total"
          className="mb-10 text-center"
        >
          <p className="text-sm font-medium text-zinc-500">
            So far this year
          </p>
          <p
            className="mt-1 font-mono text-2xl font-bold tabular-nums text-zinc-900 sm:text-3xl"
            role="status"
          >
            {formatCurrency(ytdTotal)}
          </p>
        </div>
      )}
      <h2 className="mb-10 text-center text-lg font-medium text-zinc-900">
        How fast is that?
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {cards.map((card) => (
          <div
            key={card.unit}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center"
          >
            <p className="font-mono text-2xl font-bold tabular-nums text-zinc-900 sm:text-3xl">
              {card.rate}
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {card.unit}
            </p>
            {card.note && (
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                {card.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
