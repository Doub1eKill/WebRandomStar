import { useEffect, useState } from 'react';
import { TimerState } from '../types/timer.ts';
import { getLiveRemainingMs } from '../engine/timerEngine.ts';

const TICK_MS = 100;

/**
 * Live remaining time for display (PF1). Only the component that calls this hook
 * re-renders while the timer runs; the shared session state stays untouched.
 */
export function useRemainingMs(timerState: TimerState): number {
  const isRunning = timerState.status === 'running' && Boolean(timerState.startTimestamp);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setTick(t => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [isRunning, timerState.startTimestamp, timerState.durationMs]);

  return getLiveRemainingMs(timerState);
}
