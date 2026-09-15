# Design Spec: Stage Center Alignment & Luxury Question Card Refinement

## 1. Context & Goal
- **User Issue 1:** On the initial idle stage, the quote and "SPIN WORD" button are shifted to the left rather than being centered horizontally and vertically on screen.
- **User Issue 2:** On the question reveal stage (page 2), the question card contains weather cartoon emojis (such as `🌧️`), has an unaligned header row causing `Q_RAIN_06` to wrap awkwardly, and needs complete styling refinement into a neat, sharp, luxury glassmorphic card matching the Cosmic Diamond theme.

---

## 2. Technical Design & Architecture

### 2.1 Stage Layout Centering
- In `StageOverlay.tsx` and `src/index.css`:
  - Ensure `.stage-body` and `.stage-main-content` fill the available viewport area with:
    ```css
    .stage-body,
    .stage-main-content {
      flex: 1;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
    ```
  - Ensure `.stage-idle-hero` is centered with `margin: 0 auto; display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 720px;`.

### 2.2 Category Iconography Upgrades
- In `src/types/question.ts`:
  - Update `CATEGORY_CONFIGS` to replace informal emojis (`🌧️`, `🌫️`, `🍃`, `🍂`, `🌙`, `⭐`, `👑`) with crisp crystal geometric symbols:
    - Rain: `◈` / `✦` (Crystal Prism)
    - Mist: `◇` (Silver Diamond)
    - Wind: `❖` (Aurora Star)
    - Leaf: `✧` (Golden Spire)
    - Moon: `⬡` (Luminous Hexagon)
    - Star: `✦` (Radiant Spark)
    - Final: `✦` (Royal Diamond)

### 2.3 Question Card Glassmorphism & Header Layout
- In `QuestionCard.tsx` and `src/index.css`:
  - **Header Ribbon (`.card-header-ribbon`):**
    - `display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px;`
    - **Left Section (`.card-header-left`):** Category badge with crystal icon, Category Name (`font-size: 1.2rem; font-weight: 700; color: cat.color;`), and Subtitle (`font-size: 0.75rem; text-transform: uppercase; color: #94a3b8;`).
    - **Right Section (`.card-header-right`):** `AMBASSADOR 2026` tiara badge + `question.id` chip (`background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(192, 132, 252, 0.35); border-radius: 9999px; padding: 4px 12px; font-family: monospace; font-size: 0.8rem; color: #e2e8f0;`).
  - **Question Text Content (`.question-text-content`):**
    - Clear, legible typography with `color: #ffffff; text-shadow: 0 2px 16px rgba(0, 0, 0, 0.8), 0 0 20px rgba(192, 132, 252, 0.25);`.
    - Elegant crystal quotes `“` and `”`.
  - **Card Container & Borders:**
    - Frosted smoked glass: `background: rgba(11, 16, 43, 0.68); backdrop-filter: blur(28px); border: 1px solid rgba(192, 132, 252, 0.45); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.3); border-radius: 24px;`.
  - **Footer:** Tag pills on left, glassmorphic Next button on right.

---

## 3. Verification Plan
- **Automated Tests:** Run full Vitest suite (`npm test -- --run`).
- **Production Build:** Run `npm run build` (`tsc -b && vite build`).
- **Browser Live Inspection:** Capture idle screen to verify true center alignment, and question screen to verify the neat, emoji-free, luxury question card.
