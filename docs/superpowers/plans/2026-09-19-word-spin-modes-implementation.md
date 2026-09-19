# Word Spin Modes (4 Interactive Pageant Spin Styles) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 4 distinct, fully interactive Word Spin Modes (`vertical`, `3d`, `orbital`, `ribbon`) on the Pageant Stage with dedicated view renderers, 60fps GPU-accelerated styling, and seamless integration with the state machine.

**Architecture:** Maintain `WordCarousel.tsx` as the master timing & easing orchestrator that dispatches rendering to 4 dedicated view components (`VerticalSpinView`, `Perspective3DSpinView`, `OrbitalSpinView`, `RibbonSpinView`). Common interfaces and helpers reside in `types.ts`.

**Tech Stack:** React (TypeScript), CSS 3D Transforms / Glassmorphism, Vitest, Web Audio API integration.

## Global Constraints
- React 18+ with TypeScript in strict mode.
- 60fps rendering with CSS transforms (`translateY`, `rotateX`, `translateZ`, `translateX`, `scale`) and GPU acceleration.
- High Thai typography contrast and luxury pageant aesthetics (deep navy, crystal cyan, royal gold accents).
- Existing test suite (70 tests) must remain 100% green.

---

### Task 1: Word Spin View Types & Test Scaffold

**Files:**
- Create: `src/components/Stage/WordSpin/types.ts`
- Create: `tests/wordCarouselModes.test.ts`

**Interfaces:**
- Produces: `SpinViewProps`, `SpinItemOffset` interfaces.

- [ ] **Step 1: Write the failing test scaffold**

```typescript
// tests/wordCarouselModes.test.ts
import { describe, it, expect } from 'vitest';
import { KeywordItem } from '../src/types/word.ts';

const mockWords: KeywordItem[] = [
  { id: 'w1', word: 'ความฝัน', category: 'moon', enabled: true },
  { id: 'w2', word: 'วิสัยทัศน์', category: 'mist', enabled: true },
  { id: 'w3', word: 'ภาวะผู้นำ', category: 'wind', enabled: true },
  { id: 'w4', word: 'ตัวตน', category: 'star', enabled: true },
  { id: 'w5', word: 'คุณค่า', category: 'final', enabled: true }
];

describe('Word Spin View Types & Definitions', () => {
  it('exports valid SpinViewProps contract', async () => {
    const types = await import('../src/components/Stage/WordSpin/types.ts');
    expect(types).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/wordCarouselModes.test.ts`
Expected: FAIL due to missing `types.ts`.

- [ ] **Step 3: Write types definition**

```typescript
// src/components/Stage/WordSpin/types.ts
import { KeywordItem } from '../../../types/word.ts';

export interface SpinViewProps {
  reel: KeywordItem[];
  currentIndex: number;
  targetWord: KeywordItem;
  phase: 'pre-spin' | 'word-spin' | 'word-decelerate';
}

export interface VisibleSpinItem {
  item: KeywordItem;
  offset: number;
  isCenter: boolean;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/wordCarouselModes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Stage/WordSpin/types.ts tests/wordCarouselModes.test.ts
git commit -m "feat(word-spin): add shared spin view types and test scaffold"
```

---

### Task 2: VerticalSpinView Component (Mode 1: Royal Vertical Spin)

**Files:**
- Create: `src/components/Stage/WordSpin/VerticalSpinView.tsx`
- Modify: `tests/wordCarouselModes.test.ts`

**Interfaces:**
- Consumes: `SpinViewProps` from `types.ts`.
- Produces: `VerticalSpinView` React component.

- [ ] **Step 1: Add failing test for VerticalSpinView**

