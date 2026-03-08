#!/usr/bin/env bash
# Deploy the static export to the Cloudflare Worker service using Workers Assets.

set -euo pipefail

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
  npm run deploy:worker
EOF
    exit 1
  fi
fi

if ! "${WRANGLER_CMD[@]}" deployments list --name wealthtracker >/dev/null 2>&1; then
  echo "Unable to verify the Cloudflare Worker service 'wealthtracker' for the current account." >&2
  echo "Check your Cloudflare auth/token permissions, then rerun the deploy." >&2
  exit 1
fi

"${WRANGLER_CMD[@]}" deploy --keep-vars
