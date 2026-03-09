import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { wealthTrackerData } from "@/data/billionaires";
import { findBySlug, getNetWorth } from "@/lib/billionaire-utils";
import { formatCompact } from "@/lib/format-currency";
import ProfileHeader from "@/components/profile/ProfileHeader";
import IndividualAccumulator from "@/components/profile/IndividualAccumulator";
import WealthContext from "@/components/profile/WealthContext";
import Biography from "@/components/profile/Biography";
import ProfileNav from "@/components/profile/ProfileNav";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return wealthTrackerData.entries.map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = findBySlug(slug);
  if (!entry) return { title: "Not Found" };

  const nw = getNetWorth(entry);
  return {
    title: `${entry.name} — Net Worth & Passive Income | The Inequality Calculator`,
    description: `${entry.name} has a net worth of ${formatCompact(nw * 1e9)}. Watch their passive income tick up in real time.`,
    openGraph: {
      title: `${entry.name} — The Inequality Calculator`,
      description: `${entry.name} has a net worth of ${formatCompact(nw * 1e9)}. Watch their passive income tick up in real time.`,
    },
  };
}

export default async function BillionaireProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const entry = findBySlug(slug);
  if (!entry) notFound();

  const { entries, medianSalary, dataAsOf } = wealthTrackerData;
  const idx = entries.findIndex((e) => e.slug === slug);
  const prev = idx > 0 ? entries[idx - 1] : null;
  const next = idx < entries.length - 1 ? entries[idx + 1] : null;

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-zinc-50 px-4 sm:px-8">
      <ProfileHeader entry={entry} />

      <div className="space-y-6 py-8">
        <IndividualAccumulator entry={entry} dataAsOf={dataAsOf} />
        <WealthContext entry={entry} medianSalary={medianSalary} />
        <Biography entry={entry} />
      </div>

      <ProfileNav prev={prev} next={next} />

      <footer className="border-t border-zinc-200 py-8 text-center text-xs text-zinc-400 mt-6">
        <a href="/" className="hover:text-zinc-600 underline">
          The Inequality Calculator
        </a>
        {" "}&middot; Data from Forbes Real-Time Billionaires
      </footer>
    </div>
  );
}
