# Grand Stage Suspense, Heartbeat Riser & Star Roulette Targeting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate stage drama and suspense by removing the mid-journey category announcement banner, adding procedural heartbeat tension audio, cycling star roulette lock-on reticle, golden hero leaf stardust trail, and full-screen supernova flash.

**Architecture:** 
- UI overlay: Remove `CategoryAnnouncementBanner` from `StageOverlay.tsx` and adjust `CinematicNarrator.tsx`.
- Particle & Celestial: Add stardust emitter to `LeafSystem.ts`, star roulette cycling & lock-on reticle to `ConstellationSystem.ts`, and full-screen flash to `StageCanvas.tsx`.
- Audio Engine: Implement `playHeartbeatRiser` with accelerating double-thumps and `playSupernovaBoom` in `audioEngine.ts`.

**Tech Stack:** React 19, TypeScript, Canvas 2D, Web Audio API, Vitest, Vite.

## Global Constraints
- Pure procedural Web Audio API synthesis (zero external audio mp3/wav files).
- Keep pure Canvas 2D without third-party animation libraries.
- Maintain total sequence duration of ~12.5 seconds.
- All 30 existing tests + new audio tests must pass 100%.

---

### Task 1: UI Streamlining (Remove Banner & Update Narrator Copy)

**Files:**
- Modify: `src/components/Stage/StageOverlay.tsx`
- Modify: `src/components/Stage/CinematicNarrator.tsx`

**Interfaces:**
- Removes `<CategoryAnnouncementBanner />` completely from `StageOverlay.tsx`.
- Updates `CinematicNarrator.tsx` line for `leaf` state:
  - Text: `ใบไม้สีทองร่อนลงสู่ทิศทาง... สายลมกำลังพัดพาดวงดาวคำถามให้ปรากฏ!`
  - Sub: `The golden leaf glides toward its destiny as celestial stars emerge.`

- [ ] **Step 1: Edit `StageOverlay.tsx` to remove CategoryAnnouncementBanner**
- [ ] **Step 2: Edit `CinematicNarrator.tsx` to update narrator copy**
- [ ] **Step 3: Run tests to verify no regressions**
Run: `npx vitest run`
Expected: 30 tests pass
- [ ] **Step 4: Commit changes**
```bash
git add src/components/Stage/StageOverlay.tsx src/components/Stage/CinematicNarrator.tsx
git commit -m "refactor: remove category banner and update leaf narrator copy"
```

---

### Task 2: Hero Leaf Golden Stardust Trail

**Files:**
- Modify: `src/components/Stage/canvas/LeafSystem.ts`

**Interfaces:**
- Produces: `LeafTrailParticle` in `LeafSystem` that leaves a glowing trail of particles behind the moving hero leaf.

- [ ] **Step 1: Add trail particle interface and array in `LeafSystem.ts`**
```ts
interface LeafTrailParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  decay: number;
}
```
- [ ] **Step 2: Emit particles when `heroLeaf` is active and update decay in `update()`**
- [ ] **Step 3: Render golden glow particles in `draw(ctx)` before the hero leaf**
- [ ] **Step 4: Run typecheck to verify integrity**
Run: `npx tsc --noEmit`
Expected: 0 errors
- [ ] **Step 5: Commit changes**
```bash
git add src/components/Stage/canvas/LeafSystem.ts
git commit -m "feat: add golden stardust trail to hero leaf"
```

---

### Task 3: Procedural Audio Tension Riser & Supernova Boom

**Files:**
- Modify: `src/engine/audioEngine.ts`
- Modify: `tests/audioEngine.test.ts`

**Interfaces:**
- Produces: `audioEngine.playHeartbeatRiser(durationSec: number): void`
- Produces: `audioEngine.playSupernovaBoom(): void`

