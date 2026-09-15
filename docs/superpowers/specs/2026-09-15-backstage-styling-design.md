# Design Specification: Luxury Backstage Command Center UI Overhaul

**Date:** 2026-09-15  
**Topic:** Backstage Control Center UI Styling & Layout Overhaul  
**Target:** `RandomizeQuiz` (SCi TECH TINE 2026 / Royal Word Spin)  
**Status:** Approved  

---

## 1. Background & Problem Statement

Backstage control screens (`WordBankDashboard.tsx` and `AppearanceSettings.tsx`) suffered from missing and unformatted CSS rules:
1. **Word Bank Dashboard:** Metric statistics were rendered as raw unaligned text; search inputs and category selectors were unstyled browser defaults; the data table lacked modern grid spacing, borders, row hover states, and card-backed action buttons.
2. **Appearance Settings Panel:** The 4 word spin modes collapsed horizontally into unreadable overlapping text; atmospheric toggles and sliders were displayed as raw unaligned HTML checkboxes and sliders without card grids.

---

## 2. Goals & Design Principles

- **Unified Luxury Dark Glassmorphism:** High-contrast dark backgrounds (`rgba(15, 23, 42, 0.75)` / `#090d16`), luminous indigo/cyan/gold accents, and clean padding.
- **Structured Responsive Grids:** 2x2 and 3-column auto-fit grids for metric stat cards, mode selectors, and toggle switches.
- **Card-Based Interactive Elements:** Mode selection cards with icons and active neon borders, iOS-style toggle cards for atmospheric layers, and custom slider thumbs with percentage pills.
- **Polished Data Tables:** Sticky table headers, subtle zebra striping, category color badges, glowing keyword titles, and styled icon action buttons.

---

## 3. Detailed Component Specifications

### 3.1 `WordBankDashboard.tsx` & CSS
- **Stat Metric Cards (`.qb-stats-row`, `.qb-stat-card`):**
  - Grid: `grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))`, gap `1rem`.
  - Cards: `background: rgba(15, 23, 42, 0.65)`, `border: 1px solid rgba(255, 255, 255, 0.1)`, `border-radius: 12px`, padding `1rem 1.25rem`.
  - Stat number: `font-size: 1.8rem`, `font-weight: 800`.
  - Accent colors: Total (White/Cyan), Enabled (Emerald `#22c55e`), Disabled (Rose `#f43f5e`).
- **Toolbar (`.qb-toolbar`):**
  - Search input with embedded glass icon, focus glow `0 0 0 2px rgba(99, 102, 241, 0.4)`.
  - Custom styled dropdown select.
  - Gradient button `+ เพิ่มคำสำคัญใหม่` (`linear-gradient(135deg, #6366f1, #8b5cf6)`).
- **Table (`.qb-table-wrap`, `.qb-table`):**
  - Rounded 14px container, sticky `<thead>`, row hover background `rgba(99, 102, 241, 0.08)`.
  - Keyword title with colored `✦` sparkle.
  - Category badge pill with translucent border and icon.
  - Action buttons (`.btn-action-icon`) with glassmorphic button boxes and hover scale.

### 3.2 `AppearanceSettings.tsx` & CSS
- **Word Spin Mode Grid (`.mode-selection-grid`):**
  - Responsive 2x2 Grid (`repeat(auto-fit, minmax(280px, 1fr))`), gap `1rem`.
  - `.mode-card`: `border: 1.5px solid rgba(255, 255, 255, 0.1)`, `background: rgba(15, 23, 42, 0.6)`, padding `1.25rem`, border-radius `16px`.
  - Active `.mode-card.active`: `border-color: #818cf8`, `background: rgba(99, 102, 241, 0.18)`, `box-shadow: 0 0 20px rgba(99, 102, 241, 0.35)`.
- **Atmospheric FX Toggles (`.toggles-grid`, `.toggle-switch-card`):**
  - 2x2 Grid with card-backed toggle labels and custom checkbox switch indicators.
- **Sliders Panel (`.sliders-panel`):**
  - Card container with percentage badge pills and styled gradient range inputs.

---

## 4. Verification Plan

1. **Automated Tests:** Run `npm test -- --run` to verify that all 13 test suites (69 tests) pass.
2. **Production Build:** Run `npm run build` (`tsc -b && vite build`) to verify clean compile with 0 errors.
3. **Visual Inspection:** Verify both Word Bank and Appearance tabs render with beautiful, aligned glassmorphic cards and grids.
