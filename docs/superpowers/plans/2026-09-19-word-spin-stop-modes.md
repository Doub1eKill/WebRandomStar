# Word Spin Stop Modes (Auto vs. Manual) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide an Appearance/Control setting in the Backstage panel allowing operators to toggle between Auto-Stop (automatic spin & word locking on a timer) and Manual-Stop (continuous endless spin until presenter/operator clicks STOP or presses Spacebar).

**Architecture:** `spinStopMode: 'auto' | 'manual'` is defined in `AppearanceSettings` (`src/types/appearance.ts`). In `useStageSync.ts`, when `spinStopMode === 'manual'`, the auto-progression timer for `word-spin` is bypassed. A dedicated `stopWordSpin()` function transitions `currentState` from `word-spin` to `word-decelerate` and broadcasts `STAGE_STOP_WORD_SPIN` across tabs, triggering physics deceleration and word locking. An interactive crystal glass STOP button appears on the Stage when spinning in manual mode.

**Tech Stack:** React 18, TypeScript, BroadcastChannel, Vitest.

## Global Constraints
- In manual mode, word spin must run at continuous 60fps without hitching until STOP is triggered.
- When STOP is pressed, deceleration must take exactly 2.0s and smoothly lock onto the target word without jumping.
- Full real-time synchronization between Control Center and Stage View.
- 100% automated test pass rate and clean production build.

---

### Task 1: Data Models & Storage Updates

**Files:**
- Modify: `src/types/appearance.ts`
- Modify: `src/types/session.ts`
- Modify: `src/utils/storage.ts`
- Test: `tests/appearanceSpinStopMode.test.ts`

**Interfaces:**
- Produces:
  - `export type WordSpinStopMode = 'auto' | 'manual'`
  - `AppearanceSettings.spinStopMode: WordSpinStopMode`
  - `DEFAULT_APPEARANCE_SETTINGS.spinStopMode: 'auto'`
  - `SyncEventType`: includes `'STAGE_STOP_WORD_SPIN'`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/appearanceSpinStopMode.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_APPEARANCE_SETTINGS, WordSpinStopMode } from '../src/types/appearance.ts';
import { loadAppearanceSettings, saveAppearanceSettings } from '../src/utils/storage.ts';

