# Design Specification: Word Lock / Selected Keyword Phase Toggle

## 1. Overview
This specification defines the implementation of a configurable toggle setting in the backstage management interface (**Appearance Settings Tab** and **Control Drawer**) allowing presenters and stage operators to enable or disable the **"Selected Keyword Showcase (Word Lock)"** transition phase (`word-lock`).

---

## 2. User Intent & Requirements
- **Goal**: Allow operators to choose whether the stage presents the standalone "Selected Keyword Card" showcase after spinning words, or skips directly into the question reveal phase for a faster, more streamlined competition flow.
- **Enabled State (`true`, Default)**:
  - Progression: `idle` ➔ `pre-spin` ➔ `word-spin` ➔ `word-decelerate` ➔ `word-lock` (Showcases Selected Keyword card for 1.5s) ➔ `question-reveal` ➔ `question`.
- **Disabled State (`false`)**:
  - Progression: `idle` ➔ `pre-spin` ➔ `word-spin` ➔ `word-decelerate` ➔ `question-reveal` (or direct transition to `question`). The standalone keyword card modal is bypassed seamlessly.

---

## 3. Architecture & Data Flow

### 3.1 State & Type Definitions
Update `AppearanceSettings` in `src/types/appearance.ts`:
```typescript
export interface AppearanceSettings {
  // ... existing fields ...
  showWordLockPhase: boolean; // default: true
}

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  // ... existing defaults ...
  showWordLockPhase: true
};
```

### 3.2 State Machine & Sync Progression
In `src/engine/stateMachine.ts`:
- Update `getNextState(currentState: AppState, showWordLockPhase: boolean = true): AppState`
- If `currentState === 'word-decelerate'` and `!showWordLockPhase`: returns `'question-reveal'`.

In `src/hooks/useStageSync.ts`:
- In the automatic timer sequence transition:
  ```typescript
  const next = getNextState(session.currentState, session.appearanceSettings?.showWordLockPhase ?? true);
  ```

### 3.3 Backstage Controls & UI Integration
1. **Appearance Settings Panel (`src/components/Control/AppearanceSettings.tsx`)**:
   - Add a luxury toggle card in the Stage Transitions section:
     - Title: **"ช่วงแสดงการ์ดคำที่สุ่มได้ (Selected Keyword Showcase)"**
     - Description: "เปิดเพื่อแสดงการ์ดคำสุ่มพร้อมเอฟเฟกต์ประกายดาวก่อนเปิดคำถาม หรือปิดเพื่อข้ามเข้าสู่คำถามทันที"
     - Toggle Button: `[เปิดใช้งาน (ON)]` / `[ข้ามช่วงนี้ (OFF)]`
2. **Control Drawer (`src/components/Control/ControlDrawer.tsx`)**:
   - Add a quick-toggle row under Section 2 / Stage Settings for fast backstage toggling during live shows.

---

## 4. Testing & Verification
- Unit tests in `tests/stateMachine.test.ts` verifying state transitions when `showWordLockPhase` is `true` vs `false`.
- Unit tests in `tests/appearancePanel.test.tsx` verifying the toggle switch interaction and persistence.
- Full test suite execution (`npx vitest run`) and production build (`npm run build`).
