# Stage Background Switcher Design Specification

## Overview
Implement a real-time Stage Background Switcher allowing operators in the backstage controller (`AppearanceSettings.tsx`) to switch between the current canvas background (**Cosmic Canvas Stage**) and the new React Bits component (**AeroShards Glass Sculpture**) styled specifically for the Cosmic Diamond / Charm of Transition 2026 palette.

## 1. Background Modes

### 1.1 Mode 1: Cosmic Canvas Stage (`cosmic-canvas`)
- Current 2D procedural HTML5 Canvas system featuring nebula gradient `#060919` $\rightarrow$ `#0b102b`, multi-layered shimmering aurora ribbons, crystal particle field, watermark crown silhouette, and stage lighting spotlights.

### 1.2 Mode 2: AeroShards Glass Sculpture (`aero-shards`)
- React Bits `<AeroShards />` component powered by `vgpu` / WebGPU.
- Themed for Charm of Transition 2026:
  - `backgroundColor`: `#060919` (Deep starry night void).
  - `shardColor`: `#C084FC` (Lavender crystal shards).
  - `accentColor`: `#38BDF8` (Bright diamond cyan specular highlights).
  - `flow`: `'stream'` (Flowing cosmic wind stream).
  - `material`: `'pearl'` (Pearl sheen with gentle roughness & luster).
  - `detail`: `'balanced'`, `density`: `1.2`, `bloom`: `0.6`, `glow`: `1.2`.
- Graceful Fallback: If WebGPU is unavailable or errors on the client machine, automatically fall back to `StageCanvas` without throwing an unhandled exception.

## 2. Architecture & Data Flow

### 2.1 Types (`src/types/appearance.ts`)
```typescript
export type BackgroundMode = 'cosmic-canvas' | 'aero-shards';

export interface AppearanceSettings {
  backgroundMode?: BackgroundMode; // default: 'cosmic-canvas'
  themeName: 'luxury-winter-pageant' | 'ethereal-gold' | 'custom';
  spinMode: WordSpinMode;
  spinDurationMs: number;
  particleDensity: number;
  glowIntensity: number;
  showCrownSilhouette: boolean;
  showWaterReflection: boolean;
  showLightRays: boolean;
  showAurora: boolean;
  showCrystals: boolean;
  customColors?: Partial<ThemeColors>;
}
```

### 2.2 Stage Renderer Integration (`src/App.tsx` or `src/components/Stage/StageBackground.tsx`)
- Container that evaluates `session.appearanceSettings?.backgroundMode`.
- Renders `<StageCanvas session={session} />` or `<AeroShardsBackground />` with smooth transition.

### 2.3 Backstage Controller UI (`src/components/Control/AppearanceSettings.tsx`)
- Add **"🖼️ เลือกรูปแบบพื้นหลังเวที (Stage Background Mode)"** with interactive selectable visual cards:
  - `🌌 Cosmic Canvas Stage (พื้นหลังมาตรฐาน)`
  - `💎 AeroShards Glass Sculpture (พื้นหลังใหม่ React Bits)`

## 3. Verification Plan
- `npm test -- --run` passes 100%.
- `npm run build` passes with 0 type/bundle errors.
- Real-time background toggle test across controller and stage viewports.
