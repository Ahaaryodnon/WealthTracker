# Test Automation Summary

**Generated:** QA Automate workflow (Quinn)  
**Scope:** Epic 1 — Live Accumulator with real data

---

## Framework

- **E2E:** [Playwright](https://playwright.dev/) (`@playwright/test`)
- **API/unit:** None (no API endpoints; pipeline/sync are Node scripts — optional script tests later)

Playwright was added because the project had no existing test framework. It starts the Next.js dev server automatically and runs tests against the UI.

---

## Generated Tests

### E2E Tests

| File | Description |
|------|-------------|
| `tests/e2e/wealthtracker.spec.ts` | Epic 1 home page and Accumulator |

**Cases:**

1. **loads single-page layout with hero, top 10, methodology, and share** — Asserts all four regions (Wealth Accumulator, Top 10 Billionaires, Methodology, Share) are visible.
2. **displays main Accumulator and since-you-arrived counter** — Asserts both status elements are visible and contain `$`.
3. **Accumulator values update over time (live counter)** — Uses `expect.poll` to wait up to 5s for the "since you arrived" value to change.
4. **shows Data as of and comparison line in hero** — Asserts "Data as of", "Since you arrived:", and comparison text (median salary / every X seconds|minutes).
5. **top 10 list shows entries or helpful message when empty** — Asserts either list items or the "No data available" / data:sync message.

Locators use semantic roles and labels (`getByRole("region", { name: "..." })`, `getByRole("status", { name: "..." })`) for accessibility alignment.

---

## How to Run

1. **Install browsers (once):**  
   `npx playwright install chromium`  
   (Requires network and disk space; if you use system Chrome, you may still need this for the correct build.)

2. **Run E2E tests:**  
   `npm run test` or `npx playwright test`  
   The config starts `npm run dev` and runs tests against http://localhost:3000.

3. **Run with UI (debug):**  
   `npx playwright test --ui`

---

## Coverage

| Area | Covered | Notes |
|------|---------|--------|
| **UI – Epic 1** | 5 E2E tests | Page layout, Accumulator, live counter, comparison, top 10 |
| **API** | 0 | No app API; static export only |
| **Pipeline/sync** | 0 | Optional: script tests (run `update-data` with bad input, assert exit code ≠ 0) |

---

## Next Steps

- Run `npm run test` locally and fix any failures (e.g. if `data:sync` has not been run, "No data available" may show; tests accept either list or fallback).
- Add pipeline/sync failure tests if you want CI to assert: validation failure → non-zero exit; sync with Convex unavailable → no overwrite of `src/data/`.
- Add tests to CI (e.g. GitHub Actions) with `npm run build && npx playwright install --with-deps chromium && npm run test`.

---

## Validation Checklist (Quinn)

- [x] E2E tests generated for Epic 1 UI
- [x] Tests use standard Playwright APIs
- [x] Semantic locators (roles, labels)
- [x] Happy path + live-counter behavior
- [x] No hardcoded sleeps (poll used for “updates over time”)
- [ ] All tests run successfully (blocked here by browser install / disk; run locally to verify)
- [x] Test summary created
