# Design Document: Grand Stage Suspense, Heartbeat Riser & Star Roulette Targeting

## 1. Overview & Objectives

Following feedback from testing on the pageant stage:
1. **Remove Mid-Journey Category Announcement Banner**: The central banner card prematurely interrupted the visual flow, obscured the hero leaf, and weakened the suspense of the celestial reveal.
2. **Amplify Stage Excitement & Thrill (Grand Stage Suspense)**:
   - Introduce an adrenaline-inducing **Heartbeat Sub-bass Riser** that accelerates leading up to the meteor strike.
   - Implement a **Star Roulette & Lock-on Targeting Reticle** across candidate constellation star nodes.
   - Implement a **Supernova Full-screen Flash** at meteor impact before the question card blooms into view.
   - Add a glowing **Golden Stardust Trail** behind the hero leaf as it glides across the stage.

---

## 2. Architecture & Component Changes

### 2.1 UI & Layout Streamlining
- **`src/components/Stage/StageOverlay.tsx`**:
  - Remove `<CategoryAnnouncementBanner />` completely from the render tree.
  - Retain `SeasonJourneyBreadcrumb` and `CinematicNarrator`.
- **`src/components/Stage/CinematicNarrator.tsx`**:
  - Update narrative line for `leaf` state to maintain curiosity and excitement:
    - Thai: *"ใบไม้สีทองร่อนลงสู่ทิศทาง... สายลมกำลังพัดพาดวงดาวคำถามให้ปรากฏ!"*
    - English: *"The golden leaf glides toward its destiny as celestial stars emerge."*

### 2.2 Procedural Audio Suspense (`src/engine/audioEngine.ts`)
- **`playHeartbeatRiser(durationSec: number)`**:
  - Synthesize a pair of deep sub-bass pulses (50-60Hz sine + lowpass triangle) simulating a double thump `ตึก... ตึก...`
  - Accelerate interval between thumps from 600ms down to 180ms over `durationSec` (2.5s) using Web Audio scheduling.
  - Layer an escalating high-resonance tension drone to build palpable auditorium suspense.
- **`playSupernovaBoom()`**:
  - Triggered exactly at meteor impact.
  - Combines an explosive sub-drop (120Hz sliding down to 35Hz with exponential decay) and high-frequency crystalline shimmer sparkle (1800Hz - 4200Hz bandpass noise burst).

### 2.3 Visual Suspense & Animation Climax

#### A. Hero Leaf Stardust Trail (`src/components/Stage/canvas/LeafSystem.ts`)
- Maintain an array of stardust particles emitted by the hero leaf as it travels:
  ```ts
  interface LeafTrailParticle {
    x: number;
    y: number;
    radius: number;
    alpha: number;
    decay: number;
  }
  ```
- Every frame while hero leaf is flying, push stardust behind leaf position `(heroLeaf.x, heroLeaf.y)`.
- Render with warm golden radial gradient.

#### B. Star Roulette & Lock-on Targeting (`src/components/Stage/canvas/ConstellationSystem.ts`)
- Candidate star nodes represent possible questions.
- During the `constellation` phase:
  - Rapidly cycle active highlight across nodes (every ~70ms) creating a "roulette wheel" selection effect.
  - In the final 0.5s before meteor launch, lock highlight onto the final chosen node.
  - Draw a pulsing targeting reticle with 4 targeting brackets and glowing inner ring around the target node:
    ```
    ┌   ┐
    ( O )
    └   ┘
    ```

#### C. Supernova Flash & Climax (`src/components/Stage/StageCanvas.tsx`)
- Add `supernovaFlash: number = 0` (1.0 on impact, decaying by 0.90 per frame).
- Render `ctx.fillStyle = rgba(255, 255, 255, supernovaFlash * 0.75)` over the full viewport immediately following meteor impact.
- Combines with expanding Shockwave rings and screen micro-shake before Question Card bloom.

---

## 3. Data Flow & Timing Sequence (~12.5s Total)

| Time (s) | State | Visual Action | Audio Action |
|---|---|---|---|
| 0.0 - 1.2 | `rain` | Rains gently fade | Rain ambience |
| 1.2 - 2.5 | `water-drop` | Water condensation trickle | Water drop plop |
| 2.5 - 4.0 | `mist` | Mist thickens, rain stops | Rain fade out |
| 4.0 - 5.5 | `wind` | Chilly breeze blows | Chilly wind gust |
| 5.5 - 7.5 | `leaf` | Hero Leaf flies across stage with **Golden Stardust Trail** | Leaf rustle & chime |
| 7.5 - 9.0 | `sky-opening` | Sky clears, crescent moon shines | Ambient calm |
| 9.0 - 11.5 | `constellation` | Candidate stars connect + **Star Roulette cycling & Lock-on Reticle** | **Heartbeat Riser & Tension Drone** |
| 11.5 - 12.5 | `meteor` | Blazing meteor strikes locked star | Meteor whoosh |
| 12.5+ | `question` | **Supernova Full-screen Flash** + Shockwave + Screen Shake ➔ Question Card blooms | **Supernova Boom & Fanfare** |

---

## 4. Verification Plan

1. **Automated Unit & E2E Tests**: Run `npx vitest run` to ensure all 30 tests pass.
2. **TypeScript Strict Typecheck**: Run `npx tsc --noEmit` with zero errors.
3. **Production Build**: Run `npm run build` to confirm bundle integrity.
4. **Browser End-to-End Simulation**:
   - Verify Category Announcement Banner is absent.
   - Verify hero leaf stardust trail.
   - Verify star roulette cycling and reticle lock-on.
   - Verify heartbeat audio and supernova flash on meteor impact.
