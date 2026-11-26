/**
 * Pure session reducer (Phase 3, A1). Every action that used to live in useStageSync is ported
 * here line for line. Side effects (storage writes, history, sounds, operator notices) are
 * returned as data and executed by the stage host, so this module never touches the outside world.
 */
import { SessionState } from '@/types/session.ts';
import { Question, Contestant } from '@/types/question.ts';
import { KeywordItem } from '@/types/word.ts';
import { TimerSoundSettings, StageDisplaySettings } from '@/types/timer.ts';
import { AppearanceSettings } from '@/types/appearance.ts';
import { selectNextQuestion, SelectionFallbackReason } from '@/features/questions/questionSelector.ts';
import { selectTargetWord, allWordsUsed } from '@/features/words/wordSelector.ts';
import { getNextState } from './stateMachine.ts';
import {
  createInitialTimerState,
  calculateRemainingMs,
  calculateTimeUsedMs,
  getLiveRemainingMs,
  DEFAULT_TIMER_DURATION_MS
} from '@/features/timer/timerEngine.ts';
import { CreateRecordParams } from '@/features/history/historyManager.ts';
import { NoticeLevel } from '@/shared/notices/operatorNotices.ts';
import { AnyCommand } from './commands.ts';

export type SessionEffect =
  | { type: 'NOTIFY'; level: NoticeLevel; message: string }
  | { type: 'RECORD_HISTORY'; params: CreateRecordParams }
  | { type: 'PERSIST_APPEARANCE'; settings: AppearanceSettings }
  | { type: 'PERSIST_TIMER_SOUND'; settings: TimerSoundSettings }
  | { type: 'PERSIST_STAGE_DISPLAY'; settings: StageDisplaySettings }
  | { type: 'PLAY_FINISH_SOUND' };

/** Everything the reducer needs from outside, injected so it stays pure and testable. */
export interface ReducerContext {
  now: number;
  loadQuestions: () => Question[];
  loadWords: () => KeywordItem[];
  loadContestants: () => Contestant[];
  loadTimerSoundSettings: () => TimerSoundSettings;
  loadStageDisplaySettings: () => StageDisplaySettings;
}

export interface ReducerResult {
  state: SessionState;
  effects: SessionEffect[];
}

/** Operator-facing explanation of a selector fallback (B11). */
export function describeFallback(reason: SelectionFallbackReason, round: string): string {
  switch (reason) {
    case 'round-empty':
      return `ไม่มีคำถามในรอบ "${round}" จึงสุ่มจากทุกรอบแทน`;
    case 'difficulty-empty':
      return 'ไม่มีคำถามตามระดับความยากที่เลือก จึงสุ่มจากทุกระดับแทน';
    case 'subset-exhausted':
      return 'คำถามในรอบที่เลือกถูกใช้ครบแล้ว จึงสุ่มจากคำถามที่ยังไม่ถูกใช้ในรอบอื่น';
    case 'bank-exhausted':
      return 'คำถามทั้งคลังถูกใช้ครบแล้ว ระบบเริ่มวนใช้คำถามซ้ำ';
  }
}

const unchanged = (state: SessionState): ReducerResult => ({ state, effects: [] });
const next = (state: SessionState, effects: SessionEffect[] = []): ReducerResult => ({ state, effects });

/** Timer state for a question that just became visible, honouring autoStartTimerOnReveal. */
function timerOnReveal(s: SessionState, now: number): SessionState['timerState'] {
  if (!s.stageDisplaySettings?.autoStartTimerOnReveal) return s.timerState;
  const durationMs = s.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;
  return {
    ...s.timerState,
    status: 'running',
    durationMs,
    remainingMs: durationMs,
    startTimestamp: now,
    pausedRemainingMs: undefined
  };
}

