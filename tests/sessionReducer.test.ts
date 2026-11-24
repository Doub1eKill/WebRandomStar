import { describe, it, expect } from 'vitest';
import { sessionReducer, ReducerContext } from '../src/features/session/sessionReducer.ts';
import { parseChannelMessage } from '../src/features/session/sessionChannel.ts';
import { createInitialSession } from '../src/features/session/persistence.ts';
import { DEFAULT_TIMER_SOUND_SETTINGS, DEFAULT_STAGE_DISPLAY_SETTINGS } from '../src/types/timer.ts';
import { Question } from '../src/types/question.ts';
import { KeywordItem } from '../src/types/word.ts';

const question: Question = { id: 'q1', text: 'Q', round: 'intro', category: 'rain', difficulty: 'medium', enabled: true };
const word: KeywordItem = { id: 'w1', word: 'ฝน', category: 'rain', enabled: true } as KeywordItem;

const ctx = (patch: Partial<ReducerContext> = {}): ReducerContext => ({
  now: 1_000_000,
  loadQuestions: () => [question],
  loadWords: () => [word],
  loadContestants: () => [],
  loadTimerSoundSettings: () => DEFAULT_TIMER_SOUND_SETTINGS,
  loadStageDisplaySettings: () => DEFAULT_STAGE_DISPLAY_SETTINGS,
  ...patch
});

describe('sessionReducer', () => {
  it('is pure: the input state is never mutated', () => {
    const s = createInitialSession();
    const frozen = JSON.stringify(s);
    sessionReducer(s, { type: 'START_JOURNEY' }, ctx());
    sessionReducer(s, { type: 'START_TIMER', durationMs: 5000 }, ctx());
    expect(JSON.stringify(s)).toBe(frozen);
  });

  it('START_JOURNEY seeds from ctx.now and selects deterministically', () => {
    const a = sessionReducer(createInitialSession(), { type: 'START_JOURNEY' }, ctx());
    const b = sessionReducer(createInitialSession(), { type: 'START_JOURNEY' }, ctx());
    expect(a.state.seed).toBe('seed-1000000');
    expect(a.state.currentState).toBe('pre-spin');
    expect(a.state.selectedQuestion?.id).toBe(b.state.selectedQuestion?.id);
  });

  it('START_JOURNEY with no usable question returns an error notice and leaves state alone', () => {
    const s = createInitialSession();
    const r = sessionReducer(s, { type: 'START_JOURNEY' }, ctx({ loadQuestions: () => [] }));
    expect(r.state).toBe(s);
    expect(r.effects).toEqual([{ type: 'NOTIFY', level: 'error', message: expect.any(String) }]);
  });

  it('ADVANCE_PHASE is ignored when the phase changed or the stage is paused', () => {
    const s = { ...createInitialSession(), currentState: 'word-spin' as const };
    expect(sessionReducer(s, { type: 'ADVANCE_PHASE', from: 'pre-spin' }, ctx()).state).toBe(s);
    const paused = { ...s, isPaused: true };
    expect(sessionReducer(paused, { type: 'ADVANCE_PHASE', from: 'word-spin' }, ctx()).state).toBe(paused);
    expect(sessionReducer(s, { type: 'ADVANCE_PHASE', from: 'word-spin' }, ctx()).state.currentState).toBe('word-decelerate');
  });

  it('MARK_ANSWERED emits a history effect instead of writing storage itself', () => {
    const s = { ...createInitialSession(), currentState: 'question' as const, selectedQuestion: question };
    const r = sessionReducer(s, { type: 'MARK_ANSWERED' }, ctx());
    expect(r.state.currentState).toBe('answered');
    expect(r.effects).toHaveLength(1);
    expect(r.effects[0]).toMatchObject({ type: 'RECORD_HISTORY', params: { question: { id: 'q1' } } });
  });

  it('TIMER_EXPIRED finishes a running timer once and asks for the finish sound', () => {
    const s = { ...createInitialSession(), timerState: { status: 'running' as const, durationMs: 1000, remainingMs: 1000, startTimestamp: 1 } };
    const r = sessionReducer(s, { type: 'TIMER_EXPIRED' }, ctx());
    expect(r.state.timerState).toMatchObject({ status: 'finished', remainingMs: 0 });
    expect(r.effects).toEqual([{ type: 'PLAY_FINISH_SOUND' }]);
    expect(sessionReducer(r.state, { type: 'TIMER_EXPIRED' }, ctx()).effects).toEqual([]);
  });

  it('settings commands return persist effects', () => {
    const r = sessionReducer(createInitialSession(), { type: 'SET_TIMER_SOUND_SETTINGS', settings: { tickVolume: 0.2 } }, ctx());
    expect(r.state.timerSoundSettings?.tickVolume).toBe(0.2);
    expect(r.effects[0]).toMatchObject({ type: 'PERSIST_TIMER_SOUND', settings: { tickVolume: 0.2 } });
  });
});

describe('S7: channel message validation', () => {
  it('accepts well-formed remote commands', () => {
    expect(parseChannelMessage({ kind: 'COMMAND', from: 'c1', command: { type: 'SET_ROUND', round: 'final' } })).not.toBeNull();
  });

  it('rejects internal scheduler commands, unknown kinds and malformed snapshots', () => {
    expect(parseChannelMessage({ kind: 'COMMAND', from: 'c1', command: { type: 'ADVANCE_PHASE', from: 'idle' } })).toBeNull();
    expect(parseChannelMessage({ kind: 'COMMAND', from: 'c1', command: { type: 'DROP_TABLES' } })).toBeNull();
    expect(parseChannelMessage({ kind: 'SNAPSHOT', from: 's1', state: { currentState: 'idle' } })).toBeNull();
    expect(parseChannelMessage({ kind: 'WHATEVER', from: 'x' })).toBeNull();
    expect(parseChannelMessage('not an object')).toBeNull();
    expect(parseChannelMessage({ kind: 'HELLO', from: 'x', role: 'admin' })).toBeNull();
  });
});
