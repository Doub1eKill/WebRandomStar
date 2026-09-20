import { useState, useEffect, useCallback, useRef } from 'react';
import { SessionState, SyncMessage } from '../types/session.ts';
import { Question, QuestionCategory } from '../types/question.ts';
import { KeywordItem } from '../types/word.ts';
import { TimerSoundSettings, StageDisplaySettings } from '../types/timer.ts';
import { AppearanceSettings } from '../types/appearance.ts';
import {
  loadQuestions,
  loadContestants,
  loadWords,
  loadAppearanceSettings,
  saveAppearanceSettings,
  appendHistoryRecord,
  loadTimerSoundSettings,
  saveTimerSoundSettings,
  loadStageDisplaySettings,
  saveStageDisplaySettings,
  STORAGE_KEYS
} from '../utils/storage.ts';
import { selectNextQuestion } from '../engine/questionSelector.ts';
import { selectTargetWord } from '../engine/wordSelector.ts';
import { STAGE_DURATION, getNextState } from '../engine/stateMachine.ts';
import { createInitialTimerState, calculateRemainingMs, calculateTimeUsedMs, DEFAULT_TIMER_DURATION_MS } from '../engine/timerEngine.ts';
import { createHistoryRecord } from '../engine/historyManager.ts';
import { audioEngine } from '../engine/audioEngine.ts';
import { musicPlayer } from '../engine/musicPlayerEngine.ts';

const CHANNEL_NAME = 'season_transition_quiz_sync_v2';

const initialSessionState: SessionState = {
  sessionId: 'session-' + Date.now(),
  seed: 'seed-' + Math.floor(Math.random() * 100000),
  currentState: 'idle',
  selectedRound: 'intro',
  usedQuestionIds: [],
  isMuted: false,
  volume: 0.8,
  isPaused: false,
  timerState: createInitialTimerState(),
  timerSoundSettings: loadTimerSoundSettings(),
  stageDisplaySettings: loadStageDisplaySettings(),
  appearanceSettings: loadAppearanceSettings()
};