- [ ] **Step 1: Write unit tests in `tests/audioEngine.test.ts` for new audio methods**
```ts
it('should call playHeartbeatRiser without crashing', () => {
  expect(() => audioEngine.playHeartbeatRiser(2.5)).not.toThrow();
});

it('should call playSupernovaBoom without crashing', () => {
  expect(() => audioEngine.playSupernovaBoom()).not.toThrow();
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/audioEngine.test.ts`
Expected: FAIL (methods not defined)
- [ ] **Step 3: Implement `playHeartbeatRiser` and `playSupernovaBoom` in `audioEngine.ts`**
  - `playHeartbeatRiser`: Schedule accelerating 55Hz sub-bass sine pulses over duration with rising filter tension drone.
  - `playSupernovaBoom`: Deep sub-drop (120Hz -> 35Hz) + bandpass crystalline noise burst.
- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/audioEngine.test.ts`
Expected: PASS
- [ ] **Step 5: Commit changes**
```bash
git add src/engine/audioEngine.ts tests/audioEngine.test.ts
git commit -m "feat: implement procedural heartbeat tension riser and supernova boom audio"
```

---

### Task 4: Star Roulette Cycling & Lock-on Targeting Reticle

**Files:**
- Modify: `src/components/Stage/canvas/ConstellationSystem.ts`

**Interfaces:**
- Consumes: `StarNode[]`
- Produces: `setTargetNode(targetX: number, targetY: number): void`, roulette cycling animation and lock-on targeting reticle `[ ]` drawn around the target question star.

- [ ] **Step 1: Add roulette state and targeting reticle properties to `ConstellationSystem.ts`**
```ts
public targetX: number | null = null;
public targetY: number | null = null;
private rouletteIndex: number = 0;
private rouletteTimer: number = 0;
private isLockedOn: boolean = false;
```
- [ ] **Step 2: Update roulette cycling and reticle pulse in `update()`**
  - If `!isLockedOn`, cycle `rouletteIndex = (rouletteIndex + 1) % nodes.length` every ~70ms.
  - When locked on, pulse the targeting reticle around the node closest to `(targetX, targetY)`.
- [ ] **Step 3: Draw targeting reticle (4 brackets + glowing inner halo) in `draw(ctx)`**
- [ ] **Step 4: Run typecheck**
Run: `npx tsc --noEmit`
Expected: 0 errors
- [ ] **Step 5: Commit changes**
```bash
git add src/components/Stage/canvas/ConstellationSystem.ts
git commit -m "feat: add star roulette cycling and targeting reticle to constellation system"
```

---

### Task 5: Supernova Full-Screen Flash & Climax Wiring in StageCanvas

**Files:**
- Modify: `src/components/Stage/StageCanvas.tsx`

**Interfaces:**
- Connects `audioEngine.playHeartbeatRiser(2.5)` when entering `constellation`.
- Connects target coordinates to `constellationRef.current.setTargetNode(targetX, targetY)`.
- Triggers `audioEngine.playSupernovaBoom()` and `supernovaFlash = 1.0` on meteor impact.
- Renders full-screen flash overlay in `render()` loop.

- [ ] **Step 1: Add `supernovaFlash` ref in `StageCanvas.tsx`**
- [ ] **Step 2: Trigger heartbeat riser and targeting in `constellation` state transition**
- [ ] **Step 3: Trigger supernova boom and flash on meteor impact**
- [ ] **Step 4: Render decaying white-gold flash in canvas render loop**
- [ ] **Step 5: Run full test suite & typecheck**
Run: `npx vitest run && npx tsc --noEmit`
Expected: All tests pass, 0 type errors
- [ ] **Step 6: Commit changes**
```bash
git add src/components/Stage/StageCanvas.tsx
git commit -m "feat: wire heartbeat audio, star targeting, and supernova flash climax"
```

---

### Task 6: Full Verification, Production Build & E2E Validation

**Files:**
- Verify all modified files

- [ ] **Step 1: Run all unit & E2E tests**
Run: `npx vitest run`
Expected: All 32 tests pass
- [ ] **Step 2: Run production build**
Run: `npm run build`
Expected: Built successfully
- [ ] **Step 3: Test and record in browser subagent**
Verify no banner appears, heartbeat audio triggers, star roulette cycles and locks on, and supernova flashes on impact.
- [ ] **Step 4: Update walkthrough artifact**
