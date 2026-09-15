# Season Transition Question V2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Season Transition Quiz to Version 2.0 by removing all Constellation/Meteor subsystems, implementing the revised 9-stage natural transition (`idle → rain → water-drop → mist → wind → leaf → sky-clear → question-reveal → question → answered`), and building the Competition Control Center with a timestamp-synchronized Timer Engine, Question Bank Dashboard, and Audit History.

**Architecture:** Decoupled engine architecture with pure-logic `QuestionSelector`, `TimerEngine`, and `HistoryManager`. State synchronized between Stage display and backstage Control Center via `BroadcastChannel API` (using timestamps to avoid per-second message flooding). Visual transitions rendered using HTML5 Canvas 2D without geometric candidate star nodes.

**Tech Stack:** React 19, TypeScript ~5.7, Vite 6.2, Vanilla CSS (Glassmorphism design system), Web Audio API, Vitest.

## Global Constraints
- Absolute removal of all constellation, meteor, candidate star nodes, and meteor trajectory code.
- State sequence: `idle → rain → water-drop → mist → wind → leaf → sky-clear → question-reveal → question → answered`.
- Question selection must be independent from Canvas particle systems.
- Timer sync across Stage and Controller must use timestamps (`startTimestamp`, `durationMs`) rather than broadcasting tick messages every second.
- LocalStorage split into dedicated namespaces: questions, contestants, session, history, settings.
- All tests in `tests/` must pass with 100% coverage on core engines.

---

### Task 1: Purge Constellation & Meteor Modules and Update Core Types

**Files:**
- Delete: `src/components/Stage/canvas/ConstellationSystem.ts`
- Delete: `src/components/Stage/canvas/MeteorSystem.ts`
- Modify: `src/types/question.ts`
- Modify: `src/types/session.ts`

**Interfaces:**
- Produces: Cleaned `Question`, `Contestant`, `AppState` (`idle | rain | water-drop | mist | wind | leaf | sky-clear | question-reveal | question | answered`), and `SyncMessage` types.

- [ ] **Step 1: Remove obsolete files**
Delete `src/components/Stage/canvas/ConstellationSystem.ts` and `src/components/Stage/canvas/MeteorSystem.ts`.

- [ ] **Step 2: Update `src/types/question.ts`**
Remove any star/meteor fields from `Question` interface, and ensure fields match V2 specification:
```ts
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionCategory = 'Rain' | 'Water' | 'Mist' | 'Wind' | 'Leaf' | 'Moon' | 'Final' | string;

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  round: string;
  enabled: boolean;
  used: boolean;
  tags?: string[];
  timeLimit?: number; // Optional custom time limit in seconds
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contestant {
  id: string;
  number: string;
  name: string;
  faculty: string;
  round: string;
  avatarUrl?: string;
  status?: 'waiting' | 'answering' | 'completed';
  questionsAnswered?: number;
  timeUsedMs?: number;
}
```

- [ ] **Step 3: Update `src/types/session.ts`**
Update `AppState` and `SyncMessage` without constellation/meteor references:
```ts
export type AppState =
  | 'idle'
  | 'rain'
  | 'water-drop'
  | 'mist'
  | 'wind'
  | 'leaf'
  | 'sky-clear'
  | 'question-reveal'
  | 'question'
  | 'answered';

export interface StageSession {
  sessionId: string;
  currentState: AppState;
  currentRound: string;
  selectedContestantId?: string;
  selectedQuestionId?: string;
  usedQuestionIds: string[];
  seed: number | string;
  isAudioMuted: boolean;
  audioVolume: number;
  stageProgress: number; // 0 to 1
  stageStartTime: number;
}
```

- [ ] **Step 4: Verify type compilation**
Run: `npx tsc --noEmit`
Expected: Only expected downstream reference errors in modules to be refactored next.

---

### Task 2: Revised State Machine & Transition Lighting Canvas System

