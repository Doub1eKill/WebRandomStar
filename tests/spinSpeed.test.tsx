/**
 * The reel spins at one speed and then only slows down (before this fix the brake jumped to
 * 3–18× the spin speed, measured at ~10× in Chrome: 3.8 → 40 items/s), and it stops on the
 * target. Speed is read from the rendered `translate3d` of the vertical view, frame by frame.
 */
import { act, useState } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from './helpers/render.tsx';
import { WordCarousel } from '@/features/stage/word-spin/WordCarousel.tsx';
import { SPIN_SPEED_ITEMS_PER_MS } from '@/features/stage/word-spin/wordSpinEngine.ts';
import { STAGE_DURATION } from '@/features/session/stateMachine.ts';
import { DEFAULT_WORDS } from '@/data/defaultWords.ts';

type Phase = 'pre-spin' | 'word-spin' | 'word-decelerate';
const FRAME_MS = 16;

describe('constant-speed spin', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['keyword', 60, SPIN_SPEED_ITEMS_PER_MS.keyword],
    ['question', 68, SPIN_SPEED_ITEMS_PER_MS.question]
  ] as const)('%s reel: the brake never runs faster than the spin, and stops on the target', (displayType, spacingPx, spinSpeed) => {
    const target = DEFAULT_WORDS[4];
    let setPhase!: (phase: Phase) => void;
    function Harness() {
      const [phase, set] = useState<Phase>('word-spin');
      setPhase = set;
      return <WordCarousel phase={phase} items={DEFAULT_WORDS} targetItem={target} displayType={displayType} mode="vertical" />;
    }
    const view = mount(<Harness />);

    // Per-frame speed in items/ms: how far the items that stayed on screen moved since the last frame.
    let previous = new Map<Element, number>();
    const speeds: number[] = [];
    const frame = () => {
      act(() => { vi.advanceTimersByTime(FRAME_MS); });
      const now = new Map<Element, number>();
      view.container.querySelectorAll<HTMLElement>('.carousel-word-item').forEach(el => {
        const y = /translate3d\(0,\s*(-?[\d.]+)px/.exec(el.style.transform);
        if (y) now.set(el, Number(y[1]));
      });
      const moves = [...now].filter(([el]) => previous.has(el)).map(([el, y]) => previous.get(el)! - y);
      if (moves.length) speeds.push(moves.sort((a, b) => a - b)[Math.floor(moves.length / 2)] / spacingPx / FRAME_MS);
      previous = now;
    };

    for (let t = 0; t < STAGE_DURATION['word-spin']; t += FRAME_MS) frame();
    const spinSpeeds = speeds.splice(0);
    expect(spinSpeeds.at(-1)).toBeCloseTo(spinSpeed, 4);

    act(() => setPhase('word-decelerate'));
    for (let t = 0; t < STAGE_DURATION['word-decelerate']; t += FRAME_MS) frame();

    expect(Math.max(...speeds)).toBeLessThanOrEqual(spinSpeed * 1.1);
    expect(speeds.at(-1)).toBe(0);
    expect(view.container.querySelector('.carousel-word-item.active-center')?.textContent).toContain(target.word);
    view.unmount();
  });
});
