# Code Review Findings: 3-1-share-bar

**Story:** 3-1-share-bar (Share bar – Web Share API or copy)  
**Story file:** `_bmad-output/implementation-artifacts/3-1-share-bar.md`  
**Status at review:** review  
**Review date:** 2026-03-07  

---

## Git vs Story Discrepancies

- **Story File List:** `ShareSection.tsx`, `wealthtracker.spec.ts`, `sprint-status.yaml` (modified).
- **Git status:** Repo shows `src/` and `tests/` as untracked (`??`). No modified tracked paths under `src/` or `tests/` in the collected diff output.
- **Discrepancy:** Story claims application files were modified; git does not show those paths as modified in the working tree (either uncommitted, or different repo state). **Count: 1** (process/transparency).

---

## AC Validation Summary

| AC | Requirement | Verdict | Evidence |
|----|-------------|---------|----------|
| 1 | Web Share when available, else copy link/message | IMPLEMENTED | `ShareSection.tsx`: `navigator.share` with `handleCopy` fallback; `handleCopy` uses `clipboard.writeText` with URL-only fallback |
| 1 | Clear label, keyboard-focusable, 44×44px touch target | PARTIAL | Labels and focus ring present; **visible Copy button label is "Copy fact" not "Copy link"** (see finding below) |
| 1 | Accessible "Link copied" feedback | IMPLEMENTED | `#share-copy-status` with `role="status"` `aria-live="polite"`; button shows "Copied!" |
| 1 | One primary share CTA only | IMPLEMENTED | `HeroSection.tsx` has no Share/Copy buttons; E2E asserts zero share buttons in hero |

---

## Task Completion Audit

| Task | Marked | Actually done | Proof |
|------|--------|----------------|--------|
| 1 Web Share + copy fallback | [x] | Yes | Lines 23–60: optional chaining, URL fallback, AbortError handling |
| 2 Label, keyboard, 44×44px | [x] | Partial | Focus ring and size OK; **visible text "Copy fact" vs AC "Copy link"** |
| 3 Post-copy feedback | [x] | Yes | Lines 96–104: sr-only live region "Link copied"; button "Copied!"; 2.5s timeout |
| 4 One primary CTA | [x] | Yes | HeroSection has no share buttons; E2E in `wealthtracker.spec.ts` |

---

## Issues Found

### HIGH (0)

- None.

### MEDIUM (2)

1. **Visible Copy button label vs AC (ShareSection.tsx)**  
   - **Where:** `ShareSection.tsx` ~line 166: visible text is "Copy fact".  
   - **AC / Tech table:** "Clear label (e.g. 'Share' or 'Copy link')"; "Visible 'Share' or 'Copy link' (or both with one primary)".  
   - **Issue:** aria-label is "Copy link" / "Link copied" (correct). Visible label is "Copy fact", which does not match the specified "Copy link".  
   - **Fix:** Change visible button text from "Copy fact" to "Copy link" so label matches AC and aria-label.

2. **Story File List vs git (process)**  
   - **Where:** Story Dev Agent Record → File List.  
   - **Issue:** Story lists `src/components/sections/ShareSection.tsx` and `tests/e2e/wealthtracker.spec.ts` as modified. Git status shows `src/` and `tests/` as untracked; no modified tracked files under those trees in the captured diff. Either changes are uncommitted or repo state differs.  
   - **Fix:** Commit story changes and ensure File List matches committed files; or document that review was done against working tree.

### LOW (3)

3. **No user feedback when clipboard is fully unavailable (ShareSection.tsx)**  
   - **Where:** `handleCopy` inner catch block (lines 37–40).  
   - **Issue:** If both full-text and URL-only `writeText` fail, the code does nothing and the user gets no feedback.  
   - **Suggestion:** Optionally show a brief message (e.g. "Couldn't copy") or leave as-is and document the silent-fail behavior.

4. **handleShare fallback does not await handleCopy (ShareSection.tsx)**  
   - **Where:** Lines 52–55: `handleCopy()` is called without `await`.  
   - **Issue:** When `navigator.share` fails (non-AbortError), copy runs asynchronously; any future logic that depended on copy completion would need to await.  
   - **Suggestion:** Low impact for current behavior; consider `await handleCopy()` for consistency if you add post-copy logic later.

5. **E2E tied to implementation id (wealthtracker.spec.ts)**  
   - **Where:** `page.locator("#share-copy-status")` in Epic 3 copy-feedback test.  
   - **Issue:** Test is coupled to DOM id. Prefer `getByRole("status", { name: "Link copied" })` where feasible; sr-only may affect role/name in some runners.  
   - **Suggestion:** Keep current locator if more reliable in your environment; optionally add a short comment explaining the choice.

---

## Summary

- **Git vs Story discrepancies:** 1 (uncommitted/untracked vs File List).  
- **Issues:** 0 High, 2 Medium, 3 Low.  
- **AC:** One partial (Copy button visible label). All other AC and tasks are implemented as claimed.

---

## Recommended Next Steps

1. ~~**Fix MEDIUM #1:** Change Copy button visible text from "Copy fact" to "Copy link."~~ **DONE** (ShareSection.tsx)
2. **Fix or document MEDIUM #2:** Commit story changes and align File List with git. (Story Dev Agent Record updated with note.)
3. ~~**LOW #4:** `await handleCopy()` in handleShare fallback.~~ **DONE**
4. ~~**LOW #5:** E2E comment for #share-copy-status.~~ **DONE**
