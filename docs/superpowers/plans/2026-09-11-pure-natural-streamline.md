# Pure 5-Phase Natural Streamline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove celestial constellations and meteors completely from the randomize quiz app, streamlining the sequence into a pure 5-phase natural transition (~7.5s) where the golden leaf lands at the screen center with golden water ripples and blooms into the question card.

**Architecture:** 
- State Machine: Streamline `AppState` to 5 natural stages (`rain`, `water-drop`, `mist`, `wind`, `leaf`) ➔ `question`.
- Canvas 2D: Remove `ConstellationSystem` and `MeteorSystem`; add expanding golden water ripples (`LeafRipple`) to `LeafSystem.ts`.
- UI Components: Simplify `SeasonJourneyBreadcrumb` to 5 natural milestones and align `CinematicNarrator`.
- Audio Engine: Trigger gentle water drop + leaf chime + harmonic chord on leaf landing.

**Tech Stack:** React 19, TypeScript, Canvas 2D, Web Audio API, Vitest, Vite.

## Global Constraints
- Sequence duration must be ~7.5 seconds total.
- Completely remove `constellation` and `meteor` states and systems.
- Zero external audio files (100% procedural Web Audio API).
- All Vitest tests and production build must pass with 0 errors.

---

### Task 1: Streamline AppState & State Machine

**Files:**
- Modify: `src/types/session.ts`
- Modify: `src/engine/stateMachine.ts`
- Test: `tests/stateMachine.test.ts`

**Interfaces:**
- `AppState`: `'idle' | 'rain' | 'water-drop' | 'mist' | 'wind' | 'leaf' | 'question' | 'answered'`
- `NATURAL_SEQUENCE`: `['rain', 'water-drop', 'mist', 'wind', 'leaf']`
- `STAGE_DURATIONS`: rain 1200ms, water-drop 1300ms, mist 1500ms, wind 1500ms, leaf 2000ms (7500ms total).

- [ ] **Step 1: Update `AppState` in `src/types/session.ts`**
Remove `'sky-opening' | 'constellation' | 'meteor'`.
- [ ] **Step 2: Update `NATURAL_SEQUENCE` and `STAGE_DURATIONS` in `src/engine/stateMachine.ts`**
- [ ] **Step 3: Update `tests/stateMachine.test.ts` to assert 5 states and 7500ms total duration**
- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/stateMachine.test.ts`
Expected: PASS
- [ ] **Step 5: Commit changes**
```bash
git add src/types/session.ts src/engine/stateMachine.ts tests/stateMachine.test.ts
git commit -m "refactor: streamline state machine to 5 natural states (total 7.5s)"
```

---

### Task 2: Hero Leaf Landing & Golden Water Ripples in LeafSystem

**Files:**
- Modify: `src/components/Stage/canvas/LeafSystem.ts`

**Interfaces:**
- Produces: `LeafRipple` interface and ripple animation when hero leaf settles at `(targetX, targetY)`.

- [ ] **Step 1: Add `LeafRipple` interface and `ripples` array to `LeafSystem.ts`**
```ts
interface LeafRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}
```
- [ ] **Step 2: Spawn 3 expanding ripple rings upon `heroLanded = true`**
- [ ] **Step 3: Update and draw golden ripples with soft golden glow in `draw(ctx)`**
- [ ] **Step 4: Run typecheck**
Run: `npm run build`
Expected: 0 errors
- [ ] **Step 5: Commit changes**
```bash
git add src/components/Stage/canvas/LeafSystem.ts
git commit -m "feat: add golden water ripple effect upon hero leaf landing"
```

---

### Task 3: Decouple Constellations & Meteors from StageCanvas

**Files:**
- Modify: `src/components/Stage/StageCanvas.tsx`

**Interfaces:**
- Removes `ConstellationSystem` and `MeteorSystem` from canvas layers.
- On `leaf` completion or hero leaf landing, triggers `playQuestionReveal()`.

- [ ] **Step 1: Remove `ConstellationSystem` and `MeteorSystem` imports & refs in `StageCanvas.tsx`**
- [ ] **Step 2: Update state transitions in `useEffect` for the 5-phase sequence**
- [ ] **Step 3: Remove constellation and meteor update/draw from canvas render loop**
- [ ] **Step 4: Verify build succeeds**
Run: `npm run build`
Expected: 0 errors
- [ ] **Step 5: Commit changes**
```bash
git add src/components/Stage/StageCanvas.tsx
git commit -m "refactor: remove constellation and meteor systems from StageCanvas"
```

---

### Task 4: Streamline Breadcrumb, Narrator & Question Selector

**Files:**
- Modify: `src/components/Stage/SeasonJourneyBreadcrumb.tsx`
- Modify: `src/components/Stage/CinematicNarrator.tsx`
- Modify: `src/engine/questionSelector.ts`

**Interfaces:**
- `SeasonJourneyBreadcrumb`: 5 milestones (`ฝนซา`, `หยดน้ำ`, `สายหมอก`, `ลมหนาว`, `ใบไม้ทอง`).
- `CinematicNarrator`: 5 matching narrative lines.
- `questionSelector`: Set default landing target to center `(width * 0.5, height * 0.46)`.

- [ ] **Step 1: Update `MILESTONES` in `SeasonJourneyBreadcrumb.tsx` to 5 natural states**
- [ ] **Step 2: Update `NARRATIVE_LINES` in `CinematicNarrator.tsx`**
- [ ] **Step 3: Clean up `questionSelector.ts` to center leaf target**
- [ ] **Step 4: Run all unit tests**
Run: `npx vitest run`
Expected: All tests pass
- [ ] **Step 5: Commit changes**
```bash
git add src/components/Stage/SeasonJourneyBreadcrumb.tsx src/components/Stage/CinematicNarrator.tsx src/engine/questionSelector.ts
git commit -m "feat: align breadcrumb and narrator with 5-phase natural streamline"
```

---

### Task 5: Full Verification, Production Build & E2E Validation

**Files:**
- Modify/Verify: `tests/e2e.test.ts`, `tests/questionSelector.test.ts`

- [ ] **Step 1: Update and run all unit & E2E tests**
Run: `npx vitest run`
Expected: All tests pass
- [ ] **Step 2: Run production build**
Run: `npm run build`
Expected: Built in ~1s
- [ ] **Step 3: Test and record in browser subagent**
Verify 5-phase progression (~7.5s), hero leaf landing with golden ripples, no constellations or meteors, and question card bloom.
- [ ] **Step 4: Update walkthrough artifact**
