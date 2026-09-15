# Luxury Stage Chronometer & Smooth Timer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate timer animation stuttering, remove chaotic canvas strobe effects, and upgrade countdown sound design to a smooth, elegant Luxury Stage Chronometer suitable for the Winter Royal Pageant stage.

**Architecture:**
- **UI Smoothness:** Remove DOM remounting (`key` prop) in `TimerDisplay.tsx`, enforce tabular fixed-width typography (`font-variant-numeric: tabular-nums`), and synchronize progress bar transitions.
- **Visual Canvas:** Replace rapid sinusoidal strobing in `TransitionLightingSystem.ts` with a calm, gentle breathing glow (warm amber $\rightarrow$ soft ruby) with smooth lerping.
- **Audio Synthesis:** Replace harsh triangle waves in `audioEngine.ts` with soft crystal sine ticks, melodic countdown bells (G5, A5, C6), and a resonant royal completion gong.

**Tech Stack:** React 19, TypeScript, HTML5 Canvas 2D, Web Audio API, Vitest.

## Global Constraints
- Full offline capability: 100% Web Audio API procedural synthesis with zero external audio assets.
- Frame budget: 60fps stable on stage displays without layout thrashing or stutter.
- Zero regression on existing timer controls, BroadcastChannel multi-screen sync, and backstage settings.

---

### Task 1: Timer Display & Typography Smoothness

**Files:**
- Modify: `src/components/Stage/TimerDisplay.tsx`
- Modify: `src/index.css`
- Test: `tests/timerEngine.test.ts`

**Interfaces:**
- Consumes: `TimerState` from `src/types/timer.ts`
- Produces: Smooth 60fps countdown display without DOM remounts or layout shifts

- [ ] **Step 1: Inspect and verify existing timer test suite**

Run: `npx vitest run tests/timerEngine.test.ts`
Expected: PASS

- [ ] **Step 2: Update `TimerDisplay.tsx` and `src/index.css`**

In `src/components/Stage/TimerDisplay.tsx`:
1. Remove `key={isRunning ? remainingSeconds : 'static'}` from all digit wrappers.
2. Add `fontVariantNumeric: 'tabular-nums'`, `fontFeatureSettings: '"tnum"'`, `minWidth: '2.8ch'`, `textAlign: 'center'` to digit styles.
3. Remove `animate-bounce` on flame icons.
4. Set progress bar transition to `transition: 'width 0.1s linear'`.
5. Update container transition to `transition: 'background 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease'`.

In `src/index.css`:
Ensure `.stage-timer-digits` has `font-variant-numeric: tabular-nums;` and `.timer-digit-wrapper` has smooth transitions.

- [ ] **Step 3: Run timer tests to verify no regressions**

Run: `npx vitest run tests/timerEngine.test.ts`
Expected: PASS

- [ ] **Step 4: Commit Task 1 changes**

```bash
git add src/components/Stage/TimerDisplay.tsx src/index.css
git commit -m "feat: eliminate timer DOM remounting and apply tabular numerals"
```

---

### Task 2: Smooth Canvas Breathing Vignette

**Files:**
- Modify: `src/components/Stage/canvas/TransitionLightingSystem.ts`

**Interfaces:**
- Consumes: `TimerPhase` ('normal' | 'warning' | 'critical' | 'last-3s' | 'finished')
- Produces: Calm, gentle breathing edge lighting on stage canvas without strobe or flashing

- [ ] **Step 1: Refactor `TransitionLightingSystem.ts`**

1. Replace `Math.sin(this.timeAccumulator * 8.0)` and `Math.sin(this.timeAccumulator * 5.0)` with calm breathing frequencies:
   - Warning: `0.14 + Math.sin(this.timeAccumulator * 1.2) * 0.03`
   - Critical / Last 3s: `0.26 + Math.sin(this.timeAccumulator * 1.5) * 0.04`
2. Change vignette lerp easing factor from `0.15` to `0.06` for gradual transitions.
3. Adjust gradient radial feathering start to `maxDist * 0.6` so center stage remains clear.

- [ ] **Step 2: Run all canvas/stage unit tests**

Run: `npx vitest run tests/leafSystem.test.ts tests/prng.test.ts`
Expected: PASS

- [ ] **Step 3: Commit Task 2 changes**

```bash
git add src/components/Stage/canvas/TransitionLightingSystem.ts
git commit -m "feat: replace canvas timer strobe with luxury breathing glow"
```

---

### Task 3: Refined Luxury Procedural Audio Palette

**Files:**
- Modify: `src/engine/audioEngine.ts`
- Modify: `tests/audioEngine.test.ts`

**Interfaces:**
- Consumes: Web Audio API `AudioContext`
- Produces: `playTickSound(remainingSeconds: number)`, `playTimerWarning()`, `playTimerFinish()`

- [ ] **Step 1: Add unit tests for countdown audio in `tests/audioEngine.test.ts`**

Add tests asserting:
- `playTickSound(15)` calls oscillator with sine wave.
- `playTickSound(8)` executes critical tick without errors.
- `playTickSound(3)` executes last-3s harmonic chime.
- `playTickSound(0)` triggers finish sound.

- [ ] **Step 2: Run audio tests to verify initial state**

Run: `npx vitest run tests/audioEngine.test.ts`
Expected: PASS

- [ ] **Step 3: Upgrade audio synthesizer in `src/engine/audioEngine.ts`**

1. Normal Tick (>10s): Sine wave (640Hz $\rightarrow$ 320Hz decay in 35ms) at quiet volume (0.12).
2. Critical Tick (10s to 4s): Sine wave at 720Hz with soft attack and decay in 45ms.
3. Last 3 Seconds (3s, 2s, 1s): Melodic countdown chimes (3s = G5 783.99Hz, 2s = A5 880.00Hz, 1s = C6 1046.50Hz).
4. Timer Finish (0s): Royal finish gong polyphonic triad (C4, G4, C5) with warm 1.5s acoustic decay.

- [ ] **Step 4: Run audio tests and full test suite**

Run: `npx vitest run tests/audioEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit Task 3 changes**

```bash
git add src/engine/audioEngine.ts tests/audioEngine.test.ts
git commit -m "feat: upgrade timer procedural audio to luxury crystal chronometer"
```

---

### Task 4: Full Verification, QA & Documentation Update

**Files:**
- Modify: `PROJECT_SUMMARY.md`

- [ ] **Step 1: Run full unit test suite**

Run: `npm test -- --run`
Expected: 13 passed test suites (100% PASS)

- [ ] **Step 2: Run production TypeScript & Vite build**

Run: `npm run build`
Expected: Exit code 0, zero TypeScript errors

- [ ] **Step 3: Update `PROJECT_SUMMARY.md`**

Add section detailing the Luxury Stage Chronometer refinement (smooth 60fps rendering, breathing vignette, procedural crystal audio).

- [ ] **Step 4: Final commit**

```bash
git add PROJECT_SUMMARY.md
git commit -m "docs: document luxury timer refinement in project summary"
```
