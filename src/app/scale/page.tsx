import type { Metadata } from "next";
import { wealthTrackerData } from "@/data/billionaires";
import ScaleJourney from "@/components/scale/ScaleJourney";
import { formatCurrency } from "@/lib/format-currency";
import { BILLION } from "@/lib/scale/scale-math";

export const metadata: Metadata = {
  title: "A Million vs a Billion vs a Trillion — The Inequality Calculator",
  description:
    "See the gap for yourself: each dollar is a fixed distance. A billion is 1,000× a million; a trillion is 1,000× a billion.",
  openGraph: {
    title: "A Million vs a Billion vs a Trillion",
    description:
      "Each dollar is a fixed distance. Travel the scale and feel how far a billion — and a trillion — really is.",
    url: "https://theinequalitycalculator.com/scale",
    siteName: "The Inequality Calculator",
  },
};

export default function ScalePage() {
  const { entries } = wealthTrackerData;
  const topNetWorth = entries.reduce((m, e) => Math.max(m, e.netWorth ?? 0), 0) * BILLION;

  return (
    <main className="min-h-screen bg-white">
      <noscript>
        <div className="px-4 py-16 text-center" style={{ fontFamily: "system-ui, sans-serif" }}>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-400">
            Scale (JavaScript disabled)
          </p>
          <p className="mb-4 text-zinc-700">
            A million is {formatCurrency(1_000_000)}. A billion is {formatCurrency(1_000_000_000)} —
            one thousand millions. A trillion is {formatCurrency(1_000_000_000_000)} — one thousand
            billions. The richest person today is worth about {formatCurrency(topNetWorth)}.
          </p>
          <p className="text-sm text-zinc-500">Enable JavaScript to travel the scale interactively.</p>
        </div>
      </noscript>
      <ScaleJourney entries={entries} />
    </main>
  );
}
