# Competition Flow Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow backstage operators to choose between **Keyword Mode (โหมดสุ่มคำสำคัญ)** and **Question Bank Mode (โหมดสุ่มคลังคำถาม)** with dedicated stage presentations, state machine flows, and quick controller toggles.

**Architecture:** Extend `AppearanceSettings` and `SessionState` with `quizMode: 'keyword' | 'question'`. Adapt `stateMachine.ts` and `useStageSync.ts` to support immediate keyword answering, and build a royal `KeywordShowcaseCard` on stage for keyword mode while maintaining full question flow for question bank mode.

**Tech Stack:** React 19, TypeScript 5.7, Vitest, CSS Glassmorphism.

---

## Global Constraints

- Preserve all 30 existing test suites without regressions.
- Maintain seamless dual-window synchronization over `BroadcastChannel`.
- Default to `'question'` mode for backward compatibility.

---

## Tasks Breakdown

### Task 1: Type Definitions & State Machine Update
**Files:**
- Modify: `src/types/appearance.ts`
- Modify: `src/engine/stateMachine.ts`
- Modify: `src/hooks/useStageSync.ts`
- Test: `tests/stateMachine.test.ts`

- [ ] **Step 1:** Write failing tests in `tests/stateMachine.test.ts` for `getNextState` with `quizMode === 'keyword'`.
- [ ] **Step 2:** Add `CompetitionFlowMode = 'keyword' | 'question'` in `src/types/appearance.ts`.
- [ ] **Step 3:** Update `getNextState` in `src/engine/stateMachine.ts` and `useStageSync.ts` auto-progression & `markAnswered`.
- [ ] **Step 4:** Run tests and verify they pass.

---

### Task 2: Stage Keyword Showcase Card & Overlay Adaptation
**Files:**
- Create: `src/components/Stage/KeywordShowcaseCard.tsx`
- Modify: `src/components/Stage/StageOverlay.tsx`
- Modify: `src/index.css`
- Test: `tests/stageTransitions.test.ts`

- [ ] **Step 1:** Create `KeywordShowcaseCard.tsx` with royal glassmorphic styling, category badge, and glowing keyword text.
- [ ] **Step 2:** Add CSS styles in `src/index.css` for `.keyword-showcase-card`, `.keyword-showcase-title`, and `.keyword-showcase-cat`.
- [ ] **Step 3:** Update `StageOverlay.tsx` to render `KeywordShowcaseCard` when `quizMode === 'keyword'` during question/answering phase.
- [ ] **Step 4:** Add unit tests in `tests/stageTransitions.test.ts` asserting keyword showcase rendering.
- [ ] **Step 5:** Run tests and verify they pass.

---

### Task 3: Backstage Quick Switcher & Appearance Settings UI
**Files:**
- Modify: `src/components/Control/AppearanceSettings.tsx`
- Modify: `src/components/Control/ControlDrawer.tsx`
- Test: `tests/appearancePanel.test.tsx`

- [ ] **Step 1:** Add Competition Mode toggle in `AppearanceSettings.tsx` with visual icons and descriptions.
- [ ] **Step 2:** Add Quick Mode Switcher in `ControlDrawer.tsx` header for instant 1-click toggling.
- [ ] **Step 3:** Write tests in `tests/appearancePanel.test.tsx` asserting mode switching and persistence.
- [ ] **Step 4:** Run tests and verify they pass.

---

### Task 4: Full System Verification & Build
- [ ] **Step 1:** Run all 30 Vitest suites (`npm run test`).
- [ ] **Step 2:** Run TypeScript build (`npm run build`).

---

## Verification Plan

### Automated Tests
```bash
npm run test
npm run build
```

### Manual Verification
1. Open Backstage Drawer $\rightarrow$ Switch to **🏷️ โหมดคำสำคัญ (Keyword)** $\rightarrow$ Click "เริ่มสุ่ม"
2. Observe Stage: Spins keyword $\rightarrow$ Locks $\rightarrow$ Displays large royal `KeywordShowcaseCard` with countdown timer.
3. Switch to **📜 โหมดคลังคำถาม (Question Bank)** $\rightarrow$ Click "เริ่มสุ่ม"
4. Observe Stage: Spins keyword $\rightarrow$ Locks $\rightarrow$ Reveals full `QuestionCard` from question bank.
