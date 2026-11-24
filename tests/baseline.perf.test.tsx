/**
 * Phase 0 performance baselines. These assert TODAY's numbers so Phase 1 can show the change;
 * Phase 1 replaces each assertion with its target.
 */
import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from './helpers/render.tsx';
import { WordCarousel } from '../src/components/Stage/WordSpin/WordCarousel.tsx';

describe('performance baselines', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('[baseline → Phase 1 PF4] the spinning word carousel commits on every animation frame', () => {
    const view = mount(<WordCarousel phase="word-spin" mode="vertical" />);
    const before = view.commits();
    for (let frame = 0; frame < 60; frame++) {
      act(() => { vi.advanceTimersByTime(16); });
    }
    const commitsPerSecond = (view.commits() - before) / (60 * 16 / 1000);
    expect(commitsPerSecond).toBeGreaterThan(55); // Phase 1 target: only when the centred word changes
    view.unmount();
  });
});
