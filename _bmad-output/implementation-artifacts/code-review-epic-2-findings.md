# Code Review Findings — Epic 2: Understanding and credibility

**Reviewer:** Adversarial code review (BMAD workflow)  
**Date:** 2026-03-07  
**Stories reviewed:** 2-1 (Top 10 list), 2-2 (YTD total), 2-3 (Relatable comparison), 2-4 (Methodology & citations)

---

## Summary

| Severity | Count |
|----------|--------|
| 🔴 CRITICAL | 0 |
| 🟡 MEDIUM | 2 |
| 🟢 LOW | 5 |

**Git vs Story discrepancies:** Not compared (Epic 2 scope; repo has many unrelated _bmad/config changes). Application source files from story File Lists were read and verified.

**Verdict:** All four stories have their Acceptance Criteria **implemented**. Two MEDIUM issues affect UX/consistency and one edge case; several LOW items improve types, formatting, and documentation.

---

## 🔴 CRITICAL ISSUES

- None. No tasks marked [x] were found to be unimplemented. No ACs are fully missing.

---

## 🟡 MEDIUM ISSUES

### 1. YTD cumulative total not visible on first paint (Story 2-2)

**Where:** `PageClient.tsx` initial state `ytdTotal: 0`; `ContextStrip.tsx` renders the "So far this year" block only when `ytdTotal > 0`.

**Issue:** The year-to-date value is only set when the Accumulator’s rAF loop runs and calls `onSessionUpdate(..., ytdTotal)`. Until the first tick, `sessionData.ytdTotal` stays 0, so the YTD region is absent for the first frame(s). AC says "When I view the page / Then the year-to-date cumulative total is displayed" — it should be visible as soon as the page is viewable.

**Evidence:**  
- `PageClient.tsx` lines 24–28: initial `sessionData.ytdTotal = 0`.  
- `ContextStrip.tsx` line 41: `{ytdTotal > 0 && (...)}`  
- `Accumulator.tsx` line 129: `ytdTotal` is computed in the rAF loop and passed to `onSessionUpdate`.

**Recommendation:** Compute YTD once on mount (e.g. in `PageClient` or in a small helper using `getYtdElapsedSeconds` and `computeYtdTotal`) and use that as the initial `ytdTotal` so the block is visible on first paint, then let the Accumulator callback overwrite for subsequent ticks.

---

### 2. Two comparison lines in the hero (Story 2-3 / FR5)

**Where:** `Accumulator.tsx` (inside hero) and `HeroSection.tsx` (below Accumulator).

**Issue:** AC and UX call for **one** clear relatable comparison (e.g. "earns median salary every X minutes"). Currently there are two distinct comparison messages in the hero:

1. **Accumulator** (lines 197–211): *"Every X seconds/minutes, they passively earn what a typical American makes in a year."*
2. **HeroSection** (lines 54–62): *"[Name] earns a median annual salary every X seconds/minutes."*

Both are in or directly below the hero. That dilutes the "one shareable takeaway" and conflicts with "one clear comparison line" in the UX spec.

**Evidence:**  
- `Accumulator.tsx` 197–211: gut-punch paragraph.  
- `HeroSection.tsx` 54–62: `showComparison && <p role="status">` with firstEntry.name and median-salary interval.

**Recommendation:** Choose one as the single hero comparison: either the named-person line (Story 2.3) or the "typical American" line, and remove or move the other (e.g. into ContextStrip or ComparisonSection, or remove).

---

## 🟢 LOW ISSUES

### 3. Inconsistent "Data as of" formatting (Story 2-4 / FR8)

**Where:** `HeroSection.tsx` line 67; `page.tsx` (noscript) line 35; `MethodologySection.tsx` uses `formatDataAsOf()`.

**Issue:** Hero and noscript show raw ISO (e.g. "Data as of 2026-03-07"); Methodology shows a formatted date (e.g. "7 March 2026"). Same data, different presentation.

**Recommendation:** Use a shared formatter (e.g. export `formatDataAsOf` from a lib or from MethodologySection) and use it in HeroSection and in the noscript block so "Data as of" is consistent everywhere.

---

### 4. HeroSection `onSessionUpdate` type missing third parameter (Story 2-2)

**Where:** `HeroSection.tsx` line 10.

**Issue:** `HeroSectionProps` defines  
`onSessionUpdate?: (sinceArrived: number, elapsedSeconds: number) => void`  
but `Accumulator` calls it with three arguments: `(sessionVal, fromSession, ytdTotal)`. The implementation is correct; the type is incomplete.

**Recommendation:** Update the type to  
`(sinceArrived: number, elapsedSeconds: number, ytdTotal?: number) => void`  
so it matches Accumulator and PageClient.

---

### 5. `formatDataAsOf` and invalid dates (Story 2-4)