export function sessionReducer(s: SessionState, command: AnyCommand, ctx: ReducerContext): ReducerResult {
  const { now } = ctx;

  switch (command.type) {
    // ── Stage flow ────────────────────────────────────────────────────────────
    case 'START_JOURNEY': {
      const questions = ctx.loadQuestions();
      const words = ctx.loadWords();
      const newSeed = 'seed-' + now;

      // 1. Deterministically select the target keyword
      const usedWordIds = s.usedWordIds ?? [];
      const targetWord = command.forceWord || selectTargetWord(words, newSeed, usedWordIds) || words[0];
      const isKeywordMode = s.appearanceSettings?.quizMode === 'keyword';

      // Keyword mode shows only the keyword, so no question is drawn (one used to be drawn and
      // hidden, and Done then recorded that question and marked it used).
      if (isKeywordMode && !targetWord) {
        return next(s, [{ type: 'NOTIFY', level: 'error', message: 'ไม่มีคำสำคัญที่เปิดใช้งาน' }]);
      }

      // 2. Question mode: deterministically select an unused question from the selected round
      const selection = isKeywordMode ? null : selectNextQuestion({
        questions,
        usedQuestionIds: s.usedQuestionIds,
        round: s.selectedRound,
        seed: newSeed
      });

      if (!isKeywordMode && !selection) {
        // B10: a notice for the operator instead of alert()
        return next(s, [{ type: 'NOTIFY', level: 'error', message: 'ไม่มีคำถามที่พร้อมใช้งานในรอบที่เลือก' }]);
      }

      // B11: tell the operator when the question did not come from the requested round
      const effects: SessionEffect[] = (selection?.fallbackReasons ?? []).map(reason => ({
        type: 'NOTIFY',
        level: 'warning',
        message: describeFallback(reason, s.selectedRound)
      }));
      if (isKeywordMode && !command.forceWord && allWordsUsed(words, usedWordIds)) {
        effects.push({ type: 'NOTIFY', level: 'warning', message: 'คำสำคัญทุกคำถูกใช้ครบแล้ว ระบบเริ่มวนใช้คำซ้ำ (กดรีเซ็ตในหน้าคลังคำสำคัญได้)' });
      }

      const safeDuration = s.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;
      return next({
        ...s,
        seed: newSeed,
        currentState: 'pre-spin',
        selectedWordId: targetWord?.id,
        selectedKeyword: targetWord?.word,
        selectedWordItem: targetWord || undefined,
        selectedQuestion: selection?.selectedQuestion,
        isPaused: false,
        timerState: {
          ...s.timerState,
          status: 'ready',
          durationMs: safeDuration,
          remainingMs: safeDuration,
          startTimestamp: undefined,
          pausedRemainingMs: undefined
        }
      }, effects);
    }

    case 'TOGGLE_PAUSE':
      return next({ ...s, isPaused: !s.isPaused });

    case 'STOP_WORD_SPIN':
      return s.currentState === 'word-spin' ? next({ ...s, currentState: 'word-decelerate' }) : unchanged(s);

    case 'SKIP_TO_QUESTION': {
      const hasContent = s.appearanceSettings?.quizMode === 'keyword' ? Boolean(s.selectedWordItem) : Boolean(s.selectedQuestion);
      if (!hasContent) return unchanged(s);
      return next({ ...s, currentState: 'question', isPaused: false, timerState: timerOnReveal(s, now) });
    }

    case 'ADVANCE_PHASE': {
      // Scheduler fired for `from`; ignore it if the stage has moved on or was paused since.
      if (s.currentState !== command.from || s.isPaused) return unchanged(s);
      const showWordLock = s.appearanceSettings?.showWordLockPhase ?? true;
      const quizMode = s.appearanceSettings?.quizMode || 'question';
      const nextState = getNextState(s.currentState, showWordLock, quizMode);
      return next({
        ...s,
        currentState: nextState,
        timerState: nextState === 'question' ? timerOnReveal(s, now) : s.timerState
      });
    }

    case 'MARK_ANSWERED': {
      const isKeywordMode = s.appearanceSettings?.quizMode === 'keyword';
      // Keyword mode records the keyword itself; question mode records the question.
      const activeQuestion: Question | undefined = isKeywordMode
        ? (s.selectedKeyword ? {
            id: `KW_${s.selectedWordItem?.id || now}`,
            text: s.selectedKeyword,
            difficulty: 'medium',
            round: s.selectedRound,
            enabled: true
          } : undefined)
        : s.selectedQuestion;

      if (!activeQuestion) return unchanged(s);

      // B13: remainingMs is not kept up to date while running, so measure from the timestamp.
      const timeUsed = calculateTimeUsedMs(s.timerState.durationMs, getLiveRemainingMs(s.timerState, now));
      const contestant = ctx.loadContestants().find(c => c.id === s.selectedContestantId);

      const updatedUsed = !isKeywordMode && s.selectedQuestion
        ? Array.from(new Set([...s.usedQuestionIds, s.selectedQuestion.id]))
        : s.usedQuestionIds;
      // In keyword mode the keyword is what was answered; it is not drawn again until all are used.
      const updatedUsedWords = isKeywordMode && s.selectedWordId
        ? Array.from(new Set([...(s.usedWordIds ?? []), s.selectedWordId]))
        : s.usedWordIds;

      return next({
        ...s,
        currentState: 'answered',
        usedQuestionIds: updatedUsed,
        usedWordIds: updatedUsedWords,
        timerState: { ...s.timerState, status: 'idle' }
      }, [{
        type: 'RECORD_HISTORY',
        params: {
          sessionId: s.sessionId,
          round: s.selectedRound,
          contestant,
          question: activeQuestion,
          seed: s.seed,
          timerConfiguredMs: s.timerState.durationMs,
          timerUsedMs: timeUsed,
          isTimeout: s.timerState.status === 'finished'
        }
      }]);
    }

    case 'RESET_STAGE': {
      const safeDuration = s.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;
      return next({
        ...s,
        currentState: 'idle',
        isPaused: false,
        selectedQuestion: undefined,
        selectedWordItem: undefined,
        selectedKeyword: undefined,
        timerState: createInitialTimerState(safeDuration)
      });
    }

    // Every question can be drawn again (e.g. after a rehearsal). History is kept.
    case 'RESET_USED_QUESTIONS':
      return s.usedQuestionIds.length === 0 ? unchanged(s) : next({ ...s, usedQuestionIds: [] });

    // Every keyword can be drawn again. History is kept.
    case 'RESET_USED_WORDS':
      return (s.usedWordIds ?? []).length === 0 ? unchanged(s) : next({ ...s, usedWordIds: [] });

    // ── Selections & settings ────────────────────────────────────────────────
    case 'SET_CONTESTANT':
      return next({ ...s, selectedContestantId: command.contestantId });

    case 'SET_ROUND':
      return next({ ...s, selectedRound: command.round });

    case 'SET_VOLUME':
      return next({ ...s, volume: command.volume });

    case 'TOGGLE_MUTE':
      return next({ ...s, isMuted: !s.isMuted });

    case 'SET_APPEARANCE':
      return next({ ...s, appearanceSettings: command.settings }, [{ type: 'PERSIST_APPEARANCE', settings: command.settings }]);

    case 'SET_TIMER_SOUND_SETTINGS': {
      const settings: TimerSoundSettings = { ...(s.timerSoundSettings || ctx.loadTimerSoundSettings()), ...command.settings };
      return next({ ...s, timerSoundSettings: settings }, [{ type: 'PERSIST_TIMER_SOUND', settings }]);
    }

    case 'SET_STAGE_DISPLAY_SETTINGS': {
      const settings: StageDisplaySettings = { ...(s.stageDisplaySettings || ctx.loadStageDisplaySettings()), ...command.settings };
      return next({ ...s, stageDisplaySettings: settings }, [{ type: 'PERSIST_STAGE_DISPLAY', settings }]);
    }

    // ── Timer ────────────────────────────────────────────────────────────────
    case 'SET_TIMER_DURATION': {
      const d = command.durationMs;
      const safeDuration = typeof d === 'number' && !isNaN(d) && d > 0 ? d : DEFAULT_TIMER_DURATION_MS;
      return next({
        ...s,
        timerState: {
          ...s.timerState,
          status: 'ready',
          durationMs: safeDuration,
          remainingMs: safeDuration,
          startTimestamp: undefined,
          pausedRemainingMs: undefined
        }
      });
    }

    case 'START_TIMER': {
      const duration = command.durationMs || s.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;
      return next({
        ...s,
        timerState: {
          ...s.timerState,
          status: 'running',
          durationMs: duration,
          remainingMs: duration,
          startTimestamp: now,
          pausedRemainingMs: undefined
        }
      });
    }

    case 'PAUSE_TIMER': {
      if (s.timerState.status !== 'running') return unchanged(s);
      const remaining = calculateRemainingMs(s.timerState.startTimestamp, s.timerState.durationMs, now);
      return next({
        ...s,
        timerState: { ...s.timerState, status: 'paused', remainingMs: remaining, pausedRemainingMs: remaining }
      });
    }

    case 'RESUME_TIMER': {
      if (s.timerState.status !== 'paused' && s.timerState.status !== 'ready') return unchanged(s);
      const remaining = s.timerState.pausedRemainingMs ?? s.timerState.remainingMs;
      const duration = s.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;
      return next({
        ...s,
        timerState: {
          ...s.timerState,
          status: 'running',
          durationMs: duration,
          remainingMs: remaining,
          startTimestamp: now - (duration - remaining),
          pausedRemainingMs: undefined
        }
      });
    }

    case 'RESET_TIMER': {
      const duration = s.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;
      return next({
        ...s,
        timerState: {
          ...s.timerState,
          status: 'idle',
          durationMs: duration,
          remainingMs: duration,
          startTimestamp: undefined,
          pausedRemainingMs: undefined
        }
      });
    }

    case 'FINISH_TIMER':
      return next(
        { ...s, timerState: { ...s.timerState, status: 'finished', remainingMs: 0 } },
        [{ type: 'PLAY_FINISH_SOUND' }]
      );

    case 'TIMER_EXPIRED':
      if (s.timerState.status !== 'running') return unchanged(s);
      return next(
        { ...s, timerState: { ...s.timerState, status: 'finished', remainingMs: 0 } },
        [{ type: 'PLAY_FINISH_SOUND' }]
      );

    case 'ADJUST_TIMER': {
      const t = s.timerState;
      if (t.status === 'finished' || t.status === 'idle') return unchanged(s);

      let currentRemaining = t.remainingMs;
      if (t.status === 'running' && t.startTimestamp) {
        currentRemaining = calculateRemainingMs(t.startTimestamp, t.durationMs, now);
      } else if (t.status === 'paused') {
        currentRemaining = t.pausedRemainingMs ?? t.remainingMs;
      }

      const deltaMs = command.deltaMs;
      const newRemaining = Math.max(0, Math.min(3600 * 1000, currentRemaining + deltaMs));
      const newDuration = Math.max(newRemaining, t.durationMs + (deltaMs > 0 ? deltaMs : 0));

      if (newRemaining <= 0) {
        return next(
          { ...s, timerState: { ...t, status: 'finished', durationMs: newDuration, remainingMs: 0, pausedRemainingMs: undefined } },
          [{ type: 'PLAY_FINISH_SOUND' }]
        );
      }
      if (t.status === 'running') {
        return next({
          ...s,
          timerState: {
            ...t,
            durationMs: newDuration,
            remainingMs: newRemaining,
            startTimestamp: now - (newDuration - newRemaining),
            pausedRemainingMs: undefined
          }
        });
      }
      return next({
        ...s,
        timerState: {
          ...t,
          durationMs: newDuration,
          remainingMs: newRemaining,
          pausedRemainingMs: t.status === 'paused' ? newRemaining : undefined
        }
      });
    }
  }
}
