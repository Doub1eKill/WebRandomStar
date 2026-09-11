# Royal Crown Grandeur & Cinematic Suspense Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the UI elements into razor-sharp, sleek Haute Couture Glassmorphism with specular light sweeps, and implement a breathtaking 1.2-second Cinematic Suspense beat and Royal Supernova shockwave for the quiz reveal.

**Architecture:** Extend Web Audio API in `audioEngine.ts` with procedural suspense riser and sub-bass supernova impact; overhaul CSS with `@keyframes specular-sweep`, `@keyframes tiara-card-reveal`, and luxury HUD design tokens; upgrade StageCanvas with canvas-level vignette dimming, contracting diamond laser rings, full-screen shockwave rings, and 24 diamond starburst sparkles; and polish StageHeader, StageFooter, and QuestionCard with razor-sharp luxury styling.

**Tech Stack:** React 19, TypeScript, Canvas 2D, Web Audio API, Vanilla CSS, Vitest, Vite.

## Global Constraints

- Retain existing 5-phase sequence: `rain` (1.5s) -> `water-drop` (1.5s) -> `mist` (1.5s) -> `wind` (1.5s) -> `leaf` (arrival + 1.2s suspense buildup -> supernova)
- Zero external UI libraries or external audio/video assets
- Pure procedural Web Audio API synthesis
- 100% test pass on Vitest (all 32+ tests passing)
- Clean production build with TypeScript check (`npm run build`)

---

### Task 1: Procedural Audio Synthesizer: Suspense Riser & Supernova Impact

**Files:**
- Modify: `src/utils/audioEngine.ts:180-260`
- Test: `tests/audioEngine.test.ts:1-70`

**Interfaces:**
- Produces: `audioEngine.playSuspenseRiser()`, `audioEngine.playSupernovaImpact()`

- [ ] **Step 1: Write tests for `playSuspenseRiser` and `playSupernovaImpact`**

In `tests/audioEngine.test.ts`:
```typescript
  it('should trigger suspense riser and supernova impact without throwing', () => {
    expect(() => audioEngine.playSuspenseRiser()).not.toThrow();
    expect(() => audioEngine.playSupernovaImpact()).not.toThrow();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/audioEngine.test.ts`
Expected: FAIL (`playSuspenseRiser is not a function`)

- [ ] **Step 3: Implement `playSuspenseRiser` and `playSupernovaImpact` in `src/utils/audioEngine.ts`**

```typescript
  public playSuspenseRiser(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Deep Sub-bass heartbeat pulse
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(45, now);
    subOsc.frequency.exponentialRampToValueAtTime(90, now + 1.2);

    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.35, now + 0.9);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain!);
    subOsc.start(now);
    subOsc.stop(now + 1.25);

    // 2. Rising crystalline resonance
    const chimeOsc = ctx.createOscillator();
    const chimeFilter = ctx.createBiquadFilter();
    const chimeGain = ctx.createGain();

    chimeOsc.type = 'triangle';
    chimeOsc.frequency.setValueAtTime(280, now);
    chimeOsc.frequency.exponentialRampToValueAtTime(880, now + 1.2);

    chimeFilter.type = 'bandpass';
    chimeFilter.frequency.setValueAtTime(350, now);
    chimeFilter.frequency.exponentialRampToValueAtTime(1400, now + 1.2);
    chimeFilter.Q.value = 5.0;

    chimeGain.gain.setValueAtTime(0.02, now);
    chimeGain.gain.linearRampToValueAtTime(0.28, now + 1.1);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

    chimeOsc.connect(chimeFilter);
    chimeFilter.connect(chimeGain);
    chimeGain.connect(this.masterGain!);
    chimeOsc.start(now);
    chimeOsc.stop(now + 1.25);
  }

  public playSupernovaImpact(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Sub-bass impact drop
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(95, now);
    boomOsc.frequency.exponentialRampToValueAtTime(28, now + 0.8);

    boomGain.gain.setValueAtTime(0.7, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    boomOsc.connect(boomGain);
    boomGain.connect(this.masterGain!);
    boomOsc.start(now);
    boomOsc.stop(now + 0.9);

    // 2. Crystal chime dispersion
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(1200, now);
    chimeOsc.frequency.exponentialRampToValueAtTime(1800, now + 0.3);

    chimeGain.gain.setValueAtTime(0.4, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.masterGain!);
    chimeOsc.start(now);
    chimeOsc.stop(now + 1.2);
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/audioEngine.test.ts`
Expected: PASS (5/5 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/utils/audioEngine.ts tests/audioEngine.test.ts
git commit -m "feat: implement procedural suspense riser and supernova impact audio"
```

---

### Task 2: Haute Couture Glassmorphism Design Tokens & UI Styles

**Files:**
- Modify: `src/index.css:120-220, 420-530`

**Interfaces:**
- Produces: `@keyframes specular-sweep`, `@keyframes tiara-card-reveal`, beveled luxury glass chips, specular shimmer buttons, luxury HUD keys.

- [ ] **Step 1: Add `@keyframes specular-sweep` and update luxury buttons in `src/index.css`**

```css
@keyframes specular-sweep {
  0% { transform: translateX(-160%) skewX(-25deg); opacity: 0; }
  15% { opacity: 0.85; }
  35% { transform: translateX(260%) skewX(-25deg); opacity: 0; }
  100% { transform: translateX(260%) skewX(-25deg); opacity: 0; }
}

.btn-start-journey {
  position: relative;
  overflow: hidden;
  padding: 16px 44px;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 9999px;
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6366f1 100%);
  border: 1px solid rgba(216, 180, 254, 0.55);
  box-shadow: 0 10px 35px -5px rgba(168, 85, 247, 0.65), 0 0 25px rgba(192, 132, 252, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transition: all var(--transition-normal);
}

.btn-start-journey::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: specular-sweep 4s infinite cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.btn-start-journey:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 14px 45px -5px rgba(168, 85, 247, 0.85), 0 0 35px rgba(192, 132, 252, 0.6);
}
```

- [ ] **Step 2: Update `.glass-chip`, `.royal-badge`, and `.btn-key-hint`**

```css
.glass-chip {
  background: linear-gradient(135deg, rgba(22, 18, 54, 0.88) 0%, rgba(14, 12, 38, 0.92) 100%);
  border: 1px solid rgba(192, 132, 252, 0.38);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 12px rgba(168, 85, 247, 0.12);
  border-radius: 12px;
  padding: 6px 14px;
}

