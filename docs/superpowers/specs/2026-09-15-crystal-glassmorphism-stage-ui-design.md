# Design Spec: Cosmic Crystal Glassmorphism Stage UI & Vector Iconography

## 1. Context & Goal
- **User Requirement:** Remove informal cartoon emojis (specifically circled `👑` on the Ambassador badge and `👑` on the Spin Word button, as well as informal emojis across headers, status chips, drawer buttons, and question components). Redesign all stage UI elements, buttons, badges, chips, and docks into a luxurious, crisp, sharp, semi-translucent glassmorphism aesthetic (`กึ่งโปร่งใส`) that reveals the 3D AeroShards and Cosmic Canvas backgrounds with depth and elegance.
- **Theme Constraints:** Strictly adhere to the **Cosmic Diamond (Royal Blue / Violet / Cyan / White)** aesthetic palette:
  - Deep Navy / Glass Base: `#060919`, `rgba(15, 23, 42, 0.45)` - `rgba(11, 16, 43, 0.65)`
  - Crystal Violet Accent: `#C084FC`, `rgba(192, 132, 252, 0.6)`
  - Aurora Cyan Accent: `#38BDF8`, `rgba(56, 189, 248, 0.7)`
  - Pearl White Specular: `#FFFFFF`, `rgba(255, 255, 255, 0.85)`
  - Frosted Blur: `backdrop-filter: blur(20px) - blur(28px)`

---

## 2. Iconography Upgrades (Replacing Emojis with Vectors)
1. **Brand Badge (`StageHeader.tsx`):**
   - Replace emoji `👑` with an elegant inline SVG Crystal Tiara / Diamond Crest vector icon with cyan/violet gradient stroke and subtle drop shadow.
2. **Hero Spin Button (`StageOverlay.tsx`):**
   - Replace emoji `👑` with stylized diamond sparkle `✦` and sharp typography.
3. **Stage Status Indicators (`StageHeader.tsx`):**
   - Clean up `STAGE_LABELS` to remove informal weather emojis (`🌧️`, `💧`, `🌫️`, `🍃`, `🍂`, `🌤️`) and crown/sparkle emojis (`👑`, `✨`, `🌟`).
   - Replace with sleek diamond sparkle `✦` or clean status labels with pulsing glass glow dot.
4. **Footer Drawer Trigger (`StageOverlay.tsx`):**
   - Replace emoji `⚙️` with a minimal inline SVG sliders/gear icon.
5. **Question Cards & Lock Effect (`QuestionCard.tsx`, `WordLockEffect.tsx`, `WordCarousel.tsx`):**
   - Upgrade any remaining emojis (`👑`, `✓`, `✨`) to SVG vector crests or crisp typography symbols.

---

## 3. Glassmorphism Styling Specifications

### 3.1 Hero Spin Button (`.btn-royal-spin`)
- **Background:** Multi-stop semi-translucent linear gradient:
  `linear-gradient(135deg, rgba(15, 23, 42, 0.55) 0%, rgba(88, 28, 135, 0.4) 45%, rgba(14, 165, 233, 0.3) 100%)`
- **Backdrop Filter:** `backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);`
- **Borders & Highlights:** 
  - `border: 1px solid rgba(192, 132, 252, 0.6)`
  - `box-shadow: 0 12px 40px rgba(6, 9, 25, 0.7), 0 0 20px rgba(192, 132, 252, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.5)`
- **Hover Dynamic:**
  - `transform: translateY(-2px) scale(1.02);`
  - Shimmer light reflection sweep across the surface: `::before` pseudo-element with 45° light ray.
  - Border illumination increases to `rgba(103, 232, 249, 0.85)` with cyan-violet outer glow.
- **Key Hint Badge (`.btn-key-hint`):**
  - Frosted crystal keycap: `background: rgba(255, 255, 255, 0.12)`, `border: 1px solid rgba(192, 132, 252, 0.45)`, `border-radius: 6px`.

### 3.2 Header Badges & Glass Chips
- **Brand Badge (`.royal-badge`):**
  - Smoked glass capsule: `background: rgba(15, 23, 42, 0.55)`, `border: 1px solid rgba(192, 132, 252, 0.4)`, `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4)`.
- **Round & Status Chips (`.glass-chip`, `.round-chip`, `.status-chip`):**
  - Semi-translucent glass capsule with subtle gradient border and clean label/value layout.

### 3.3 Footer Dock & Keys Hint (`.stage-footer`, `.footer-keys-hint`, `.btn-drawer-trigger`)
- **Dock:** Floating frosted glass container: `background: rgba(10, 15, 36, 0.5)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(192, 132, 252, 0.25)`, `border-radius: 9999px`.
- **Key Badges (`code`):** Crisp glass key tags with subtle border and pearl text.
- **Drawer Trigger Button (`.btn-drawer-trigger`):**
  - Semi-translucent pill button with clean SVG icon, smooth hover elevation and cyan/violet glow.

### 3.4 Idle Hero Quote (`.idle-nature-quote`)
- Typography: `font-style: italic`, `font-size: 1.15rem`, `letter-spacing: 0.05em`.
- Text Gradient: `linear-gradient(135deg, #ffffff 0%, #e0e7ff 60%, #c084fc 100%)`.

---

## 4. Verification Plan
- **Automated Tests:** Run full Vitest suite (`npm test -- --run`) to ensure all unit tests pass without regressions.
- **TypeScript Build:** Run `tsc -b && vite build` to ensure 0 compiler errors.
- **Visual Browser Verification:** Test in browser to verify that:
  1. No emojis appear on the stage header or spin button.
  2. All buttons, badges, and chips are sharp, luxurious, and semi-translucent (showing the background behind them with blur).
  3. Hover and interaction effects are responsive and fluid.
