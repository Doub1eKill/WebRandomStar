# Dynamic Question Spin Reel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement dynamic question spinning in Question Bank Mode so actual question sentences flow across the stage carousel during spin and lock phases instead of keywords.

**Architecture:** Extend `generateSpinReel` in `wordSpinEngine.ts` to support generic spin items (`Question` and `KeywordItem`). Update `WordCarousel` and its 4 view variants (`Ribbon`, `Vertical`, `3D`, `Orbital`) to render question text cleanly with text auto-adaptation, and update `WordLockEffect` and `StageOverlay` to conditionally render question text when `quizMode === 'question'`.

**Tech Stack:** React 19, TypeScript, Vitest, Vanilla CSS, Vite.

---

## Global Constraints
- Must maintain 100% test coverage across all existing 30 test suites.
- Must preserve cosmic royal glassmorphism visual styling.
- `quizMode: 'question'` spins Question items; `quizMode: 'keyword'` spins Keyword items.

---

### Task 1: Generic Spin Reel Engine & Tests

**Files:**
- Modify: `src/engine/wordSpinEngine.ts`
- Modify: `tests/wordSpinEngine.test.ts`

**Interfaces:**
- Produces: `generateSpinReel<T extends { id: string }>(allItems: T[], targetItem: T, reelLength?: number, seed?: string): T[]`
- Produces: `getDisplayText(item: any): string`

- [ ] **Step 1: Write the failing test in `tests/wordSpinEngine.test.ts`**

```typescript
it('generates a question spin reel where the final item is the target question', () => {
  const sampleQuestions: Question[] = [
    { id: 'Q1', text: 'คำถามข้อที่ 1', category: 'general', difficulty: 'easy', round: 'intro', enabled: true },
    { id: 'Q2', text: 'คำถามข้อที่ 2', category: 'general', difficulty: 'easy', round: 'intro', enabled: true },
    { id: 'Q3', text: 'คำถามข้อที่ 3', category: 'general', difficulty: 'easy', round: 'intro', enabled: true }
  ];
  const target = sampleQuestions[1];
  const reel = generateSpinReel(sampleQuestions, target, 20, 'test_seed');
  expect(reel.length).toBe(20);
  expect(reel[19].id).toBe('Q2');
  expect(reel[19].text).toBe('คำถามข้อที่ 2');
});
```

- [ ] **Step 2: Run test to verify it fails or needs generic type signature**
Run: `npx vitest run tests/wordSpinEngine.test.ts`

- [ ] **Step 3: Update `src/engine/wordSpinEngine.ts`**
Add generic typing to `generateSpinReel`:
```typescript
export function generateSpinReel<T extends { id: string; enabled?: boolean }>(
  allItems: T[],
  targetItem: T,
  reelLength: number = 30,
  seed?: string
): T[] {
  const enabledItems = allItems.filter(w => w.enabled !== false);
  const pool = enabledItems.length > 0 ? enabledItems : [targetItem];
  const prng = createPRNG(seed || `reel_seed_${Date.now()}`);

  const reel: T[] = [];
  for (let i = 0; i < reelLength - 1; i++) {
    reel.push(randomChoice(pool, prng));
  }
  reel.push(targetItem);
  return reel;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/wordSpinEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/engine/wordSpinEngine.ts tests/wordSpinEngine.test.ts
git commit -m "feat(engine): support generic spin reel generation for questions and keywords"
```

---

### Task 2: Stage Spin Carousel & Spin Views Text Auto-Adaptation

**Files:**
- Modify: `src/components/Stage/WordSpin/types.ts`
- Modify: `src/components/Stage/WordSpin/WordCarousel.tsx`
- Modify: `src/components/Stage/WordSpin/RibbonSpinView.tsx`
- Modify: `src/components/Stage/WordSpin/VerticalSpinView.tsx`
- Modify: `src/components/Stage/WordSpin/Perspective3DSpinView.tsx`
- Modify: `src/components/Stage/WordSpin/OrbitalSpinView.tsx`
- Modify: `src/index.css`
- Modify: `tests/wordCarouselModes.test.ts`

**Interfaces:**
- Consumes: `generateSpinReel` from `wordSpinEngine.ts`
- Produces: `WordCarousel` accepting `items?: (KeywordItem | Question)[]`, `targetItem?: KeywordItem | Question | null`, `displayType?: 'keyword' | 'question'`

- [ ] **Step 1: Write test in `tests/wordCarouselModes.test.ts`**
Verify `WordCarousel` renders question text when provided question items.

- [ ] **Step 2: Update `types.ts` and `WordCarousel.tsx`**
Support `displayText` resolution: `(item as Question).text || (item as KeywordItem).word || ''`.
Add `isQuestion` CSS styling in `RibbonSpinView`, `VerticalSpinView`, `Perspective3DSpinView`, `OrbitalSpinView`.

- [ ] **Step 3: Update `src/index.css`**
Add styles for `.ribbon-word-item.is-question`, `.carousel-word-item.is-question` for responsive font size (`clamp(0.95rem, 2vw, 1.35rem)`), proper max-width, ellipsis, and multi-line safety.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/wordCarouselModes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/Stage/WordSpin/ src/index.css tests/wordCarouselModes.test.ts
git commit -m "feat(stage): add question text auto-adaptation to spin carousel views"
```

---

### Task 3: Dynamic Question Lock Effect & Stage Overlay Integration

**Files:**
- Modify: `src/components/Stage/WordSpin/WordLockEffect.tsx`
- Modify: `src/components/Stage/StageOverlay.tsx`
- Modify: `tests/stageTransitions.test.ts`

**Interfaces:**
- Consumes: `SessionState`, `quizMode`
- Produces: `StageOverlay` and `WordLockEffect` dynamically switching between question and keyword display based on `session.appearanceSettings?.quizMode`.

- [ ] **Step 1: Write test in `tests/stageTransitions.test.ts`**
Test that `StageOverlay` in question mode renders question text during `word-spin` and `word-lock`.

- [ ] **Step 2: Update `WordLockEffect.tsx`**
Add `quizMode?: 'keyword' | 'question'` and `question?: Question | null` prop.
When `quizMode === 'question'`, render `✦ SELECTED QUESTION ✦` header and the question text.

- [ ] **Step 3: Update `StageOverlay.tsx`**
In `StageOverlay.tsx`, load available questions (via `loadQuestions()` or session questions) and pass `items={allQuestions}` & `targetItem={session.selectedQuestion}` when `session.appearanceSettings?.quizMode !== 'keyword'`. Pass `quizMode` and `question={session.selectedQuestion}` to `WordLockEffect`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/stageTransitions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/Stage/WordSpin/WordLockEffect.tsx src/components/Stage/StageOverlay.tsx tests/stageTransitions.test.ts
git commit -m "feat(stage): integrate question spin reel and lock showcase in StageOverlay"
```

---

### Task 4: Comprehensive Verification & Build

- [ ] **Step 1: Run all vitest suites**
Run: `npx vitest run`
Expected: All 30+ suites / 140+ tests PASS.

- [ ] **Step 2: Run production TypeScript build**
Run: `npm run build`
Expected: 0 errors.

- [ ] **Step 3: Commit all remaining clean files if any**
```bash
git status
```
