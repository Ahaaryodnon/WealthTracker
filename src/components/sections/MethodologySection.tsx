"use client";

import { useState } from "react";
import { formatDataAsOf } from "@/lib/format-date";

interface MethodologySectionProps {
  dataAsOf: string;
}

export default function MethodologySection({
  dataAsOf,
}: MethodologySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const dataAsOfFormatted = formatDataAsOf(dataAsOf);

  return (
    <section
      id="methodology"
      aria-label="Methodology"
      className="border-t border-zinc-200 py-16 sm:py-24"
    >
      <h2 className="mb-4 text-center text-lg font-medium text-zinc-900">
        How we calculate this
      </h2>

      <div className="mx-auto max-w-xl">
        {dataAsOfFormatted && (
          <p className="mb-4 text-center text-sm font-medium text-zinc-600">
            Data as of {dataAsOfFormatted}
          </p>
        )}
        <p className="text-center text-zinc-600 leading-relaxed">
          Net worth &times; estimated annual return = passive income. The
          number above uses a <strong>5%</strong> annual return assumption —
          the long-run average of a diversified portfolio. We also show
          conservative (3%) and high (7%) scenarios below.
        </p>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            aria-expanded={expanded}
          >
            {expanded ? "Hide" : "See full"} methodology
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              aria-hidden
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
        </div>

        {expanded && (
          <div className="mt-6 space-y-6 rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-sm leading-relaxed text-zinc-600">
            <div>
              <h3 className="mb-2 font-medium text-zinc-900">
                Return assumptions
              </h3>
              <p className="mb-3 text-zinc-600">
                We use three scenarios; the main display uses the 5% (base)
                rate.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="pb-2 pr-4 font-medium text-zinc-700">
                        Scenario
                      </th>
                      <th className="pb-2 pr-4 font-medium text-zinc-700">
                        Annual return
                      </th>
                      <th className="pb-2 font-medium text-zinc-700">
                        Rationale
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-600">
                    <tr className="border-b border-zinc-100">
                      <td className="py-2 pr-4">Conservative</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">3%</td>
                      <td className="py-2">
                        Bond-heavy, dividend-focused portfolio
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 bg-white">
                      <td className="py-2 pr-4 font-medium text-zinc-900">
                        Base (used for main display)
                      </td>
                      <td className="py-2 pr-4 font-mono tabular-nums font-medium text-zinc-900">
                        5%
                      </td>
                      <td className="py-2">
                        Long-run real return of diversified portfolio
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">High</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">7%</td>
                      <td className="py-2">
                        Equity-heavy with private deal access
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-zinc-900">What this models</h3>
              <p>
                This is an asset-return model — not declared cash income. It
                estimates the combined value of dividends, interest, rent,
                buybacks, and capital gains that wealth generates. Actual
                realised income will vary based on asset allocation, market
                conditions, and liquidity events.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-zinc-900">Sources</h3>
              <ul className="list-inside list-disc space-y-1 text-zinc-600">
                <li>
                  <strong>Forbes Real-Time Billionaires</strong> — primary net
                  worth data
                </li>
                <li>
                  <strong>Bloomberg Billionaires Index</strong> — when
                  available; we average with Forbes where both exist
                </li>
                <li>
                  Median US salary from <strong>US Census Bureau</strong>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-zinc-900">Uncertainty</h3>
              <p>
                Net worth estimates can vary significantly between sources and
                over time. Private assets, leverage, and valuation methods
                introduce uncertainty. All figures should be read as estimates
                within a range, not precise values.
              </p>
            </div>

            {dataAsOfFormatted && (
              <p className="text-xs text-zinc-400">
                Data as of {dataAsOfFormatted}. Found an error?{" "}
                <span className="underline">Let us know.</span>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
