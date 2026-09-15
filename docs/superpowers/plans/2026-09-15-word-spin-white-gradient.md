# Royal Word Selection White Gradient Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the word carousel and lock effect from multicolored text into an elegant pure white gradient (from soft/translucent white on outer edges to brilliant luminous diamond white at the center focus).

**Architecture:** Update `WordCarousel.tsx`, `WordLockEffect.tsx`, and `index.css` to use white gradient typography, diamond glows, and crisp white accent stars.

**Tech Stack:** React 19, TypeScript, CSS, Vitest.

## Global Constraints
- Strictly avoid arbitrary rainbow/pink/green/yellow text colors during spinning and lock.
- Maintain smooth 60fps animations.
- Ensure 100% test pass rate on all Vitest suites and TypeScript production build.

---

### Task 1: Update `WordCarousel.tsx` & `index.css` to use pure white gradient during spinning

**Files:**
- Modify: `src/components/Stage/WordSpin/WordCarousel.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Update `WordCarousel.tsx`**
  - Set center word color to `#ffffff` with white/diamond text shadow and drop shadow.
  - Set outer words opacity and color to soft white gradient (`rgba(255, 255, 255, ${opacity})`).
  - Set accent stars `✦` to pure white `#ffffff`.

- [ ] **Step 2: Update `index.css` for carousel indicators and stars**
  - Update `.carousel-indicator`, `.indicator-diamond`, and `.word-accent-star` to pure white with diamond glow.

- [ ] **Step 3: Commit**

```bash
git add src/components/Stage/WordSpin/WordCarousel.tsx src/index.css
git commit -m "feat(carousel): apply pure white diamond gradient to word spin reel"
```

---

### Task 2: Update `WordLockEffect.tsx` to use brilliant diamond white title and aura

**Files:**
- Modify: `src/components/Stage/WordSpin/WordLockEffect.tsx`

- [ ] **Step 1: Update `WordLockEffect.tsx`**
  - Render `locked-word-title` in `#ffffff` with layered diamond/crystal aura glow.
  - Update `lock-radial-bloom` and bracket accents to pure diamond white and cosmic nebula tones.

- [ ] **Step 2: Commit**

```bash
git add src/components/Stage/WordSpin/WordLockEffect.tsx
git commit -m "feat(lock): apply brilliant diamond white styling to locked word title"
```

---

### Task 3: Full Verification & Walkthrough

- [ ] **Step 1: Run Vitest test suite (`npm test -- --run`)**
- [ ] **Step 2: Run TypeScript build (`npm run build`)**
- [ ] **Step 3: Update walkthrough and progress ledger**
