import type { Metadata } from "next";
import Link from "next/link";
import { wealthTrackerData } from "@/data/billionaires";
import WealthScale from "@/components/scale/WealthScale";
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
            Every amount drawn as a bar from zero: a {formatCurrency(1_000_000)} bar is a sliver,
            a {formatCurrency(1_000_000_000)} bar is a thousand times longer, and a{" "}
            {formatCurrency(1_000_000_000_000)} bar is a thousand times longer again. The richest
            person today is worth about {formatCurrency(topNetWorth)}.
          </p>
          <p className="text-sm text-zinc-500">Enable JavaScript to travel the scale interactively.</p>
        </div>
      </noscript>
      <nav className="mx-auto max-w-5xl px-4 pt-6">
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-700"
        >
          &larr; The Inequality Calculator
        </Link>
      </nav>
      <WealthScale entries={entries} />
    </main>
  );
}
