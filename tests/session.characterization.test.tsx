/**
 * Phase 0 characterization tests for the session (written against the old useStageSync hook;
 * since Phase 9 they run on <SessionProvider>, the same runtime the app uses).
 * They pin down CURRENT behaviour so the Phase 3 rewrite (reducer + store + host)
 * can prove it changed nothing by accident. Tests whose name starts with
 * "[known bug]" or "[baseline]" assert today's behaviour on purpose and must be
 * flipped by the phase named in the test.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { mount, HookResult } from './helpers/render.tsx';
import { renderSession, SessionHarness } from './helpers/session.tsx';
import { getLiveRemainingMs } from '@/features/timer/timerEngine.ts';
import { TimerDisplay } from '@/features/timer/TimerDisplay.tsx';
import { STORAGE_KEYS, historyRepository } from '@/storage/repositories.ts';
import { DEFAULT_APPEARANCE_SETTINGS, AppearanceSettings } from '@/types/appearance.ts';
import { AppState } from '@/types/session.ts';
import { audioEngine } from '@/features/audio/audioEngine.ts';
import { musicPlayer } from '@/features/music/musicPlayerEngine.ts';

type Sync = SessionHarness;
const mounted: HookResult<Sync>[] = [];

function mountSync(role: 'stage' | 'controller' = 'stage') {
  const h = renderSession(role);
  mounted.push(h);
  return h;
}

const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

/**
 * Advance in small steps, one act() per step. A single act() batches every state update
 * into one commit and only runs effects at the end, so chained timeouts and per-tick
 * commits need this to behave like a real browser.
 */
const advanceStepped = (ms: number, step = 100) => {
  for (let t = 0; t < ms; t += step) advance(Math.min(step, ms - t));
};

/** Let real BroadcastChannel messages between hook instances be delivered. */
async function flushChannel() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await new Promise(r => setImmediate(r));
  });
}

function setAppearance(h: HookResult<Sync>, patch: Partial<AppearanceSettings>) {
  act(() => h.result.current.setAppearanceSettings({ ...DEFAULT_APPEARANCE_SETTINGS, ...patch }));
}

/** Advance through timed phases, checking each one fires exactly at its configured duration. */
function expectSequence(h: HookResult<Sync>, steps: Array<[number, AppState]>) {
  for (const [ms, next] of steps) {
    advance(ms - 1);
    expect(h.result.current.session.currentState).not.toBe(next);
    advance(1);
    expect(h.result.current.session.currentState).toBe(next);
  }
}

const state = (h: HookResult<Sync>) => h.result.current.session;
const live = (h: HookResult<Sync>) => getLiveRemainingMs(state(h).timerState);

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
  vi.setSystemTime(new Date('2026-11-24T10:00:00Z'));
});

