import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, TimerPhase } from '@/types/timer.ts';
import {
  calculateRemainingMs,
  calculateTimeUsedMs,
  formatTimerDisplay,
  isWarningTime,
  isCriticalTime,
  isLast3Seconds,
  getTimerPhase,
  createInitialTimerState,
  DEFAULT_TIMER_DURATION_MS,
  DEFAULT_WARNING_THRESHOLD_MS
} from './timerEngine.ts';
import { audioEngine } from '@/features/audio/audioEngine.ts';

interface UseTimerOptions {
  initialDurationMs?: number;
  warningThresholdMs?: number;
  playSounds?: boolean;
  onTick?: (remainingSeconds: number) => void;
  onWarning?: () => void;
  onFinish?: (timeUsedMs: number) => void;
}

export function useTimer(options: UseTimerOptions = {}) {
  const {
    initialDurationMs = DEFAULT_TIMER_DURATION_MS,
    warningThresholdMs = DEFAULT_WARNING_THRESHOLD_MS,
    playSounds = true,
    onTick,
    onWarning,
    onFinish
  } = options;

  const [timerState, setTimerState] = useState<TimerState>(() =>
    createInitialTimerState(initialDurationMs)
  );

  const hasFiredWarningRef = useRef(false);
  const lastTickSecondRef = useRef<number | null>(null);
  const onWarningRef = useRef(onWarning);
  const onFinishRef = useRef(onFinish);
  const onTickRef = useRef(onTick);

  onWarningRef.current = onWarning;
  onFinishRef.current = onFinish;
  onTickRef.current = onTick;

  // Active interval loop when running
  useEffect(() => {
    if (timerState.status !== 'running' || !timerState.startTimestamp) {
      lastTickSecondRef.current = null;
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateRemainingMs(
        timerState.startTimestamp,
        timerState.durationMs,
        Date.now()
      );
      const secondsLeft = Math.ceil(remaining / 1000);

      // Whole-second tick trigger
      if (lastTickSecondRef.current !== secondsLeft && secondsLeft >= 0) {
        lastTickSecondRef.current = secondsLeft;
        if (playSounds && secondsLeft > 0) {
          audioEngine.playTickSound(secondsLeft);
        }
        onTickRef.current?.(secondsLeft);
      }

      // Check warning
      if (remaining <= warningThresholdMs && remaining > 0 && !hasFiredWarningRef.current) {
        hasFiredWarningRef.current = true;
        onWarningRef.current?.();
      }

      if (remaining <= 0) {
        clearInterval(interval);
        lastTickSecondRef.current = null;
        if (playSounds) {
          audioEngine.playTimerFinish();
        }
        setTimerState(prev => ({
          ...prev,
          status: 'finished',
          remainingMs: 0
        }));
        const timeUsed = calculateTimeUsedMs(timerState.durationMs, 0);
        onFinishRef.current?.(timeUsed);
      } else {
        setTimerState(prev => ({
          ...prev,
          remainingMs: remaining
        }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [timerState.status, timerState.startTimestamp, timerState.durationMs, warningThresholdMs, playSounds]);


  const setDuration = useCallback((durationMs: number) => {
    hasFiredWarningRef.current = false;
    setTimerState({
      status: 'ready',
      durationMs,
      remainingMs: durationMs,
      warningAtMs: warningThresholdMs
    });
  }, [warningThresholdMs]);

  const start = useCallback((durationMs?: number) => {
    const duration = durationMs || timerState.durationMs;
    hasFiredWarningRef.current = false;
    setTimerState({
      status: 'running',
      durationMs: duration,
      remainingMs: duration,
      startTimestamp: Date.now(),
      warningAtMs: warningThresholdMs,
      pausedRemainingMs: undefined
    });
  }, [timerState.durationMs, warningThresholdMs]);

  const pause = useCallback(() => {
    setTimerState(prev => {
      if (prev.status !== 'running') return prev;
      const remaining = calculateRemainingMs(prev.startTimestamp, prev.durationMs, Date.now());
      return {
        ...prev,
        status: 'paused',
        remainingMs: remaining,
        pausedRemainingMs: remaining
      };
    });
  }, []);

  const resume = useCallback(() => {
    setTimerState(prev => {
      if (prev.status !== 'paused' && prev.status !== 'ready') return prev;
      const remaining = prev.pausedRemainingMs ?? prev.remainingMs;
      return {
        ...prev,
        status: 'running',
        startTimestamp: Date.now() - (prev.durationMs - remaining),
        pausedRemainingMs: undefined
      };
    });
  }, []);

  const reset = useCallback(() => {
    hasFiredWarningRef.current = false;
    setTimerState(prev => ({
      status: 'idle',
      durationMs: prev.durationMs,
      remainingMs: prev.durationMs,
      startTimestamp: undefined,
      pausedRemainingMs: undefined
    }));
  }, []);

  const finish = useCallback(() => {
    setTimerState(prev => {
      const timeUsed = calculateTimeUsedMs(prev.durationMs, prev.remainingMs);
      onFinishRef.current?.(timeUsed);
      return {
        ...prev,
        status: 'finished',
        remainingMs: 0
      };
    });
  }, []);

  const syncState = useCallback((newState: TimerState) => {
    setTimerState(newState);
    if (newState.status === 'running' && newState.remainingMs <= warningThresholdMs) {
      hasFiredWarningRef.current = true;
    } else if (newState.status === 'ready' || newState.status === 'idle') {
      hasFiredWarningRef.current = false;
    }
  }, [warningThresholdMs]);

  const progress = timerState.durationMs > 0
    ? Math.max(0, Math.min(1, 1 - (timerState.remainingMs / timerState.durationMs)))
    : 0;

  const isWarning = isWarningTime(timerState.remainingMs, timerState.status, warningThresholdMs);
  const isCritical = isCriticalTime(timerState.remainingMs, timerState.status);
  const isLast3s = isLast3Seconds(timerState.remainingMs, timerState.status);
  const phase: TimerPhase = getTimerPhase(timerState.remainingMs, timerState.status, warningThresholdMs);
  const isFinished = timerState.status === 'finished';
  const formattedTime = formatTimerDisplay(timerState.remainingMs);

  return {
    timerState,
    formattedTime,
    progress,
    isWarning,
    isCritical,
    isLast3s,
    phase,
    isFinished,
    setDuration,
    start,
    pause,
    resume,
    reset,
    finish,
    syncState
  };
}

