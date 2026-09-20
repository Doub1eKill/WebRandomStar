# Task 1: Generic Spin Reel Engine & Tests

**Files:**
- Modify: `src/engine/wordSpinEngine.ts`
- Modify: `tests/wordSpinEngine.test.ts`

**Interfaces:**
- Produces: `generateSpinReel<T extends { id: string; enabled?: boolean }>(allItems: T[], targetItem: T, reelLength?: number, seed?: string): T[]`
- Produces: `getDisplayText(item: any): string`

**Requirements:**
1. Update `generateSpinReel` in `src/engine/wordSpinEngine.ts` with generic typing `<T extends { id: string; enabled?: boolean }>` so it can create deterministic reels for arrays of `Question` or `KeywordItem`.
2. Add a helper function `getDisplayText(item: any): string` that returns `item.text` (if `Question`) or `item.word` (if `KeywordItem`) or `String(item || '')`.
3. Add unit tests in `tests/wordSpinEngine.test.ts` verifying:
   - Generating a reel of `Question` objects guarantees that the last item is the predetermined `targetQuestion`.
   - `getDisplayText` correctly extracts the text for both questions and keyword items.
4. Ensure all existing tests in `tests/wordSpinEngine.test.ts` pass.

**Report file:** `.superpowers/sdd/2026-09-20-dynamic-question-spin-reel/task-1-report.md`