export function useStageSync(role: 'stage' | 'controller') {
  const [session, setSession] = useState<SessionState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (saved) {
        const parsed = JSON.parse(saved);
        const soundSettings = parsed.timerSoundSettings || loadTimerSoundSettings();
        const displaySettings = parsed.stageDisplaySettings || loadStageDisplaySettings();
        const appearanceSettings = parsed.appearanceSettings || loadAppearanceSettings();

        // Sanitize timer state to prevent any NaN/undefined values
        const rawTimer = parsed.timerState || {};
        const safeDuration = typeof rawTimer.durationMs === 'number' && !isNaN(rawTimer.durationMs) && rawTimer.durationMs > 0
          ? rawTimer.durationMs
          : DEFAULT_TIMER_DURATION_MS;
        const safeRemaining = typeof rawTimer.remainingMs === 'number' && !isNaN(rawTimer.remainingMs) && rawTimer.remainingMs >= 0
          ? rawTimer.remainingMs
          : safeDuration;

        const safeTimerState = {
          status: rawTimer.status || 'idle',
          durationMs: safeDuration,
          remainingMs: safeRemaining,
          startTimestamp: rawTimer.startTimestamp,
          warningAtMs: typeof rawTimer.warningAtMs === 'number' ? rawTimer.warningAtMs : 30000,
          pausedRemainingMs: rawTimer.pausedRemainingMs
        };

        // Reset animation state to idle if reloaded mid-transition
        if (parsed.currentState !== 'question' && parsed.currentState !== 'answered') {
          return {
            ...parsed,
            currentState: 'idle',
            isPaused: false,
            timerState: safeTimerState,
            timerSoundSettings: soundSettings,
            stageDisplaySettings: displaySettings,
            appearanceSettings
          };
        }
        return {
          ...parsed,
          timerState: safeTimerState,
          timerSoundSettings: soundSettings,
          stageDisplaySettings: displaySettings,
          appearanceSettings
        };
      }
    } catch {
      // ignore
    }
    return initialSessionState;
  });

  const channelRef = useRef<BroadcastChannel | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const lastTickSecondRef = useRef<number | null>(null);

  // Broadcast state changes and persist to localStorage
  const broadcastState = useCallback((nextState: SessionState, messageType?: string) => {
    setSession(nextState);
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(nextState));
      const msg: SyncMessage = {
        type: (messageType as any) || 'STAGE_SYNC_STATE',
        payload: nextState,
        timestamp: Date.now()
      };
      channelRef.current?.postMessage(msg);
    } catch {
      // ignore
    }
  }, []);

  // Sync volume and sound settings with AudioEngine and MusicPlayer
  useEffect(() => {
    if (role === 'controller') {
      audioEngine.setMuted(true);
      musicPlayer.setMuted(true);
      return;
    }

    audioEngine.setVolume(session.volume);
    audioEngine.setMuted(session.isMuted);
    musicPlayer.setMasterVolume(session.volume);
    musicPlayer.setMuted(session.isMuted);

    if (session.timerSoundSettings) {
      audioEngine.setTickSoundEnabled(session.timerSoundSettings.tickSoundEnabled);
      audioEngine.setWarningSoundEnabled(session.timerSoundSettings.warningSoundEnabled);
      audioEngine.setFinishSoundEnabled(session.timerSoundSettings.finishSoundEnabled);
      audioEngine.setTickVolume(session.timerSoundSettings.tickVolume);
    }
  }, [role, session.volume, session.isMuted, session.timerSoundSettings]);

  // Setup BroadcastChannel & localStorage fallback
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        const msg = event.data;
        if (!msg) return;

        // Sync full session payload whenever present
        if (msg.payload) {
          setSession(msg.payload);
        }

        if (msg.type === 'TIMER_FINISH' && role === 'stage') {
          audioEngine.playTimerFinish();
        }
      };

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === STORAGE_KEYS.SESSION && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setSession(parsed);
          } catch {
            // ignore
          }
        }
      };
      window.addEventListener('storage', handleStorageChange);

      return () => {
        channel.close();
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [role]);

  // Automated sequence progression when on Stage
  useEffect(() => {
    if (
      session.isPaused ||
      session.currentState === 'idle' ||
      session.currentState === 'question' ||
      session.currentState === 'answered'
    ) {
      return;
    }

    // In manual spin stop mode, do not auto-progress past word-spin
    if (session.currentState === 'word-spin' && session.appearanceSettings?.spinStopMode === 'manual') {
      return;
    }

    const duration = STAGE_DURATION[session.currentState];
    if (!duration || duration <= 0) return;

    const timer = setTimeout(() => {
      const showWordLock = session.appearanceSettings?.showWordLockPhase ?? true;
      const quizMode = session.appearanceSettings?.quizMode || 'question';
      const next = getNextState(session.currentState, showWordLock, quizMode);

      // If transitioning to question, check if autoStartTimerOnReveal is enabled
      const willAutoStart = next === 'question' && session.stageDisplaySettings?.autoStartTimerOnReveal;
      const durationMs = session.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;

      const nextTimerState = willAutoStart
        ? {
            ...session.timerState,
            status: 'running' as const,
            durationMs,
            remainingMs: durationMs,
            startTimestamp: Date.now(),
            pausedRemainingMs: undefined
          }
        : session.timerState;

      broadcastState({
        ...session,
        currentState: next,
        timerState: nextTimerState
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [session, broadcastState]);

  // Timer Tick & Sound / Completion handler
  useEffect(() => {
    if (session.timerState.status !== 'running' || !session.timerState.startTimestamp) {
      lastTickSecondRef.current = null;
      return;
    }

    const interval = setInterval(() => {
      const current = sessionRef.current;
      const tState = current.timerState;
      if (tState.status !== 'running' || !tState.startTimestamp) return;

      const remaining = calculateRemainingMs(tState.startTimestamp, tState.durationMs, Date.now());
      const secondsLeft = Math.ceil(remaining / 1000);

      if (remaining <= 0) {
        clearInterval(interval);
        lastTickSecondRef.current = null;
        if (role === 'stage') {
          audioEngine.playTimerFinish();
        }

        const updatedTimer = {
          ...tState,
          status: 'finished' as const,
          remainingMs: 0
        };

        broadcastState({
          ...current,
          timerState: updatedTimer
        }, 'TIMER_FINISH');
      } else {
        // Trigger per-second tick sound when crossing whole-second boundary on stage
        if (role === 'stage' && lastTickSecondRef.current !== secondsLeft) {
          lastTickSecondRef.current = secondsLeft;
          audioEngine.playTickSound(secondsLeft);
        }

        setSession(prev => ({
          ...prev,
          timerState: {
            ...prev.timerState,
            remainingMs: remaining
          }
        }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [session.timerState.status, session.timerState.startTimestamp, broadcastState, role]);

  // Actions
  const startJourney = useCallback((
    _viewport?: { width: number; height: number },
    forceCategory?: QuestionCategory,
    forceWord?: KeywordItem
  ) => {
    const questions = loadQuestions();
    const words = loadWords();
    const newSeed = 'seed-' + Date.now();

    // 1. Deterministically select the target keyword
    const targetWord = forceWord || selectTargetWord(words, forceCategory, newSeed) || words[0];
    const categoryToUse = forceCategory || (targetWord ? (targetWord.category as QuestionCategory) : undefined);

    // 2. Deterministically select the question matching the selected word / category
    const selection = selectNextQuestion({
      questions,
      usedQuestionIds: session.usedQuestionIds,
      round: session.selectedRound,
      category: categoryToUse,
      seed: newSeed
    });

    if (!selection) {
      alert('ไม่มีคำถามที่พร้อมใช้งานในหมวด/รอบที่เลือก');
      return;
    }

    const safeDuration = session.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;

    const nextState: SessionState = {
      ...session,
      seed: newSeed,
      currentState: 'pre-spin',
      selectedWordId: targetWord?.id,
      selectedKeyword: targetWord?.word,
      selectedWordItem: targetWord || undefined,
      selectedCategory: selection.selectedCategory,
      selectedQuestion: selection.selectedQuestion,
      isPaused: false,
      timerState: {
        ...session.timerState,
        status: 'ready',
        durationMs: safeDuration,
        remainingMs: safeDuration,
        startTimestamp: undefined,
        pausedRemainingMs: undefined
      }
    };

    broadcastState(nextState, 'STAGE_SPIN_START');
  }, [session, broadcastState]);

  const pauseJourney = useCallback(() => {
    broadcastState({
      ...session,
      isPaused: !session.isPaused
    }, 'STAGE_PAUSE');
  }, [session, broadcastState]);

  const stopWordSpin = useCallback(() => {
    if (session.currentState === 'word-spin') {
      broadcastState({
        ...session,
        currentState: 'word-decelerate'
      }, 'STAGE_STOP_WORD_SPIN');
    }
  }, [session, broadcastState]);

  const skipToQuestion = useCallback(() => {
    if (!session.selectedQuestion) return;

    const willAutoStart = session.stageDisplaySettings?.autoStartTimerOnReveal;
    const durationMs = session.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;

    const nextTimerState = willAutoStart
      ? {
          ...session.timerState,
          status: 'running' as const,
          durationMs,
          remainingMs: durationMs,
          startTimestamp: Date.now(),
          pausedRemainingMs: undefined
        }
      : session.timerState;

    broadcastState({
      ...session,
      currentState: 'question',
      isPaused: false,
      timerState: nextTimerState
    }, 'STAGE_SKIP');
  }, [session, broadcastState]);

  const markAnswered = useCallback(() => {
    const isKeywordMode = session.appearanceSettings?.quizMode === 'keyword';
    const activeQuestion: Question | undefined = session.selectedQuestion || (isKeywordMode && session.selectedKeyword ? {
      id: `KW_${session.selectedWordItem?.id || Date.now()}`,
      text: session.selectedKeyword,
      category: (session.selectedCategory || session.selectedWordItem?.category || 'general') as any,
      difficulty: 'medium',
      round: session.selectedRound,
      enabled: true
    } : undefined);

    if (!activeQuestion) return;

    const timeUsed = calculateTimeUsedMs(session.timerState.durationMs, session.timerState.remainingMs);
    const contestants = loadContestants();
    const activeContestant = contestants.find(c => c.id === session.selectedContestantId);

    // Save history audit
    const record = createHistoryRecord({
      sessionId: session.sessionId,
      round: session.selectedRound,
      contestant: activeContestant,
      question: activeQuestion,
      seed: session.seed,
      timerConfiguredMs: session.timerState.durationMs,
      timerUsedMs: timeUsed,
      isTimeout: session.timerState.status === 'finished'
    });
    appendHistoryRecord(record);

    const updatedUsed = session.selectedQuestion
      ? Array.from(new Set([...session.usedQuestionIds, session.selectedQuestion.id]))
      : session.usedQuestionIds;

    broadcastState({
      ...session,
      currentState: 'answered',
      usedQuestionIds: updatedUsed,
      timerState: {
        ...session.timerState,
        status: 'idle'
      }
    }, 'STAGE_DONE');
  }, [session, broadcastState]);


  const resetStage = useCallback(() => {
    const safeDuration = session.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;
    broadcastState({
      ...session,
      currentState: 'idle',
      isPaused: false,
      selectedQuestion: undefined,
      selectedWordItem: undefined,
      selectedKeyword: undefined,
      selectedCategory: undefined,
      timerState: createInitialTimerState(safeDuration)
    }, 'STAGE_RESET');
  }, [session, broadcastState]);

  const setContestant = useCallback((contestantId: string) => {
    broadcastState({
      ...session,
      selectedContestantId: contestantId
    }, 'STAGE_SET_CONTESTANT');
  }, [session, broadcastState]);

  const setRound = useCallback((round: string) => {
    broadcastState({
      ...session,
      selectedRound: round
    }, 'STAGE_SET_ROUND');
  }, [session, broadcastState]);

  const setVolume = useCallback((volume: number) => {
    broadcastState({
      ...session,
      volume
    }, 'STAGE_SET_VOLUME');
  }, [session, broadcastState]);

  const toggleMute = useCallback(() => {
    broadcastState({
      ...session,
      isMuted: !session.isMuted
    }, 'STAGE_TOGGLE_MUTE');
  }, [session, broadcastState]);

  const setAppearanceSettings = useCallback((settings: AppearanceSettings) => {
    saveAppearanceSettings(settings);
    broadcastState({
      ...session,
      appearanceSettings: settings
    }, 'STAGE_SET_APPEARANCE');
  }, [session, broadcastState]);

  // Timer Controls
  const setTimerDuration = useCallback((durationMs: number) => {
    const safeDuration = typeof durationMs === 'number' && !isNaN(durationMs) && durationMs > 0
      ? durationMs
      : DEFAULT_TIMER_DURATION_MS;

    const updatedTimer = {
      ...session.timerState,
      status: 'ready' as const,
      durationMs: safeDuration,
      remainingMs: safeDuration,
      startTimestamp: undefined,
      pausedRemainingMs: undefined
    };
    broadcastState({
      ...session,
      timerState: updatedTimer
    }, 'TIMER_SET');
  }, [session, broadcastState]);

  const startTimer = useCallback((durationMs?: number) => {
    const duration = durationMs || session.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;
    const updatedTimer = {
      ...session.timerState,
      status: 'running' as const,
      durationMs: duration,
      remainingMs: duration,
      startTimestamp: Date.now(),
      pausedRemainingMs: undefined
    };
    broadcastState({
      ...session,
      timerState: updatedTimer
    }, 'TIMER_START');
  }, [session, broadcastState]);

  const pauseTimer = useCallback(() => {
    if (session.timerState.status !== 'running') return;
    const remaining = calculateRemainingMs(session.timerState.startTimestamp, session.timerState.durationMs, Date.now());
    const updatedTimer = {
      ...session.timerState,
      status: 'paused' as const,
      remainingMs: remaining,
      pausedRemainingMs: remaining
    };
    broadcastState({
      ...session,
      timerState: updatedTimer
    }, 'TIMER_PAUSE');
  }, [session, broadcastState]);

  const resumeTimer = useCallback(() => {
    if (session.timerState.status !== 'paused' && session.timerState.status !== 'ready') return;
    const remaining = session.timerState.pausedRemainingMs ?? session.timerState.remainingMs;
    const duration = session.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;
    const updatedTimer = {
      ...session.timerState,
      status: 'running' as const,
      durationMs: duration,
      remainingMs: remaining,
      startTimestamp: Date.now() - (duration - remaining),
      pausedRemainingMs: undefined
    };
    broadcastState({
      ...session,
      timerState: updatedTimer
    }, 'TIMER_RESUME');
  }, [session, broadcastState]);

  const resetTimer = useCallback(() => {
    const duration = session.timerState.durationMs || DEFAULT_TIMER_DURATION_MS;
    const updatedTimer = {
      ...session.timerState,
      status: 'idle' as const,
      durationMs: duration,
      remainingMs: duration,
      startTimestamp: undefined,
      pausedRemainingMs: undefined
    };
    broadcastState({
      ...session,
      timerState: updatedTimer
    }, 'TIMER_RESET');
  }, [session, broadcastState]);

  const finishTimer = useCallback(() => {
    if (role === 'stage') {
      audioEngine.playTimerFinish();
    }
    const updatedTimer = {
      ...session.timerState,
      status: 'finished' as const,
      remainingMs: 0
    };
    broadcastState({
      ...session,
      timerState: updatedTimer
    }, 'TIMER_FINISH');
  }, [session, role, broadcastState]);

  const adjustTimer = useCallback((deltaMs: number) => {
    const tState = session.timerState;
    if (tState.status === 'finished' || tState.status === 'idle') return;

    let currentRemaining = tState.remainingMs;
    if (tState.status === 'running' && tState.startTimestamp) {
      currentRemaining = calculateRemainingMs(tState.startTimestamp, tState.durationMs, Date.now());
    } else if (tState.status === 'paused') {
      currentRemaining = tState.pausedRemainingMs ?? tState.remainingMs;
    }

    const newRemaining = Math.max(0, Math.min(3600 * 1000, currentRemaining + deltaMs));
    const newDuration = Math.max(newRemaining, tState.durationMs + (deltaMs > 0 ? deltaMs : 0));

    let updatedTimer: typeof tState;
    if (newRemaining <= 0) {
      updatedTimer = {
        ...tState,
        status: 'finished' as const,
        durationMs: newDuration,
        remainingMs: 0,
        pausedRemainingMs: undefined
      };
      if (role === 'stage') {
        audioEngine.playTimerFinish();
      }
    } else if (tState.status === 'running') {
      updatedTimer = {
        ...tState,
        durationMs: newDuration,
        remainingMs: newRemaining,
        startTimestamp: Date.now() - (newDuration - newRemaining),
        pausedRemainingMs: undefined
      };
    } else {
      updatedTimer = {
        ...tState,
        durationMs: newDuration,
        remainingMs: newRemaining,
        pausedRemainingMs: tState.status === 'paused' ? newRemaining : undefined
      };
    }

    broadcastState({
      ...session,
      timerState: updatedTimer
    }, 'TIMER_ADJUST');
  }, [session, role, broadcastState]);

  const setTimerSoundSettings = useCallback((settings: Partial<TimerSoundSettings>) => {
    const current = session.timerSoundSettings || loadTimerSoundSettings();
    const updated: TimerSoundSettings = {
      ...current,
      ...settings
    };
    saveTimerSoundSettings(updated);
    broadcastState({
      ...session,
      timerSoundSettings: updated
    }, 'STAGE_SET_TIMER_SOUND_SETTINGS');
  }, [session, broadcastState]);

  const setStageDisplaySettings = useCallback((settings: Partial<StageDisplaySettings>) => {
    const current = session.stageDisplaySettings || loadStageDisplaySettings();
    const updated: StageDisplaySettings = {
      ...current,
      ...settings
    };
    saveStageDisplaySettings(updated);
    broadcastState({
      ...session,
      stageDisplaySettings: updated
    }, 'STAGE_SET_DISPLAY_SETTINGS');
  }, [session, broadcastState]);

  return {
    session,
    role,
    startJourney,
    stopWordSpin,
    pauseJourney,
    skipToQuestion,
    markAnswered,
    resetStage,
    setContestant,
    setRound,
    setVolume,
    toggleMute,
    setAppearanceSettings,
    setTimerDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    finishTimer,
    adjustTimer,
    setTimerSoundSettings,
    setStageDisplaySettings
  };
}
