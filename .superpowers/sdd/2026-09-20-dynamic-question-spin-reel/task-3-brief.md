# Task 3: Dynamic Question Lock Effect & Stage Overlay Integration

**Files:**
- Modify: `src/components/Stage/WordSpin/WordLockEffect.tsx`
- Modify: `src/components/Stage/StageOverlay.tsx`
- Modify: `tests/stageTransitions.test.ts`

**Requirements:**
1. Update `WordLockEffect.tsx`:
   - Accept `quizMode?: 'keyword' | 'question'`, `question?: Question | null`, and `wordItem?: KeywordItem | null`.
   - When `quizMode === 'question'`:
     - Render seal text: `✦ SELECTED QUESTION ✦`
     - Render locked question title/text: `question?.text`
     - Render category badge: `หมวด: {category.toUpperCase()}`
     - Render cue: `กำลังเปิดเผยการ์ดคำถาม...`
   - When `quizMode === 'keyword'`:
     - Render seal text: `✦ SELECTED KEYWORD ✦`
     - Render locked keyword: `wordItem?.word`
2. Update `StageOverlay.tsx`:
   - Import `loadQuestions` and `loadWords` from `../../utils/storage.ts`.
   - When `isSpinning`:
     - If `session.appearanceSettings?.quizMode === 'keyword'`: pass `allWords` (or `loadWords()`) and `targetWord={session.selectedWordItem}`, with `displayType="keyword"`.
     - Else (`quizMode === 'question'`): pass `items={loadQuestions().filter(q => q.enabled !== false && (!session.selectedRound || q.round === session.selectedRound))}` and `targetItem={session.selectedQuestion}`, with `displayType="question"`.
   - When `isWordLocked`:
     - Pass `quizMode={session.appearanceSettings?.quizMode}` and `question={session.selectedQuestion}` and `wordItem={session.selectedWordItem}` to `WordLockEffect`.
3. Update `tests/stageTransitions.test.ts`:
   - Add tests checking that `StageOverlay` renders question spin items when `quizMode === 'question'` and keyword spin items when `quizMode === 'keyword'`.

**Report file:** `.superpowers/sdd/2026-09-20-dynamic-question-spin-reel/task-3-report.md`
