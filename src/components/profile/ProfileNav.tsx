import type { BillionaireEntry } from "@/data/billionaires.types";
import Link from "next/link";

interface ProfileNavProps {
  prev: BillionaireEntry | null;
  next: BillionaireEntry | null;
}

export default function ProfileNav({ prev, next }: ProfileNavProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-6">
      {prev ? (
        <Link
          href={`/billionaires/${prev.slug}`}
          className="group flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          <span aria-hidden="true">&larr;</span>
          <span>
            <span className="text-xs text-zinc-400 block">#{prev.rank}</span>
            <span className="group-hover:underline">{prev.name}</span>
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/billionaires/${next.slug}`}
          className="group flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors text-right"
        >
          <span>
            <span className="text-xs text-zinc-400 block">#{next.rank}</span>
            <span className="group-hover:underline">{next.name}</span>
          </span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