.state-pulse {
  box-shadow: 0 0 10px #c084fc;
}

.btn-key-hint {
  font-family: monospace;
  font-size: 0.82rem;
  font-weight: 600;
  background: rgba(168, 85, 247, 0.18);
  border: 1px solid rgba(192, 132, 252, 0.35);
  color: #e9d5ff;
  padding: 3px 9px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}
```

- [ ] **Step 3: Add `@keyframes tiara-card-reveal` for QuestionCard**

```css
@keyframes tiara-card-reveal {
  0% {
    opacity: 0;
    transform: perspective(1000px) translateY(45px) scale(0.85) rotateX(7deg);
    filter: blur(14px);
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

.question-card-container {
  animation: tiara-card-reveal 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

- [ ] **Step 4: Verify production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "style: implement Haute Couture Glassmorphism tokens and animations"
```

---

### Task 3: Stage Header & Footer Sharp Luxury Layout

**Files:**
- Modify: `src/components/Stage/StageHeader.tsx:60-95`
- Modify: `src/components/Stage/StageFooter.tsx:1-40`

**Interfaces:**
- Consumes: `AppState`, `roundMap`
- Produces: Sleek luxury HUD StageHeader and StageFooter with sharp typography and glass bevels.

- [ ] **Step 1: Polish `src/components/Stage/StageHeader.tsx`**

Ensure `.royal-badge` and `.glass-chip` have sharp typography, diamond glyphs `✦`, and clear visual hierarchy.

- [ ] **Step 2: Polish `src/components/Stage/StageFooter.tsx`**

Ensure `.stage-footer` has luxury HUD spacing, distinct key hints, and styled control panel trigger button.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/Stage/StageHeader.tsx src/components/Stage/StageFooter.tsx
git commit -m "style: polish StageHeader and StageFooter with luxury HUD aesthetics"
```

---

### Task 4: Canvas Cinematic Suspense & Royal Supernova Engine

**Files:**
- Modify: `src/components/Stage/StageCanvas.tsx:1-286`
- Modify: `src/components/Stage/canvas/LeafSystem.ts:1-260`

**Interfaces:**
- Consumes: Canvas rendering context, `audioEngine`
- Produces: 1.2s Suspense buildup (stage dimming, 3 contracting laser rings) followed by Supernova explosion (upward vertical beam, screen-wide shockwave rings, 24 diamond sparkles).

- [ ] **Step 1: Update `LeafSystem.ts` with suspense callback**

In `LeafSystem.ts`:
Add `public onHeroLeafArrived?: () => void;` when hero leaf reaches center `(dist < 8)`.

- [ ] **Step 2: Implement Suspense & Supernova Engine in `StageCanvas.tsx`**

In `StageCanvas.tsx`:
Add refs:
- `suspenseTimerRef = useRef<number>(0);`
- `isSuspenseActiveRef = useRef<boolean>(false);`
- `shockwaveRingsRef = useRef<Array<{ radius: number; maxRadius: number; alpha: number; speed: number }>>([]);`
- `dimVignetteRef = useRef<number>(0);`

When hero leaf arrives at center:
```typescript
leaf.onHeroLeafArrived = () => {
  isSuspenseActiveRef.current = true;
  suspenseTimerRef.current = 1.2; // 1.2s suspense countdown
  dimVignetteRef.current = 0.65;  // Dim the stage lights
  audioEngine.playSuspenseRiser(); // Deep pulsing heartbeat + crystalline riser
};
```
In `render()`:
1. When `isSuspenseActiveRef.current` is true:
   - Decrement `suspenseTimerRef.current -= 0.016`.
   - Draw stage dimming vignette over screen:
     ```typescript
     if (dimVignetteRef.current > 0.01) {
       const vig = ctx.createRadialGradient(width * 0.5, height * 0.46, 60, width * 0.5, height * 0.46, width * 0.7);
       vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
       vig.addColorStop(1, `rgba(3, 3, 10, ${dimVignetteRef.current})`);
       ctx.fillStyle = vig;
       ctx.fillRect(0, 0, width, height);
     }
     ```
   - Draw 3 contracting diamond laser rings collapsing inward toward `(width * 0.5, height * 0.46)`.
   - When `suspenseTimerRef.current <= 0`:
     - `isSuspenseActiveRef.current = false`.
     - `audioEngine.playSupernovaImpact()`.
     - `verticalBeamFlashRef.current = 1.0`.
     - Spawn 3 screen-wide shockwave rings in `shockwaveRingsRef.current`.
     - `leaf.spawnSparkles(width * 0.5, height * 0.46)`.
     - Trigger `if (onLeafLanded) onLeafLanded(); else if (onMeteorImpact) onMeteorImpact();`.
2. Update and draw `shockwaveRingsRef`:
   - Fast expanding ellipses across the stage with diamond white and amethyst violet borders.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/Stage/canvas/LeafSystem.ts src/components/Stage/StageCanvas.tsx
git commit -m "feat: implement 1.2s Cinematic Suspense and Royal Supernova shockwave engine"
```

---

### Task 5: QuestionCard 3D Unfold & Final UI Polish

**Files:**
- Modify: `src/components/Stage/QuestionCard.tsx:20-75`
- Modify: `src/index.css:455-525`

**Interfaces:**
- Consumes: `Question`, `QuestionCategory`
- Produces: QuestionCard with 4 diamond corner accents `✦`, polished crown badge, and specular sweep on ready button.

- [ ] **Step 1: Add diamond corner markers to `QuestionCard.tsx`**

```tsx
<div className="card-diamond-corner top-left">✦</div>
<div className="card-diamond-corner top-right">✦</div>
<div className="card-diamond-corner bottom-left">✦</div>
<div className="card-diamond-corner bottom-right">✦</div>
```

- [ ] **Step 2: Style `.card-diamond-corner` in `src/index.css`**

```css
.card-diamond-corner {
  position: absolute;
  font-size: 0.75rem;
  color: #c084fc;
  opacity: 0.65;
  text-shadow: 0 0 8px #a855f7;
  pointer-events: none;
}
.card-diamond-corner.top-left { top: 12px; left: 14px; }
.card-diamond-corner.top-right { top: 12px; right: 14px; }
.card-diamond-corner.bottom-left { bottom: 12px; left: 14px; }
.card-diamond-corner.bottom-right { bottom: 12px; right: 14px; }
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/Stage/QuestionCard.tsx src/index.css
git commit -m "style: add diamond corner accents and specular sheen to QuestionCard"
```

---

### Task 6: Full Verification, Production Build & E2E Validation

**Files:**
- Test: Vitest test suite (`tests/audioEngine.test.ts`, `tests/e2e.test.ts`, etc.)
- Artifact: `C:\Users\UNS_CT\.gemini\antigravity-ide\brain\8c0af753-badc-45a9-84b9-5003aec81fa7\walkthrough.md`

- [ ] **Step 1: Run complete automated test suite**

Run: `npx vitest run`
Expected: PASS (all tests pass)

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: PASS with clean bundle

- [ ] **Step 3: Live browser verification**

Use `browser_subagent` to test `http://localhost:3000`:
- Verify specular sweep on `.btn-start-journey`.
- Verify suspense buildup (vignette dimming + contracting rings).
- Verify Royal Supernova shockwave and vertical violet beam.
- Verify 3D reveal of QuestionCard with diamond corner markers and crown badge.

- [ ] **Step 4: Update walkthrough documentation**

Update `walkthrough.md` with visual evidence and video recording.

- [ ] **Step 5: Final commit**

```bash
git commit -am "chore: finalize Cinematic Suspense and Haute Couture Glassmorphism implementation"
```
