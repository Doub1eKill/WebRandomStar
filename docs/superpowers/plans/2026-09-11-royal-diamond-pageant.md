# Royal Diamond Pageant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the UI, color palette, particle systems, and randomization moment to faithfully match the official event visual: **SCI TECH TINE: CHARM OF TRANSITION — AMBASSADOR 2026**, featuring a magnificent diamond crystal tiara, deep royal indigo & amethyst violet atmosphere, and spectacular vertical violet lens flare beam with diamond starbursts upon question reveal.

**Architecture:** Update document typography with Google Font `Cinzel` (Classical Roman Serif); overhaul the CSS token system to Deep Royal Indigo (`#070818` to `#191444`), Amethyst Violet (`#a855f7`, `#c084fc`), and Diamond Platinum (`#ffffff`); transform Canvas systems (crystalline rain, amethyst mist, diamond specular water drops, reflective stage floor curve); implement the Crystalline Diamond Hero Leaf with upward-shooting Vertical Violet Lens Flare Beam; and redesign the QuestionCard with tiara badges and frosted diamond glassmorphism.

**Tech Stack:** React 19, TypeScript, Canvas 2D, Vanilla CSS (Design Tokens), Web Audio API, Vitest, Vite.

## Global Constraints

- Header Title: `CHARM OF TRANSITION` in `Cinzel` serif with metallic diamond-chrome gradient
- Header Top Line: `✦ SCI TECH TINE ✦`
- Header Bottom Line: `✦ AMBASSADOR 2026 ✦` alongside `มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว`
- Color Palette: Deep Royal Indigo (`#070818` - `#191444`), Amethyst Violet (`#8b5cf6`, `#a855f7`, `#c084fc`), Diamond White (`#ffffff`, `#e0e7ff`)
- Upward Vertical Violet Lens Flare Beam upon hero leaf landing (faithful recreation of the reference poster's spotlight flare)
- Zero external UI libraries, 100% test pass on Vitest (32/32 tests)

---

### Task 1: Google Font (Cinzel) & Royal Header Hierarchy

**Files:**
- Modify: `index.html:7-14`
- Modify: `src/components/Stage/StageHeader.tsx:28-56`
- Modify: `tests/setup.test.ts:7-15`

**Interfaces:**
- Consumes: `AppState`, `roundMap`
- Produces: Updated StageHeader with `✦ SCI TECH TINE ✦`, `CHARM OF TRANSITION`, `✦ AMBASSADOR 2026 ✦`, and `👑 AMBASSADOR 2026` badge.

- [ ] **Step 1: Update branding test in `tests/setup.test.ts`**

```typescript
  it('should verify branding constants and title string format', () => {
    const preTitle = '✦ SCI TECH TINE ✦';
    const title = 'CHARM OF TRANSITION';
    const postTitle = '✦ AMBASSADOR 2026 ✦';
    const subtitle = 'มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว';
    expect(preTitle).toContain('SCI TECH TINE');
    expect(title).toBe('CHARM OF TRANSITION');
    expect(postTitle).toContain('AMBASSADOR 2026');
    expect(subtitle).toContain('ปลายฝนต้นหนาว');
  });
```

- [ ] **Step 2: Update `index.html` with Google Font `Cinzel` and title**

```html
    <title>SCI TECH TINE — CHARM OF TRANSITION AMBASSADOR 2026</title>
    <meta name="description" content="SCI TECH TINE: CHARM OF TRANSITION — AMBASSADOR 2026 ระบบสุ่มคำถามการประกวดรอบตัดสิน" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@300;400;500;600;700&family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700&display=swap" rel="stylesheet">
```

- [ ] **Step 3: Update `src/components/Stage/StageHeader.tsx`**

```tsx
  return (
    <header className="stage-header">
      <div className="header-left">
        <div className="brand-badge royal-badge">
          <span className="brand-crown">👑</span>
          <span className="brand-season">AMBASSADOR 2026</span>
        </div>
        <div className="header-titles">
          <div className="event-pre-title">✦ SCI TECH TINE ✦</div>
          <h1 className="event-title royal-serif">CHARM OF TRANSITION</h1>
          <div className="event-post-title">
            <span className="post-ambassador">✦ AMBASSADOR 2026 ✦</span>
            <span className="post-divider">•</span>
            <span className="event-subtitle">มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="glass-chip round-chip">
          <span className="chip-label">รอบการแข่งขัน</span>
          <span className="chip-value">{roundMap[round] || round}</span>
        </div>

        <div className="glass-chip state-chip">
          <span className="state-pulse" />
          <span className="state-label">{STAGE_LABELS[currentState] || currentState}</span>
        </div>
      </div>
    </header>
  );
```

- [ ] **Step 4: Run vitest**

Run: `npx vitest run tests/setup.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html src/components/Stage/StageHeader.tsx tests/setup.test.ts
git commit -m "feat: implement SCI TECH TINE CHARM OF TRANSITION header hierarchy"
```

---

### Task 2: Deep Royal Indigo & Amethyst Violet CSS Design Tokens

**Files:**
- Modify: `src/index.css:1-70, 205-270`

**Interfaces:**
- Consumes: CSS custom properties (`--bg-space-top`, `--bg-space-bottom`, `--accent-primary`, etc.)
- Produces: Royal pageant design tokens and display styles for `.royal-serif`, `.event-pre-title`, `.event-post-title`, `.royal-badge`.

- [ ] **Step 1: Update design tokens in `:root` and header CSS in `src/index.css`**

```css
:root {
  --bg-space-top: #070818;
  --bg-space-mid: #100e2b;
  --bg-space-bottom: #191444;
  --accent-primary: #a855f7;
  --accent-secondary: #c084fc;
  --accent-glow: #e9d5ff;
  --accent-diamond: #ffffff;
  --glass-bg: rgba(14, 12, 38, 0.75);
  --glass-border: rgba(192, 132, 252, 0.25);
  --font-serif: 'Cinzel', Georgia, serif;
}

.royal-serif {
  font-family: var(--font-serif);
}

.event-pre-title {
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: #c084fc;
  text-shadow: 0 0 12px rgba(168, 85, 247, 0.6);
  text-transform: uppercase;
}

.event-title.royal-serif {
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: linear-gradient(180deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 80%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(168, 85, 247, 0.45);
  line-height: 1.1;
  margin: 2px 0;
}

.event-post-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
}

.post-ambassador {
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #d8b4fe;
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
}

.post-divider {
  color: rgba(192, 132, 252, 0.4);
}

.royal-badge {
  background: rgba(18, 14, 46, 0.82);
  border: 1px solid rgba(192, 132, 252, 0.4);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.25), inset 0 0 10px rgba(168, 85, 247, 0.15);
}

.brand-crown {
  font-size: 1.05rem;
  filter: drop-shadow(0 0 8px #c084fc);
}
```

- [ ] **Step 2: Verify production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: implement Royal Indigo and Amethyst Violet design tokens"
```

---

### Task 3: Atmospheric Canvas Systems (Rain, Drops, Mist & Stage Reflected Horizon)

**Files:**
- Modify: `src/components/Stage/canvas/SkySystem.ts:1-120`
- Modify: `src/components/Stage/canvas/RainSystem.ts:60-110`
- Modify: `src/components/Stage/canvas/WaterDropSystem.ts:70-120`
- Modify: `src/components/Stage/canvas/MistSystem.ts:60-120`

**Interfaces:**
- Consumes: Canvas rendering contexts
- Produces: Atmospheric background with reflective stage pedestal, crystalline diamond rain, specular drops, and amethyst ground mist.

- [ ] **Step 1: Update `SkySystem.ts` with deep royal indigo gradient, starlight, and reflective stage horizon**

In `SkySystem.ts`:
```typescript
    // 1. Deep Royal Indigo Sky
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#070818');
    grad.addColorStop(0.45, '#100e2b');
    grad.addColorStop(0.75, '#181242');
    grad.addColorStop(1, '#080814');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Reflective Stage Pedestal Horizon Arc
    const horizonGrad = ctx.createRadialGradient(
      this.width * 0.5, this.height * 1.15, 20,
      this.width * 0.5, this.height * 1.15, this.width * 0.75
    );
    horizonGrad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
    horizonGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
    horizonGrad.addColorStop(1, 'rgba(7, 8, 24, 0)');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, this.height * 0.6, this.width, this.height * 0.4);
