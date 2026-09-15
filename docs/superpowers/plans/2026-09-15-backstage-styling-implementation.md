# Luxury Backstage Command Center UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the Backstage Command Center UI, specifically upgrading the Word Bank Dashboard and Appearance Settings Panel with modern Dark Glassmorphism, responsive 2x2 and 3-column grids, glowing interactive cards, custom toggle switches, and polished data tables.

**Architecture:**
- **Word Bank Dashboard:** Implement glassmorphic metric stat cards, custom-styled dark search and filter toolbar, sticky-header data table with category color badges, status switches, and card-backed action buttons.
- **Appearance Settings Panel:** Implement a responsive 2x2 grid for Word Spin Mode selection cards with neon active borders, a 2x2 grid for Atmospheric Layer FX toggle cards, and modern range sliders with live percentage pills.
- **CSS Design System:** Add comprehensive backstage UI classes to `src/index.css` supporting glassmorphism, responsive grids, custom controls, and hover effects.

**Tech Stack:** React 19, TypeScript, Vanilla CSS, Lucide React, Vitest.

---

### Task 1: Word Bank Dashboard Styling & Layout

**Files:**
- Modify: `src/components/Control/WordBankDashboard.tsx`
- Modify: `src/index.css`
- Test: `tests/wordSelector.test.ts`

- [ ] **Step 1: Update `WordBankDashboard.tsx` markup and structure**
  - Use Lucide icons (Search, Plus, RotateCcw, Edit2, Trash2, Tag, Layers).
  - Ensure metric cards, search toolbar, and data table have clean accessible markup.
- [ ] **Step 2: Add Word Bank CSS classes to `src/index.css`**
  - Define `.word-bank-dashboard`, `.qb-stats-row`, `.qb-stat-card`, `.qb-toolbar`, `.qb-search-wrap`, `.qb-search-input`, `.qb-filter-select`, `.qb-table-wrap`, `.qb-table`, `.word-cell-wrap`, `.cat-badge-chip`, `.theme-text-muted`, `.q-count-badge`, `.btn-action-icon`.
- [ ] **Step 3: Run unit tests**
  Run: `npx vitest run tests/wordSelector.test.ts`
  Expected: PASS
- [ ] **Step 4: Commit Task 1**
  ```bash
  git add src/components/Control/WordBankDashboard.tsx src/index.css
  git commit -m "feat: overhaul Word Bank dashboard with luxury glassmorphic styling"
  ```

---

### Task 2: Appearance Settings Panel Grid & Interactive Cards

**Files:**
- Modify: `src/components/Control/AppearanceSettings.tsx`
- Modify: `src/index.css`
- Test: `tests/data.test.ts`

- [ ] **Step 1: Update `AppearanceSettings.tsx` structure**
  - Ensure 4 mode cards, 4 toggle switches, and 2 range sliders have structured classes and semantic attributes.
- [ ] **Step 2: Add Appearance CSS classes to `src/index.css`**
  - Define `.appearance-settings-panel`, `.control-section-group`, `.group-title`, `.mode-selection-grid`, `.mode-card`, `.toggles-grid`, `.toggle-switch-card`, `.toggle-card-content`, `.sliders-panel`, `.slider-row`, `.range-slider`.
- [ ] **Step 3: Run unit tests**
  Run: `npx vitest run tests/data.test.ts`
  Expected: PASS
- [ ] **Step 4: Commit Task 2**
  ```bash
  git add src/components/Control/AppearanceSettings.tsx src/index.css
  git commit -m "feat: upgrade Appearance settings with 2x2 mode grid and toggle cards"
  ```

---

### Task 3: Full Verification, QA & Documentation Update

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
  git commit -m "docs: document backstage UI overhaul in project summary"
  ```