afterEach(() => {
  mounted.splice(0).forEach(h => h.unmount());
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('session: stage sequence', () => {
  it('question mode runs pre-spin → … → question with the configured durations, then waits', () => {
    const h = mountSync();
    setAppearance(h, {});
    expect(state(h).currentState).toBe('idle');

    act(() => h.result.current.startJourney());
    expect(state(h).currentState).toBe('pre-spin');
    expect(state(h).selectedQuestion).toBeDefined();
    expect(state(h).timerState.status).toBe('ready');

    expectSequence(h, [
      [800, 'word-spin'],
      [2500, 'word-decelerate'],
      [2000, 'word-lock'],
      [1500, 'question-reveal'],
      [1000, 'question']
    ]);

    advance(60_000);
    expect(state(h).currentState).toBe('question');
    expect(state(h).timerState.status).toBe('ready'); // autoStartTimerOnReveal is off by default
  });

  it('question mode without the word-lock phase goes word-decelerate → question-reveal', () => {
    const h = mountSync();
    setAppearance(h, { showWordLockPhase: false });
    act(() => h.result.current.startJourney());
    expectSequence(h, [
      [800, 'word-spin'],
      [2500, 'word-decelerate'],
      [2000, 'question-reveal'],
      [1000, 'question']
    ]);
  });

  it('keyword mode skips question-reveal: word-lock → question', () => {
    const h = mountSync();
    setAppearance(h, { quizMode: 'keyword' });
    act(() => h.result.current.startJourney());
    expect(state(h).selectedKeyword).toBeTruthy();
    expectSequence(h, [
      [800, 'word-spin'],
      [2500, 'word-decelerate'],
      [2000, 'word-lock'],
      [1500, 'question']
    ]);
  });

  it('keyword mode without word-lock goes word-decelerate → question', () => {
    const h = mountSync();
    setAppearance(h, { quizMode: 'keyword', showWordLockPhase: false });
    act(() => h.result.current.startJourney());
    expectSequence(h, [
      [800, 'word-spin'],
      [2500, 'word-decelerate'],
      [2000, 'question']
    ]);
  });

  it('manual spin stop holds word-spin until stopWordSpin()', () => {
    const h = mountSync();
    setAppearance(h, { spinStopMode: 'manual' });
    act(() => h.result.current.startJourney());
    advance(800);
    expect(state(h).currentState).toBe('word-spin');
    advance(30_000);
    expect(state(h).currentState).toBe('word-spin');

    act(() => h.result.current.stopWordSpin());
    expect(state(h).currentState).toBe('word-decelerate');
    expectSequence(h, [[2000, 'word-lock']]);
  });

  it('stopWordSpin() does nothing outside word-spin', () => {
    const h = mountSync();
    act(() => h.result.current.stopWordSpin());
    expect(state(h).currentState).toBe('idle');
  });

  it('pauseJourney() toggles a freeze; resuming restarts the current phase duration', () => {
    const h = mountSync();
    act(() => h.result.current.startJourney());
    advance(800);
    advance(1000); // 1s into the 2.5s word-spin
    act(() => h.result.current.pauseJourney());
    expect(state(h).isPaused).toBe(true);
    advance(30_000);
    expect(state(h).currentState).toBe('word-spin');

    act(() => h.result.current.pauseJourney());
    expect(state(h).isPaused).toBe(false);
    expectSequence(h, [[2500, 'word-decelerate']]); // full duration again, not the remaining 1.5s
  });

  it('skipToQuestion() jumps straight to question and clears pause', () => {
    const h = mountSync();
    act(() => h.result.current.startJourney());
    advance(800);
    act(() => h.result.current.pauseJourney());
    act(() => h.result.current.skipToQuestion());
    expect(state(h).currentState).toBe('question');
    expect(state(h).isPaused).toBe(false);
  });

  it('autoStartTimerOnReveal starts the timer when question is reached', () => {
    const h = mountSync();
    act(() => h.result.current.setStageDisplaySettings({ autoStartTimerOnReveal: true }));
    act(() => h.result.current.startJourney());
    advanceStepped(800 + 2500 + 2000 + 1500 + 1000);
    expect(state(h).currentState).toBe('question');
    expect(state(h).timerState.status).toBe('running');
    expect(state(h).timerState.startTimestamp).toBe(Date.now());
    expect(state(h).timerState.remainingMs).toBe(state(h).timerState.durationMs);
  });
});

describe('session: timer', () => {
  it('start / pause / resume keep remaining time from timestamps', () => {
    const h = mountSync();
    act(() => h.result.current.startTimer(60_000));
    expect(state(h).timerState).toMatchObject({ status: 'running', durationMs: 60_000, remainingMs: 60_000 });

    advance(10_000);
    // Phase 1 (PF1): while running, the session keeps the start value and readers derive it live.
    expect(live(h)).toBe(50_000);

    act(() => h.result.current.pauseTimer());
    expect(state(h).timerState).toMatchObject({ status: 'paused', remainingMs: 50_000, pausedRemainingMs: 50_000 });
    advance(5_000);
    expect(state(h).timerState.remainingMs).toBe(50_000);

    act(() => h.result.current.resumeTimer());
    advance(10_000);
    expect(state(h).timerState.status).toBe('running');
    expect(live(h)).toBe(40_000);
  });

  it('adjustTimer() extends remaining and duration, and finishes when it drops to zero', () => {
    const finish = vi.spyOn(audioEngine, 'playTimerFinish');
    const h = mountSync();
    act(() => h.result.current.startTimer(60_000));
    advance(10_000);

    act(() => h.result.current.adjustTimer(30_000));
    expect(state(h).timerState).toMatchObject({ remainingMs: 80_000, durationMs: 90_000 });

    act(() => h.result.current.adjustTimer(-200_000));
    expect(state(h).timerState).toMatchObject({ status: 'finished', remainingMs: 0 });
    expect(finish).toHaveBeenCalledTimes(1);
  });

  it('a single stage window plays one tick per second and one finish sound', () => {
    const tick = vi.spyOn(audioEngine, 'playTickSound');
    const finish = vi.spyOn(audioEngine, 'playTimerFinish');
    const h = mountSync();
    act(() => h.result.current.startTimer(3_000));
    advance(3_100);
    expect(state(h).timerState).toMatchObject({ status: 'finished', remainingMs: 0 });
    expect(tick.mock.calls.map(c => c[0])).toEqual([3, 2, 1]);
    expect(finish).toHaveBeenCalledTimes(1);
  });

  it('PF1: a running timer does not re-render the hook owner (baseline before Phase 1: ~10/s)', () => {
    const h = mountSync();
    act(() => h.result.current.startTimer(60_000));
    const before = h.commits();
    advanceStepped(10_000);
    expect(h.commits() - before).toBe(0);
  });

  it('PF1: the timer display alone re-renders while running, and shows the live value', () => {
    const view = mount(<TimerDisplay timerState={{ status: 'running', durationMs: 60_000, remainingMs: 60_000, startTimestamp: Date.now() }} variant="center" />);
    const before = view.commits();
    advanceStepped(1_000);
    expect(view.commits() - before).toBeGreaterThanOrEqual(9);
    expect(view.commits() - before).toBeLessThanOrEqual(11);
    view.unmount();
  });
});

describe('session: answering, history and reset', () => {
  function reachQuestion(h: HookResult<Sync>) {
    act(() => h.result.current.startJourney());
    act(() => h.result.current.skipToQuestion());
  }

  it('markAnswered() records history with the time actually used', () => {
    const h = mountSync();
    reachQuestion(h);
    const questionId = state(h).selectedQuestion!.id;
    act(() => h.result.current.startTimer(60_000));
    advance(15_000);

    act(() => h.result.current.markAnswered());
    // Done goes straight back to the idle stage (no `answered` card since 2026-11-26).
    expect(state(h).currentState).toBe('idle');
    expect(state(h).selectedQuestion).toBeUndefined();
    expect(state(h).timerState).toMatchObject({ status: 'idle', remainingMs: 60_000 });
    expect(state(h).usedQuestionIds).toContain(questionId);

    const [record] = historyRepository.load();
    expect(record).toMatchObject({
      questionId,
      timerConfiguredMs: 60_000,
      timerUsedMs: 15_000,
      isTimeout: false
    });
  });

  it('markAnswered() after the timer ran out is recorded as a timeout', () => {
    const h = mountSync();
    reachQuestion(h);
    act(() => h.result.current.startTimer(2_000));
    advance(2_100);
    act(() => h.result.current.markAnswered());
    expect(historyRepository.load()[0]).toMatchObject({ isTimeout: true, timerUsedMs: 2_000 });
  });

  it('resetStage() returns to idle, clears the selection and keeps the timer duration', () => {
    const h = mountSync();
    reachQuestion(h);
    act(() => h.result.current.setTimerDuration(45_000));
    act(() => h.result.current.markAnswered());
    act(() => h.result.current.resetStage());
    expect(state(h)).toMatchObject({ currentState: 'idle', isPaused: false });
    expect(state(h).selectedQuestion).toBeUndefined();
    expect(state(h).selectedKeyword).toBeUndefined();
    expect(state(h).timerState).toMatchObject({ status: 'idle', durationMs: 45_000, remainingMs: 45_000 });
  });

  it('used questions are not drawn again in the same session', () => {
    const h = mountSync();
    const drawn = new Set<string>();
    for (let i = 0; i < 5; i++) {
      reachQuestion(h);
      const id = state(h).selectedQuestion!.id;
      expect(drawn.has(id)).toBe(false);
      drawn.add(id);
      act(() => h.result.current.markAnswered());
      act(() => h.result.current.resetStage());
      advance(1); // new Date.now() → new seed
    }
  });
});

describe('session: restore after reload', () => {
  function saveSession(patch: Record<string, unknown>) {
    const h = mountSync();
    const snapshot = { ...state(h), ...patch };
    mounted.pop()!.unmount();
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(snapshot));
  }

  it('a reload mid-animation resets to idle', () => {
    saveSession({ currentState: 'word-spin', isPaused: true });
    const h = mountSync();
    expect(state(h)).toMatchObject({ currentState: 'idle', isPaused: false });
  });

  it('a reload during question keeps the question state', () => {
    saveSession({ currentState: 'question' });
    expect(state(mountSync()).currentState).toBe('question');
  });

  it('a corrupted timer is sanitised to the default duration', () => {
    saveSession({ timerState: { status: 'ready', durationMs: null, remainingMs: -5 } });
    expect(state(mountSync()).timerState).toMatchObject({ durationMs: 90_000, remainingMs: 90_000 });
  });
});

describe('session: multi-window (stage + remote controller window)', () => {
  // Before Phase 3 the controller window mounted useStageSync twice; two mirrors must stay harmless.
  function openStageAndController() {
    const stage = mountSync('stage');
    const controllerApp = mountSync('controller');
    const controllerPanel = mountSync('controller');
    return { stage, controllerApp, controllerPanel };
  }

  it('commands from the controller reach the stage', async () => {
    const { stage, controllerPanel } = openStageAndController();
    act(() => controllerPanel.result.current.setRound('final'));
    await flushChannel();
    expect(state(stage).selectedRound).toBe('final');
  });

  it('B1: the finish sound plays exactly once with a controller window open (Phase 0 measured 3)', async () => {
    const finish = vi.spyOn(audioEngine, 'playTimerFinish');
    const { controllerPanel } = openStageAndController();
    act(() => controllerPanel.result.current.startTimer(2_000));
    await flushChannel();
    for (let i = 0; i < 25; i++) {
      advance(100);
      await flushChannel();
    }
    expect(finish).toHaveBeenCalledTimes(1);
  });

  it('B1: phases advance exactly once and the controller mirrors them', async () => {
    const { stage, controllerPanel } = openStageAndController();
    const seen: string[] = [];
    act(() => controllerPanel.result.current.startJourney());
    await flushChannel();
    for (let i = 0; i < 80; i++) {
      advance(100);
      await flushChannel();
      const now = state(stage).currentState;
      if (seen[seen.length - 1] !== now) seen.push(now);
    }
    expect(seen).toEqual(['pre-spin', 'word-spin', 'word-decelerate', 'word-lock', 'question-reveal', 'question']);
    expect(state(controllerPanel).currentState).toBe('question');
    expect(state(controllerPanel).selectedQuestion?.id).toBe(state(stage).selectedQuestion?.id);
  });

  it('receiving a command does not re-apply audio settings on the stage (was on every snapshot)', async () => {
    const { stage, controllerPanel } = openStageAndController();
    const setMuted = vi.spyOn(musicPlayer, 'setMuted');
    act(() => controllerPanel.result.current.setRound('final'));
    await flushChannel();
    expect(state(stage).selectedRound).toBe('final');
    expect(setMuted).not.toHaveBeenCalled();

    act(() => controllerPanel.result.current.toggleMute());
    await flushChannel();
    expect(setMuted).toHaveBeenCalledWith(true);
  });

  it('both sides know whether the other is connected', async () => {
    const { stage, controllerPanel } = openStageAndController();
    await flushChannel();
    expect(controllerPanel.result.current.isPeerConnected).toBe(true);
    expect(stage.result.current.isPeerConnected).toBe(true);

    // Close the controller windows: the stage notices after the heartbeat timeout.
    mounted.splice(1).forEach(h => h.unmount());
    for (let i = 0; i < 4; i++) {
      advance(1000);
      await flushChannel();
    }
    expect(stage.result.current.isPeerConnected).toBe(false);
  });

  it('Q2: without a stage window, controller commands do nothing and it reports "not connected"', async () => {
    const controller = mountSync('controller');
    act(() => controller.result.current.startJourney());
    await flushChannel();
    advance(3000);
    await flushChannel();
    expect(state(controller).currentState).toBe('idle');
    expect(controller.result.current.isPeerConnected).toBe(false);
  });
});
