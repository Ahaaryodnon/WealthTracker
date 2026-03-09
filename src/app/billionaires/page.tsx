import type { Metadata } from "next";
import Link from "next/link";
import { wealthTrackerData } from "@/data/billionaires";
import { getAllCountries } from "@/lib/billionaire-utils";
import BillionaireFilters from "@/components/billionaires/BillionaireFilters";

export const metadata: Metadata = {
  title: "World's Richest Billionaires — The Inequality Calculator",
  description:
    "Browse the world's richest billionaires ranked by net worth. See their passive income rates, wealth sources, and more.",
  openGraph: {
    title: "World's Richest Billionaires — The Inequality Calculator",
    description:
      "Browse the world's richest billionaires ranked by net worth.",
  },
};

export default function BillionairesIndexPage() {
  const { entries } = wealthTrackerData;
  const countries = getAllCountries();

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-zinc-50 px-4 sm:px-8">
      <nav className="pt-6 mb-8">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          &larr; The Inequality Calculator
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          World&rsquo;s Richest Billionaires
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {entries.length} billionaires ranked by net worth. Click any profile to see their
          passive income in real time.
        </p>
      </header>

      <BillionaireFilters entries={entries} countries={countries} />

      <footer className="border-t border-zinc-200 py-8 text-center text-xs text-zinc-400 mt-8">
        <a href="/" className="hover:text-zinc-600 underline">
          The Inequality Calculator
        </a>
        {" "}&middot; Data from Forbes Real-Time Billionaires
      </footer>
    </div>
  );
}
