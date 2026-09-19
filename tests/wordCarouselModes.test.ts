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
