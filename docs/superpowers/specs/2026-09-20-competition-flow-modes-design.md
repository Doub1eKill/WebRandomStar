# Competition Flow Modes (Keyword Mode vs Question Bank Mode) Design Specification

## 1. Overview & Purpose
In the **SCi TECH TINE Ambassador 2026 Pageant Quiz System**, different competition rounds have distinct evaluation formats:
1. **Keyword Mode (โหมดสุ่มคำสำคัญ):** Contestants spin for a single high-impact keyword (e.g. "นวัตกรรม", "การเปลี่ยนแปลง", "ความยั่งยืน"). Upon stopping, the stage locks and displays the keyword in a large, luxurious crystal showcase card while the countdown timer runs immediately for the contestant's speech/response. No long multi-line question card is revealed.
2. **Question Bank Mode (โหมดสุ่มคำถามจากคลัง):** Standard full-question pageant flow where the keyword spin leads to the reveal of a complete question from the question bank, with full question text, categories, and timer countdown.

---

## 2. Architecture & Data Model

### 2.1 Type Definitions
In `src/types/appearance.ts`:
```typescript
export type CompetitionFlowMode = 'keyword' | 'question';

export interface AppearanceSettings {
  // ... existing fields
  quizMode?: CompetitionFlowMode; // default: 'question'
}
```

In `src/types/session.ts`:
```typescript
// AppState already supports 'word-lock', 'question', 'answered', etc.
// In 'keyword' mode:
// 'word-lock' transitions directly to 'keyword-answering' (or stays in 'word-lock' / 'question' with selectedKeyword showcased)
```

### 2.2 State Transition Logic (`src/engine/stateMachine.ts`)
When `quizMode === 'keyword'`:
- Sequence: `idle` $\rightarrow$ `pre-spin` $\rightarrow$ `word-spin` $\rightarrow$ `word-decelerate` $\rightarrow$ `word-lock`
- At `word-lock`, instead of advancing to `question-reveal`, the system auto-activates the timer (if configured or started manually) and keeps the selected keyword showcased center stage until the operator marks answered.
- Next State: `answered` $\rightarrow$ `idle`.

When `quizMode === 'question'`:
- Sequence: `idle` $\rightarrow$ `pre-spin` $\rightarrow$ `word-spin` $\rightarrow$ `word-decelerate` $\rightarrow$ `word-lock` $\rightarrow$ `question-reveal` $\rightarrow$ `question` $\rightarrow$ `answered` $\rightarrow$ `idle`.

---

## 3. UI/UX Design

### 3.1 Backstage Control Center & Drawer (`ControlCenter.tsx`, `ControlDrawer.tsx`, `AppearanceSettings.tsx`)
- **Quick Competition Mode Switcher:**
  - Located prominently on the control header and inside the Appearance Settings panel.
  - Interactive Segmented Button:
    - `[ 🏷️ สุ่มคำสำคัญ (Keyword) | 📜 สุ่มคลังคำถาม (Question Bank) ]`
  - Real-time synchronization to Stage view via `useStageSync`.

### 3.2 Stage Display View (`StageOverlay.tsx`, `KeywordShowcaseCard.tsx`, `QuestionCard.tsx`)
- **In Keyword Mode:**
  - When locked/answering, displays **"KeywordShowcaseCard"**:
    - Large royal gold & diamond gradient keyword typography (`Cinzel`/`Prompt`, font size 3rem – 4.5rem).
    - Category badge pill above the keyword.
    - Ambient radial glow and floating particles.
    - Timer overlay (Center or Corner as configured).
- **In Question Mode:**
  - Displays full `QuestionCard` with question text and category banner.

---

## 4. History & Audit Manager (`historyManager.ts`, `storage.ts`)
- History record records whether the entry was from `keyword` or `question` mode.
- In `keyword` mode:
  - `questionText`: stores the keyword text or `[Keyword Mode] <keyword>`.
  - `category`: stores the keyword category.

---

## 5. Testing & Verification Plan
- Unit tests in `tests/stateMachine.test.ts` verifying next state progression under both `quizMode` settings.
- Unit tests in `tests/appearancePanel.test.tsx` verifying the switcher UI and persistence.
- E2E tests verifying complete stage cycle for both Keyword Mode and Question Bank Mode.
