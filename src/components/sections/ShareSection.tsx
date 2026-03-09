"use client";

import { useState, useCallback, useRef } from "react";
import { formatCurrency, formatDuration, formatNumber } from "@/lib/format-currency";
import { useScrollReveal } from "@/lib/useScrollReveal";

interface ShareSectionProps {
  sinceArrived: number;
  elapsedSeconds: number;
  medianSalary?: number;
}

function getShareUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

export default function ShareSection({
  sinceArrived,
  elapsedSeconds,
  medianSalary = 59_384,
}: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useScrollReveal<HTMLElement>();

  const salaryMultiple =
    sinceArrived > 0 && medianSalary > 0
      ? Math.floor(sinceArrived / medianSalary)
      : 0;

  const shareText =
    sinceArrived > 0
      ? `I spent ${formatDuration(elapsedSeconds)} reading about wealth inequality. In that time, 10 people earned ${formatCurrency(Math.round(sinceArrived))} in passive income${salaryMultiple > 0 ? ` — ${formatNumber(salaryMultiple)} years of the average American salary` : ""}. See for yourself:`
      : "The 10 richest people earn more passively in seconds than most earn in a year. See for yourself:";

  const handleCopy = useCallback(async (text?: string, url?: string) => {
    const urlToUse = url ?? getShareUrl();
    const textToUse = text ?? shareText;
    const textToCopy = `${textToUse} ${urlToUse}`.trim();
    setCopyError(false);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      try {
        await navigator.clipboard?.writeText(urlToUse || textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        setCopyError(true);
        setTimeout(() => setCopyError(false), 3000);
      }
    }
  }, [shareText]);

  const handleShare = useCallback(async () => {
    const url = getShareUrl();
    setCopyError(false);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "The Inequality Calculator",
          text: shareText,
          url: url || undefined,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await handleCopy(shareText, url);
        }
      }
    } else {
      await handleCopy(shareText, url);
    }
  }, [shareText, handleCopy]);

  return (
    <section
      ref={sectionRef}
      id="share"
      aria-label="Share"
      className="reveal py-20 text-center sm:py-32"
    >
      <p className="section-kicker mb-3">Pass It On</p>
      <h2 className="section-title mb-3">Your moment on this page</h2>
      <p className="section-lead mx-auto mb-10 max-w-xl text-sm sm:text-base">
        The point lands harder when people watch the number move for themselves.
      </p>

      {/* ── Screenshot-optimised share card (dark) ─────── */}
      <div
        ref={cardRef}
        className="share-card mx-auto mb-8 max-w-md text-left"
      >
        <div className="relative z-10">
          {sinceArrived > 0 ? (
            <>
              <p className="text-sm font-medium text-slate-400">
                You spent{" "}
                <span className="text-white">{formatDuration(elapsedSeconds)}</span>{" "}
                on this page.
              </p>
              <p className="mt-4 text-sm text-slate-400">
                In that time, the 10 richest people earned
              </p>
              <p className="numeric mt-2 text-4xl font-bold text-white sm:text-5xl">
                {formatCurrency(Math.round(sinceArrived))}
              </p>
              {salaryMultiple > 0 && (
                <p className="mt-3 text-sm text-slate-400">
                  That&rsquo;s{" "}
                  <span className="font-semibold text-amber-400">
                    {formatNumber(salaryMultiple)} year{salaryMultiple !== 1 ? "s" : ""}
                  </span>{" "}
                  of median US salary.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-slate-400">
                The 10 richest people earn more passively in seconds
                than most earn in a year.
              </p>
              <p className="font-editorial mt-4 text-3xl font-semibold text-white">
                See for yourself.
              </p>
            </>
          )}
          <p className="mt-6 text-xs tracking-wide text-slate-500">
            theinequalitycalculator.com
          </p>
        </div>
      </div>

      {/* Accessible feedback */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={copied ? "mb-3 text-sm font-medium text-emerald-600" : "sr-only"}
      >
        {copied ? "Copied to clipboard" : ""}
      </div>
      {copyError && (
        <p role="alert" className="mb-3 text-sm text-amber-700">
          Sharing isn&rsquo;t available in this browser. Try copying the link from the address bar.
        </p>
      )}

      {/* Action buttons */}
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => handleShare()}
          className="inline-flex h-12 min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-white shadow-md transition-all hover:bg-accent-light hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.98] sm:min-w-[140px] sm:w-auto"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 8h8M8 4l4 4-4 4" /></svg>
          Share
        </button>

        <button
          type="button"
          onClick={() => handleCopy()}
          className="inline-flex h-12 min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-zinc-200 px-6 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 active:scale-[0.98] sm:min-w-[140px] sm:w-auto"
          aria-label={copied ? "Link copied" : "Copy link"}
        >
          {copied ? (
            <><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 8l4 4 6-7" /></svg> Copied!</>
          ) : (
            <><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="5" y="5" width="8" height="8" rx="1" /><path d="M3 11V3h8" /></svg> Copy link</>
          )}
        </button>
      </div>
    </section>
  );
}
