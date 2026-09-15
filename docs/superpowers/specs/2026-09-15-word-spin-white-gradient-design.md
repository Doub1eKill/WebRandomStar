# Royal Word Selection White Gradient Design Specification

## Overview
Replace multicolored keyword styling during the randomization / word spin phase (`WordCarousel.tsx`) and lock phase (`WordLockEffect.tsx`) with an elegant, radiant white monochrome gradient (from soft translucent white on the edges to brilliant, luminous diamond white at the center focus).

## 1. Visual Specification

### 1.1 Word Carousel Reel (`WordCarousel.tsx`)
- **Center Focused Word (`active-center`):**
  - Text Color: `#ffffff` (Pure radiant white).
  - Text Shadow: `0 0 24px rgba(255, 255, 255, 0.9), 0 0 48px rgba(165, 243, 252, 0.45)`.
  - Filter: `drop-shadow(0 0 16px rgba(255, 255, 255, 0.8))`.
  - Accompanying Stars `✦`: Pure white `#ffffff` with pulse glow.
- **Outer Reel Words (Non-center):**
  - Offset 1 / -1: `rgba(255, 255, 255, 0.65)`.
  - Offset 2 / -2: `rgba(255, 255, 255, 0.40)`.
  - Offset 3 / -3: `rgba(255, 255, 255, 0.20)`.
- **Top / Bottom Diamond Indicators (`indicator-top`, `indicator-bottom`):**
  - Diamond `◆`: `#ffffff` with `filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))`.

### 1.2 Locked Word Aura (`WordLockEffect.tsx`)
- **Locked Keyword Title (`locked-word-title`):**
  - Text Color: `#ffffff`.
  - Text Shadow: `0 0 25px rgba(255, 255, 255, 0.95), 0 0 50px rgba(192, 132, 252, 0.5), 0 0 75px rgba(165, 243, 252, 0.35)`.
- **Radial Bloom Background:**
  - `radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(192, 132, 252, 0.15) 45%, transparent 70%)`.
- **Brackets `◇ ✦`:**
  - Color: `#ffffff` with diamond glow.

## 2. Affected Files
- `src/components/Stage/WordSpin/WordCarousel.tsx`
- `src/components/Stage/WordSpin/WordLockEffect.tsx`
- `src/index.css` (indicators, diamond stars, active center styling)

## 3. Verification
- Vitest test suite passes 100%.
- TypeScript production build passes with zero errors.
- Visual check in browser confirms pure white gradient during spinning without multicolor artifacts.