**Files:**
- Modify: `src/engine/stateMachine.ts`
- Create: `src/components/Stage/canvas/TransitionLightingSystem.ts`
- Modify: `src/components/Stage/StageCanvas.tsx`
- Modify: `tests/stateMachine.test.ts`

**Interfaces:**
- Produces: `STAGE_SEQUENCE`, `STAGE_DURATION`, `getNextState(state)`, `isValidTransition(from, to)`.
- Produces: `TransitionLightingSystem` class with `update(dt, state, progress)` and `draw(ctx)`.

- [ ] **Step 1: Write test for revised State Machine**
Update `tests/stateMachine.test.ts` to assert the 9-stage sequence:
```ts
import { describe, it, expect } from 'vitest';
import { STAGE_SEQUENCE, STAGE_DURATION, getNextState, isValidTransition } from '../src/engine/stateMachine.ts';

describe('V2 State Machine', () => {
  it('should follow the 9-stage sequence without constellation or meteor', () => {
    expect(STAGE_SEQUENCE).toEqual([
      'idle', 'rain', 'water-drop', 'mist', 'wind', 'leaf', 'sky-clear', 'question-reveal', 'question', 'answered'
    ]);
  });

  it('should advance smoothly through stages', () => {
    expect(getNextState('leaf')).toBe('sky-clear');
    expect(getNextState('sky-clear')).toBe('question-reveal');
    expect(getNextState('question-reveal')).toBe('question');
  });

  it('should allow valid transitions and quick skip to question', () => {
    expect(isValidTransition('leaf', 'sky-clear')).toBe(true);
    expect(isValidTransition('mist', 'question')).toBe(true);
    expect(isValidTransition('idle', 'question')).toBe(false);
  });
});
```

- [ ] **Step 2: Implement `src/engine/stateMachine.ts`**
Update `src/engine/stateMachine.ts` with durations (total ~7.5s - 8s):
```ts
export const STAGE_DURATION: Record<AppState, number> = {
  'idle': 0,
  'rain': 1200,
  'water-drop': 1300,
  'mist': 1400,
  'wind': 1400,
  'leaf': 1800,
  'sky-clear': 1400,
  'question-reveal': 1000,
  'question': 0,
  'answered': 0
};
```

- [ ] **Step 3: Create `src/components/Stage/canvas/TransitionLightingSystem.ts`**
Implement ambient dawn glow, mist-clearing light beam, and soft shimmer for `sky-clear` and `question-reveal`.

- [ ] **Step 4: Update `src/components/Stage/StageCanvas.tsx`**
Remove `ConstellationSystem` and `MeteorSystem` imports and instances. Integrate `TransitionLightingSystem`.

- [ ] **Step 5: Run tests**
Run: `npm test tests/stateMachine.test.ts`
Expected: PASS.

---

### Task 3: Decoupled Question Selector Engine

**Files:**
- Modify: `src/engine/questionSelector.ts`
- Modify: `tests/questionSelector.test.ts`

**Interfaces:**
- Produces: `selectNextQuestion(options: SelectQuestionOptions): SelectedQuestionResult | null`.

- [ ] **Step 1: Write tests in `tests/questionSelector.test.ts`**
```ts
import { describe, it, expect } from 'vitest';
import { selectNextQuestion } from '../src/engine/questionSelector.ts';
import { Question } from '../src/types/question.ts';

const mockQuestions: Question[] = [
  { id: 'q1', text: 'Q1', category: 'Rain', difficulty: 'easy', round: 'Round 1', enabled: true, used: false, createdAt: '', updatedAt: '' },
  { id: 'q2', text: 'Q2', category: 'Wind', difficulty: 'medium', round: 'Round 1', enabled: true, used: true, createdAt: '', updatedAt: '' },
  { id: 'q3', text: 'Q3', category: 'Wind', difficulty: 'hard', round: 'Round 2', enabled: true, used: false, createdAt: '', updatedAt: '' },
  { id: 'q4', text: 'Q4', category: 'Leaf', difficulty: 'easy', round: 'Round 1', enabled: false, used: false, createdAt: '', updatedAt: '' }
];

describe('Decoupled Question Selector', () => {
  it('should filter out disabled and used questions', () => {
    const result = selectNextQuestion({ questions: mockQuestions, usedQuestionIds: ['q2'], round: 'Round 1' });
    expect(result?.question.id).toBe('q1');
  });

  it('should produce identical results given the same seed', () => {
    const res1 = selectNextQuestion({ questions: mockQuestions, usedQuestionIds: [], seed: 12345 });
    const res2 = selectNextQuestion({ questions: mockQuestions, usedQuestionIds: [], seed: 12345 });
    expect(res1?.question.id).toBe(res2?.question.id);
  });
});
```