```typescript
// in tests/wordCarouselModes.test.ts
import React from 'react';
import { render } from '@testing-library/react';
import { VerticalSpinView } from '../src/components/Stage/WordSpin/VerticalSpinView.tsx';

describe('VerticalSpinView', () => {
  it('renders vertical track with visible items and center highlight', () => {
    const { container } = render(
      React.createElement(VerticalSpinView, {
        reel: mockWords,
        currentIndex: 2,
        targetWord: mockWords[2],
        phase: 'word-spin'
      })
    );
    expect(container.querySelector('.vertical-spin-view')).toBeTruthy();
    expect(container.querySelector('.carousel-word-item.active-center')).toBeTruthy();
    expect(container.textContent).toContain('ภาวะผู้นำ');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/wordCarouselModes.test.ts`
Expected: FAIL due to missing `VerticalSpinView.tsx`.

- [ ] **Step 3: Implement VerticalSpinView component**

```tsx
// src/components/Stage/WordSpin/VerticalSpinView.tsx
import React from 'react';
import { SpinViewProps } from './types.ts';

export const VerticalSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord
}) => {
  const windowSize = 7;
  const half = Math.floor(windowSize / 2);
  const visible: { item: typeof targetWord; offset: number }[] = [];

  for (let o = -half; o <= half; o++) {
    const idx = (currentIndex + o + reel.length) % reel.length;
    visible.push({ item: reel[idx] || targetWord, offset: o });
  }

  return (
    <div className="vertical-spin-view">
      <div className="carousel-indicator indicator-top">
        <span className="indicator-diamond">◆</span>
      </div>

      <div className="carousel-reel-track">
        {visible.map(({ item, offset }) => {
          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);
          const scale = 1 - absOffset * 0.12;
          const opacity = isCenter ? 1 : Math.max(0.15, 0.7 - absOffset * 0.22);
          const translateY = offset * 56;

          return (
            <div
              key={`${item.id}-${offset}`}
              className={`carousel-word-item ${isCenter ? 'active-center' : ''}`}
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                opacity,
                color: isCenter ? '#ffffff' : `rgba(255, 255, 255, ${Math.max(0.2, 0.85 - absOffset * 0.25)})`
              }}
            >
              {isCenter && <span className="word-accent-star left">✦</span>}
              <span className="word-text">{item.word}</span>
              {isCenter && <span className="word-accent-star right">✦</span>}
            </div>
          );
        })}
      </div>

      <div className="carousel-indicator indicator-bottom">
        <span className="indicator-diamond">◆</span>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/wordCarouselModes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Stage/WordSpin/VerticalSpinView.tsx tests/wordCarouselModes.test.ts
git commit -m "feat(word-spin): implement VerticalSpinView component"
```

---

### Task 3: Perspective3DSpinView Component (Mode 2: 3D Perspective Spin)

**Files:**
- Create: `src/components/Stage/WordSpin/Perspective3DSpinView.tsx`
- Modify: `tests/wordCarouselModes.test.ts`

**Interfaces:**
- Consumes: `SpinViewProps` from `types.ts`.
- Produces: `Perspective3DSpinView` React component.

- [ ] **Step 1: Add failing test for Perspective3DSpinView**

```typescript
// in tests/wordCarouselModes.test.ts
import { Perspective3DSpinView } from '../src/components/Stage/WordSpin/Perspective3DSpinView.tsx';

describe('Perspective3DSpinView', () => {
  it('renders 3d perspective cylinder drum with depth blur and center item', () => {
    const { container } = render(
      React.createElement(Perspective3DSpinView, {
        reel: mockWords,
        currentIndex: 1,
        targetWord: mockWords[1],
        phase: 'word-spin'
      })
    );
    expect(container.querySelector('.perspective-3d-spin-view')).toBeTruthy();
    expect(container.querySelector('.cylinder-stage')).toBeTruthy();
    expect(container.textContent).toContain('วิสัยทัศน์');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/wordCarouselModes.test.ts`
Expected: FAIL due to missing `Perspective3DSpinView.tsx`.

- [ ] **Step 3: Implement Perspective3DSpinView component**

