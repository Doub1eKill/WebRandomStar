# Royal Word Spin & Luxury Pageant Edition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the stage quiz system from nature-only transitions to **Version 3.0: Royal Word Spin / Luxury Pageant Edition (✦ SCi TECH TINE ✦ CHARM OF TRANSITION AMBASSADOR 2026)** with an offline-capable Word Carousel, deterministic PRNG selection, luxury multi-layer canvas physics, 8-tab backstage control center, procedural sound synthesis, and dual-screen synchronization.

**Architecture:** Decoupled Modular Architecture separating deterministic logic (PRNG, Word/Question selectors, FSM State Machine), Canvas 2D particle & lighting physics (Aurora, Crystal, Crown, Reflection), Web Audio procedural synthesis, and React UI stage overlays with real-time BroadcastChannel & LocalStorage dual-sync.

**Tech Stack:** React 19, TypeScript (Strict Mode), Vite 6, HTML5 Canvas 2D, Web Audio API, Lucide React, Vitest.

## Global Constraints
- Full offline capability: No external MP3 audio or remote image assets.
- Deterministic selection: Random results are chosen first by PRNG logic; visual animation smoothly reflects the predetermined result.
- Controller silent mode: Controller window (`?mode=controller`) must remain muted.
- Maintain 100% test passing rate across all test suites.

---

### Task 1: Word Bank & Appearance Type Definitions & Default Data

**Files:**
- Create: `src/types/word.ts`
- Create: `src/types/appearance.ts`
- Create: `src/data/defaultWords.ts`
- Modify: `src/types/session.ts`
- Modify: `src/types/question.ts`
- Test: `tests/data.test.ts`

**Interfaces:**
- Produces: `KeywordItem`, `WordBankState`, `AppearanceSettings`, `WordSpinMode` in `src/types/word.ts` & `src/types/appearance.ts`.
- Updates: `AppState` in `src/types/session.ts` to include `'idle' | 'pre-spin' | 'word-spin' | 'word-decelerate' | 'word-lock' | 'question-reveal' | 'question' | 'answered'`.

- [ ] **Step 1: Write failing test in `tests/data.test.ts` for default keywords and types**
- [ ] **Step 2: Run test to verify failure** (`npm test tests/data.test.ts`)
- [ ] **Step 3: Implement `src/types/word.ts`, `src/types/appearance.ts`, `src/data/defaultWords.ts`, and update `src/types/session.ts`**
- [ ] **Step 4: Run test to verify pass** (`npm test tests/data.test.ts`)
- [ ] **Step 5: Verify types compile cleanly with `npx tsc -b`**

---

### Task 2: State Machine & Word Selection Logic Engines

**Files:**
- Create: `src/engine/wordSelector.ts`
- Create: `src/engine/wordSpinEngine.ts`
- Modify: `src/engine/stateMachine.ts`
- Modify: `src/engine/questionSelector.ts`
- Test: `tests/stateMachine.test.ts`
- Test: `tests/wordSelector.test.ts`
- Test: `tests/wordSpinEngine.test.ts`

**Interfaces:**
- Produces: `selectTargetWord(words, category, seed)` in `src/engine/wordSelector.ts`.
- Produces: `calculateSpinSequence(words, targetWord, totalSteps)` in `src/engine/wordSpinEngine.ts`.
- Updates: `STAGE_SEQUENCE` and `STAGE_DURATION` in `src/engine/stateMachine.ts` for 8-step cycle.

- [ ] **Step 1: Write unit tests for `wordSelector` and `wordSpinEngine` and updated `stateMachine`**
- [ ] **Step 2: Run tests to verify failures**
- [ ] **Step 3: Implement `src/engine/wordSelector.ts`, `src/engine/wordSpinEngine.ts`, and update `src/engine/stateMachine.ts`**
- [ ] **Step 4: Run tests to verify all pass** (`npm test`)

---

### Task 3: Word Spin Procedural Audio Synthesis Engine

**Files:**
- Modify: `src/engine/audioEngine.ts`
- Test: `tests/audioEngine.test.ts`

**Interfaces:**
- Produces: `playSpinStart()`, `playSpinTick(speedRatio: number)`, `playWordLock()`, `playQuestionReveal()` in `audioEngine`.

- [ ] **Step 1: Update `tests/audioEngine.test.ts` to test spin audio methods**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement sound synthesis in `src/engine/audioEngine.ts` with granular toggles**
- [ ] **Step 4: Run test to verify all 6+ audio tests pass**

---

### Task 4: Luxury Winter Pageant Canvas Visual Background System

**Files:**
- Create: `src/components/Stage/canvas/AuroraSystem.ts`
- Create: `src/components/Stage/canvas/CrystalSystem.ts`
- Create: `src/components/Stage/canvas/CrownSystem.ts`
- Create: `src/components/Stage/canvas/ReflectionSystem.ts`
- Modify: `src/components/Stage/StageCanvas.tsx`
- Modify: `src/components/Stage/canvas/particleTypes.ts`

