# Stage UI Transition Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a unified Royal Cinematic Stage UI Transition Animation system with fluid cubic-bezier easing, staggered glassmorphism reveals, and seamless dissolve crossfades across all stage states.

**Architecture:** Extend CSS token easing curves and keyframe definitions in `src/index.css`, integrate entrance/exit CSS hooks in `StageOverlay.tsx`, `QuestionCard.tsx`, `WordLockEffect.tsx`, `TimerDisplay.tsx`, and `ContestantBadge.tsx`, and verify via Vitest unit tests and production builds.

**Tech Stack:** React 19, TypeScript, Vanilla CSS (Cubic-Bezier, Glassmorphism, GPU translate3d), Vitest.

## Global Constraints

- Keep stage screen 100% clean and distraction-free for broadcast / LED wall presentation.
- All animations must run at 60/120fps with zero layout shift and hardware GPU compositing (`will-change: transform, opacity, filter`).
- Retain full test suite pass rate (all 81+ tests green).

---

### Task 1: Core Easing Tokens & Cinematic Keyframe System in `src/index.css`

**Files:**
- Modify: `src/index.css`
- Test: `tests/stageTransitions.test.ts`

**Interfaces:**
- Consumes: CSS Variables in `:root`
- Produces: CSS animation utility classes `.animate-stage-card-reveal`, `.animate-hero-dissolve`, `.animate-badge-slide-in`, `.animate-timer-float-in`, `.animate-word-lock-climax`

- [ ] **Step 1: Write the failing test for stage transition CSS classes and tokens**

```typescript
// tests/stageTransitions.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Stage Transition CSS & Tokens', () => {
  it('contains royal cinematic easing tokens and keyframes in index.css', () => {
    const cssPath = path.resolve(__dirname, '../src/index.css');
    const css = fs.readFileSync(cssPath, 'utf-8');

    expect(css).toContain('--ease-royal-spring');
    expect(css).toContain('stage-card-cinematic-reveal');
    expect(css).toContain('stage-hero-dissolve-out');
    expect(css).toContain('contestant-badge-slide-in');
    expect(css).toContain('timer-cinematic-float');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stageTransitions.test.ts`
Expected: FAIL with missing token/keyframe assertions

- [ ] **Step 3: Implement easing tokens and keyframes in `src/index.css`**

Add easing tokens:
- `--ease-royal-spring: cubic-bezier(0.16, 1, 0.3, 1)`
- `--ease-soft-out: cubic-bezier(0.25, 1, 0.5, 1)`
- Keyframes `@keyframes stage-card-cinematic-reveal`, `@keyframes stage-hero-dissolve-out`, `@keyframes contestant-badge-slide-in`, `@keyframes timer-cinematic-float`, `@keyframes badge-shimmer-sweep`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/stageTransitions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/index.css tests/stageTransitions.test.ts
git commit -m "feat(css): add royal cinematic easing tokens and stage keyframes"
```

---

### Task 2: Staggered Crystal Reveal & Settle in `QuestionCard.tsx`

**Files:**
- Modify: `src/components/Stage/QuestionCard.tsx`
- Modify: `src/index.css`
- Test: `tests/stageTransitions.test.ts`

**Interfaces:**
- Consumes: `QuestionCardProps` (`question`, `isAnswered`, `fontSizeScale`, `compact`)
- Produces: Smooth glass card reveal with staggered typography clarity and answered emerald settle

- [ ] **Step 1: Write test for QuestionCard transition classes**

```typescript
// in tests/stageTransitions.test.ts
import React from 'react';
import { renderToString } from 'react-dom/server';
import { QuestionCard } from '../src/components/Stage/QuestionCard.tsx';

