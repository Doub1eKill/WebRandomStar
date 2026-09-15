# Frontstage Countdown Alert Phase Effects Design Specification

## Overview
Synchronize the frontstage timer display (`TimerDisplay.tsx`) with the backstage controller (`TimerPanel.tsx`) and dynamic alert threshold settings (`StageDisplaySettings.warningThresholdMs` and `criticalThresholdMs`). The stage timer will visually reflect all 5 countdown phases (Normal, Warning, Critical, Last-3s, and Finished) with matching badge labels, icons, numeral colors, glowing card borders, and animated progress bar gradients.

## 1. Countdown Phases & Visual Matrix

| Phase | Threshold Condition | Badge Label & Icon | Badge & Accent Color | Numeral Color & Text Shadow | Progress Bar Gradient | Container Border & Glow |
|---|---|---|---|---|---|---|
| **Normal** | `remainingMs > warningThresholdMs` | `⏱️ กำลังนับเวลา` (`Clock`) | `#38bdf8`<br>bg `rgba(56, 189, 248, 0.15)` | `#ffffff`<br>shadow `0 0 25px rgba(56, 189, 248, 0.35)` | `linear-gradient(90deg, #0284c7, #38bdf8)` | `rgba(56, 189, 248, 0.35)`<br>glow `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(13, 40, 84, 0.4)` |
| **Warning** | `remainingMs <= warningThresholdMs` (e.g. $\le 30$s) | `⚠️ ช่วงเตือน (≤30s Warning)` (`AlertTriangle`) | `#fde68a`<br>bg `rgba(245, 158, 11, 0.25)` | `#fde68a`<br>shadow `0 0 25px rgba(245, 158, 11, 0.45)` | `linear-gradient(90deg, #f59e0b, #fbbf24)` | `rgba(245, 158, 11, 0.5)`<br>glow `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.3)` |
| **Critical** | `remainingMs <= criticalThresholdMs` (e.g. $\le 10$s) | `⚠️ วิกฤต (≤10s Critical)` (`AlertTriangle`) | `#fca5a5`<br>bg `rgba(239, 68, 68, 0.25)` | `#f87171`<br>shadow `0 0 25px rgba(239, 68, 68, 0.5)` | `linear-gradient(90deg, #ef4444, #f97316)` | `rgba(239, 68, 68, 0.6)`<br>glow `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.35)` |
| **Last 3s** | `remainingMs <= 3000ms` ($\le 3$s) | `🔥 3 วินาทีสุดท้าย (Last 3s)` (`Flame`) | `#ff8888`<br>bg `rgba(255, 34, 34, 0.3)` | `#ff4444`<br>shadow `0 0 30px rgba(255, 34, 34, 0.6)` | `linear-gradient(90deg, #ff2222, #f43f5e)` | `rgba(255, 34, 34, 0.8)`<br>glow `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 34, 34, 0.45)` |
| **Finished** | `status === 'finished'` or `remainingMs <= 0` | `⚠️ สิ้นสุดเวลา` (`AlertTriangle`) | `#fca5a5`<br>bg `rgba(244, 63, 94, 0.2)` | `หมดเวลา`<br>`#fca5a5`<br>shadow `0 0 24px rgba(244, 63, 94, 0.45)` | None (hidden track) | `rgba(244, 63, 94, 0.6)`<br>glow `0 16px 48px rgba(0, 0, 0, 0.85), 0 0 35px rgba(244, 63, 94, 0.3)` |

## 2. Component Integration

### 2.1 `src/components/Stage/TimerDisplay.tsx`
- Add `stageDisplaySettings?: StageDisplaySettings` to `TimerDisplayProps`.
- Calculate phase dynamically using `getTimerPhase(timerState.remainingMs, timerState.status, stageDisplaySettings?.warningThresholdMs || timerState.warningAtMs, stageDisplaySettings?.criticalThresholdMs)`.
- Support paused timer state gracefully.
- Support all 3 display variants: `center`, `compact`, `corner`.
- Apply dynamic styles (`bg`, `border`, `glow`, `accentColor`, `badgeBg`, `numeralColor`, `textShadow`, `progressGradient`) across all variants.

### 2.2 `src/components/Stage/StageOverlay.tsx`
- Pass `stageDisplaySettings={displaySettings}` to both instances of `<TimerDisplay />`.

### 2.3 `src/engine/timerEngine.ts`
- Ensure `getTimerPhase` accepts `criticalAtMs: number = CRITICAL_THRESHOLD_MS` so custom critical thresholds configured in backstage sliders are honored.

## 3. Verification & Non-Functional Requirements
- **Performance:** Smooth 60fps countdown with zero background particle stutter or canvas flashing.
- **Visual Legibility:** Crisp solid font colors (`#ffffff`, `#fde68a`, `#f87171`, `#ff4444`, `#fca5a5`) with tabular figures (`fontVariantNumeric: 'tabular-nums'`) to avoid layout jitter.
- **Zero Regressions:** 100% test pass rate on Vitest test suite and TypeScript production build.
