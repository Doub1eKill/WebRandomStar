/**
 * Performance guards. Phase 0 recorded the baselines noted in each test name;
 * Phase 1 changed the assertions to the targets.
 */
import { act, useReducer } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from './helpers/render.tsx';
import { WordCarousel } from '@/features/stage/word-spin/WordCarousel.tsx';
import { VerticalSpinView } from '@/features/stage/word-spin/VerticalSpinView.tsx';
import { Perspective3DSpinView } from '@/features/stage/word-spin/Perspective3DSpinView.tsx';
import { OrbitalSpinView } from '@/features/stage/word-spin/OrbitalSpinView.tsx';
import { RibbonSpinView } from '@/features/stage/word-spin/RibbonSpinView.tsx';
import { ApplyOffset } from '@/features/stage/word-spin/spinDom.ts';
import { DEFAULT_WORDS } from '@/data/defaultWords.ts';
import { useLazyRef } from '@/shared/lib/useLazyRef.ts';

describe('PF4: word carousel', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('commits only when the centred word changes (baseline before Phase 1: 62.5/s)', () => {
    const view = mount(<WordCarousel phase="word-spin" mode="vertical" />);
    const before = view.commits();
    for (let frame = 0; frame < 60; frame++) {
      act(() => { vi.advanceTimersByTime(16); });
    }
    const commitsPerSecond = (view.commits() - before) / (60 * 16 / 1000);
    // keyword spin speed is 13 items/s, so roughly 13 slot changes per second
    expect(commitsPerSecond).toBeLessThanOrEqual(15);
    expect(commitsPerSecond).toBeGreaterThan(5);
    view.unmount();
  });

  it('still moves the reel on every frame through direct DOM updates', () => {
    const view = mount(<WordCarousel phase="word-spin" mode="vertical" />);
    const transforms = () =>
      Array.from(view.container.querySelectorAll<HTMLElement>('.carousel-word-item')).map(el => el.style.transform).join('|');
    const seen = new Set<string>();
    for (let frame = 0; frame < 10; frame++) {
      act(() => { vi.advanceTimersByTime(16); });
      seen.add(transforms());
    }
    expect(seen.size).toBe(10);
    view.unmount();
  });
});

describe('PF4: direct DOM updates produce the same markup as a React render', () => {
  const reel = DEFAULT_WORDS.slice(0, 12);
  const views = { vertical: VerticalSpinView, '3d': Perspective3DSpinView, orbital: OrbitalSpinView, ribbon: RibbonSpinView };

  for (const [mode, View] of Object.entries(views)) {
    for (const displayType of ['keyword', 'question'] as const) {
      it(`${mode} / ${displayType}`, () => {
        let apply: ApplyOffset | null = null;
        const props = { reel, currentIndex: 2, targetWord: reel[0], phase: 'word-spin' as const, displayType };

        // Rendered at 2.1, then patched to 2.4 (same integer slot, so the same items).
        const patched = mount(<View {...props} floatOffset={2.1} registerApply={fn => { apply = fn; }} />);
        act(() => apply!(2.4));
        const fresh = mount(<View {...props} floatOffset={2.4} />);

        expect(patched.container.innerHTML).toBe(fresh.container.innerHTML);
        patched.unmount();
        fresh.unmount();
      });
    }
  }
});

describe('PF2: useLazyRef', () => {
  it('runs the initializer once across re-renders', () => {
    const init = vi.fn(() => ({ heavy: true }));
    let rerender: () => void = () => {};
    function Probe() {
      useLazyRef(init);
      const [, bump] = useReducer((x: number) => x + 1, 0);
      rerender = bump;
      return null;
    }
    const view = mount(<Probe />);
    act(() => rerender());
    act(() => rerender());
    expect(init).toHaveBeenCalledTimes(1);
    view.unmount();
  });
});
