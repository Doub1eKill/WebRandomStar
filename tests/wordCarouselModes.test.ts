import { describe, it, expect } from 'vitest';
import { KeywordItem } from '@/types/word.ts';

export const mockWords: KeywordItem[] = [
  { id: 'w1', word: 'ความฝัน', enabled: true },
  { id: 'w2', word: 'วิสัยทัศน์', enabled: true },
  { id: 'w3', word: 'ภาวะผู้นำ', enabled: true },
  { id: 'w4', word: 'ตัวตน', enabled: true },
  { id: 'w5', word: 'คุณค่า', enabled: true }
];

describe('Word Spin View Types & Definitions', () => {
  it('exports valid SpinViewProps contract', async () => {
    const types = await import('@/features/stage/word-spin/types.ts');
    expect(types).toBeDefined();
  });
});

describe('VerticalSpinView (Mode 1: Royal Vertical Spin)', () => {
  it('renders vertical track with visible items and center highlight', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { VerticalSpinView } = await import('@/features/stage/word-spin/VerticalSpinView.tsx');

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
    const { Perspective3DSpinView } = await import('@/features/stage/word-spin/Perspective3DSpinView.tsx');

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
    const { OrbitalSpinView } = await import('@/features/stage/word-spin/OrbitalSpinView.tsx');

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

describe('RibbonSpinView (Mode 4: Royal Ribbon Spin)', () => {
  it('renders horizontal glass ribbon stream with brackets and shimmer', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { RibbonSpinView } = await import('@/features/stage/word-spin/RibbonSpinView.tsx');

    const html = renderToString(
      React.createElement(RibbonSpinView, {
        reel: mockWords,
        currentIndex: 3,
        targetWord: mockWords[3],
        phase: 'word-spin'
      })
    );

    expect(html).toContain('ribbon-spin-view');
    expect(html).toContain('glass-ribbon-track');
    expect(html).toContain('ribbon-shimmer-sweep');
    expect(html).toContain('active-center');
    expect(html).toContain('ตัวตน');
  });
});

describe('WordCarousel Orchestrator Mode Switching', () => {
  it('renders vertical view by default or when mode="vertical"', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { WordCarousel } = await import('@/features/stage/word-spin/WordCarousel.tsx');

    const html = renderToString(
      React.createElement(WordCarousel, {
        allWords: mockWords,
        targetWord: mockWords[0],
        phase: 'word-spin',
        mode: 'vertical'
      })
    );

    expect(html).toContain('vertical-spin-view');
  });

  it('renders 3D perspective view when mode="3d"', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { WordCarousel } = await import('@/features/stage/word-spin/WordCarousel.tsx');

    const html = renderToString(
      React.createElement(WordCarousel, {
        allWords: mockWords,
        targetWord: mockWords[0],
        phase: 'word-spin',
        mode: '3d'
      })
    );

    expect(html).toContain('perspective-3d-spin-view');
  });

  it('renders orbital view when mode="orbital"', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { WordCarousel } = await import('@/features/stage/word-spin/WordCarousel.tsx');

    const html = renderToString(
      React.createElement(WordCarousel, {
        allWords: mockWords,
        targetWord: mockWords[0],
        phase: 'word-spin',
        mode: 'orbital'
      })
    );

    expect(html).toContain('orbital-spin-view');
  });

  it('renders ribbon view when mode="ribbon"', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { WordCarousel } = await import('@/features/stage/word-spin/WordCarousel.tsx');

    const html = renderToString(
      React.createElement(WordCarousel, {
        allWords: mockWords,
        targetWord: mockWords[0],
        phase: 'word-spin',
        mode: 'ribbon'
      })
    );

    expect(html).toContain('ribbon-spin-view');
  });

  it('renders question text and is-question class when provided Question objects and displayType="question"', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { WordCarousel } = await import('@/features/stage/word-spin/WordCarousel.tsx');

    const sampleQuestions = [
      { id: 'q1', text: 'ในยุคดิจิทัล ทักษะใดสำคัญที่สุดสำหรับผู้นำ?', enabled: true },
      { id: 'q2', text: 'แนวคิดการพัฒนาที่ยั่งยืนคืออะไร?', enabled: true }
    ];

    const html = renderToString(
      React.createElement(WordCarousel, {
        items: sampleQuestions,
        targetItem: sampleQuestions[0],
        phase: 'word-spin',
        mode: 'ribbon',
        displayType: 'question'
      })
    );

    expect(html).toContain('ribbon-spin-view');
    expect(html).toContain('is-question');
    // The reel shows random questions from the pool until it brakes onto the target.
    expect(html).toMatch(/ในยุคดิจิทัล ทักษะใดสำคัญที่สุดสำหรับผู้นำ\?|แนวคิดการพัฒนาที่ยั่งยืนคืออะไร\?/);
  });
});