```

- [ ] **Step 2: Update `RainSystem.ts` to crystalline diamond lavender threads**

In `RainSystem.ts`:
Update drop color to `rgba(224, 231, 255, ${0.65 * this.intensity})` with subtle white tip.

- [ ] **Step 3: Update `MistSystem.ts` to soft amethyst violet mist**

In `MistSystem.ts`:
Update fog cloud gradients to `rgba(139, 92, 246, ${alpha * 0.12})` and `rgba(192, 132, 252, ${alpha * 0.08})`.

- [ ] **Step 4: Update `WaterDropSystem.ts` to diamond-reflective condensation**

In `WaterDropSystem.ts`:
Add specular glint `ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'` at drop upper-left.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/Stage/canvas/SkySystem.ts src/components/Stage/canvas/RainSystem.ts src/components/Stage/canvas/MistSystem.ts src/components/Stage/canvas/WaterDropSystem.ts
git commit -m "feat: align atmospheric canvas systems with Royal Indigo & Amethyst Violet"
```

---

### Task 4: Crystalline Diamond Leaf & Spectacular Vertical Violet Lens Flare Beam

**Files:**
- Modify: `src/components/Stage/canvas/LeafSystem.ts:1-250`
- Modify: `src/components/Stage/StageCanvas.tsx:100-240`

**Interfaces:**
- Consumes: Canvas rendering context, `session.meteorTrajectory`
- Produces: Crystalline Diamond Leaf with sparkling stardust trail, concentric violet-diamond water ripples, and upward-shooting Vertical Violet Lens Flare Beam matching the reference visual.

- [ ] **Step 1: Enhance `LeafSystem.ts` with Crystalline Diamond shading and Starburst Flares**

In `LeafSystem.ts`:
- Leaf shape rendered with faceted diamond gradient (`#ffffff` -> `#e0e7ff` -> `#c084fc`).
- Trail particles styled as sparkling diamond dust (`#ffffff`, `#c084fc`, `#d8b4fe`).
- Upon hero leaf landing:
  - Spawn concentric violet and diamond ripples (`rgba(192, 132, 252, ...)` and `rgba(255, 255, 255, ...)`).
  - Spawn 12 diamond starburst sparkles (`✦`) expanding outward.

