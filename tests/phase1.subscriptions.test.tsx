import { act, useReducer } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from './helpers/render.tsx';
import { useMusicPlayerState, differsOnlyInProgress } from '../src/hooks/useMusicPlayerState.ts';
import { MusicPlayerEngine } from '../src/engine/musicPlayerEngine.ts';
import { DEFAULT_MUSIC_STATE, MusicState } from '../src/types/music.ts';
import { KeyboardController } from '../src/components/Control/KeyboardController.tsx';

/** Stand-in player that lets the test push notifications. */
function fakePlayer() {
  let state: MusicState = { ...DEFAULT_MUSIC_STATE };
  const listeners = new Set<(s: MusicState) => void>();
  return {
    player: {
      getState: () => state,
      subscribe: (fn: (s: MusicState) => void) => { listeners.add(fn); fn(state); return () => listeners.delete(fn); }
    } as unknown as MusicPlayerEngine,
    emit(patch: Partial<MusicState>) {
      state = { ...state, ...patch };
      act(() => listeners.forEach(fn => fn(state)));
    }
  };
}

describe('PF5: useMusicPlayerState', () => {
  it('ignores progress-only updates by default', () => {
    const { player, emit } = fakePlayer();
    function Probe() { useMusicPlayerState({ player }); return null; }
    const view = mount(<Probe />);
    const before = view.commits();

    for (let t = 1; t <= 8; t++) emit({ currentTime: t * 0.25, duration: 120 });
    expect(view.commits() - before).toBe(0);

    emit({ isPlaying: true });
    expect(view.commits() - before).toBe(1);
    view.unmount();
  });

  it('re-renders on progress when asked to', () => {
    const { player, emit } = fakePlayer();
    function Probe() { useMusicPlayerState({ player, withProgress: true }); return null; }
    const view = mount(<Probe />);
    const before = view.commits();
    for (let t = 1; t <= 4; t++) emit({ currentTime: t });
    expect(view.commits() - before).toBe(4);
    view.unmount();
  });

  it('differsOnlyInProgress compares every non-progress field', () => {
    const base = { ...DEFAULT_MUSIC_STATE };
    expect(differsOnlyInProgress(base, { ...base, currentTime: 9, duration: 99 })).toBe(true);
    expect(differsOnlyInProgress(base, { ...base, volume: 0.1 })).toBe(false);
    expect(differsOnlyInProgress(base, { ...base, phaseTrackMapping: { ...base.phaseTrackMapping, spin: 'x' } })).toBe(false);
  });
});

describe('PF6: KeyboardController', () => {
  afterEach(() => vi.restoreAllMocks());

  it('attaches one keydown listener for its lifetime and always calls the latest handler', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const calls: number[] = [];
    let rerender = () => {};
    function Host() {
      const [n, bump] = useReducer((x: number) => x + 1, 0);
      rerender = bump;
      return (
        <KeyboardController
          onStartOrPause={() => calls.push(n)}
          onProceed={() => {}}
          onToggleDrawer={() => {}}
          onToggleMute={() => {}}
        />
      );
    }
    const view = mount(<Host />);
    act(() => rerender());
    act(() => rerender());

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    expect(add.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
    expect(calls).toEqual([2]); // handler from the latest render
    view.unmount();
  });

  it('B9: ignores auto-repeated keydown events from a held key', () => {
    const onStartOrPause = vi.fn();
    const onProceed = vi.fn();
    const view = mount(
      <KeyboardController onStartOrPause={onStartOrPause} onProceed={onProceed} onToggleDrawer={() => {}} onToggleMute={() => {}} />
    );
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    for (let i = 0; i < 5; i++) window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', repeat: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', repeat: true }));
    expect(onStartOrPause).toHaveBeenCalledTimes(1);
    expect(onProceed).not.toHaveBeenCalled();
    view.unmount();
  });

  it('shortcuts still win over a focused button (verified in Chrome: preventDefault blocks the button)', () => {
    const onStartOrPause = vi.fn();
    const view = mount(
      <KeyboardController onStartOrPause={onStartOrPause} onProceed={() => {}} onToggleDrawer={() => {}} onToggleMute={() => {}} />
    );
    const button = document.createElement('button');
    document.body.appendChild(button);
    const event = new KeyboardEvent('keydown', { code: 'Space', bubbles: true, cancelable: true });
    button.dispatchEvent(event);
    expect(onStartOrPause).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
    button.remove();
    view.unmount();
  });
});