```tsx
// src/components/Stage/WordSpin/Perspective3DSpinView.tsx
import React from 'react';
import { SpinViewProps } from './types.ts';

export const Perspective3DSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord
}) => {
  const windowSize = 7;
  const half = Math.floor(windowSize / 2);
  const visible: { item: typeof targetWord; offset: number }[] = [];

  for (let o = -half; o <= half; o++) {
    const idx = (currentIndex + o + reel.length) % reel.length;
    visible.push({ item: reel[idx] || targetWord, offset: o });
  }

  const radius = 150; // px cylinder radius

  return (
    <div className="perspective-3d-spin-view">
      <div className="cylinder-vignette vignette-top" />

      <div className="cylinder-stage">
        {visible.map(({ item, offset }) => {
          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);
          const angleDeg = offset * 38;
          const blurPx = absOffset * 2.2;
          const opacity = isCenter ? 1 : Math.max(0.2, 0.85 - absOffset * 0.22);

          return (
            <div
              key={`${item.id}-${offset}`}
              className={`cylinder-word-item ${isCenter ? 'active-center' : ''}`}
              style={{
                transform: `rotateX(${-angleDeg}deg) translateZ(${radius}px)`,
                filter: isCenter ? 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.85))' : `blur(${blurPx}px)`,
                opacity,
                color: isCenter ? '#ffffff' : `rgba(224, 231, 255, ${Math.max(0.3, 0.8 - absOffset * 0.2)})`
              }}
            >
              {isCenter && <span className="word-accent-star left">✦</span>}
              <span className="word-text">{item.word}</span>
              {isCenter && <span className="word-accent-star right">✦</span>}
            </div>
          );
        })}
      </div>

      <div className="cylinder-vignette vignette-bottom" />
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/wordCarouselModes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Stage/WordSpin/Perspective3DSpinView.tsx tests/wordCarouselModes.test.ts
git commit -m "feat(word-spin): implement Perspective3DSpinView component"
```

---

### Task 4: OrbitalSpinView Component (Mode 3: Circular Orbital Words)

**Files:**
- Create: `src/components/Stage/WordSpin/OrbitalSpinView.tsx`
- Modify: `tests/wordCarouselModes.test.ts`

**Interfaces:**
- Consumes: `SpinViewProps` from `types.ts`.
- Produces: `OrbitalSpinView` React component.

- [ ] **Step 1: Add failing test for OrbitalSpinView**

```typescript
// in tests/wordCarouselModes.test.ts
import { OrbitalSpinView } from '../src/components/Stage/WordSpin/OrbitalSpinView.tsx';

describe('OrbitalSpinView', () => {
  it('renders circular orbit container with core tiara and orbiting words', () => {
    const { container } = render(
      React.createElement(OrbitalSpinView, {
        reel: mockWords,
        currentIndex: 0,
        targetWord: mockWords[0],
        phase: 'word-spin'
      })
    );
    expect(container.querySelector('.orbital-spin-view')).toBeTruthy();
    expect(container.querySelector('.orbital-core-tiara')).toBeTruthy();
    expect(container.querySelector('.orbital-ring-track')).toBeTruthy();
    expect(container.textContent).toContain('ความฝัน');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/wordCarouselModes.test.ts`
Expected: FAIL due to missing `OrbitalSpinView.tsx`.

- [ ] **Step 3: Implement OrbitalSpinView component**

