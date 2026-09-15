# Design Specification: Season Transition Question (V2.0 — No Constellation / No Meteor)

**Date**: 2026-09-14  
**Status**: Approved  
**Author**: Antigravity  

---

## 1. Executive Summary

This document specifies the technical architecture for Version 2.0 of the **Season Transition Question** web application (`season-transition-quiz`). 

The system transitions from an initial star/constellation/meteor concept to an atmospheric nature-based transition model (**Rain → Water Drop → Mist → Wind → Leaf → Sky Clear → Question Reveal**), while introducing an enterprise-grade backstage **Competition Control Center** with a **Question Bank Dashboard**, **Timer Engine**, **Session Management**, and **Audit History Tracking**.

---

## 2. Requirements & Non-Goals

### 2.1 Core Objectives
1. **Remove all Constellation and Meteor subsystems**: Eliminate `ConstellationSystem.ts`, `MeteorSystem.ts`, star candidate nodes, trajectory calculations, and related sound effects.
2. **Implement Revised Natural Transition**:
   $$\text{idle} \rightarrow \text{rain} \rightarrow \text{water-drop} \rightarrow \text{mist} \rightarrow \text{wind} \rightarrow \text{leaf} \rightarrow \text{sky-clear} \rightarrow \text{question-reveal} \rightarrow \text{question} \rightarrow \text{answered}$$
3. **Decoupled Question Selection**: Question selection must be pure algorithmic logic (`Mulberry32` PRNG) with round/category filtering and duplicate prevention, completely decoupled from Canvas particle systems.
4. **Timer Engine**: Timestamp-based countdown engine supporting presets (30s, 60s, 90s, 120s, custom), warning alerts, pause/resume, and sound cues.
5. **History & Session Management**: Audit logging of all randomized questions, time used, contestants, and export capabilities (JSON & CSV).
6. **Competition Control Center**: Unified operator interface featuring Question Bank dashboard (CRUD, status toggles, JSON import/export with schema validation), contestant management, timer controls, and real-time Stage synchronization via `BroadcastChannel API`.

### 2.2 Non-Goals
- No roulette, slot machine, or wheel-of-fortune widgets.
- No per-second BroadcastChannel tick broadcasting (must synchronize via timestamps to avoid message spam).
- No direct coupling between QuestionCard and TimerEngine.

---

## 3. Architecture & Data Flow

```
+-------------------------------------------------------------------------+
|                       Competition Session                               |
|        (Active Session, Selected Contestant, Current Round, Seed)       |
+------------------------------------+------------------------------------+
                                     |
         +---------------------------+---------------------------+
         |                           |                           |
         v                           v                           v
+------------------+       +------------------+       +-------------------+
|  Question Engine |       |   Timer Engine   |       |   History Engine  |
|  - Mulberry32    |       |   - State/Timers |       |   - Audit Trail   |
|  - Filters/Rules |       |   - Presets/Sync |       |   - JSON/CSV Exp  |
+--------+---------+       +--------+---------+       +---------+---------+
         |                          |                           |
         +--------------------+-----+---------------------------+
                              |
                              v
                +---------------------------+
                |   BroadcastChannel API    |
                |   (Real-time State Sync)  |
                +-------------+-------------+
                              |
               +--------------+--------------+
               |                             |
               v                             v
+-----------------------------+ +-----------------------------+
|        Stage Display        | | Competition Control Center  |
| - Canvas 2D Particles       | | - Question Bank Dashboard   |
| - Ethereal Sky & Lighting   | | - Contestant Manager        |
| - Question Card Reveal      | | - Timer Control Panel       |
| - Synchronized Timer View   | | - Session & History Panel   |
| - Procedural Audio Engine   | | - Quick Randomizer Controls |
+-----------------------------+ +-----------------------------+
```

---

## 4. Subsystem Specifications

### 4.1 State Machine (`src/engine/stateMachine.ts`)
The transition lifecycle follows:
- `idle`: Ready state showing contestant & event identity.
- `rain` (1,200ms): Rain particle system.
- `water-drop` (1,300ms): Rain diminishes, water ripples expand.
- `mist` (1,500ms): Atmospheric fog drifting across the viewport.
- `wind` (1,500ms): Wind vectors push mist and initiate drift.
- `leaf` (2,000ms): Autumn leaves flutter across the wind stream.
- `sky-clear` (1,500ms): Mist clears, ambient light increases, sky opens up.
- `question-reveal` (1,200ms): Atmospheric bloom and subtle light sweep preceding card appearance.
- `question`: Waiting state displaying the selected question.
- `answered`: State denoting question completion.

