# Design Specification: Ultra-Clean Royal Pageant Timer

**Date:** 2026-09-15  
**Topic:** Ultra-Clean, Non-Flashing Stage Timer Display  
**Target:** `RandomizeQuiz` (SCi TECH TINE 2026 / Royal Word Spin)  
**Status:** Approved  

---

## 1. Background & Problem Statement

In the previous design, countdown timers dynamically cycled through multiple sub-phases (`normal` $\rightarrow$ `warning` $\rightarrow$ `critical 10s` $\rightarrow$ `last-3s` $\rightarrow$ `finished`). This caused:
1. Rapid background color and border shifts over short intervals, creating a flashing sensation.
2. Excess text shadows and blurred glows around the countdown digits, reducing legibility.
3. Canvas dynamic vignette color shifts during countdown.

---

## 2. Goals & Design Principles

- **Unified Steady Appearance:** Single consistent Deep Navy Glassmorphism theme throughout the entire countdown.
- **Zero Mid-Countdown Flashing:** No border, background, or badge changes at 30s, 10s, or 3s.
- **High-Contrast, Crisp Typography:** Clean white/ice-blue digits with crisp edges and tabular fixed widths (`font-variant-numeric: tabular-nums`).
- **Smooth Single-Tone Progress Bar:** Consistent Royal Blue $\rightarrow$ Cyan gradient smoothly gliding from 100% to 0%.
- **Clean Finished State:** Transition to "สิ้นสุดเวลา" / "หมดเวลา" only when remaining time reaches 0s.
- **Stable Stage Canvas Lighting:** Disable countdown red edge vignette on canvas to maintain clean stage visibility.

---

## 3. Detailed Component Specifications

### 3.1 `TimerDisplay.tsx`
- Define two visual states: `running` (all positive countdown time) and `finished` (0ms remaining).
- **Running Theme:**
  - Card Background: `rgba(7, 17, 38, 0.88)`
  - Card Border: `1.5px solid rgba(56, 189, 248, 0.35)`
  - Card Shadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(13, 40, 84, 0.4)`
  - Badge: `<Clock size={16} /> กำลังนับเวลา` with soft cyan pill background `rgba(56, 189, 248, 0.15)`.
  - Digits: `linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)`, text shadow `0 2px 14px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.25)`.
  - Progress Bar: `linear-gradient(90deg, #0284c7, #38bdf8)`, smooth linear 0.1s transition.
- **Finished Theme:**
  - Card Background: `rgba(20, 10, 25, 0.92)`
  - Card Border: `1.5px solid rgba(244, 63, 94, 0.5)`
  - Badge: `<AlertTriangle size={16} /> สิ้นสุดเวลา`
  - Digits: `หมดเวลา` in soft coral rose.

### 3.2 `TransitionLightingSystem.ts`
- Remove dynamic vignette calculation from timer phases.
- Maintain steady stage ambiance and lighting sweep without countdown color flashing.

---

## 4. Verification Plan

1. **Unit & Engine Tests:** Run `npm test` across all 13 test suites (100% pass).
2. **Production Build:** Run `npm run build` (`tsc -b && vite build`) to ensure 0 compile errors.
3. **Visual Inspection:** Verify stable, non-flashing countdown in Grand Center and Corner HUD modes.
