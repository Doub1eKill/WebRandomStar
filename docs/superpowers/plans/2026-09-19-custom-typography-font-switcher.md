# Custom Typography & Font Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a comprehensive Typography & Font Switcher system featuring curated display fonts (Amoria by Fandi Kurniawan, Verve by Dieter Steffmann, Cinzel, Outfit) plus a custom Google WebFont adder in the Backstage Appearance settings panel, synchronized in real-time with the Stage view.

**Architecture:** Font presets and custom font configurations are stored in `AppearanceSettings` (`src/types/appearance.ts`), persisted in `localStorage`, and synced via `useStageSync` (BroadcastChannel). A dedicated `src/utils/typography.ts` engine applies active CSS custom properties (`--font-display`, `--font-serif`) and dynamically loads Google WebFonts into `<head>`, with robust fallback to `'Prompt'` for Thai text.

**Tech Stack:** React 18, TypeScript, CSS Custom Properties, WebFont API, Vitest.

## Global Constraints
- Every font preset must pair with `'Prompt', -apple-system, sans-serif` fallback stack so Thai text is 100% legible.
- Instantaneous switching with zero page reload or UI flickering.
- Zero regression in existing stage transitions, timer effects, or word spin animations.
- 100% passing automated test suite and clean production build.

---

### Task 1: Data Models & Storage Updates

**Files:**
- Modify: `src/types/appearance.ts`
- Modify: `src/utils/storage.ts`
- Test: `tests/appearanceTypography.test.ts`

**Interfaces:**
- Produces:
  - `export type FontPresetId = 'cinzel' | 'amoria' | 'verve' | 'outfit' | 'custom'`
  - `export interface CustomFontConfig { name: string; fontFamily: string; googleFontUrl?: string; }`
  - `AppearanceSettings.fontPreset: FontPresetId`
  - `AppearanceSettings.customFont?: CustomFontConfig`
  - `DEFAULT_APPEARANCE_SETTINGS.fontPreset: 'cinzel'`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/appearanceTypography.test.ts
import { describe, it, expect } from 'vitest';
import { DEFAULT_APPEARANCE_SETTINGS, FontPresetId } from '../src/types/appearance.ts';
import { loadAppearanceSettings, saveAppearanceSettings } from '../src/utils/storage.ts';

