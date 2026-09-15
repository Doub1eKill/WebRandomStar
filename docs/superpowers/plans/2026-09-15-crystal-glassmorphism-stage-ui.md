# Cosmic Crystal Glassmorphism Stage UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove informal emojis (specifically `👑` on the Ambassador badge and Spin button, and `⚙️` on footer drawer) and redesign all Stage UI elements into sharp, luxurious, semi-translucent glassmorphism (`กึ่งโปร่งใส`) with vector iconography matching the Cosmic Diamond theme.

**Architecture:** Component-level SVG vector replacements in Stage components (`StageHeader.tsx`, `StageOverlay.tsx`, `WordCarousel.tsx`, `WordLockEffect.tsx`, `QuestionCard.tsx`) coupled with modern vanilla CSS glassmorphic tokens in `src/index.css` (frosted blur, specular border highlights, smoked glass backdrops, shimmer sweeps, and crystal keycaps).

**Tech Stack:** React 19, TypeScript, Vanilla CSS3 (backdrop-filter, linear-gradient, CSS animations), Vitest.

## Global Constraints
- Strictly adhere to the Cosmic Diamond palette (`#060919`, `#C084FC`, `#38BDF8`, `#FFFFFF`).
- All interactive elements must maintain accessibility and keyboard shortcuts (`Space`, `Enter`, `T`, `Esc`).
- Ensure all 13 Vitest test suites continue to pass with 0 errors.

---

### Task 1: Vector Iconography Upgrades & Removal of Informal Emojis

**Files:**
- Modify: `src/components/Stage/StageHeader.tsx`
- Modify: `src/components/Stage/StageOverlay.tsx`
- Modify: `src/components/Stage/WordSpin/WordCarousel.tsx`
- Modify: `src/components/Stage/WordSpin/WordLockEffect.tsx`
- Modify: `src/components/Stage/QuestionCard.tsx`

**Interfaces:**
- Consumes: `StageHeaderProps`, `StageOverlayProps`
- Produces: Crisp SVG vector icons (`CrystalTiaraIcon`, `SettingsSlidersIcon`, `DiamondSparkle`) without cartoon emojis.

- [ ] **Step 1: Update `StageHeader.tsx`**
  - Replace `<span className="brand-crown">👑</span>` with inline SVG Crystal Tiara / Diamond Crest.
  - Clean up `STAGE_LABELS` to use `✦` or clean status texts without informal emojis.
- [ ] **Step 2: Update `StageOverlay.tsx`**
  - In `isIdle` hero button, remove `<span className="btn-sparkle">👑</span>`. Keep crisp typography `✦ SPIN WORD ✦` and glass `[Space]` badge.
  - In footer drawer trigger, replace `⚙️ แผงควบคุม` with inline SVG icon + `แผงควบคุม`.
- [ ] **Step 3: Update WordSpin & QuestionCard components**
  - In `WordCarousel.tsx`, `WordLockEffect.tsx`, `QuestionCard.tsx`, ensure any remaining emojis are replaced with clean SVG or `✦`.
- [ ] **Step 4: Verify test suite**
  - Run `npm test -- --run` to verify no regressions.
- [ ] **Step 5: Commit changes**
  - `git commit -m "feat(stage-ui): replace informal emojis with vector crystal iconography"`

---

### Task 2: Semi-Translucent Glassmorphism CSS Upgrades

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: Glassmorphic CSS classes: `.btn-royal-spin`, `.btn-key-hint`, `.royal-badge`, `.glass-chip`, `.round-chip`, `.status-chip`, `.stage-footer`, `.footer-keys-hint`, `.btn-drawer-trigger`, `.idle-nature-quote`.

- [ ] **Step 1: Implement `.btn-royal-spin` and `.btn-key-hint` glassmorphism**
  - Apply `background: linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(88, 28, 135, 0.35) 50%, rgba(14, 165, 233, 0.25) 100%)`
  - Apply `backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);`
  - Apply sharp border `1px solid rgba(192, 132, 252, 0.6)` with specular top highlight `inset 0 1px 1px rgba(255, 255, 255, 0.5)`.
  - Add shimmer sweep animation on hover.
  - Style `.btn-key-hint` as a frosted glass keycap.
- [ ] **Step 2: Implement Header Badges & Chips glassmorphism**
  - Update `.royal-badge`, `.brand-badge`, `.glass-chip`, `.round-chip`, `.status-chip` with smoked translucent backdrops (`rgba(15, 23, 42, 0.55)`), delicate glowing borders, and crisp serif/sans typography.
- [ ] **Step 3: Implement Footer Dock & Key Hint bar glassmorphism**
  - Style `.stage-footer` and `.footer-keys-hint` with floating translucent capsule dock styles.
  - Style `.btn-drawer-trigger` with sleek glass pill and glowing hover elevation.
- [ ] **Step 4: Update `.idle-nature-quote` typography**
  - Gradient text from `#FFFFFF` to `#C084FC` with subtle glow.
- [ ] **Step 5: Run TypeScript check & build**
  - `npx tsc --noEmit` and `npm run build`
- [ ] **Step 6: Commit changes**
  - `git commit -m "feat(styles): implement cosmic crystal glassmorphism for stage UI"`

---

### Task 3: Full Verification, Browser E2E Inspection & Walkthrough

**Files:**
- Output: Screenshots & `walkthrough.md`

- [ ] **Step 1: Automated test verification**
  - `npm test -- --run`
- [ ] **Step 2: Browser subagent visual inspection**
  - Navigate to `http://localhost:3000/` in browser.
  - Capture full-res screenshots of the new Glassmorphic Stage UI in idle and active states.
  - Verify transparency over 3D AeroShards and 2D Cosmic Canvas.
- [ ] **Step 3: Update walkthrough artifact & final commit**
  - Update `walkthrough.md` with visual evidence.
  - Commit all updates.