describe('QuestionCard Transitions', () => {
  it('renders with cinematic reveal animation and clean centered typography', () => {
    const html = renderToString(
      React.createElement(QuestionCard, {
        question: {
          id: 'q1',
          text: 'คุณคิดว่าอะไรคือคุณสมบัติสำคัญที่สุดของผู้นำ?',
          category: 'wind',
          round: 'intro',
          tags: []
        },
        isAnswered: false
      })
    );

    expect(html).toContain('question-card-crystal-cinematic');
    expect(html).toContain('คุณคิดว่าอะไรคือคุณสมบัติสำคัญที่สุดของผู้นำ?');
  });

  it('applies answered celebration settle styling when isAnswered is true', () => {
    const html = renderToString(
      React.createElement(QuestionCard, {
        question: {
          id: 'q1',
          text: 'ทดสอบคำถาม',
          category: 'wind',
          round: 'intro',
          tags: []
        },
        isAnswered: true
      })
    );

    expect(html).toContain('card-answered-settle');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stageTransitions.test.ts`
Expected: FAIL

- [ ] **Step 3: Update `QuestionCard.tsx` and CSS styles**

Enhance `QuestionCard.tsx`:
- Apply `question-card-crystal-cinematic` and dynamic `card-answered-settle` classes
- Ensure GPU accelerated transform and smooth typography text reveal

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/stageTransitions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Stage/QuestionCard.tsx src/index.css tests/stageTransitions.test.ts
git commit -m "feat(stage): enhance QuestionCard with staggered crystal cinematic reveal"
```

---

### Task 3: Seamless Dissolve & Entrance for Idle Hero & Word Lock

**Files:**
- Modify: `src/components/Stage/StageOverlay.tsx`
- Modify: `src/components/Stage/WordSpin/WordLockEffect.tsx`
- Modify: `src/index.css`
- Test: `tests/stageTransitions.test.ts`

**Interfaces:**
- Consumes: `SessionState`, `WordLockEffectProps`
- Produces: Smooth hero dissolve upon start and soft bloom fadeout on word lock

- [ ] **Step 1: Write test for Idle Hero & Word Lock transition structures**

```typescript
// in tests/stageTransitions.test.ts
import { WordLockEffect } from '../src/components/Stage/WordSpin/WordLockEffect.tsx';

describe('WordLockEffect Transitions', () => {
  it('renders word lock container with royal bloom aura and crown seal', () => {
    const html = renderToString(
      React.createElement(WordLockEffect, {
        wordItem: { id: 'w1', word: 'วิสัยทัศน์', category: 'moon', enabled: true }
      })
    );

    expect(html).toContain('word-lock-container');
    expect(html).toContain('lock-radial-bloom');
    expect(html).toContain('วิสัยทัศน์');
  });
});
```

- [ ] **Step 2: Run test to verify test coverage**

Run: `npx vitest run tests/stageTransitions.test.ts`
Expected: Check status

- [ ] **Step 3: Implement soft hero dissolve and lock transition enhancements**

- In `StageOverlay.tsx`: Update Idle hero button with pulsing sparkles and smooth scale/blur dissolve
- In `WordLockEffect.tsx`: Enhance radial bloom and crown seal typography with smooth entry
- In `src/index.css`: Add styles for `.stage-idle-hero`, `.btn-royal-spin`, `.word-lock-container`

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/stageTransitions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Stage/StageOverlay.tsx src/components/Stage/WordSpin/WordLockEffect.tsx src/index.css tests/stageTransitions.test.ts
git commit -m "feat(stage): add smooth idle hero dissolve and word lock transitions"
```

---

### Task 4: Fluid Timer & Contestant Badge Entrance / Exit

**Files:**
- Modify: `src/components/Stage/ContestantBadge.tsx`
- Modify: `src/components/Stage/TimerDisplay.tsx`
- Modify: `src/components/Stage/StageOverlay.tsx`
- Modify: `src/index.css`
- Test: `tests/stageTransitions.test.ts`

**Interfaces:**
- Consumes: `TimerDisplayProps`, `ContestantBadgeProps`
- Produces: Floating smooth entry for corner/center timer and crystal shimmer badge

- [ ] **Step 1: Write test for Timer and Badge animations**

```typescript
// in tests/stageTransitions.test.ts
import { ContestantBadge } from '../src/components/Stage/ContestantBadge.tsx';

describe('ContestantBadge & Timer Transitions', () => {
  it('renders contestant badge with slide-in animation and crystal shimmer sweep', () => {
    const html = renderToString(
      React.createElement(ContestantBadge, {
        contestant: { id: 'c1', number: 5, name: 'อาริยา สมบูรณ์', title: 'ตัวแทนคณะวิทยาศาสตร์', faculty: 'วิทยาศาสตร์' }
      })
    );

    expect(html).toContain('contestant-badge-cinematic');
    expect(html).toContain('badge-shimmer-sweep-layer');
    expect(html).toContain('อาริยา สมบูรณ์');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stageTransitions.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement fluid timer float & contestant badge shimmer**

- In `ContestantBadge.tsx`: Add `.contestant-badge-cinematic` and `.badge-shimmer-sweep-layer`
- In `TimerDisplay.tsx`: Enhance corner and center timer containers with `.animate-timer-float-in`
- In `src/index.css`: Define fluid keyframes and hardware GPU compositing

- [ ] **Step 4: Run all tests to verify full green suite**

Run: `npm test`
Expected: All test suites PASS (82+ tests)

- [ ] **Step 5: Run production build**

Run: `npm run build`
Expected: `tsc -b && vite build` succeeds with exit code 0

- [ ] **Step 6: Commit**

```bash
git add src/components/Stage/ContestantBadge.tsx src/components/Stage/TimerDisplay.tsx src/components/Stage/StageOverlay.tsx src/index.css tests/stageTransitions.test.ts
git commit -m "feat(stage): add fluid timer and contestant badge entrance transitions"
```
