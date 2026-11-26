import { describe, it, expect } from 'vitest';
import { sessionReducer, ReducerContext } from '@/features/session/sessionReducer.ts';
import { parseChannelMessage } from '@/features/session/sessionChannel.ts';
import { createInitialSession } from '@/features/session/persistence.ts';
import { DEFAULT_TIMER_SOUND_SETTINGS, DEFAULT_STAGE_DISPLAY_SETTINGS } from '@/types/timer.ts';
import { Question } from '@/types/question.ts';
import { SessionState } from '@/types/session.ts';
import { KeywordItem } from '@/types/word.ts';

const question: Question = { id: 'q1', text: 'Q', round: 'intro', difficulty: 'medium', enabled: true };
const word: KeywordItem = { id: 'w1', word: 'ฝน', enabled: true } as KeywordItem;

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

  it('START_JOURNEY straight from answered spins the next one with no Reset in between', () => {
    const q2: Question = { id: 'q2', text: 'Q2', round: 'intro', difficulty: 'medium', enabled: true };
    const answered = {
      ...createInitialSession(),
      currentState: 'answered' as const,
      selectedQuestion: question,
      usedQuestionIds: ['q1'],
      timerState: { ...createInitialSession().timerState, status: 'idle' as const, remainingMs: 12_000 }
    };
    const r = sessionReducer(answered, { type: 'START_JOURNEY' }, ctx({ loadQuestions: () => [question, q2] }));
    expect(r.state.currentState).toBe('pre-spin');
    expect(r.state.selectedQuestion?.id).toBe('q2'); // the answered one is not drawn again
    expect(r.state.timerState.status).toBe('ready');
    expect(r.state.timerState.remainingMs).toBe(r.state.timerState.durationMs);
  });

  it('stageControls: SPIN is available when idle and right after Done, not mid-round', async () => {
    const { stageControls } = await import('@/features/control/useStageControls.ts');
    const handlers = { onStart: () => {}, onSkip: () => {} };
    const at = (currentState: SessionState['currentState']) => stageControls({ ...createInitialSession(), currentState }, [], handlers).canSpin;
    expect(at('idle')).toBe(true);
    expect(at('answered')).toBe(true);
    expect(at('question')).toBe(false);
    expect(at('word-spin')).toBe(false);
  });

  it('RESET_USED_QUESTIONS lets every question be drawn again and keeps everything else', () => {
    const s = { ...createInitialSession(), usedQuestionIds: ['q1', 'q2'], currentState: 'question' as const };
    const r = sessionReducer(s, { type: 'RESET_USED_QUESTIONS' }, ctx());
    expect(r.state.usedQuestionIds).toEqual([]);
    expect(r.state.currentState).toBe('question');
    expect(r.effects).toEqual([]);
    expect(parseChannelMessage({ kind: 'COMMAND', from: 'c1', command: { type: 'RESET_USED_QUESTIONS' } })).not.toBeNull();
  });

  describe('used keywords (keyword mode)', () => {
    const words: KeywordItem[] = [{ id: 'w1', word: 'หนึ่ง', enabled: true }, { id: 'w2', word: 'สอง', enabled: true }];
    const keywordSession = () => {
      const s = createInitialSession();
      return { ...s, appearanceSettings: { ...s.appearanceSettings!, quizMode: 'keyword' as const } };
    };

    it('Done marks the keyword used, and the next draw skips it', () => {
      const started = sessionReducer(keywordSession(), { type: 'START_JOURNEY', forceWord: words[0] }, ctx({ loadWords: () => words }));
      const answered = sessionReducer({ ...started.state, currentState: 'question' }, { type: 'MARK_ANSWERED' }, ctx({ loadWords: () => words }));
      expect(answered.state.usedWordIds).toEqual(['w1']);
      for (let i = 0; i < 5; i++) {
        const again = sessionReducer({ ...answered.state, currentState: 'idle' }, { type: 'START_JOURNEY' }, ctx({ now: 2_000_000 + i, loadWords: () => words }));
        expect(again.state.selectedWordId).toBe('w2');
      }
    });

    it('warns once every keyword is used, and RESET_USED_WORDS clears the list', () => {
      const s = { ...keywordSession(), usedWordIds: ['w1', 'w2'] };
      const r = sessionReducer(s, { type: 'START_JOURNEY' }, ctx({ loadWords: () => words }));
      expect(r.effects).toContainEqual(expect.objectContaining({ type: 'NOTIFY', level: 'warning' }));
      const reset = sessionReducer(s, { type: 'RESET_USED_WORDS' }, ctx());
      expect(reset.state.usedWordIds).toEqual([]);
      expect(parseChannelMessage({ kind: 'COMMAND', from: 'c1', command: { type: 'RESET_USED_WORDS' } })).not.toBeNull();
    });

    it('keyword mode draws no hidden question, and Done records the keyword, not a question', () => {
      const started = sessionReducer(keywordSession(), { type: 'START_JOURNEY', forceWord: words[1] }, ctx({ loadWords: () => words }));
      expect(started.state.selectedQuestion).toBeUndefined();
      const answered = sessionReducer({ ...started.state, currentState: 'question' }, { type: 'MARK_ANSWERED' }, ctx({ loadWords: () => words }));
      expect(answered.state.usedQuestionIds).toEqual([]);
      const history = answered.effects.find(e => e.type === 'RECORD_HISTORY');
      expect(history).toMatchObject({ params: { question: { id: 'KW_w2', text: 'สอง' } } });
    });

    it('keyword mode starts even with an empty question bank, and Skip works', () => {
      const started = sessionReducer(keywordSession(), { type: 'START_JOURNEY' }, ctx({ loadWords: () => words, loadQuestions: () => [] }));
      expect(started.state.currentState).toBe('pre-spin');
      expect(started.effects).toEqual([]);
      const skipped = sessionReducer({ ...started.state, currentState: 'word-spin' }, { type: 'SKIP_TO_QUESTION' }, ctx());
      expect(skipped.state.currentState).toBe('question');
    });

    it('question mode does not mark keywords used', () => {
      const started = sessionReducer(createInitialSession(), { type: 'START_JOURNEY', forceWord: words[0] }, ctx({ loadWords: () => words }));
      const answered = sessionReducer({ ...started.state, currentState: 'question' }, { type: 'MARK_ANSWERED' }, ctx({ loadWords: () => words }));
      expect(answered.state.usedWordIds ?? []).toEqual([]);
    });
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