- [ ] **Step 2: Implement `src/engine/questionSelector.ts`**
Clean pure logic with Mulberry32 PRNG integration, zero Canvas dependencies.

- [ ] **Step 3: Run test**
Run: `npm test tests/questionSelector.test.ts`
Expected: PASS.

---

### Task 4: Timer Engine & Synchronized Hook

**Files:**
- Create: `src/types/timer.ts`
- Create: `src/engine/timerEngine.ts`
- Create: `src/hooks/useTimer.ts`
- Create: `src/components/Stage/TimerDisplay.tsx`
- Create: `tests/timerEngine.test.ts`

**Interfaces:**
- Produces: `TimerState`, `TimerPreset`, `calculateRemainingMs`, `calculateTimeUsedMs`, `formatTimerDisplay`, `isWarningTime`.
- Produces: `useTimer(options)` hook.
- Produces: `<TimerDisplay timerState={...} />` component.

- [ ] **Step 1: Create `src/types/timer.ts`**
Define `TimerStatus`, `TimerState`, `TimerPreset`, and `TimerSyncAction`.

- [ ] **Step 2: Write tests in `tests/timerEngine.test.ts`**
Test `calculateRemainingMs(startTimestamp, durationMs, now)`, pause math, warning math, and formatting `01:30`.

- [ ] **Step 3: Implement `src/engine/timerEngine.ts`**
Implement pure time calculation utilities.

- [ ] **Step 4: Implement `src/hooks/useTimer.ts`**
Manage countdown with `requestAnimationFrame` or `setInterval` calculating exact `Date.now() - startTimestamp`.

- [ ] **Step 5: Implement `src/components/Stage/TimerDisplay.tsx`**
Visual HUD with time display, warning glow (at ≤30s), and finished pulse.

- [ ] **Step 6: Run tests**
Run: `npm test tests/timerEngine.test.ts`
Expected: PASS.

---

### Task 5: History Manager & Multi-Namespace Storage

**Files:**
- Create: `src/types/history.ts`
- Create: `src/engine/historyManager.ts`
- Modify: `src/utils/storage.ts`
- Create: `tests/historyManager.test.ts`
- Modify: `tests/storage.test.ts`

**Interfaces:**
- Produces: `HistoryRecord`, `addHistoryRecord`, `exportHistoryToJSON`, `exportHistoryToCSV`, `filterHistory`.
- Produces: `STORAGE_KEYS`, `loadHistory`, `saveHistory`, `loadSession`, `saveSession`, `validateQuestionsSchema`.

- [ ] **Step 1: Create `src/types/history.ts`**
Define `HistoryRecord` interface.

- [ ] **Step 2: Write tests in `tests/historyManager.test.ts`**
Test adding records, filtering by contestant/round, and exporting to CSV.

- [ ] **Step 3: Implement `src/engine/historyManager.ts`**
Implement CSV/JSON serializers and record generators.

- [ ] **Step 4: Update `src/utils/storage.ts`**
Implement separate namespaces: `season_transition_questions`, `season_transition_contestants`, `season_transition_session`, `season_transition_history`, `season_transition_settings`.