```tsx
// src/components/Stage/WordSpin/OrbitalSpinView.tsx
import React from 'react';
import { SpinViewProps } from './types.ts';
import { CrystalTiaraIcon } from '../CrystalIcons.tsx';

export const OrbitalSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord
}) => {
  const totalSlots = 8;
  const radiusX = 230; // Horizontal ellipse radius
  const radiusY = 62;  // Vertical ellipse radius (inclined perspective)

  const wordsOnRing: { item: typeof targetWord; slotIndex: number; isCenter: boolean }[] = [];

  for (let s = 0; s < totalSlots; s++) {
    const idx = (currentIndex + s + reel.length) % reel.length;
    wordsOnRing.push({
      item: reel[idx] || targetWord,
      slotIndex: s,
      isCenter: s === 0
    });
  }

  return (
    <div className="orbital-spin-view">
      {/* Radiant Tiara Core */}
      <div className="orbital-core-tiara">
        <div className="core-glow-aura" />
        <CrystalTiaraIcon size={38} />
      </div>

      {/* Orbit Ring Visual Ellipse */}
      <div className="orbital-ring-track" />

      {/* Orbiting Words */}
      <div className="orbital-words-container">
        {wordsOnRing.map(({ item, slotIndex, isCenter }) => {
          // Angle around orbit: slot 0 is foreground front-center (PI / 2)
          const angle = (Math.PI / 2) - (slotIndex * (2 * Math.PI / totalSlots));
          const posX = Math.cos(angle) * radiusX;
          const posY = Math.sin(angle) * radiusY;

          // Depth properties: front items (posY > 0) have higher scale & zIndex
          const depthProgress = (Math.sin(angle) + 1) / 2; // 0 (back) to 1 (front)
          const scale = 0.65 + depthProgress * 0.45;
          const opacity = isCenter ? 1 : Math.max(0.25, 0.4 + depthProgress * 0.55);
          const zIndex = Math.round(depthProgress * 20) + (isCenter ? 10 : 0);

          return (
            <div
              key={`${item.id}-${slotIndex}`}
              className={`orbital-word-item ${isCenter ? 'active-center' : ''}`}
              style={{
                transform: `translate(${posX}px, ${posY}px) scale(${scale})`,
                opacity,
                zIndex,
                color: isCenter ? '#ffffff' : depthProgress > 0.6 ? 'rgba(224, 231, 255, 0.85)' : 'rgba(148, 163, 184, 0.45)',
                textShadow: isCenter ? '0 0 24px rgba(255, 255, 255, 0.95), 0 0 45px rgba(165, 243, 252, 0.5)' : 'none'
              }}
            >
              {isCenter && <span className="word-accent-star left">✦</span>}
              <span className="word-text">{item.word}</span>
              {isCenter && <span className="word-accent-star right">✦</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/wordCarouselModes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Stage/WordSpin/OrbitalSpinView.tsx tests/wordCarouselModes.test.ts
git commit -m "feat(word-spin): implement OrbitalSpinView component"
```

---

### Task 5: RibbonSpinView Component (Mode 4: Royal Ribbon Spin)

**Files:**
- Create: `src/components/Stage/WordSpin/RibbonSpinView.tsx`
- Modify: `tests/wordCarouselModes.test.ts`

**Interfaces:**
- Consumes: `SpinViewProps` from `types.ts`.
- Produces: `RibbonSpinView` React component.

- [ ] **Step 1: Add failing test for RibbonSpinView**

```typescript
// in tests/wordCarouselModes.test.ts
import { RibbonSpinView } from '../src/components/Stage/WordSpin/RibbonSpinView.tsx';

describe('RibbonSpinView', () => {
  it('renders horizontal glass ribbon stream with brackets and shimmer', () => {
    const { container } = render(
      React.createElement(RibbonSpinView, {
        reel: mockWords,
        currentIndex: 3,
        targetWord: mockWords[3],
        phase: 'word-spin'
      })
    );
    expect(container.querySelector('.ribbon-spin-view')).toBeTruthy();
    expect(container.querySelector('.glass-ribbon-track')).toBeTruthy();
    expect(container.querySelector('.ribbon-shimmer-sweep')).toBeTruthy();
    expect(container.textContent).toContain('ตัวตน');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/wordCarouselModes.test.ts`
Expected: FAIL due to missing `RibbonSpinView.tsx`.

- [ ] **Step 3: Implement RibbonSpinView component**