describe('Appearance Typography Data Model', () => {
  it('should have cinzel as default fontPreset in DEFAULT_APPEARANCE_SETTINGS', () => {
    expect(DEFAULT_APPEARANCE_SETTINGS.fontPreset).toBe('cinzel');
  });

  it('should save and load fontPreset in storage', () => {
    saveAppearanceSettings({ fontPreset: 'amoria' as FontPresetId });
    const loaded = loadAppearanceSettings();
    expect(loaded.fontPreset).toBe('amoria');
  });

  it('should save and load customFont in storage', () => {
    saveAppearanceSettings({
      fontPreset: 'custom',
      customFont: {
        name: 'Playfair Display',
        fontFamily: "'Playfair Display', serif",
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap'
      }
    });
    const loaded = loadAppearanceSettings();
    expect(loaded.fontPreset).toBe('custom');
    expect(loaded.customFont?.name).toBe('Playfair Display');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/appearanceTypography.test.ts`
Expected: FAIL (fontPreset not defined on DEFAULT_APPEARANCE_SETTINGS)

- [ ] **Step 3: Update `src/types/appearance.ts` and `src/utils/storage.ts`**

In `src/types/appearance.ts`:
```typescript
export type FontPresetId = 'cinzel' | 'amoria' | 'verve' | 'outfit' | 'custom';

export interface CustomFontConfig {
  name: string;
  fontFamily: string;
  googleFontUrl?: string;
}

export interface AppearanceSettings {
  backgroundMode?: BackgroundMode;
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
  fontPreset: FontPresetId;
  customFont?: CustomFontConfig;
  customColors?: Partial<ThemeColors>;
}

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  backgroundMode: 'cosmic-canvas',
  themeName: 'luxury-winter-pageant',
  spinMode: 'vertical',
  spinDurationMs: 4500,
  particleDensity: 1.0,
  glowIntensity: 1.0,
  showCrownSilhouette: true,
  showWaterReflection: true,
  showLightRays: true,
  showAurora: true,
  showCrystals: true,
  fontPreset: 'cinzel'
};
```

In `src/utils/storage.ts`: Ensure `loadAppearanceSettings()` merges with `DEFAULT_APPEARANCE_SETTINGS` guaranteeing `fontPreset` is always defined.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/appearanceTypography.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/appearance.ts src/utils/storage.ts tests/appearanceTypography.test.ts
git commit -m "feat(typography): add fontPreset and customFont to AppearanceSettings"
```

---

### Task 2: Typography Engine & Dynamic Font Injection

**Files:**
- Create: `src/utils/typography.ts`
- Modify: `src/index.css`
- Test: `tests/typographyEngine.test.ts`

**Interfaces:**
- Produces:
  - `export interface FontPresetOption { id: FontPresetId; name: string; subtitle: string; author: string; styleTag: string; fontFamily: string; previewText: string; }`
  - `export const FONT_PRESETS: Record<FontPresetId, FontPresetOption>`
  - `export function resolveFontFamily(preset: FontPresetId, custom?: CustomFontConfig): string`
  - `export function applyTypography(settings: Partial<AppearanceSettings>): void`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/typographyEngine.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { FONT_PRESETS, resolveFontFamily, applyTypography } from '../src/utils/typography.ts';

describe('Typography Engine', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--font-display');
    document.documentElement.style.removeProperty('--font-serif');
  });

  it('should define presets for cinzel, amoria, verve, outfit', () => {
    expect(FONT_PRESETS.cinzel.name).toBe('Cinzel');
    expect(FONT_PRESETS.amoria.name).toBe('Amoria');
    expect(FONT_PRESETS.amoria.author).toContain('Fandi Kurniawan');
    expect(FONT_PRESETS.verve.name).toBe('Verve');
    expect(FONT_PRESETS.verve.author).toContain('Dieter Steffmann');
    expect(FONT_PRESETS.outfit.name).toBe('Outfit');
  });

  it('should resolve font-family including Thai fallback Prompt', () => {
    const amoriaFont = resolveFontFamily('amoria');
    expect(amoriaFont).toContain('Amoria');
    expect(amoriaFont).toContain('Prompt');

    const verveFont = resolveFontFamily('verve');
    expect(verveFont).toContain('Verve');
    expect(verveFont).toContain('Prompt');
  });

  it('should apply CSS custom variables on root element', () => {
    applyTypography({ fontPreset: 'amoria' });
    const appliedDisplay = document.documentElement.style.getPropertyValue('--font-display');
    expect(appliedDisplay).toContain('Amoria');
  });

  it('should inject Google Fonts link tag when custom font has URL', () => {
    applyTypography({
      fontPreset: 'custom',
      customFont: {
        name: 'Great Vibes',
        fontFamily: "'Great Vibes', cursive",
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap'
      }
    });

    const link = document.getElementById('dynamic-google-font') as HTMLLinkElement;
    expect(link).not.toBeNull();
    expect(link?.href).toContain('Great+Vibes');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/typographyEngine.test.ts`
Expected: FAIL (typography module not found)

- [ ] **Step 3: Implement `src/utils/typography.ts` & Add `@font-face` in `src/index.css`**

Create `src/utils/typography.ts`:
```typescript
import { AppearanceSettings, FontPresetId, CustomFontConfig } from '../types/appearance.ts';

export interface FontPresetOption {
  id: FontPresetId;
  name: string;
  subtitle: string;
  author: string;
  styleTag: string;
  fontFamily: string;
  previewText: string;
  description: string;
}

export const FONT_PRESETS: Record<Exclude<FontPresetId, 'custom'>, FontPresetOption> = {
  cinzel: {
    id: 'cinzel',
    name: 'Cinzel',
    subtitle: 'Royal Roman Serif',
    author: 'Natanael Gama / Google Fonts',
    styleTag: 'Royal Standard',
    fontFamily: "'Cinzel', Georgia, 'Prompt', serif",
    previewText: 'CHARM OF TRANSITION 2026',
    description: 'ฟอนต์โรมันคลาสสิก ลายเส้นทรงเกียรติยศ มาตรฐานเวทีประกวดระดับสากล'
  },
  amoria: {
    id: 'amoria',
    name: 'Amoria',
    subtitle: 'Modern Luxury Serif',
    author: 'Fandi Kurniawan',
    styleTag: 'Modern Luxury',
    fontFamily: "'Amoria', 'Cinzel', 'Prompt', serif",
    previewText: 'CHARM OF TRANSITION 2026',
    description: 'ฟอนต์สไตล์ High-Fashion โมเดิร์นหรูหรา ลายเส้นคมชัด สง่างามเหนือระดับ'
  },
  verve: {
    id: 'verve',
    name: 'Verve',
    subtitle: 'Ornate Heritage Display',
    author: 'Dieter Steffmann',
    styleTag: 'Classic Heritage',
    fontFamily: "'Verve', 'Cinzel', 'Prompt', serif",
    previewText: 'CHARM OF TRANSITION 2026',
    description: 'ฟอนต์คลาสสิกวิจิตร ศิลปะลวดลายโบราณ เอกลักษณ์โดดเด่นสะกดทุกสายตา'
  },
  outfit: {
    id: 'outfit',
    name: 'Outfit',
    subtitle: 'Clean Geometric Sans',
    author: 'Outfit / Google Fonts',
    styleTag: 'Modern Sans',
    fontFamily: "'Outfit', 'Prompt', sans-serif",
    previewText: 'CHARM OF TRANSITION 2026',
    description: 'ฟอนต์โมเดิร์นคลีน ไร้หัว อ่านง่าย สบายตา ทันสมัยและกระชับ'
  }
};

export function resolveFontFamily(preset?: FontPresetId, custom?: CustomFontConfig): string {
  if (preset === 'custom' && custom?.fontFamily) {
    return `${custom.fontFamily}, 'Prompt', sans-serif`;
  }
  if (preset && preset in FONT_PRESETS) {
    return FONT_PRESETS[preset as Exclude<FontPresetId, 'custom'>].fontFamily;
  }
  return FONT_PRESETS.cinzel.fontFamily;
}

export function applyTypography(settings?: Partial<AppearanceSettings>): void {
  if (typeof document === 'undefined') return;

  const preset = settings?.fontPreset || 'cinzel';
  const custom = settings?.customFont;
  const resolvedFont = resolveFontFamily(preset, custom);

  document.documentElement.style.setProperty('--font-display', resolvedFont);
  document.documentElement.style.setProperty('--font-serif', resolvedFont);

  // Dynamic Google Font Injection
  const existingLink = document.getElementById('dynamic-google-font') as HTMLLinkElement | null;
  if (preset === 'custom' && custom?.googleFontUrl) {
    if (existingLink) {
      if (existingLink.href !== custom.googleFontUrl) {
        existingLink.href = custom.googleFontUrl;
      }
    } else {
      const link = document.createElement('link');
      link.id = 'dynamic-google-font';
      link.rel = 'stylesheet';
      link.href = custom.googleFontUrl;
      document.head.appendChild(link);
    }
  } else if (existingLink && preset !== 'custom') {
    existingLink.remove();
  }
}
```

In `src/index.css`: Add `@font-face` definitions for Amoria and Verve with high-quality SVG/WOFF2 fallbacks.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/typographyEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/typography.ts src/index.css tests/typographyEngine.test.ts
git commit -m "feat(typography): implement typography engine and preset mappings"
```

---

### Task 3: Stage UI Integration & Real-Time Sync

**Files:**
- Modify: `src/components/Stage/StageOverlay.tsx`
- Modify: `src/App.tsx`
- Test: `tests/stageTypographyIntegration.test.ts`

**Interfaces:**
- Consumes: `applyTypography` from `src/utils/typography.ts`
- Produces: Live automatic font variable update on `#root` whenever `session.appearanceSettings` changes.

- [ ] **Step 1: Write integration test**

```typescript
// tests/stageTypographyIntegration.test.ts
import { describe, it, expect } from 'vitest';
import { applyTypography } from '../src/utils/typography.ts';

describe('Stage Typography Integration', () => {
  it('should update css custom property on document element when appearance updates', () => {
    applyTypography({ fontPreset: 'verve' });
    expect(document.documentElement.style.getPropertyValue('--font-display')).toContain('Verve');

    applyTypography({ fontPreset: 'cinzel' });
    expect(document.documentElement.style.getPropertyValue('--font-display')).toContain('Cinzel');
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run tests/stageTypographyIntegration.test.ts`
Expected: PASS

- [ ] **Step 3: Update `src/App.tsx` and `src/components/Stage/StageOverlay.tsx`**

In `src/App.tsx`:
```typescript
import { applyTypography } from './utils/typography.ts';

// In App component or Stage component:
useEffect(() => {
  applyTypography(session.appearanceSettings);
}, [session.appearanceSettings?.fontPreset, session.appearanceSettings?.customFont]);
```

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/Stage/StageOverlay.tsx tests/stageTypographyIntegration.test.ts
git commit -m "feat(stage): hook applyTypography to stage state sync"
```

---

### Task 4: Backstage Control Center (AppearanceSettings Panel UI)

**Files:**
- Modify: `src/components/Control/AppearanceSettings.tsx`
- Modify: `src/index.css`
- Test: `tests/appearancePanel.test.tsx`

**Interfaces:**
- Produces:
  - Interactive Font Preset selection grid (Cinzel, Amoria, Verve, Outfit, Custom)
  - Live preview of typography with English & Thai sample text
  - Custom Google WebFont input form with validation and instant preview

- [ ] **Step 1: Write test for AppearanceSettings Panel**

```typescript
// tests/appearancePanel.test.tsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppearanceSettingsPanel } from '../src/components/Control/AppearanceSettings.tsx';
import { DEFAULT_APPEARANCE_SETTINGS } from '../src/types/appearance.ts';

describe('AppearanceSettingsPanel Font Selector', () => {
  it('renders all font preset cards', () => {
    const onChange = vi.fn();
    render(<AppearanceSettingsPanel settings={DEFAULT_APPEARANCE_SETTINGS} onChange={onChange} />);

    expect(screen.getByText('Cinzel')).toBeDefined();
    expect(screen.getByText('Amoria')).toBeDefined();
    expect(screen.getByText('Verve')).toBeDefined();
    expect(screen.getByText('Outfit')).toBeDefined();
  });

  it('triggers onChange with selected font preset', () => {
    const onChange = vi.fn();
    render(<AppearanceSettingsPanel settings={DEFAULT_APPEARANCE_SETTINGS} onChange={onChange} />);

    const amoriaBtn = screen.getByRole('button', { name: /Amoria/i });
    fireEvent.click(amoriaBtn);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ fontPreset: 'amoria' })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/appearancePanel.test.tsx`
Expected: FAIL (Font preset elements not found)

- [ ] **Step 3: Implement Font Selection Section in `src/components/Control/AppearanceSettings.tsx`**

Add the Typography section with:
1. Preset cards grid featuring live preview badges, font style description, author attribution.
2. Custom WebFont configuration drawer (Font Name, CSS Font Family, Google Fonts Embed URL).
3. Add sleek styles in `src/index.css` for `.font-preset-card`, `.font-preview-sample`, and `.custom-font-box`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/appearancePanel.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Control/AppearanceSettings.tsx src/index.css tests/appearancePanel.test.tsx
git commit -m "feat(control): add font preset selector and custom webfont form"
```

---

### Task 5: Verification, End-to-End Test Suite & Build

**Files:**
- Full repository verification

- [ ] **Step 1: Run all unit & integration test suites**

Run: `npm test`
Expected: 100% tests passing across all test files.

- [ ] **Step 2: Run production TypeScript check & Vite build**

Run: `npm run build`
Expected: Exit code 0, 0 errors.

- [ ] **Step 3: Final Commit & Push**

```bash
git add .
git commit -m "chore: complete custom typography and font switcher feature"
```
