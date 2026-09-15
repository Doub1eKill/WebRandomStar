# Stage Center Alignment & Luxury Question Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Perfectly center the idle hero quote and SPIN WORD button on stage, and refine the question reveal card layout into a clean, luxury glassmorphism card free of cartoon emojis with an aligned header and crisp typography.

**Architecture:** Update `StageOverlay.tsx` and `index.css` for stage flex centering; update `src/types/question.ts` to replace emoji category icons with crystal glyphs; refine `QuestionCard.tsx` and `index.css` header ribbon into a unified flex container.

**Tech Stack:** React 19, TypeScript, Vanilla CSS3, Vitest.

## Global Constraints
- Adhere strictly to the Cosmic Diamond palette (`#060919`, `#C084FC`, `#38BDF8`, `#FFFFFF`).
- Maintain full responsiveness across desktop and mobile.
- Ensure all 13 test suites pass.

---

### Task 1: Fix Stage Main Content Centering Layout

**Files:**
- Modify: `src/components/Stage/StageOverlay.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Update `.stage-body` and `.stage-main-content` CSS**
  - Ensure `.stage-body, .stage-main-content` has `flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; margin: 0 auto;`.
  - Ensure `.stage-idle-hero` is centered with `margin: 0 auto; text-align: center; display: flex; flex-direction: column; align-items: center;`.
- [ ] **Step 2: Commit Task 1 changes**
  - `git commit -m "fix(stage): center idle hero quote and spin button on stage"`

---

### Task 2: Refine Category Icons & Question Card Layout

**Files:**
- Modify: `src/types/question.ts`
- Modify: `src/components/Stage/QuestionCard.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Update `CATEGORY_CONFIGS` in `src/types/question.ts`**
  - Replace `🌧️`, `🌫️`, `🍃`, `🍂`, `🌙`, `⭐`, `👑` with crystal geometric symbols (`◈`, `◇`, `❖`, `✧`, `⬡`, `✦`).
- [ ] **Step 2: Refine `QuestionCard.tsx` structure**
  - Organize `.card-header-ribbon` into `.card-header-left` (category icon + name + subtitle) and `.card-header-right` (tiara badge + ID pill).
- [ ] **Step 3: Update `src/index.css` for `.card-header-ribbon` and `.question-card`**
  - Add flex layout to `.card-header-ribbon` (`display: flex; align-items: center; justify-content: space-between; width: 100%;`).
  - Style `.question-id-chip` as a sleek glass pill badge in line with the tiara badge.
  - Refine question card glassmorphism with frosted blur, glowing border, and specular highlight.
- [ ] **Step 4: Commit Task 2 changes**
  - `git commit -m "feat(question-card): refine question card layout and upgrade category icons"`

---

### Task 3: Verification, Browser Inspection & Walkthrough

**Files:**
- Output: `walkthrough.md` & screenshots

- [ ] **Step 1: Automated tests & build**
  - `npm test -- --run` and `npm run build`
- [ ] **Step 2: Browser subagent inspection**
  - Inspect idle stage centering.
  - Trigger word spin -> question reveal and verify question card alignment and aesthetics.
- [ ] **Step 3: Update walkthrough & finalize**
  - Update `walkthrough.md` with visual evidence.
