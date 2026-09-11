# Design Specification: SCI TECH TINE — CHARM OF TRANSITION AMBASSADOR 2026 (Royal Diamond Pageant)

**Goal**: Transform the UI, color palette, particle systems, and randomization moment to faithfully match the official event visual: **SCI TECH TINE: CHARM OF TRANSITION — AMBASSADOR 2026**, featuring a magnificent diamond crystal tiara, deep royal indigo & amethyst violet atmosphere, and spectacular vertical violet lens flare beam with diamond starbursts upon question reveal.

---

## 1. Visual Reference & Artistic Direction

Based on the official event visual:
- **Title Layout**:
  - `✦ SCI TECH TINE ✦` (Top centered honour badge)
  - `CHARM OF TRANSITION` (Classical Roman Serif display font with metallic chrome/silver gradient, diamond shine, and violet ambient glow)
  - `✦ AMBASSADOR 2026 ✦` (Bottom badge)
  - Thai Tagline: `มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว`
- **Color Palette**:
  - Base Deep Night: `#070818` to `#100e2b` to `#191444` (Royal Midnight Indigo)
  - Primary Accent: Royal Amethyst / Violet `#8b5cf6`, `#a855f7`, `#c084fc`
  - Secondary Accent: Diamond Platinum White `#ffffff`, `#f1f5f9`, `#e0e7ff`
  - Lens Flare Colors: Vibrant violet flare `rgba(168, 85, 247, 0.9)`, diamond white core `rgba(255, 255, 255, 0.98)`
- **Stage Floor**: Reflective curved dark stage pedestal reflecting the violet starlight beam.

---

## 2. Branding & Header Component Architecture

### 2.1 Typography & Google Fonts
- Import Roman Serif display font (`Cinzel` or `Cormorant Garamond`) via `index.html`:
  - `https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Outfit:wght@300;400;500;600;700&family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700&display=swap`
- In `StageHeader.tsx`:
  - `header-titles`:
    - Top subheader: `<div className="event-pre-title">✦ SCI TECH TINE ✦</div>`
    - Main title: `<h1 className="event-title royal-serif">CHARM OF TRANSITION</h1>`
    - Bottom subheader: `<div className="event-post-title"><span className="post-ambassador">✦ AMBASSADOR 2026 ✦</span><span className="post-divider">•</span><span className="event-subtitle">มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว</span></div>`
  - `brand-badge`:
    - Icon: `👑`
    - Label: `AMBASSADOR 2026`
    - Glow: Royal Amethyst aura

---

## 3. Atmospheric Canvas 2D & Spectacular Randomization (ช่วงเวลาสุ่มอลังการ)

### 3.1 Crystalline Nature Particles
1. **SkySystem**:
   - Deep Royal Indigo gradient background (`#070818` -> `#100e2b` -> `#1a1444`).
   - Reflective stage floor curve at the bottom with subtle purple horizon arc.
   - Diamond starlight sparkles with 4-point twinkle.
2. **RainSystem**:
   - Rain threads rendered in crystalline diamond-tinted lavender: `rgba(224, 231, 255, 0.7)`.
3. **WaterDropSystem**:
   - Condensation droplets with diamond specular glint.
4. **MistSystem**:
   - Amethyst Violet ground mist drifting smoothly: `rgba(139, 92, 246, 0.1)`.

### 3.2 Hero Leaf & Crystalline Transformation
- In `LeafSystem.ts`:
  - The hero leaf is styled as a **Crystalline Diamond Leaf**:
    - Radiant silver-lavender body with diamond facet highlights.
    - Particle trail leaves sparkling diamond dust (`rgba(255, 255, 255, 0.9)` and `rgba(192, 132, 252, 0.8)`).
- **The Crowning Landing Moment**:
  - Concentric **Violet & Diamond Water Ripples** expand across the reflective stage floor (`rgba(192, 132, 252, ...)` and `rgba(255, 255, 255, ...)`).
  - **Vertical Violet Lens Flare Beam**: An upward-shooting column of royal violet & diamond light (height: full viewport, width: 60-120px) shooting from the stage pedestal through the center, matching the visual in the user's reference image!
  - **Diamond Starburst Sparkles**: 10-14 diamond star flares (`✦`) expanding outward with gentle rotation.
  - Procedural sound effect: Harmonious crystal bell chime with a royal bass chord swell.

---

## 4. Question Card & Stage UI Redesign

### 4.1 Frosted Diamond Glassmorphism
- **QuestionCard (`src/components/Stage/QuestionCard.tsx`)**:
  - Header displays royal crown badge: `👑 AMBASSADOR 2026` alongside category badge.
  - Card background: Deep royal indigo glass `rgba(14, 12, 38, 0.88)` with `backdrop-filter: blur(24px)`.
  - Border: Double-layered diamond violet outline (`border: 1px solid rgba(192, 132, 252, 0.4)`).
  - Ambient Box Glow: `box-shadow: 0 0 60px rgba(168, 85, 247, 0.28), 0 25px 60px rgba(6, 7, 20, 0.95)`.
  - Action Button: Royal purple gradient with diamond sheen on hover (`linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)`).

### 4.2 Control Drawer & Breadcrumb
- Breadcrumbs and control drawer chips updated with amethyst violet highlights and glowing border accents.

---

## 5. Verification & Testing Strategy

1. **Unit & Integration Tests**:
   - Verify `tests/setup.test.ts` passes with updated branding format (`SCI TECH TINE`, `CHARM OF TRANSITION`, `AMBASSADOR 2026`).
   - Verify all 32 vitest tests pass 100%.
2. **Production Build**:
   - Verify `npm run build` succeeds cleanly.
3. **Live Browser E2E Validation**:
   - Capture screenshots of the new header, crystalline diamond leaf, vertical violet lens flare beam upon landing, and the QuestionCard tiara styling.
