# Task 3 Report: Dynamic Question Lock Effect & Stage Overlay Integration

**Status:** DONE
**Summary:**
- Updated `WordLockEffect.tsx` to display `✦ SELECTED QUESTION ✦` with question title when in question mode, and `✦ SELECTED KEYWORD ✦` with keyword when in keyword mode.
- Updated `StageOverlay.tsx` to dynamically pass question pool and `selectedQuestion` to `WordCarousel` during question mode, and keyword pool and `selectedWordItem` during keyword mode.
- Added tests in `tests/stageTransitions.test.ts` for question lock mode and confirmed full passing (8/8).
