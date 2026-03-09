import type { BillionaireEntry } from "@/data/billionaires.types";
import { getNetWorth } from "@/lib/billionaire-utils";
import { formatCompact } from "@/lib/format-currency";
import Link from "next/link";

interface ProfileHeaderProps {
  entry: BillionaireEntry;
}

export default function ProfileHeader({ entry }: ProfileHeaderProps) {
  const nw = getNetWorth(entry);

  return (
    <div className="border-b border-zinc-200 pb-8">
      <nav className="mb-8 pt-6">
        <Link
          href="/billionaires"
          className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          &larr; All Billionaires
        </Link>
      </nav>

      <div className="flex items-start gap-6">
        {entry.imageUrl && (
          <img
            src={entry.imageUrl}
            alt={entry.name}
            className="h-20 w-20 rounded-full object-cover bg-zinc-200 shrink-0 sm:h-24 sm:w-24"
            loading="eager"
          />
        )}
        <div className="min-w-0">
          <div className="flex items-baseline gap-3 mb-1">
            {entry.rank && (
              <span className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-white tabular-nums">
                #{entry.rank}
              </span>
            )}
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl truncate">
              {entry.name}
            </h1>
          </div>

          <p className="font-mono text-xl font-semibold text-zinc-900 tabular-nums sm:text-2xl">
            {formatCompact(nw * 1e9)}
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-500">
            {entry.organization && entry.title && (
              <span>{entry.title}, {entry.organization}</span>
            )}
            {entry.organization && !entry.title && (
              <span>{entry.organization}</span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {entry.citizenship && (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">
                {entry.citizenship}
              </span>
            )}
            {entry.source && (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">
                {entry.source}
              </span>
            )}
            {entry.industries?.map((ind) => (
              <span
                key={ind}
                className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600"
              >
                {ind}
              </span>
            ))}
            {entry.selfMade && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700">
                Self-made
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