- [ ] **Step 5: Run tests**
Run: `npm test tests/historyManager.test.ts tests/storage.test.ts`
Expected: PASS.

---

### Task 6: Competition Control Center UI

**Files:**
- Create: `src/components/Control/QuestionBankDashboard.tsx`
- Create: `src/components/Control/TimerPanel.tsx`
- Create: `src/components/Control/HistoryPanel.tsx`
- Create: `src/components/Control/ControlCenter.tsx`
- Modify: `src/components/Control/RemoteController.tsx`
- Modify: `src/components/Control/ControlDrawer.tsx`

**Interfaces:**
- Produces: `<ControlCenter />` backstage operator dashboard with subpanels for Question Bank, Contestants, Session, Timer, and History.

- [ ] **Step 1: Implement `QuestionBankDashboard.tsx`**
Summary cards (Total, Enabled, Disabled, Used, Remaining), Search & Category/Round filters, Question list table, Add/Edit/Duplicate/Delete modals, Import JSON (with validation error reporting) and Export JSON.

- [ ] **Step 2: Implement `TimerPanel.tsx`**
Preset buttons (30s, 60s, 90s, 120s, Custom), Set Duration, Start, Pause, Resume, Reset buttons, and Live countdown display.

- [ ] **Step 3: Implement `HistoryPanel.tsx`**
Audit table showing timestamp, contestant, question, time used, status, and Export CSV / Export JSON buttons.

- [ ] **Step 4: Implement `ControlCenter.tsx` and integrate into `RemoteController.tsx` & `ControlDrawer.tsx`**
Unified responsive console with navigation tabs (`Stage Control`, `Question Bank`, `Timer`, `Contestants`, `History`, `Settings`).

---

### Task 7: Audio Engine, BroadcastChannel Sync & Stage Polish

**Files:**
- Modify: `src/engine/audioEngine.ts`
- Modify: `src/hooks/useStageSync.ts`
- Modify: `src/components/Stage/StageOverlay.tsx`
- Modify: `src/components/Stage/QuestionCard.tsx`
- Modify: `src/components/Stage/CinematicNarrator.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces: `audioEngine` with `playSkyTransition`, `playQuestionReveal`, `playTimerWarning`, `playTimerFinish` (no celestial/meteor methods).
- Produces: `useStageSync` supporting full V2 message catalog.

- [ ] **Step 1: Update `src/engine/audioEngine.ts`**
Remove `playCelestialShimmer` and `playMeteorWhoosh`. Add synthesized chimes for `playTimerWarning` and `playTimerFinish`.

- [ ] **Step 2: Update `src/hooks/useStageSync.ts`**
Integrate `TimerState` and handle timestamp-based timer broadcast messages.

- [ ] **Step 3: Update `StageOverlay.tsx` and `QuestionCard.tsx`**
Display `TimerDisplay` cleanly without obstruction. Add smooth reveal effects.

- [ ] **Step 4: Update `App.tsx` and `index.css`**
Connect all components, verify keyboard shortcuts (`Space`, `Enter`, `Esc`, `KeyM`, `KeyF`, `KeyT`).

---

### Task 8: Verification & End-to-End Suite

**Files:**
- Modify: `tests/audioEngine.test.ts`
- Modify: `tests/e2e.test.ts`
- Modify: `README.md`

- [ ] **Step 1: Update `tests/audioEngine.test.ts` and `tests/e2e.test.ts`**
Ensure tests verify the complete lifecycle and no longer reference removed methods.

- [ ] **Step 2: Run all Vitest suites**
Run: `npm test`
Expected: 100% tests passing across all test files.

- [ ] **Step 3: Check TypeScript compilation**
Run: `npm run build`
Expected: Clean build without errors or warnings.

- [ ] **Step 4: Grep search check for obsolete keywords**
Run grep for `constellation` and `meteor` in `src/` to confirm zero dead references.