**Interfaces:**
- Produces: Visual systems for Aurora undulating ribbons, floating 2D/3D crystal particles, subtle royal crown watermark, and bottom mirror water reflection.

- [ ] **Step 1: Create canvas modules for Aurora, Crystal, Crown, and Reflection**
- [ ] **Step 2: Integrate into `StageCanvas.tsx` with devicePixelRatio support and smooth interpolation**
- [ ] **Step 3: Verify build and test suites pass**

---

### Task 5: Royal Word Spin Carousel & Stage Overlay Components

**Files:**
- Create: `src/components/Stage/WordSpin/WordCarousel.tsx`
- Create: `src/components/Stage/WordSpin/WordLockEffect.tsx`
- Modify: `src/components/Stage/StageOverlay.tsx`
- Modify: `src/components/Stage/StageHeader.tsx`
- Modify: `src/components/Stage/QuestionCard.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces: `WordCarousel` rendering high-speed and decelerating word ribbons with soft glow.
- Produces: `WordLockEffect` with soft bloom, light burst, and lock aura.
- Updates: Header with "✦ SCi TECH TINE ✦ CHARM OF TRANSITION AMBASSADOR 2026".

- [ ] **Step 1: Implement `WordCarousel.tsx` and `WordLockEffect.tsx`**
- [ ] **Step 2: Update `StageOverlay.tsx`, `StageHeader.tsx`, and `QuestionCard.tsx`**
- [ ] **Step 3: Add CSS glassmorphism and animation tokens to `src/index.css`**
- [ ] **Step 4: Verify UI transitions cleanly across all 8 states**

---

### Task 6: Backstage Control Center (8-Tab Dashboard) & Drawer

**Files:**
- Create: `src/components/Control/WordBankDashboard.tsx`
- Create: `src/components/Control/WordManagerModal.tsx`
- Create: `src/components/Control/AppearanceSettings.tsx`
- Modify: `src/components/Control/ControlCenter.tsx`
- Modify: `src/components/Control/ControlDrawer.tsx`
- Modify: `src/components/Control/RemoteController.tsx`

**Interfaces:**
- Produces: 8-Tab navigation:
  1. Stage Controls (Spin Word button, Direct Category/Word trigger, Live Monitor)
  2. Word Bank (CRUD keywords, category mapping, active count)
  3. Question Bank (CRUD questions, category filter, import/export)
  4. Timer Panel (Presets, custom duration, Grand Center / Corner / Compact modes, sound toggles)
  5. Contestants Manager (Candidate list)
  6. History Audit Log (CSV/JSON Export)
  7. Appearance Settings (Theme tokens, spin mode, particle density, glow intensity, crown effect)
  8. Audio Settings (Granular toggles: spin ticks, lock chime, timer sounds, volume)

- [ ] **Step 1: Implement `WordBankDashboard.tsx` and `WordManagerModal.tsx`**
- [ ] **Step 2: Implement `AppearanceSettings.tsx`**
- [ ] **Step 3: Expand `ControlCenter.tsx` and `ControlDrawer.tsx` to support 8 tabs and spin triggers**
- [ ] **Step 4: Update `RemoteController.tsx` with dual-screen remote support**

---

### Task 7: Multi-Screen Realtime Synchronization & Persistence

**Files:**
- Modify: `src/utils/storage.ts`
- Modify: `src/hooks/useStageSync.ts`
- Test: `tests/storage.test.ts`
- Test: `tests/e2e.test.ts`

**Interfaces:**
- Produces: Extended `STORAGE_KEYS.WORDS` and `STORAGE_KEYS.APPEARANCE` with auto-migration from default data.
- Produces: Synchronized `STAGE_SPIN_START`, `STAGE_WORD_LOCK`, `STAGE_SET_WORD_BANK`, `STAGE_SET_APPEARANCE` messages over BroadcastChannel & LocalStorage fallback.

- [ ] **Step 1: Update `src/utils/storage.ts` with word bank and appearance storage handlers**
- [ ] **Step 2: Update `src/hooks/useStageSync.ts` to handle new sync message types**
- [ ] **Step 3: Update `tests/storage.test.ts` and `tests/e2e.test.ts`**
- [ ] **Step 4: Run test suite to verify 100% pass**

---

### Task 8: Full Verification, QA & Documentation Update

**Files:**
- Modify: `PROJECT_SUMMARY.md`
- Test: All tests in `tests/`

- [ ] **Step 1: Run complete automated test suite (`npm test`)**
- [ ] **Step 2: Run production TypeScript and Vite build (`npm run build`)**
- [ ] **Step 3: Update `PROJECT_SUMMARY.md` to reflect Version 3.0 specifications**
