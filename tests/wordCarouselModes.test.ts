import { describe, it, expect } from 'vitest';
import { KeywordItem } from '../src/types/word.ts';

export const mockWords: KeywordItem[] = [
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

describe('VerticalSpinView (Mode 1: Royal Vertical Spin)', () => {
  it('renders vertical track with visible items and center highlight', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { VerticalSpinView } = await import('../src/components/Stage/WordSpin/VerticalSpinView.tsx');

    const html = renderToString(
      React.createElement(VerticalSpinView, {
        reel: mockWords,
        currentIndex: 2,
        targetWord: mockWords[2],
        phase: 'word-spin'
      })
    );

    expect(html).toContain('vertical-spin-view');
    expect(html).toContain('active-center');
    expect(html).toContain('ภาวะผู้นำ');
    expect(html).toContain('indicator-top');
    expect(html).toContain('indicator-bottom');
  });
});

describe('Perspective3DSpinView (Mode 2: 3D Perspective Spin)', () => {
  it('renders 3d perspective cylinder drum with depth blur and center item', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { Perspective3DSpinView } = await import('../src/components/Stage/WordSpin/Perspective3DSpinView.tsx');

    const html = renderToString(
      React.createElement(Perspective3DSpinView, {
        reel: mockWords,
        currentIndex: 1,
        targetWord: mockWords[1],
        phase: 'word-spin'
      })
    );

    expect(html).toContain('perspective-3d-spin-view');
    expect(html).toContain('cylinder-stage');
    expect(html).toContain('active-center');
    expect(html).toContain('วิสัยทัศน์');
    expect(html).toContain('vignette-top');
    expect(html).toContain('vignette-bottom');
  });
});

describe('OrbitalSpinView (Mode 3: Circular Orbital Words)', () => {
  it('renders circular orbit container with core tiara and orbiting words', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { OrbitalSpinView } = await import('../src/components/Stage/WordSpin/OrbitalSpinView.tsx');

    const html = renderToString(
      React.createElement(OrbitalSpinView, {
        reel: mockWords,
        currentIndex: 0,
        targetWord: mockWords[0],
        phase: 'word-spin'
      })
    );

    expect(html).toContain('orbital-spin-view');
    expect(html).toContain('orbital-core-tiara');
    expect(html).toContain('orbital-ring-track');
    expect(html).toContain('active-center');
    expect(html).toContain('ความฝัน');
  });
});
