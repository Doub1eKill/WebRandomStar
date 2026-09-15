# Frontstage Countdown Alert Phase Effects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronize the frontstage timer display (`TimerDisplay.tsx`) with the backstage controller (`TimerPanel.tsx`) so that countdown alert phases (Normal, Warning, Critical, Last-3s, and Finished) dynamically update colors, badges, borders, numeral colors, and progress bar gradients in real-time according to configured thresholds.

**Architecture:** Extend `getTimerPhase` in `src/engine/timerEngine.ts` to accept configurable warning and critical threshold parameters. Pass `stageDisplaySettings` from `StageOverlay.tsx` to `TimerDisplay.tsx`. In `TimerDisplay.tsx`, calculate phase styles dynamically across all 3 display modes (`center`, `corner`, `compact`).

**Tech Stack:** React 19, TypeScript, Vitest, Lucide React icons, Vite.

## Global Constraints
- Do not introduce background canvas flickering or particle churn.
- Maintain solid, crisp typography with tabular figures (`tabular-nums`) to prevent layout jitter.
- Maintain 100% test pass rate on all existing Vitest suites and TypeScript build checks.

---

### Task 1: Update `timerEngine.ts` to support configurable critical threshold & update unit tests

**Files:**
- Modify: `src/engine/timerEngine.ts`
- Modify: `tests/timerEngine.test.ts`

**Interfaces:**
- `getTimerPhase(remainingMs: number, status: TimerStatus, warningAtMs?: number, criticalAtMs?: number): TimerPhase`

- [ ] **Step 1: Write unit tests for configurable critical threshold**

```typescript
// In tests/timerEngine.test.ts
it('should respect custom warning and critical thresholds in getTimerPhase', () => {
  // Custom warning: 20s (20000ms), Custom critical: 5s (5000ms)
  expect(getTimerPhase(25000, 'running', 20000, 5000)).toBe('normal');
  expect(getTimerPhase(18000, 'running', 20000, 5000)).toBe('warning');
  expect(getTimerPhase(4500, 'running', 20000, 5000)).toBe('critical');
  expect(getTimerPhase(2000, 'running', 20000, 5000)).toBe('last-3s');
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/timerEngine.test.ts`
Expected: FAIL if parameter not yet handled or PASS if already compatible.

- [ ] **Step 3: Update `getTimerPhase` implementation**

```typescript
// In src/engine/timerEngine.ts
export function getTimerPhase(
  remainingMs: number,
  status: TimerStatus,
  warningAtMs: number = DEFAULT_WARNING_THRESHOLD_MS,
  criticalAtMs: number = CRITICAL_THRESHOLD_MS
): TimerPhase {
  if (status === 'finished') {
    return 'finished';
  }
  if (typeof remainingMs !== 'number' || isNaN(remainingMs) || remainingMs <= 0) {
    if (status === 'running') {
      return 'finished';
    }
    return 'normal';
  }
  if (status !== 'running') {
    return 'normal';
  }

  const remainingSeconds = Math.ceil(remainingMs / 1000);
  if (remainingSeconds <= 3 && remainingSeconds > 0) {
    return 'last-3s';
  }
  if (remainingMs <= criticalAtMs && remainingSeconds > 0) {
    return 'critical';
  }
  if (remainingMs <= warningAtMs && remainingSeconds > 0) {
    return 'warning';
  }
  return 'normal';
}
```

- [ ] **Step 4: Run test to verify all tests pass**

Run: `npx vitest run tests/timerEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/timerEngine.ts tests/timerEngine.test.ts
git commit -m "feat(timerEngine): add custom critical threshold support to getTimerPhase"
```

---

### Task 2: Implement dynamic phase styling in `TimerDisplay.tsx` and integrate with `StageOverlay.tsx`

**Files:**
- Modify: `src/components/Stage/TimerDisplay.tsx`
- Modify: `src/components/Stage/StageOverlay.tsx`

**Interfaces:**
- Consumes: `TimerState`, `TimerPhase`, `StageDisplaySettings`, `getTimerPhase`, `formatTimerDisplay`
- Produces: `<TimerDisplay timerState={...} soundEnabled={...} variant={...} stageDisplaySettings={...} />`

- [ ] **Step 1: Update `TimerDisplayProps` and phase style generator in `TimerDisplay.tsx`**

Expand `TimerDisplay.tsx` to handle all 5 phases:
- `normal`: Cyan accent `#38bdf8`, badge "กำลังนับเวลา" with Clock icon, white numerals `#ffffff`, cyan gradient progress bar.
- `warning`: Amber accent `#fde68a`, badge `ช่วงเตือน (≤Xs Warning)` with AlertTriangle icon, amber numerals `#fde68a`, amber gradient progress bar.
- `critical`: Coral accent `#fca5a5`, badge `วิกฤต (≤Xs Critical)` with AlertTriangle icon, red numerals `#f87171`, coral red-orange progress bar.
- `last-3s`: Red accent `#ff8888`, badge `3 วินาทีสุดท้าย (Last 3s)` with Flame icon, bright red numerals `#ff4444`, fiery red gradient progress bar.
- `finished`: Pink-red accent `#fca5a5`, badge `สิ้นสุดเวลา` with AlertTriangle icon, numerals `หมดเวลา` in `#fca5a5`.
- Paused state: Amber badge `⏸️ พักชั่วคราว` with soft amber accent.

- [ ] **Step 2: Update `StageOverlay.tsx` to pass `stageDisplaySettings={displaySettings}`**

Pass `stageDisplaySettings={displaySettings}` to both `<TimerDisplay />` instances (center and corner/compact).

- [ ] **Step 3: Run full automated test suite & build check**

Run: `npm test -- --run`
Run: `npm run build`
Expected: 13/13 suites pass, TypeScript build completes with exit code 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/Stage/TimerDisplay.tsx src/components/Stage/StageOverlay.tsx
git commit -m "feat(stage): sync stage timer countdown alert phases with backstage controller"
```

---

### Task 3: Full End-to-End Verification & Verification Report

- [ ] **Step 1: Verify all 5 countdown states visually and logically**
- [ ] **Step 2: Verify custom Alert Threshold sliders from backstage update stage timer thresholds**
- [ ] **Step 3: Verify canvas background remains calm with zero stutter**
- [ ] **Step 4: Commit final verification notes**