### 4.2 Decoupled Question Selector (`src/engine/questionSelector.ts`)
- Pure function `selectNextQuestion(params)`:
  - Input: `questions: Question[]`, `usedQuestionIds: string[]`, `round?: string`, `category?: string`, `seed?: number | string`.
  - Filters: `enabled === true`, `!usedQuestionIds.includes(q.id)`.
  - Seeded selection via `Mulberry32(seed)`.
  - Output: `SelectedQuestionResult { question, seed, remainingCount }`.

### 4.3 Timer Engine (`src/engine/timerEngine.ts` & `src/hooks/useTimer.ts`)
- **State Model**:
  ```ts
  export interface TimerState {
    status: 'idle' | 'ready' | 'running' | 'paused' | 'finished';
    durationMs: number;
    remainingMs: number;
    startTimestamp?: number;
    warningAtMs?: number; // e.g. 30,000ms
  }
  ```
- **Sync Protocol**:
  - `TIMER_SET`: `{ type: 'TIMER_SET', durationMs: number, warningAtMs?: number }`
  - `TIMER_START`: `{ type: 'TIMER_START', startTimestamp: number, durationMs: number }`
  - `TIMER_PAUSE`: `{ type: 'TIMER_PAUSE', remainingMs: number }`
  - `TIMER_RESUME`: `{ type: 'TIMER_RESUME', startTimestamp: number, durationMs: number }`
  - `TIMER_RESET`: `{ type: 'TIMER_RESET' }`
  - `TIMER_FINISH`: `{ type: 'TIMER_FINISH', timeUsedMs: number }`

### 4.4 History Manager (`src/engine/historyManager.ts`)
- Records entries on question completion:
  ```ts
  export interface HistoryRecord {
    id: string;
    timestamp: number;
    sessionId: string;
    round: string;
    contestantId: string;
    contestantName: string;
    questionId: string;
    questionText: string;
    category: string;
    seed: number | string;
    timerConfiguredMs: number;
    timerUsedMs: number;
    isTimeout: boolean;
    result: 'completed' | 'timeout' | 'skipped';
  }
  ```
- Supports JSON download and standard CSV formatting.

### 4.5 Audio Engine (`src/engine/audioEngine.ts`)
- **Kept/Enhanced**: Rain Soundscape, Water Drop, Wind, Leaf Rustle, Ambient Sky Transition, Question Reveal Fanfare, Timer Warning chime, Timer Finished chime.
- **Removed**: `playCelestialShimmer`, `playMeteorWhoosh`.

### 4.6 Canvas Systems (`src/components/Stage/canvas/`)
- Kept: `RainSystem.ts`, `WaterDropSystem.ts`, `MistSystem.ts`, `LeafSystem.ts`, `SkySystem.ts`.
- Added: `TransitionLightingSystem.ts` (Dynamic dawn/bloom overlay for `sky-clear` and `question-reveal`).
- Deleted: `ConstellationSystem.ts`, `MeteorSystem.ts`.

### 4.7 Storage Namespaces (`src/utils/storage.ts`)
- `season_transition_questions`
- `season_transition_contestants`
- `season_transition_session`
- `season_transition_history`
- `season_transition_settings`

---

## 5. Testing Plan
- `prng.test.ts`: Deterministic selection and distribution.
- `questionSelector.test.ts`: Category/round filters, used question exclusion, zero canvas coupling.
- `stateMachine.test.ts`: Revised 9-stage sequence, transition validity.
- `timerEngine.test.ts`: Start/pause/resume/finish calculation, timestamp-based sync correctness.
- `historyManager.test.ts`: Record addition, CSV generation, filtering.
- `storage.test.ts`: Validation for schema corruption, namespace separation.
- `audioEngine.test.ts`: Web Audio API synthetic nodes verify without errors.
- `e2e.test.ts`: Full competition lifecycle simulation.

---
