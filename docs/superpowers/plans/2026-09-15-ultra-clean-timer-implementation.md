# Ultra-Clean Royal Pageant Timer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all rapid phase switching, flashing colors, and blurry text glow from the countdown timer, unifying the display into an ultra-clean, elegant, and stable Royal Pageant Timer.

**Architecture:**
- **TimerDisplay.tsx:** Unify countdown styling into a single steady theme throughout the entire timer duration (Deep Navy Glassmorphism + Ice Blue/Cyan Trim + Crisp White Digits + Smooth Single-Tone Progress Bar). Transition only upon reaching 0s (`finished`).
- **TransitionLightingSystem.ts:** Remove timer countdown edge vignette alterations to keep the stage canvas illumination 100% stable and clear.

**Tech Stack:** React 19, TypeScript, HTML5 Canvas 2D, Vitest.

---

### Task 1: Unified Ultra-Clean Timer Display Component

**Files:**
- Modify: `src/components/Stage/TimerDisplay.tsx`
- Test: `tests/timerEngine.test.ts`

- [ ] **Step 1: Refactor `TimerDisplay.tsx` styling**
  - Simplify phase configuration to active countdown (`isFinished ? finished : active`).
  - Set active card: `bg: 'rgba(7, 17, 38, 0.88)'`, `border: 'rgba(56, 189, 248, 0.35)'`, `glow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(13, 40, 84, 0.4)'`.
  - Set active badge: `<Clock size={16} /> กำลังนับเวลา`.
  - Set active digits: Crisp `linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)` with subtle text shadow `0 2px 14px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.25)`.
  - Set progress bar: Fixed `linear-gradient(90deg, #0284c7, #38bdf8)` with `transition: width 0.1s linear`.

- [ ] **Step 2: Run timer tests**
  Run: `npx vitest run tests/timerEngine.test.ts`
  Expected: PASS

- [ ] **Step 3: Commit Task 1**
  ```bash
  git add src/components/Stage/TimerDisplay.tsx
  git commit -m "feat: unify timer display to ultra-clean non-flashing theme"
  ```

---

### Task 2: Canvas Lighting Stabilization

**Files:**
- Modify: `src/components/Stage/canvas/TransitionLightingSystem.ts`

- [ ] **Step 1: Remove countdown vignette shift in `TransitionLightingSystem.ts`**
  - Keep vignette at 0 during question and countdown, or maintain steady ambient glow without flash.

- [ ] **Step 2: Run canvas tests**
  Run: `npx vitest run tests/leafSystem.test.ts tests/prng.test.ts`
  Expected: PASS

- [ ] **Step 3: Commit Task 2**
  ```bash
  git add src/components/Stage/canvas/TransitionLightingSystem.ts
  git commit -m "feat: stabilize canvas lighting during timer countdown"
  ```

---

### Task 3: Full Verification, QA & Documentation Update

**Files:**
- Modify: `PROJECT_SUMMARY.md`

- [ ] **Step 1: Run full test suite**
  Run: `npm test -- --run`
  Expected: 13 passed test suites (100% PASS)

- [ ] **Step 2: Run production build**
  Run: `npm run build`
  Expected: Exit code 0, 0 errors

- [ ] **Step 3: Update `PROJECT_SUMMARY.md` and commit**
  ```bash
  git add PROJECT_SUMMARY.md
  git commit -m "docs: update timer documentation for ultra-clean display"
  ```