**Where:** `MethodologySection.tsx` lines 10–17.

**Issue:** If `isoDate` is malformed (e.g. `"invalid"`), `new Date(isoDate + "T00:00:00Z")` becomes an Invalid Date and `Intl.DateTimeFormat(...).format(d)` can output "Invalid Date" in the UI.

**Recommendation:** After parsing, check `Number.isNaN(d.getTime())` and return a fallback (e.g. empty string or "—") so the UI never shows "Invalid Date".

---

### 6. Story File List documentation (Stories 2-2, 2-4)

**Where:** Story 2-2 File List; Story 2-4 File List.

**Issue:**  
- 2-2 lists `_bmad-output/implementation-artifacts/sprint-status.yaml`. Sprint-status is tracking, not application source; listing it in "File List" blurs what was actually changed in code.  
- 2-4 lists "HeroSection.tsx (updated)" but doesn’t say what changed (methodology link). Makes it harder to trace scope from the story.

**Recommendation:** In File Lists, list only app/test source files and briefly note what changed (e.g. "HeroSection: added Methodology anchor link").

---

### 7. YTD region never appears if callback never runs (Story 2-2, edge case)

**Where:** Same as MEDIUM #1 — `ytdTotal > 0` gate in ContextStrip.

**Issue:** If the tab is hidden before the first rAF tick (e.g. user switches tab immediately), the visibility logic may prevent the loop from running and the callback might never fire, so YTD could never appear. Edge case; fixing MEDIUM #1 (initial YTD on mount) would also cover this.

**Recommendation:** Addressed by the same fix as MEDIUM #1.

---

## ✅ Acceptance Criteria Verification (summary)

| Story | AC | Status |
|-------|----|--------|
| **2-1** | Top 10 section, name/net worth/per-min, same data & rate, responsive, semantic + a11y | ✅ Implemented |
| **2-2** | YTD displayed, same formula, currency, hero/dedicated section | ✅ Implemented (with MEDIUM #1 caveat) |
| **2-3** | One comparison line, named entity + "earns [baseline] every [time]", same data, plain language, hide/fallback if missing | ✅ Implemented (with MEDIUM #2: two lines present) |
| **2-4** | 3%/5%/7%, sources + "Data as of", scannable/linkable, semantic, align with architecture/PRD | ✅ Implemented |

---

## Task completion audit

All tasks marked [x] in the four story files were checked against the codebase:

- **2-1:** TopTenList section, list content, responsive layout, semantic HTML/aria — present in `TopTenList.tsx`.
- **2-2:** YTD computation in `passive-income-calc.ts`; Accumulator passes `ytdTotal`; PageClient state and ContextStrip display — present. E2E in `wealthtracker.spec.ts` covers YTD region.
- **2-3:** HeroSection comparison line, formatComparisonDuration, conditional render — present.
- **2-4:** MethodologySection 3%/5%/7%, sources, Data as of, id="methodology", hero link — present.

No task marked [x] was found to be unimplemented.

---

## Next steps

Choose how to proceed:

1. **Fix them automatically** — Apply fixes for MEDIUM and (optionally) LOW issues in code and tests, and update story File Lists/Dev Agent Record where relevant.
2. **Create action items** — Add a "Review Follow-ups (AI)" subsection to each story’s Tasks with `- [ ] [AI-Review][Severity] Description [file:line]` for each finding.
3. **Show me details** — Deep dive into specific issues (e.g. suggested patch for YTD first-paint or comparison-line consolidation).

Reply with **1**, **2**, or the issue number(s) you want to explore.

---

## Code review fixes applied (2026-03-07)

All MEDIUM and LOW issues were fixed automatically:

- **MEDIUM 1 (YTD first paint):** PageClient now initializes `sessionData.ytdTotal` with `computeYtdTotal(entries, DEFAULT_RETURN_RATE)` so "So far this year" is visible on first paint.
- **MEDIUM 2 (two comparison lines):** Removed the duplicate comparison from Accumulator ("Every X seconds they earn what a typical American makes…"); HeroSection’s "[Name] earns a median annual salary every X" is the single hero comparison. Removed salary-pulse state/logic from Accumulator.
- **LOW 3 (Data as of formatting):** Added `src/lib/format-date.ts` with `formatDataAsOf` (invalid-date guard). HeroSection, MethodologySection, and page.tsx noscript now use it for consistent "Data as of" display.
- **LOW 4 (HeroSection type):** `onSessionUpdate` type now includes optional third parameter `ytdTotal?: number`.
- **LOW 5 (invalid dates):** `formatDataAsOf` returns `""` for missing or invalid ISO strings.
- **LOW 6 (File Lists):** Story 2-2 File List no longer includes sprint-status.yaml; Story 2-4 File List documents MethodologySection, HeroSection, and format-date.ts with brief change notes.
