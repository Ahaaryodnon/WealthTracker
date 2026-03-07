# Story 3.1: Share bar (Web Share API or copy)

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **visitor**,
I want **one primary action to share the page (native share or copy link)**,
so that **I can easily pass the experience to others**.

---

## Acceptance Criteria

1. **Given** I am on the WealthTracker page  
   **When** I tap or click the Share CTA (e.g. "Share" button)  
   **Then** the app uses the Web Share API when available, or falls back to copying the link (or a prepared message) to the clipboard (FR7)  
   **And** the button has a clear label, is keyboard-focusable, and has a minimum 44×44px touch target (NFR7)  
   **And** after copy, I get brief feedback (e.g. "Link copied") that is accessible (e.g. live region or focus management)  
   **And** there is only one primary share CTA per the UX spec (no competing primary buttons in the hero)

---

## Tasks / Subtasks

- [x] **Task 1: Web Share API with copy fallback** (AC: #1)
  - [x] On Share CTA click: if `navigator.share` is available, call it with title, text, and url (e.g. current page URL). Else fall back to copying link or a prepared message (e.g. share text + URL) to clipboard via `navigator.clipboard.writeText`. Handle user cancel and errors gracefully (no uncaught exceptions). [Source: FR7, architecture — Share via Web Share API with copy fallback]
- [x] **Task 2: Clear label, keyboard, touch target** (AC: #1)
  - [x] Share control has a clear label (e.g. "Share" or "Copy link"). Keyboard-focusable (button or focusable link); visible focus indicator. Minimum 44×44px touch target (NFR7). [Source: ux-design-specification.md, NFR7]
- [x] **Task 3: Post-copy feedback** (AC: #1)
  - [x] After successful copy, show brief feedback (e.g. "Link copied") that is accessible: e.g. `aria-live="polite"` region or focus management so screen readers announce it. Auto-dismiss after a few seconds. [Source: UX feedback patterns]
- [x] **Task 4: One primary share CTA** (AC: #1)
  - [x] Only one primary share CTA on the page (e.g. in share bar/section). No competing primary button in the hero; hero remains focused on Accumulator. [Source: UX — one primary CTA per view]

---

## Dev Notes

### Epic & business context

- **Epic 3:** Share and reliability. Share bar enables viral spread and citation.
- **FRs delivered:** FR7 (share: Web Share API or copy). NFR7 (accessibility, touch target).
- **Dependencies:** Epic 1 (page and data). ShareSection already exists; verify it meets all AC.

### Developer context – guardrails

- **Existing component.** `src/components/sections/ShareSection.tsx` exists: uses `navigator.share` with copy fallback, share text + URL, copied state with timeout. Verify: (1) clear label, (2) keyboard-focusable and 44×44px touch target, (3) accessible feedback ("Link copied" in live region or equivalent), (4) only one primary share CTA on page (no duplicate in hero). [Source: ShareSection.tsx]
- **UX.** One primary CTA; min 44×44px; feedback pattern for copy. [Source: ux-design-specification.md]

### Project structure notes

- **Existing:** `src/components/sections/ShareSection.tsx`, PageClient passes `sinceArrived` and `elapsedSeconds` for dynamic share text.
- **Updated:** ShareSection only if gaps (label, focus, touch target, live region for "Link copied"). Ensure no second primary share button in HeroSection.

---

## Technical requirements (dev agent guardrails)

| Requirement | Detail |
|------------|--------|
| **Web Share** | Use `navigator.share({ title, text, url })` when available. |
| **Fallback** | `navigator.clipboard.writeText(shareText + " " + url)` (or link only); handle missing clipboard API. |
| **Label** | Visible "Share" or "Copy link" (or both with one primary). |
| **Accessibility** | Focusable, visible focus ring; 44×44px min; "Link copied" in aria-live region or status. |
| **Single CTA** | One primary share control; no duplicate in hero. |

---

## Architecture compliance

- **Requirements to Structure Mapping:** Share bar → `ShareBar.tsx` / ShareSection. [Architecture]
- **No backend:** Share is client-only; no server round-trip. [Architecture: API & Communication]

---

## File structure requirements (this story only)

**Touch:** `src/components/sections/ShareSection.tsx` to satisfy AC (label, focus, touch target, feedback). Confirm single primary CTA across page.

---

## Testing requirements

- **Manual:** Click Share; verify Web Share dialog or copy; verify "Link copied" (or equivalent); keyboard tab to button and activate; check touch target size; ensure only one primary share CTA.
- **Accessibility:** Focus order, screen reader announcement of feedback.

---

## References

- Epics: `_bmad-output/planning-artifacts/epics.md` Story 3.1. UX: `_bmad-output/planning-artifacts/ux-design-specification.md`. Architecture: `_bmad-output/planning-artifacts/architecture.md`.

---

## Dev Agent Record

### Agent Model Used

(Cursor / dev-story workflow.)

### Completion Notes List

- **Task 1:** ShareSection already used `navigator.share` with fallback to copy. Enhanced: optional chaining for `navigator.clipboard?.writeText`; fallback to copy URL only if full text fails; AbortError (user cancel) not treated as error; no uncaught exceptions.
- **Task 2:** Primary Share button has visible "Share" label and `aria-label="Share"`. Copy button has "Copy link" / "Link copied" aria-label. Both buttons: `focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2`; `min-h-[44px]` and `h-12` (≥44px), `min-w-[160px]` for touch target (NFR7).
- **Task 3:** Added `role="status" aria-live="polite" aria-atomic="true"` sr-only div (`#share-copy-status`) that shows "Link copied" when copied; auto-dismiss 2.5s. Button text "Copied!" for visual feedback.
- **Task 4:** Confirmed HeroSection has no Share/Copy buttons; only ShareSection has primary share CTA. E2E test added to assert zero share buttons in hero.
- **Code review (2026-03-07) fixes:** MEDIUM #1: Copy button visible text changed from "Copy fact" to "Copy link" (AC alignment). LOW #4: `await handleCopy()` in share fallback. LOW #5: E2E comment added for `#share-copy-status` locator. MEDIUM #2 (git vs File List): Commit application changes and keep File List in sync to clear.

### File List

- `src/components/sections/ShareSection.tsx` (modified)
- `tests/e2e/wealthtracker.spec.ts` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
