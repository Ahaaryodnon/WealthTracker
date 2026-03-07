"use client";

import { useState, useCallback } from "react";
import { formatCurrency, formatDuration } from "@/lib/format-currency";

interface ShareSectionProps {
  sinceArrived: number;
  elapsedSeconds: number;
}

function getShareUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

export default function ShareSection({
  sinceArrived,
  elapsedSeconds,
}: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const shareText =
    sinceArrived > 0
      ? `The 10 richest people earned ${formatCurrency(Math.round(sinceArrived))} while I spent ${formatDuration(elapsedSeconds)} on the Inequality Calculator. See for yourself:`
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
      aria-label="Share"
      className="border-t border-zinc-200 py-16 text-center sm:py-24"
    >
      <h2 className="mb-3 text-lg font-medium text-zinc-900">
        Share this
      </h2>

      {/* Dynamic fact */}
      <p className="mx-auto mb-8 max-w-md text-zinc-600 leading-relaxed">
        {sinceArrived > 0 ? (
          <>
            You&rsquo;ve been here for{" "}
            <span className="font-semibold text-zinc-900">
              {formatDuration(elapsedSeconds)}
            </span>
            . In that time, they earned{" "}
            <span className="font-mono font-semibold tabular-nums text-zinc-900">
              {formatCurrency(Math.round(sinceArrived))}
            </span>
            .
          </>
        ) : (
          <>Help others see the scale of inequality.</>
        )}
      </p>

      {/* Pre-written share text preview */}
      <div className="mx-auto mb-6 max-w-md rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left text-sm text-zinc-600">
        <p>&ldquo;{shareText}&rdquo;</p>
      </div>

      {/* Accessible feedback for copy action (screen readers + visible when active) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={copied ? "mt-2 text-sm font-medium text-emerald-600" : "sr-only"}
        id="share-copy-status"
      >
        {copied ? "Link copied" : ""}
      </div>
      {copyError && (
        <p
          role="alert"
          className="mt-2 text-sm text-amber-700"
          id="share-copy-error"
        >
          Sharing isn&rsquo;t available in this browser. Try copying the link from the address bar.
        </p>
      )}

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => handleShare()}
          className="inline-flex min-h-[44px] h-12 min-w-[160px] items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 active:bg-zinc-800"
          aria-label="Share"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M4 8h8M8 4l4 4-4 4" />
          </svg>
          Share
        </button>

        <button
          type="button"
          onClick={() => handleCopy()}
          className="inline-flex min-h-[44px] h-12 min-w-[160px] items-center justify-center gap-2 rounded-full border border-zinc-200 px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 active:bg-zinc-100"
          aria-label={copied ? "Link copied" : "Copy link"}
        >
          {copied ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M3 8l4 4 6-7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect x="5" y="5" width="8" height="8" rx="1" />
                <path d="M3 11V3h8" />
              </svg>
              Copy link
            </>
          )}
        </button>
      </div>
    </section>
  );
}