```tsx
// src/components/Stage/WordSpin/RibbonSpinView.tsx
import React from 'react';
import { SpinViewProps } from './types.ts';

export const RibbonSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord
}) => {
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  const visible: { item: typeof targetWord; offset: number }[] = [];

  for (let o = -half; o <= half; o++) {
    const idx = (currentIndex + o + reel.length) % reel.length;
    visible.push({ item: reel[idx] || targetWord, offset: o });
  }

  return (
    <div className="ribbon-spin-view">
      <div className="glass-ribbon-track">
        <div className="ribbon-border-edge top-edge" />
        <div className="ribbon-shimmer-sweep" />

        <div className="ribbon-words-stream">
          {visible.map(({ item, offset }) => {
            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);
            const scale = 1 - absOffset * 0.14;
            const opacity = isCenter ? 1 : Math.max(0.2, 0.75 - absOffset * 0.25);
            const translateX = offset * 210;

            return (
              <div
                key={`${item.id}-${offset}`}
                className={`ribbon-word-item ${isCenter ? 'active-center' : ''}`}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  color: isCenter ? '#ffffff' : `rgba(224, 231, 255, ${Math.max(0.25, 0.8 - absOffset * 0.25)})`
                }}
              >
                {isCenter && <span className="ribbon-bracket left">⟨</span>}
                <span className="word-text">{item.word}</span>
                {isCenter && <span className="ribbon-bracket right">⟩</span>}
              </div>
            );
          })}
        </div>

        <div className="ribbon-border-edge bottom-edge" />
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/wordCarouselModes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Stage/WordSpin/RibbonSpinView.tsx tests/wordCarouselModes.test.ts
git commit -m "feat(word-spin): implement RibbonSpinView component"
```

---

### Task 6: WordCarousel Orchestrator Integration & Complete CSS Styling

**Files:**
- Modify: `src/components/Stage/WordSpin/WordCarousel.tsx`
- Modify: `src/index.css`
- Modify: `tests/wordCarouselModes.test.ts`

**Interfaces:**
- Consumes: All 4 view components (`VerticalSpinView`, `Perspective3DSpinView`, `OrbitalSpinView`, `RibbonSpinView`).
- Produces: Updated `WordCarousel` that dynamically switches renderers based on `mode`.

- [ ] **Step 1: Add integration tests for WordCarousel mode switching**

```typescript
// in tests/wordCarouselModes.test.ts
import { WordCarousel } from '../src/components/Stage/WordSpin/WordCarousel.tsx';

describe('WordCarousel Orchestrator Mode Switching', () => {
  it('renders 3D perspective view when mode="3d"', () => {
    const { container } = render(
      React.createElement(WordCarousel, {
        allWords: mockWords,
        targetWord: mockWords[0],
        phase: 'word-spin',
        mode: '3d'
      })
    );
    expect(container.querySelector('.perspective-3d-spin-view')).toBeTruthy();
  });

  it('renders orbital view when mode="orbital"', () => {
    const { container } = render(
      React.createElement(WordCarousel, {
        allWords: mockWords,
        targetWord: mockWords[0],
        phase: 'word-spin',
        mode: 'orbital'
      })
    );
    expect(container.querySelector('.orbital-spin-view')).toBeTruthy();
  });

  it('renders ribbon view when mode="ribbon"', () => {
    const { container } = render(
      React.createElement(WordCarousel, {
        allWords: mockWords,
        targetWord: mockWords[0],
        phase: 'word-spin',
        mode: 'ribbon'
      })
    );
    expect(container.querySelector('.ribbon-spin-view')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/wordCarouselModes.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update WordCarousel.tsx and add CSS styles to src/index.css**

Update `WordCarousel.tsx` to render the corresponding view component dynamically, and add comprehensive CSS styling rules for `.perspective-3d-spin-view`, `.orbital-spin-view`, `.ribbon-spin-view`, and keyframes in `src/index.css`.

- [ ] **Step 4: Run test suite to verify all pass**

Run: `npm test`
Expected: All tests PASS (70+ tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/Stage/WordSpin/WordCarousel.tsx src/index.css tests/wordCarouselModes.test.ts
git commit -m "feat(word-spin): integrate 4 spin view renderers and complete CSS animations"
```
