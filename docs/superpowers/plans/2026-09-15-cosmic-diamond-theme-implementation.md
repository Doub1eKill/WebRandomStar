# Cosmic Diamond & Nebula Pageant Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the entire visual theme and color palette of the web application to match the official **"✦ SCi TECH TINE ✦ CHARM OF TRANSITION AMBASSADOR 2026"** contest poster (Cosmic Midnight Navy, Velvet Nebula Violet, Diamond Ice-Cyan, and Lavender Starlight).

**Architecture:**
- **Design Tokens & Global CSS:** Update root variables, glassmorphism surfaces, borders, and button gradients in `src/index.css`.
- **Stage Canvas 2D Physics:** Tune `AuroraSystem.ts`, `CrystalSystem.ts`, `ReflectionSystem.ts`, and `CrownSystem.ts` to cosmic violet nebulae, 4-point diamond sparkles, and shimmering water reflection.
- **Stage Typography & Narrative Cues:** Integrate slogans (*"เสน่ห์แห่งการเปลี่ยนผ่าน สู่ดาวนำทางแห่งอนาคต"* & *"ในฤดูกาลเปลี่ยนผ่าน มักมีกลุ่มดาวเปล่งประกายเสมอ"*) in `StageHeader.tsx`, `WordCarousel.tsx`, and `WordLockEffect.tsx`.
- **Backstage Control Styling:** Harmonize all control center tabs with matching cosmic glassmorphism.

**Tech Stack:** React 19, TypeScript, Vanilla CSS, HTML5 Canvas 2D, Lucide React, Vitest.

## Global Constraints
- Version floors: React 19, Vite 6, Vitest 3.
- Offline 100%: Pure CSS, Canvas 2D, and Web Audio API; zero external network dependencies.
- Zero TypeScript errors and 100% test pass rate across all 13 test suites.

---

### Task 1: Design Tokens, Backgrounds & Global CSS Alignment

**Files:**
- Modify: `src/index.css`
- Test: `tests/setup.test.ts`

- [ ] **Step 1: Update `:root` tokens and background gradients in `src/index.css`**
  - Define `--bg-primary: #060919;`, `--bg-stage-gradient: radial-gradient(circle at 50% 20%, #1e103f 0%, #0c0a27 45%, #060919 100%);`
  - Define `--accent-nebula-violet: #7c3aed;`, `--accent-diamond-cyan: #38bdf8;`, `--accent-lavender: #c084fc;`
  - Update `.btn-royal-spin` and `.btn-primary-glow` to Cosmic Violet & Diamond Cyan gradients.
- [ ] **Step 2: Run unit tests**
  Run: `npx vitest run tests/setup.test.ts`
  Expected: PASS
- [ ] **Step 3: Commit Task 1**
  ```bash
  git add src/index.css
  git commit -m "feat: align design tokens with cosmic diamond and nebula palette"
  ```

---

### Task 2: Stage Canvas 2D Physics Systems Realignment

**Files:**
- Modify: `src/components/Stage/canvas/AuroraSystem.ts`
- Modify: `src/components/Stage/canvas/CrystalSystem.ts`
- Modify: `src/components/Stage/canvas/ReflectionSystem.ts`
- Modify: `src/components/Stage/canvas/CrownSystem.ts`
- Test: `tests/leafSystem.test.ts`

- [ ] **Step 1: Update AuroraSystem with cosmic nebula hues**
  - Set sinusoidal color gradients to `#6d28d9` (violet), `#38bdf8` (cyan), and `#c084fc` (lavender).
- [ ] **Step 2: Update CrystalSystem for 4-point diamond starlight sparkle**
  - Draw 4-point diamond cross flares with white centers and ice-cyan halos.
- [ ] **Step 3: Update ReflectionSystem with shimmering violet-cyan water reflection**
  - Adjust gradient stops to deep violet and soft starlight reflection.
- [ ] **Step 4: Update CrownSystem with diamond tiara starlight silhouette**
  - Render diamond starlight glow with lavender halo.
- [ ] **Step 5: Run unit tests**
  Run: `npx vitest run tests/leafSystem.test.ts`
  Expected: PASS
- [ ] **Step 6: Commit Task 2**
  ```bash
  git add src/components/Stage/canvas/
  git commit -m "feat: update canvas 2D aurora, crystal sparkles, and reflections to cosmic nebula theme"
  ```

---

### Task 3: Stage Header, Word Carousel & Lock Slogans

**Files:**
- Modify: `src/components/Stage/StageHeader.tsx`
- Modify: `src/components/Stage/WordSpin/WordCarousel.tsx`
- Modify: `src/components/Stage/WordSpin/WordLockEffect.tsx`
- Modify: `src/components/Stage/QuestionCard.tsx`
- Test: `tests/wordSpinEngine.test.ts`

- [ ] **Step 1: Update StageHeader with official title and slogan**
  - Header: `"✦ SCi TECH TINE ✦ CHARM OF TRANSITION AMBASSADOR 2026"`
  - Slogan: `"เสน่ห์แห่งการเปลี่ยนผ่าน สู่ดาวนำทางแห่งอนาคต"`
- [ ] **Step 2: Update WordCarousel & WordLockEffect with cosmic quote**
  - Quote: `"ในฤดูกาลเปลี่ยนผ่าน มักมีกลุ่มดาวเปล่งประกายเสมอ"`
  - Lens flare and particle burst tuned to diamond starlight.
- [ ] **Step 3: Run unit tests**
  Run: `npx vitest run tests/wordSpinEngine.test.ts`
  Expected: PASS
- [ ] **Step 4: Commit Task 3**
  ```bash
  git add src/components/Stage/
  git commit -m "feat: embed official contest slogans and diamond starlight cues into stage visuals"
  ```

---

### Task 4: Full Verification, QA & Documentation Update

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
  git commit -m "docs: document cosmic diamond and nebula theme alignment in project summary"
  ```
