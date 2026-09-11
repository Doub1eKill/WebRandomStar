# Design Specification: Royal Crown Grandeur & Cinematic Suspense

**Document:** `docs/superpowers/specs/2026-09-11-cinematic-suspense-ui-design.md`  
**Date:** 2026-09-11  
**Status:** Approved  
**Author:** Antigravity  

---

## 1. Overview & Objectives

Following the establishment of the **"SCI TECH TINE: CHARM OF TRANSITION — AMBASSADOR 2026"** pageant theme, this specification elevates the UI aesthetics to **Haute Couture Glassmorphism** (razor-sharp diamond borders, specular light sweeps, and luxury HUD elements) and transforms the quiz reveal moment into a **Cinematic Suspense & Royal Supernova Climax** that captivates both stage audiences and live broadcasts.

### Key Goals
1. **Haute Couture Glassmorphism UI**:
   - Replace generic rounded pills with crisp, beveled diamond glassmorphism (1px diamond borders, inner specular glints, refined typography).
   - Add periodic **Specular Light Sweeps** across primary call-to-action buttons (`.btn-start-journey`, `.btn-next-action`).
   - Redesign stage headers, status chips, and footer controls into a cohesive Luxury Stage HUD.
2. **Cinematic Suspense Buildup (~1.2s)**:
   - When the crystalline hero leaf reaches the center, trigger an intentional suspense beat:
     - **Stage Vignette Dimming**: Hall lighting dims to focus 100% of attention on the center pedestal.
     - **Converging Light Rings**: 3 concentric diamond laser rings collapse into the leaf core with accelerating velocity.
     - **Procedural Sound Riser**: Deep pulsing sub-bass heartbeat coupled with an ascending crystalline resonance via Web Audio API.
3. **The Royal Supernova & 3D Tiara Unfold**:
   - High-intensity upward Vertical Violet Spotlight Beam and diamond white laser core.
   - Screen-wide diamond shockwave rings expanding across the stage.
   - 24 diamond starburst flares (`✦`) dispersing outward in 3D perspective.
   - `QuestionCard` blossoms with a 3D scale & shimmer unfold animation (`@keyframes tiara-card-reveal`).

---

## 2. Architecture & Design Details

### 2.1 UI System & Haute Couture Styling (`src/index.css`)

#### Design Tokens & Refinements
- `--glass-border`: `rgba(216, 180, 254, 0.42)` with inner highlight `rgba(255, 255, 255, 0.15)`
- `--glass-bg-luxury`: `rgba(12, 10, 32, 0.88)`
- `--glow-amethyst`: `rgba(168, 85, 247, 0.45)`
- `--glow-diamond`: `rgba(255, 255, 255, 0.7)`

#### Specular Light Sweep Animation
```css
@keyframes specular-sweep {
  0% { transform: translateX(-150%) skewX(-25deg); opacity: 0; }
  15% { opacity: 0.8; }
  35% { transform: translateX(250%) skewX(-25deg); opacity: 0; }
  100% { transform: translateX(250%) skewX(-25deg); opacity: 0; }
}
```
Applied via `::after` pseudo-element on `.btn-start-journey`, `.btn-primary`, and `.btn-next-ready`.

#### Luxury Header & Status Chips
- `.glass-chip`:
  - Background: `linear-gradient(135deg, rgba(22, 18, 54, 0.85) 0%, rgba(14, 12, 38, 0.9) 100%)`
  - Border: 1px solid `rgba(192, 132, 252, 0.35)`
  - Subtle drop shadow: `0 4px 20px rgba(0, 0, 0, 0.4), inset 0 0 12px rgba(168, 85, 247, 0.1)`
  - Active pulse indicator: Diamond cyan/violet breathing glow.

#### Luxury Footer HUD
- `.stage-footer`: Elevated with a sleek frosted backdrop, 1px top border, and distinct `.btn-key-hint` badges styled as engraved metallic keycaps.

