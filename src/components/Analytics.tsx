const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
const scriptUrl = (
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ?? "https://cloud.umami.is/script.js"
).trim();

/**
 * Privacy-conscious page analytics via Umami (https://umami.is).
 * Plain <script> in <head> so static export includes it without waiting for React.
 */
export function Analytics() {
  if (!websiteId) return null;

  return (
    <script defer src={scriptUrl} data-website-id={websiteId} />
  );
}
