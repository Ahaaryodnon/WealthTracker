#!/usr/bin/env bash
# Deploy static output to Cloudflare Pages.
# Set CLOUDFLARE_PAGES_PROJECT_NAME to match your project in the dashboard (Workers & Pages).
# Default: wealthtracker (change if you see "Project not found [8000007]").

set -euo pipefail

PROJECT_NAME="${CLOUDFLARE_PAGES_PROJECT_NAME:-wealthtracker}"
WRANGLER_CMD=(npx --yes wrangler)

if [[ ! -d "out" ]]; then
  echo "Missing ./out static export. Run 'npm run build' before deploying." >&2
  exit 1
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  WHOAMI_OUTPUT="$("${WRANGLER_CMD[@]}" whoami 2>&1 || true)"
  if grep -Fq "You are not authenticated" <<<"$WHOAMI_OUTPUT"; then
    cat >&2 <<EOF
Cloudflare auth is missing.

Use one of these:
  1. Run 'npx wrangler login' once in an interactive shell
  2. Export CLOUDFLARE_API_TOKEN before running this deploy

Then rerun:
  CLOUDFLARE_PAGES_PROJECT_NAME=$PROJECT_NAME npm run deploy:pages
EOF
    exit 1
  fi
fi

if ! "${WRANGLER_CMD[@]}" pages project list >/dev/null 2>&1; then
  echo "Unable to verify Cloudflare Pages projects for the current account." >&2
  echo "Check your Cloudflare auth/token permissions, then rerun the deploy." >&2
  exit 1
fi

"${WRANGLER_CMD[@]}" pages deploy out --project-name="$PROJECT_NAME"
