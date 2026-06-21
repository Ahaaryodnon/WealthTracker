import Script from "next/script";

const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const scriptUrl =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ?? "https://cloud.umami.is/script.js";

/**
 * Privacy-conscious page analytics via Umami (https://umami.is).
 * Enabled only when NEXT_PUBLIC_UMAMI_WEBSITE_ID is set at build time.
 */
export function Analytics() {
  if (!websiteId) return null;

  return (
    <Script
      defer
      src={scriptUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