describe('Appearance Spin Stop Mode Data Model', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have auto as default spinStopMode in DEFAULT_APPEARANCE_SETTINGS', () => {
    expect(DEFAULT_APPEARANCE_SETTINGS.spinStopMode).toBe('auto');
  });

  it('should save and load spinStopMode in storage', () => {
    saveAppearanceSettings({ spinStopMode: 'manual' as WordSpinStopMode });
    const loaded = loadAppearanceSettings();
    expect(loaded.spinStopMode).toBe('manual');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/appearanceSpinStopMode.test.ts`
Expected: FAIL (spinStopMode not defined on DEFAULT_APPEARANCE_SETTINGS)

- [ ] **Step 3: Update `src/types/appearance.ts`, `src/types/session.ts`, and `src/utils/storage.ts`**

In `src/types/appearance.ts`:
```typescript
export type WordSpinStopMode = 'auto' | 'manual';

export interface AppearanceSettings {
  backgroundMode?: BackgroundMode;
  themeName: 'luxury-winter-pageant' | 'ethereal-gold' | 'custom';
  spinMode: WordSpinMode;
  spinStopMode: WordSpinStopMode;
  spinDurationMs: number;
  particleDensity: number;
  glowIntensity: number;
  showCrownSilhouette: boolean;
  showWaterReflection: boolean;
  showLightRays: boolean;
  showAurora: boolean;
  showCrystals: boolean;
  fontPreset: FontPresetId;
  customFont?: CustomFontConfig;
  customColors?: Partial<ThemeColors>;
}

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  backgroundMode: 'cosmic-canvas',
  themeName: 'luxury-winter-pageant',
  spinMode: 'vertical',
  spinStopMode: 'auto',
  spinDurationMs: 4500,
  particleDensity: 1.0,
  glowIntensity: 1.0,
  showCrownSilhouette: true,
  showWaterReflection: true,
  showLightRays: true,
  showAurora: true,
  showCrystals: true,
  fontPreset: 'cinzel'
};
```

In `src/types/session.ts`: Add `'STAGE_STOP_WORD_SPIN'` to `SyncEventType`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/appearanceSpinStopMode.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/appearance.ts src/types/session.ts src/utils/storage.ts tests/appearanceSpinStopMode.test.ts
git commit -m "feat(appearance): add spinStopMode to AppearanceSettings"
```

---

### Task 2: State Machine & Stage Synchronization Logic

**Files:**
- Modify: `src/hooks/useStageSync.ts`
- Test: `tests/wordSpinStopModeSync.test.ts`

**Interfaces:**
- Produces:
  - `stopWordSpin: () => void` in `useStageSync` return object
  - Bypasses auto-progression timer during `word-spin` when `session.appearanceSettings?.spinStopMode === 'manual'`.

- [ ] **Step 1: Write integration test**

```typescript
// tests/wordSpinStopModeSync.test.ts
import { describe, it, expect } from 'vitest';
import { getNextState } from '../src/engine/stateMachine.ts';

describe('Word Spin Stop Mode Transitions', () => {
  it('transitions from word-spin to word-decelerate', () => {
    const next = getNextState('word-spin');
    expect(next).toBe('word-decelerate');
  });

  it('transitions from word-decelerate to word-lock', () => {
    const next = getNextState('word-decelerate');
    expect(next).toBe('word-lock');
  });
});
```

- [ ] **Step 2: Update `src/hooks/useStageSync.ts`**

In `src/hooks/useStageSync.ts`:
1. In automated sequence timer `useEffect`:
```typescript
    // In manual spin stop mode, do not auto-progress past word-spin
    if (session.currentState === 'word-spin' && session.appearanceSettings?.spinStopMode === 'manual') {
      return;
    }
```
2. Implement `stopWordSpin`:
```typescript
  const stopWordSpin = useCallback(() => {
    if (session.currentState === 'word-spin') {
      broadcastState({
        ...session,
        currentState: 'word-decelerate'
      }, 'STAGE_STOP_WORD_SPIN');
    }
  }, [session, broadcastState]);
```
3. Return `stopWordSpin` from hook.

- [ ] **Step 3: Run test to verify it passes**

Run: `npx vitest run tests/wordSpinStopModeSync.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useStageSync.ts tests/wordSpinStopModeSync.test.ts
git commit -m "feat(sync): implement stopWordSpin and manual stop mode timer bypass"
```

---

### Task 3: Stage UI & Keyboard Controller Integration

**Files:**
- Modify: `src/components/Stage/StageOverlay.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Control/KeyboardController.tsx`
- Modify: `src/index.css`
- Test: `tests/stageOverlayStopBtn.test.tsx`

**Interfaces:**
- Produces:
  - Interactive "⏹️ STOP SPIN" button on stage screen when `currentState === 'word-spin'` and `spinStopMode === 'manual'`.
  - Keyboard Spacebar triggers `stopWordSpin()` when in `word-spin`.

- [ ] **Step 1: Write test for StageOverlay Stop Button**

```typescript
// tests/stageOverlayStopBtn.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StageOverlay } from '../src/components/Stage/StageOverlay.tsx';
import { StageSession } from '../src/types/session.ts';
import { DEFAULT_APPEARANCE_SETTINGS } from '../src/types/appearance.ts';

describe('StageOverlay Stop Button in Manual Mode', () => {
  it('renders STOP SPIN button when in word-spin with manual stop mode', () => {
    const session: StageSession = {
      sessionId: 'test',
      currentState: 'word-spin',
      timerState: { status: 'idle', durationMs: 60000 },
      appearanceSettings: {
        ...DEFAULT_APPEARANCE_SETTINGS,
        spinStopMode: 'manual'
      }
    };

    const html = renderToString(
      React.createElement(StageOverlay, {
        session,
        onStart: () => {},
        onNext: () => {},
        onStopSpin: () => {},
        onOpenControlDrawer: () => {}
      })
    );

    expect(html).toContain('STOP SPIN');
  });

  it('does not render STOP SPIN button when in auto mode', () => {
    const session: StageSession = {
      sessionId: 'test',
      currentState: 'word-spin',
      timerState: { status: 'idle', durationMs: 60000 },
      appearanceSettings: {
        ...DEFAULT_APPEARANCE_SETTINGS,
        spinStopMode: 'auto'
      }
    };

    const html = renderToString(
      React.createElement(StageOverlay, {
        session,
        onStart: () => {},
        onNext: () => {},
        onStopSpin: () => {},
        onOpenControlDrawer: () => {}
      })
    );

    expect(html).not.toContain('STOP SPIN');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stageOverlayStopBtn.test.tsx`
Expected: FAIL (onStopSpin or button not present)

- [ ] **Step 3: Update `StageOverlay.tsx`, `App.tsx`, `KeyboardController.tsx`, and `index.css`**

In `src/components/Stage/StageOverlay.tsx`:
Add `onStopSpin?: () => void` to props.
When `session.currentState === 'word-spin' && session.appearanceSettings?.spinStopMode === 'manual'`:
```tsx
  <div className="stage-stop-spin-container animate-fade-in">
    <button className="btn-royal-stop-spin" onClick={onStopSpin}>
      <span className="btn-stop-icon">⏹</span>
      <span className="btn-stop-text">STOP SPIN (หยุดสุ่ม)</span>
    </button>
  </div>
```

In `src/App.tsx`:
Pass `onStopSpin={stopWordSpin}` to `StageOverlay`.
In `handleStartOrPause` / `handleProceed`: if `session.currentState === 'word-spin'`, call `stopWordSpin()`.

In `src/index.css`:
Add styles for `.btn-royal-stop-spin` with crystal glass neon glow and pulse animations.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/stageOverlayStopBtn.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Stage/StageOverlay.tsx src/App.tsx src/components/Control/KeyboardController.tsx src/index.css tests/stageOverlayStopBtn.test.tsx
git commit -m "feat(stage): add interactive STOP SPIN button in manual stop mode"
```

---

### Task 4: Backstage Control Center & Appearance Settings Panel

**Files:**
- Modify: `src/components/Control/AppearanceSettings.tsx`
- Modify: `src/components/Control/ControlCenter.tsx`
- Modify: `src/components/Control/ControlDrawer.tsx`
- Modify: `src/components/Control/RemoteController.tsx`
- Test: `tests/appearanceStopModePanel.test.tsx`

**Interfaces:**
- Produces:
  - Interactive selection cards for Auto-Stop and Manual-Stop in AppearanceSettingsPanel.
  - Main action button displays "🛑 STOP SPIN (หยุดการหมุนคำ) [Space]" during `word-spin`.

- [ ] **Step 1: Write test for AppearanceSettingsPanel Stop Mode Selector**

```typescript
// tests/appearanceStopModePanel.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AppearanceSettingsPanel } from '../src/components/Control/AppearanceSettings.tsx';
import { DEFAULT_APPEARANCE_SETTINGS } from '../src/types/appearance.ts';

describe('AppearanceSettingsPanel Spin Stop Mode', () => {
  it('renders Auto-Stop and Manual-Stop options', () => {
    const html = renderToString(
      React.createElement(AppearanceSettingsPanel, {
        settings: DEFAULT_APPEARANCE_SETTINGS,
        onChange: () => {}
      })
    );

    expect(html).toContain('หยุดอัตโนมัติ (Auto-Stop)');
    expect(html).toContain('หยุดด้วยตนเอง (Manual Stop)');
  });
});
```

- [ ] **Step 2: Update `AppearanceSettings.tsx`, `ControlCenter.tsx`, `ControlDrawer.tsx`, `RemoteController.tsx`**

In `AppearanceSettings.tsx`:
Add section:
```tsx
      {/* Word Spin Stop Mode Section */}
      <div className="control-section-group">
        <h3 className="group-title">
          <span className="group-icon">⏱️</span>
          <span>รูปแบบการหยุดสุ่มคำ (Word Spin Stop Mode)</span>
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 12px 0' }}>
          เลือกระหว่างการสุ่มและหยุดล็อกคำอัตโนมัติ หรือสุ่มต่อเนื่องจนกว่าจะกดปุ่มหยุด
        </p>

        <div className="mode-selection-grid">
          <button
            type="button"
            className={`mode-card ${(!current.spinStopMode || current.spinStopMode === 'auto') ? 'active' : ''}`}
            onClick={() => updateSetting('spinStopMode', 'auto')}
          >
            <span className="mode-icon">⏳</span>
            <div className="mode-info">
              <span className="mode-name">หยุดอัตโนมัติ (Auto-Stop)</span>
              <span className="mode-desc">หมุนตามเวลาที่กำหนดแล้วชะลอหยุดล็อกคำอัตโนมัติ (ค่าเริ่มต้น)</span>
            </div>
          </button>

          <button
            type="button"
            className={`mode-card ${current.spinStopMode === 'manual' ? 'active' : ''}`}
            onClick={() => updateSetting('spinStopMode', 'manual')}
          >
            <span className="mode-icon">🛑</span>
            <div className="mode-info">
              <span className="mode-name">หยุดด้วยตนเอง (Manual Stop)</span>
              <span className="mode-desc">หมุนต่อเนื่องไปเรื่อยๆ จนกว่าพิธีกร/แอดมินจะกดปุ่ม STOP หรือ Spacebar</span>
            </div>
          </button>
        </div>
      </div>
```

In `ControlCenter.tsx` & `ControlDrawer.tsx`:
Wire `stopWordSpin` and show "🛑 STOP SPIN" button when `session.currentState === 'word-spin'`.

- [ ] **Step 3: Run test to verify it passes**

Run: `npx vitest run tests/appearanceStopModePanel.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/Control/AppearanceSettings.tsx src/components/Control/ControlCenter.tsx src/components/Control/ControlDrawer.tsx src/components/Control/RemoteController.tsx tests/appearanceStopModePanel.test.tsx
git commit -m "feat(control): add spinStopMode controls and dynamic STOP button in backstage"
```

---

### Task 5: Verification, End-to-End Suite & Build Check

**Files:**
- Full repository verification

- [ ] **Step 1: Run all unit and integration test suites**

Run: `npm test`
Expected: 100% tests passing across all test files.

- [ ] **Step 2: Run production TypeScript check & Vite build**

Run: `npm run build`
Expected: Exit code 0, 0 errors.

- [ ] **Step 3: Final Commit & Push**

```bash
git add .
git commit -m "chore: complete word spin stop modes (auto vs manual) feature"
```
