import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/** Phase 7: index.css was split; app/styles.css imports the parts in cascade order. */
const readAppStyles = () => {
  const manifest = path.resolve(__dirname, '../src/app/styles.css');
  const imports = [...fs.readFileSync(manifest, 'utf-8').matchAll(/@import '([^']+)';/g)].map(m => m[1]);
  return imports.map(p => fs.readFileSync(path.resolve(path.dirname(manifest), p), 'utf-8')).join('\n');
};

describe('Stage Transition CSS & Tokens', () => {
  it('contains royal cinematic easing tokens and keyframes in the app stylesheets', () => {
    const css = readAppStyles();

    expect(css).toContain('--ease-royal-spring');
    expect(css).toContain('stage-card-cinematic-reveal');
    expect(css).toContain('stage-hero-dissolve-out');
    expect(css).toContain('contestant-badge-slide-in');
    expect(css).toContain('timer-cinematic-float');
    expect(css).toContain('carousel-cinematic-entrance');
  });
});

describe('QuestionCard Transitions', () => {
  it('renders with cinematic reveal animation and clean centered typography', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { QuestionCard } = await import('@/features/stage/overlay/QuestionCard.tsx');

    const html = renderToString(
      React.createElement(QuestionCard, {
        question: {
          id: 'q1',
          text: 'คุณคิดว่าอะไรคือคุณสมบัติสำคัญที่สุดของผู้นำ?',
          round: 'intro',
          tags: [],
          difficulty: 'medium',
          enabled: true
        },
        isAnswered: false
      })
    );

    expect(html).toContain('question-card-crystal-cinematic');
    expect(html).toContain('คุณคิดว่าอะไรคือคุณสมบัติสำคัญที่สุดของผู้นำ?');
  });

  it('applies answered celebration settle styling when isAnswered is true', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { QuestionCard } = await import('@/features/stage/overlay/QuestionCard.tsx');

    const html = renderToString(
      React.createElement(QuestionCard, {
        question: {
          id: 'q1',
          text: 'ทดสอบคำถาม',
          round: 'intro',
          tags: [],
          difficulty: 'medium',
          enabled: true
        },
        isAnswered: true
      })
    );

    expect(html).toContain('card-answered-settle');
  });
});

describe('WordLockEffect Transitions', () => {
  it('renders word lock container with royal bloom aura and crown seal', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { WordLockEffect } = await import('@/features/stage/word-spin/WordLockEffect.tsx');

    const html = renderToString(
      React.createElement(WordLockEffect, {
        wordItem: { id: 'w1', word: 'วิสัยทัศน์', enabled: true }
      })
    );

    expect(html).toContain('word-lock-container');
    expect(html).toContain('lock-radial-bloom');
    expect(html).toContain('วิสัยทัศน์');
    expect(html).toContain('lock-crown-seal');
    expect(html).toContain('SELECTED KEYWORD');
  });

  it('renders question lock container with question title and SELECTED QUESTION seal when quizMode is question', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { WordLockEffect } = await import('@/features/stage/word-spin/WordLockEffect.tsx');

    const html = renderToString(
      React.createElement(WordLockEffect, {
        question: { id: 'q1', text: 'คำถามข้อทดสอบใหญ่', round: 'final', enabled: true, tags: [], difficulty: 'hard' },
        quizMode: 'question'
      })
    );

    expect(html).toContain('word-lock-container');
    expect(html).toContain('SELECTED QUESTION');
    expect(html).toContain('คำถามข้อทดสอบใหญ่');
    expect(html).toContain('กำลังเปิดเผยการ์ดคำถาม');
  });
});

describe('ContestantBadge & Timer Transitions', () => {
  it('renders contestant badge with slide-in animation and crystal shimmer sweep', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { ContestantBadge } = await import('@/features/stage/overlay/ContestantBadge.tsx');

    const html = renderToString(
      React.createElement(ContestantBadge, {
        contestant: { id: 'c1', number: 5, name: 'อาริยา สมบูรณ์', title: 'ตัวแทนคณะวิทยาศาสตร์', faculty: 'วิทยาศาสตร์' }
      })
    );

    expect(html).toContain('contestant-badge-cinematic');
    expect(html).toContain('badge-shimmer-sweep-layer');
    expect(html).toContain('อาริยา สมบูรณ์');
  });

  it('renders timer with cinematic float animation', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { TimerDisplay } = await import('@/features/timer/TimerDisplay.tsx');

    const html = renderToString(
      React.createElement(TimerDisplay, {
        timerState: { status: 'running', durationMs: 60000, remainingMs: 55000, startTimestamp: Date.now() },
        variant: 'corner'
      })
    );

    expect(html).toContain('stage-timer-hud');
    expect(html).toContain('animate-timer-float-in');
  });

  it('renders KeywordShowcaseCard for Competition Flow Mode (keyword mode)', async () => {
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { KeywordShowcaseCard } = await import('@/features/stage/overlay/KeywordShowcaseCard.tsx');

    const html = renderToString(
      React.createElement(KeywordShowcaseCard, {
        keyword: 'นวัตกรรมเพื่อสังคม',
        isAnswered: false
      })
    );

    expect(html).toContain('keyword-showcase-card');
    expect(html).toContain('นวัตกรรมเพื่อสังคม');
    expect(html).not.toContain('keyword-category-pill'); // categories were removed
    expect(html).toContain('คำสำคัญประจำรอบการประกวด');
  });
});




