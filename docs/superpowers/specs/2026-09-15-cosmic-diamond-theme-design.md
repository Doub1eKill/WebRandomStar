# Cosmic Diamond & Nebula Pageant Theme Design Spec

**Title:** Cosmic Diamond & Nebula Pageant Theme Alignment
**Author:** Antigravity AI
**Date:** 2026-09-15
**Status:** Approved by User

---

## 1. Executive Summary & Vision

The project is aligned with the official branding and aesthetic of the **"✦ SCi TECH TINE ✦ CHARM OF TRANSITION AMBASSADOR 2026"** contest poster. 

The aesthetic centers around:
- **Cosmic Midnight & Velvet Nebula Sky:** Deep midnight void (`#060919`), cosmic navy (`#0a0e27`), and electric nebula violet (`#4c1d95`, `#6d28d9`, `#7c3aed`).
- **Diamond, Starlight Ice-Cyan & Lavender Accents:** Pure diamond white (`#ffffff`), celestial lens flare cyan (`#38bdf8`, `#67e8f9`), and soft lavender glow (`#c084fc`, `#d8b4fe`).
- **Frosted Crystal Dunes & Shimmering Waters:** Frosted glassmorphism, 4-point diamond star particles, crystal tiara/crown silhouettes, and violet water reflection.
- **Narrative Slogans & Quotes:**
  - *"เสน่ห์แห่งการเปลี่ยนผ่าน สู่ดาวนำทางแห่งอนาคต"* (Charm of Transition: Guiding Stars of the Future)
  - *"ในฤดูกาลเปลี่ยนผ่าน มักมีกลุ่มดาวเปล่งประกายเสมอ"* (In the season of transition, constellations always shine)
  - 4 Core Pillars: 👑 ตัวแทนของความเป็นผู้นำ, ✦ ความงามที่เปล่งประกายผ่านกาลเวลา, 👤 ความเป็นตัวเองและแรงบันดาลใจ, 💬 พลังเสียงที่จะมีต่อสังคม.

---

## 2. Palette & Design Token System (`src/index.css`)

```css
:root {
  /* Background Cosmic Palette */
  --bg-primary: #060919;
  --bg-secondary: rgba(10, 14, 39, 0.85);
  --bg-stage-gradient: radial-gradient(circle at 50% 20%, #1e103f 0%, #0c0a27 45%, #060919 100%);
  
  /* Nebula & Starlight Accents */
  --accent-nebula-violet: #7c3aed;
  --accent-nebula-deep: #4c1d95;
  --accent-diamond-cyan: #38bdf8;
  --accent-starlight-ice: #67e8f9;
  --accent-lavender: #c084fc;
  --accent-diamond-white: #ffffff;
  --accent-silver-trim: #cbd5e1;

  /* Glassmorphic Surfaces & Borders */
  --glass-surface: rgba(11, 16, 43, 0.75);
  --glass-border: rgba(192, 132, 252, 0.35);
  --glass-border-cyan: rgba(56, 189, 248, 0.35);
  --glass-glow-shadow: 0 16px 45px rgba(0, 0, 0, 0.8), 0 0 30px rgba(124, 58, 237, 0.25);

  /* Typography */
  --font-serif-royal: 'Cinzel', serif, system-ui;
  --font-sans-main: 'Outfit', 'Bai Jamjuree', sans-serif;
}
```

---

## 3. Component Updates & Structural Scope

### 3.1 Stage Canvas 2D Physics Systems
- **[`AuroraSystem.ts`](file:///d:/Drive%20D/Project/RandomizeQuiz/src/components/Stage/canvas/AuroraSystem.ts):**
  - Wave colors tuned to dual-layer cosmic violet (`rgba(109, 40, 217, 0.22)`) and electric starlight cyan (`rgba(56, 189, 248, 0.18)`).
- **[`CrystalSystem.ts`](file:///d:/Drive%20D/Project/RandomizeQuiz/src/components/Stage/canvas/CrystalSystem.ts):**
  - Particles render as 4-point diamond starlight sparkle twinkles in diamond white and ice cyan.
- **[`ReflectionSystem.ts`](file:///d:/Drive%20D/Project/RandomizeQuiz/src/components/Stage/canvas/ReflectionSystem.ts):**
  - Shimmering bottom water reflection tuned to violet-cyan gradient tones.
- **[`CrownSystem.ts`](file:///d:/Drive%20D/Project/RandomizeQuiz/src/components/Stage/canvas/CrownSystem.ts):**
  - Central crown/tiara silhouette rendered in diamond starlight glow with lavender halo.

### 3.2 Stage Visual Elements
- **[`StageHeader.tsx`](file:///d:/Drive%20D/Project/RandomizeQuiz/src/components/Stage/StageHeader.tsx):**
  - Emphasize *"✦ SCi TECH TINE ✦ CHARM OF TRANSITION AMBASSADOR 2026"* with subtitle *"เสน่ห์แห่งการเปลี่ยนผ่าน สู่ดาวนำทางแห่งอนาคต"*.
- **[`WordCarousel.tsx`](file:///d:/Drive%20D/Project/RandomizeQuiz/src/components/Stage/WordSpin/WordCarousel.tsx) & [`WordLockEffect.tsx`](file:///d:/Drive%20D/Project/RandomizeQuiz/src/components/Stage/WordSpin/WordLockEffect.tsx):**
  - Update royal spin button and reel container with cosmic nebula gradients.
  - Word lock effect incorporates the quote *"ในฤดูกาลเปลี่ยนผ่าน มักมีกลุ่มดาวเปล่งประกายเสมอ"* with diamond starlight lens flare.
- **[`QuestionCard.tsx`](file:///d:/Drive%20D/Project/RandomizeQuiz/src/components/Stage/QuestionCard.tsx) & [`TimerDisplay.tsx`](file:///d:/Drive%20D/Project/RandomizeQuiz/src/components/Stage/TimerDisplay.tsx):**
  - High-contrast starlight card styling with crystal borders and ultra-clean timer layout.

### 3.3 Backstage Control Center
- Harmonize all control panels, metric cards, and dialogs to the Cosmic Violet & Diamond Cyan glassmorphism theme.

---

## 4. Verification & QA Plan
- **Unit Tests:** `npm test -- --run` (all 13 test suites must pass 100%).
- **TypeScript Build:** `npm run build` (`tsc -b && vite build` exit code 0).
- **Visual Polish:** Check contrast ratios, 60fps canvas performance, and theme consistency.
