# Design Specification: Luxury Stage Chronometer & Smooth Timer Refinement

**Date:** 2026-09-15  
**Topic:** Stage Timer Visual Smoothness & Audio Refinement  
**Target:** `RandomizeQuiz` (SCi TECH TINE 2026 / Royal Word Spin)  
**Status:** Approved  

---

## 1. Background & Problem Statement

During stage presentation testing of the Timer in Version 3.0, several UI and audio issues were identified:
1. **DOM Re-render Stuttering:** The countdown timer wrapper in `TimerDisplay.tsx` was using `key={remainingSeconds}`, destroying and recreating DOM nodes every second and retriggering entrance animations.
2. **Progress Bar Jitter:** The progress bar CSS transition (`0.18s linear`) conflicted with the 100ms state updates from `useTimer.ts`, causing visible stepping and stuttering.
3. **Chaotic Canvas Vignette Strobe:** In `TransitionLightingSystem.ts`, rapid sinusoidal flashing (`Math.sin(t * 8.0)`) created a high-frequency red strobe that distracted from the stage atmosphere.
4. **Harsh Synthesizer Audio:** High-frequency triangle waves in `audioEngine.playTickSound` caused sharp, grating ticks during the final 10 seconds.

---

## 2. Goals & Design Principles

- **Buttery Smooth 60fps Animation:** Zero DOM destruction, layout shifts, or jerky frame drops during countdown.
- **Tabular Fixed-Width Typography:** Digits render with `tabular-nums` so numbers change in-place without horizontal shifting.
- **Subtle, Royal Stage Lighting:** Transition canvas vignette into a calm, gentle breathing glow (warm amber $\rightarrow$ soft ruby) without strobe flashes.
- **Acoustic Luxury Sound Palette:** Pure sine waves, crystal chronometer ticks, harmonic countdown chimes (G5 $\rightarrow$ A5 $\rightarrow$ C6), and resonant finish gong.

---

## 3. Detailed Component & System Specifications

### 3.1 `TimerDisplay.tsx` & `index.css`
- Remove dynamic `key` attribute on `.timer-digit-wrapper`.
- Add typography styles:
  ```css
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  display: inline-block;
  min-width: 2.8ch;
  text-align: center;
  ```
- Remove `animate-bounce` on timer flame/warning icons.
- Update progress bar transition to `transition: width 0.1s linear;` or immediate smooth interpolation.
- Refine container styling with smooth transitions:
  ```css
  transition: background 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease;
  ```

### 3.2 `TransitionLightingSystem.ts`
- Remove high-frequency oscillation (`Math.sin(time * 8.0)`).
- Replace with smooth breathing vignette:
  - `warning`: `0.15 + Math.sin(this.timeAccumulator * 1.2) * 0.03` (Soft amber rim).
  - `critical` & `last-3s`: `0.28 + Math.sin(this.timeAccumulator * 1.5) * 0.05` (Soft ruby feathering rim).
- Lerp intensity smoothly:
  `this.vignetteIntensity += (targetVignette - this.vignetteIntensity) * 0.05;`
- Gradient feathering starts at `maxDist * 0.6` to keep the center of the stage clean and legible.

### 3.3 `audioEngine.ts`
- **Soft Chronometer Tick (`playTickSound` for >10s):**
  - Sine oscillator decaying from 640Hz $\rightarrow$ 320Hz over 35ms.
  - Quiet base gain (0.12).
- **Critical Tick (10s to 4s):**
  - Warm sine oscillator at 720Hz decaying over 50ms with subtle warm harmonic resonance.
- **Harmonic Countdown Bells (3s, 2s, 1s):**
  - 3s remaining: G5 (783.99 Hz) pure bell tone.
  - 2s remaining: A5 (880.00 Hz) pure bell tone.
  - 1s remaining: C6 (1046.50 Hz) pure bell tone.
  - Decay envelope: 0.25s exponential ramp down.
- **Royal Finish Gong (`playTimerFinish`):**
  - Polyphonic triad (C4, G4, C5) with warm 1.6s natural acoustic tail.

---

## 4. Verification Plan

1. **Unit & Audio Engine Tests:** Run `npm test` to verify that all timer and audio methods continue to pass.
2. **Visual & Frame Smoothness Check:** Verify countdown transitions from 30s to 0s in browser mode without DOM re-mounting, jitter, or layout jumping.
3. **Production Build:** Verify `npm run build` passes with zero TypeScript/CSS errors.
