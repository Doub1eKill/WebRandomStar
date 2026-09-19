# Word Lock Phase Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a configurable setting in the Backstage Appearance Panel and Control Drawer to enable or disable the "Selected Keyword Showcase" (`word-lock`) stage phase transition.

**Architecture:** Extend `AppearanceSettings` with `showWordLockPhase: boolean` (default: `true`), update `getNextState` in `stateMachine.ts` and automated progression in `useStageSync.ts`, and provide toggle controls in `AppearanceSettings.tsx` and `ControlDrawer.tsx`.

**Tech Stack:** React 19, TypeScript, Vitest, CSS / Glassmorphism.

---

### Task 1: Type Definitions and State Machine Transition

**Files:**
- Modify: `src/types/appearance.ts:31-64`
- Modify: `src/engine/stateMachine.ts:40-50`
- Test: `tests/stateMachine.test.ts`

**Interfaces:**
- Consumes: `AppState`, `AppearanceSettings`
- Produces: `getNextState(currentState: AppState, showWordLockPhase?: boolean): AppState`

- [ ] **Step 1: Write the failing tests in `tests/stateMachine.test.ts`**

```typescript
it('skips word-lock phase when showWordLockPhase is false', () => {
  expect(getNextState('word-decelerate', false)).toBe('question-reveal');
});

it('includes word-lock phase when showWordLockPhase is true', () => {
  expect(getNextState('word-decelerate', true)).toBe('word-lock');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stateMachine.test.ts`
Expected: FAIL

- [ ] **Step 3: Update `src/types/appearance.ts` and `src/engine/stateMachine.ts`**

In `src/types/appearance.ts`:
```typescript
export interface AppearanceSettings {
  // ...
  showWordLockPhase?: boolean;
}

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  // ...
  showWordLockPhase: true
};
```

In `src/engine/stateMachine.ts`:
```typescript
export function getNextState(currentState: AppState, showWordLockPhase: boolean = true): AppState {
  if (currentState === 'word-decelerate' && !showWordLockPhase) {
    return 'question-reveal';
  }
  const currentIndex = STAGE_SEQUENCE.indexOf(currentState);
  if (currentIndex === -1 || currentIndex === STAGE_SEQUENCE.length - 1) {
    return 'idle';
  }
  return STAGE_SEQUENCE[currentIndex + 1];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/stateMachine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/appearance.ts src/engine/stateMachine.ts tests/stateMachine.test.ts
git commit -m "feat(engine): support skipping word-lock phase in state machine"
```

---

### Task 2: Integrate Transition in Stage Sync Hook

**Files:**
- Modify: `src/hooks/useStageSync.ts:175-225`
- Test: `tests/stateMachine.test.ts`

**Interfaces:**
- Consumes: `session.appearanceSettings.showWordLockPhase`
- Produces: Automatic stage timer progression utilizing `getNextState` with `showWordLockPhase` flag.

- [ ] **Step 1: Update `useStageSync.ts`**

In `src/hooks/useStageSync.ts`:
```typescript
const showWordLock = session.appearanceSettings?.showWordLockPhase ?? true;
const next = getNextState(session.currentState, showWordLock);
```

- [ ] **Step 2: Run tests to verify**

Run: `npx vitest run tests/stateMachine.test.ts tests/wordSpinStopModeSync.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useStageSync.ts
git commit -m "feat(stage): connect showWordLockPhase setting to stage progression hook"
```

---

### Task 3: Add Toggle Controls in Backstage Panels

**Files:**
- Modify: `src/components/Control/AppearanceSettings.tsx`
- Modify: `src/components/Control/ControlDrawer.tsx`
- Test: `tests/appearancePanel.test.tsx`

**Interfaces:**
- Consumes: `AppearanceSettings`, `onChange(settings)`
- Produces: UI toggle buttons for "ช่วงแสดงการ์ดคำที่สุ่มได้ (Selected Keyword Showcase)"

- [ ] **Step 1: Write test in `tests/appearancePanel.test.tsx`**

Verify that clicking the Word Lock Phase toggle calls `onChange` with updated `showWordLockPhase`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/appearancePanel.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement toggle in `AppearanceSettings.tsx` and `ControlDrawer.tsx`**

In `AppearanceSettings.tsx`:
Add a toggle button in the transitions section allowing user to switch `showWordLockPhase` between `true` and `false`.

In `ControlDrawer.tsx`:
Add a setting toggle under the stage control section.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/appearancePanel.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Control/AppearanceSettings.tsx src/components/Control/ControlDrawer.tsx tests/appearancePanel.test.tsx
git commit -m "feat(ui): add word lock phase toggle button in Appearance settings and Control Drawer"
```

---

### Task 4: Complete Verification

- [ ] **Step 1: Run entire Vitest test suite**

Run: `npx vitest run`
Expected: All test suites PASS

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Build succeeds with code 0
