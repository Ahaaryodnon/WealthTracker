import type { BillionaireEntry } from "@/data/billionaires.types";

interface BiographyProps {
  entry: BillionaireEntry;
}

export default function Biography({ entry }: BiographyProps) {
  const hasBio = entry.bio && entry.bio.length > 0;
  const hasAbout = entry.about && entry.about.length > 0;
  const hasPersonalDetails = entry.age || entry.gender;

  if (!hasBio && !hasAbout && !hasPersonalDetails) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      {hasBio && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-zinc-500">Biography</h2>
          <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
            {entry.bio!.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      {hasAbout && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-zinc-500">About</h2>
          <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
            {entry.about!.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      {hasPersonalDetails && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-500">Details</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {entry.age && (
              <div>
                <span className="text-zinc-400">Age: </span>
                <span className="text-zinc-700">{entry.age}</span>
              </div>
            )}
            {entry.gender && (
              <div>
                <span className="text-zinc-400">Gender: </span>
                <span className="text-zinc-700 capitalize">{entry.gender}</span>
              </div>
            )}
            {entry.citizenship && (
              <div>
                <span className="text-zinc-400">Citizenship: </span>
                <span className="text-zinc-700">{entry.citizenship}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