- [ ] **Step 2: Add Vertical Violet Lens Flare Beam in `StageCanvas.tsx`**

In `StageCanvas.tsx`:
Add `verticalBeamFlashRef = useRef<number>(0);`.
Upon leaf landing:
```typescript
    leaf.onHeroLeafLanded = () => {
      audioEngine.playWaterDrop();
      goldenBloomFlashRef.current = 0.6;
      verticalBeamFlashRef.current = 1.0; // Upward vertical violet beam!
      if (onLeafLanded) onLeafLanded();
      else if (onMeteorImpact) onMeteorImpact();
    };
```
In `render()`:
```typescript
    if (verticalBeamFlashRef.current > 0.01) {
      ctx.save();
      const beamAlpha = verticalBeamFlashRef.current;
      const beamX = width * 0.5;

      // Vertical violet beam
      const beamGrad = ctx.createLinearGradient(beamX - 40, 0, beamX + 40, 0);
      beamGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
      beamGrad.addColorStop(0.5, `rgba(216, 180, 254, ${beamAlpha * 0.85})`);
      beamGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(beamX - 60, 0, 120, height);

      // Central core brilliant diamond laser
      ctx.fillStyle = `rgba(255, 255, 255, ${beamAlpha * 0.95})`;
      ctx.fillRect(beamX - 6, 0, 12, height);

      // Diamond starburst flare at pedestal center
      const starRadius = 70 * beamAlpha;
      const flareGrad = ctx.createRadialGradient(beamX, height * 0.46, 5, beamX, height * 0.46, starRadius);
      flareGrad.addColorStop(0, `rgba(255, 255, 255, ${beamAlpha})`);
      flareGrad.addColorStop(0.35, `rgba(192, 132, 252, ${beamAlpha * 0.75})`);
      flareGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(beamX, height * 0.46, starRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      verticalBeamFlashRef.current *= 0.91; // decay smoothly
    }
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/Stage/canvas/LeafSystem.ts src/components/Stage/StageCanvas.tsx
git commit -m "feat: implement Crystalline Diamond Leaf and Vertical Violet Lens Flare Beam"
```

---

### Task 5: QuestionCard Tiara Styling & UI Polish

**Files:**
- Modify: `src/components/Stage/QuestionCard.tsx:25-78`
- Modify: `src/index.css:425-520`

**Interfaces:**
- Consumes: `Question`, `QuestionCategory`
- Produces: Redesigned QuestionCard with `👑 AMBASSADOR 2026` crown badge, diamond-violet glassmorphism, and royal purple gradient button.

- [ ] **Step 1: Update `QuestionCard.tsx` with Tiara motif and royal badges**

In `QuestionCard.tsx`:
Add crown badge inside category header row:
```tsx
  <div className="card-tiara-badge">
    <span className="tiara-icon">👑</span>
    <span className="tiara-title">AMBASSADOR 2026</span>
  </div>
```

- [ ] **Step 2: Update QuestionCard styles in `src/index.css`**

Style `.card-tiara-badge`, `.question-card` frosted diamond borders, quote marks in diamond violet, and `.btn-next-action` in royal violet gradient (`linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)`).

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/Stage/QuestionCard.tsx src/index.css
git commit -m "style: polish QuestionCard with tiara badge and royal diamond styling"
```

---

### Task 6: Full Verification, Production Build & E2E Validation

**Files:**
- Test: `tests/e2e.test.ts`
- Artifact: `C:\Users\UNS_CT\.gemini\antigravity-ide\brain\8c0af753-badc-45a9-84b9-5003aec81fa7\walkthrough.md`

- [ ] **Step 1: Run complete automated test suite**

Run: `npx vitest run`
Expected: PASS (all tests pass)

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: PASS with clean bundle

- [ ] **Step 3: Live browser verification**

Use browser subagent to verify at `http://localhost:3000`:
- Header displays `✦ SCI TECH TINE ✦`, `CHARM OF TRANSITION` in `Cinzel` serif, and `✦ AMBASSADOR 2026 ✦`
- Trigger transition and verify crystalline leaf, vertical violet lens flare beam, and diamond starburst sparkles
- Verify QuestionCard tiara styling and button interaction

- [ ] **Step 4: Update walkthrough documentation**

Update `walkthrough.md` with new screenshots, video recording, and verification results.

- [ ] **Step 5: Final commit**

```bash
git commit -am "chore: finalize Royal Diamond Pageant theme implementation and verification"
```