---

### 2.2 Procedural Audio Enhancements (`src/utils/audioEngine.ts`)

Pure Web Audio API implementation with zero external audio assets:
1. `playSuspenseRiser()`:
   - Low-frequency sine wave (45 Hz -> 90 Hz) pulse with rhythmic tremolo (heartbeat feel).
   - High-frequency triangle wave shimmering riser (300 Hz -> 880 Hz) passing through a resonant bandpass filter (Q = 6.0) over 1.2s.
2. `playSupernovaImpact()`:
   - Deep sub-bass drop (80 Hz -> 30 Hz) with soft clipping distortion.
   - White noise burst filtered through a bandpass filter (1400 Hz) with exponential decay (0.8s) replicating a crystal chime dispersion.

---

### 2.3 Canvas Suspense & Supernova Engine (`src/components/Stage/StageCanvas.tsx`)

#### State & Ref Tracking
- `suspensePhaseRef`: Number (0.0 to 1.0) representing the 1.2s suspense buildup between hero leaf arrival and question bloom.
- `shockwaveRingsRef`: Array of expanding shockwave ripples `{ radius, maxRadius, alpha, speed, color }`.
- `dimVignetteAlphaRef`: Controls canvas-level screen darkening during the suspense phase.

#### Sequence Timeline
1. **t = 0.0s**: Hero leaf lands at target `(targetX, targetY)`.
   - Trigger `audioEngine.playSuspenseRiser()`.
   - `suspensePhaseRef.current = 1.0`.
   - `dimVignetteAlphaRef.current = 0.55` (stage background dims).
2. **t = 0.0s to 1.1s (Suspense Buildup)**:
   - Draw 3 contracting diamond rings centered on `(targetX, targetY)` collapsing from radius 180px down to 0px.
   - Hero leaf pulses with an accelerating amethyst aura.
3. **t = 1.1s (The Supernova)**:
   - Trigger `audioEngine.playSupernovaImpact()`.
   - `verticalBeamFlashRef.current = 1.0` (Upward Vertical Violet Spotlight Beam).
   - Spawn 3 full-screen Shockwave Rings (radii expanding up to `width * 0.85`).
   - Spawn 24 diamond starburst sparkles (`✦`) scattering radially.
   - `dimVignetteAlphaRef.current` fades back to 0.
   - Fire `onLeafLanded()` to trigger state transition to `'question'`.
4. **t = 1.2s**: `QuestionCard` blossoms with 3D scale and specular shimmer.

---

### 2.4 QuestionCard 3D Unfold Animation (`src/index.css`)

```css
@keyframes tiara-card-reveal {
  0% {
    opacity: 0;
    transform: perspective(1000px) translateY(40px) scale(0.82) rotateX(8deg);
    filter: blur(12px);
  }
  60% {
    opacity: 1;
    transform: perspective(1000px) translateY(-6px) scale(1.02) rotateX(-1deg);
    filter: blur(0px);
  }
  100% {
    opacity: 1;
    transform: perspective(1000px) translateY(0) scale(1.0) rotateX(0deg);
  }
}
```

---

## 3. Verification Plan

1. **Automated Unit & Audio Tests**:
   - Verify `tests/audioEngine.test.ts` covers `playSuspenseRiser()` and `playSupernovaImpact()`.
   - Run `npx vitest run` (32/32 tests pass).
2. **Production Build**:
   - Run `npm run build` to guarantee TypeScript types and bundle integrity.
3. **End-to-End Visual Verification**:
   - Use `browser_subagent` to test in browser:
     - Verify sharp Haute Couture Glassmorphism on idle screen (Header, Chips, Start Button shimmer).
     - Trigger randomization transition and capture:
       1. Suspense buildup (dimming stage & converging rings).
       2. Royal Supernova shockwave & vertical beam.
       3. 3D QuestionCard reveal with crown badge and specular sweep.
