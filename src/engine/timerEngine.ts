import { TimerState, TimerStatus, TimerPhase } from '../types/timer.ts';

export const DEFAULT_WARNING_THRESHOLD_MS = 30 * 1000; // 30 seconds
export const CRITICAL_THRESHOLD_MS = 10 * 1000;       // 10 seconds
export const LAST_3S_THRESHOLD_MS = 3 * 1000;         // 3 seconds
export const DEFAULT_TIMER_DURATION_MS = 90 * 1000;   // 90 seconds

/**
 * Calculates remaining time in milliseconds given a start timestamp and configured duration.
 */
export function calculateRemainingMs(
  startTimestamp: number | undefined,
  durationMs: number,
  now: number = Date.now(),
  pausedRemainingMs?: number
): number {
  const safeDuration = typeof durationMs === 'number' && !isNaN(durationMs) && durationMs >= 0
    ? durationMs
    : DEFAULT_TIMER_DURATION_MS;

  if (pausedRemainingMs !== undefined) {
    return typeof pausedRemainingMs === 'number' && !isNaN(pausedRemainingMs)
      ? Math.max(0, pausedRemainingMs)
      : safeDuration;
  }
  if (!startTimestamp || isNaN(startTimestamp)) {
    return safeDuration;
  }
  const safeNow = typeof now === 'number' && !isNaN(now) ? now : Date.now();
  const elapsed = safeNow - startTimestamp;
  return Math.max(0, safeDuration - elapsed);
}

/**
 * Calculates time used in milliseconds.
 */
export function calculateTimeUsedMs(durationMs: number, remainingMs: number): number {
  const safeDuration = typeof durationMs === 'number' && !isNaN(durationMs) && durationMs >= 0
    ? durationMs
    : DEFAULT_TIMER_DURATION_MS;
  const safeRemaining = typeof remainingMs === 'number' && !isNaN(remainingMs) && remainingMs >= 0
    ? remainingMs
    : 0;
  return Math.max(0, safeDuration - safeRemaining);
}

/**
 * Formats milliseconds into mm:ss display string safely. Never produces NaN:NaN.
 */
export function formatTimerDisplay(ms: number | undefined | null): string {
  if (typeof ms !== 'number' || isNaN(ms)) {
    ms = 0;
  }
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Checks if current remaining time triggers the warning cue (e.g. ≤ 30 seconds).
 */
export function isWarningTime(
  remainingMs: number,
  status: TimerStatus,
  warningAtMs: number = DEFAULT_WARNING_THRESHOLD_MS
): boolean {
  if (typeof remainingMs !== 'number' || isNaN(remainingMs)) return false;
  return status === 'running' && remainingMs > 0 && remainingMs <= warningAtMs;
}

/**
 * Checks if current remaining time triggers critical cue (≤ 10 seconds).
 */
export function isCriticalTime(
  remainingMs: number,
  status: TimerStatus,
  criticalAtMs: number = CRITICAL_THRESHOLD_MS
): boolean {
  if (typeof remainingMs !== 'number' || isNaN(remainingMs)) return false;
  return status === 'running' && remainingMs > 0 && remainingMs <= criticalAtMs;
}

/**
 * Checks if current remaining time is in the final 3 seconds (≤ 3 seconds).
 */
export function isLast3Seconds(
  remainingMs: number,
  status: TimerStatus,
  last3sAtMs: number = LAST_3S_THRESHOLD_MS
): boolean {
  if (typeof remainingMs !== 'number' || isNaN(remainingMs)) return false;
  return status === 'running' && remainingMs > 0 && remainingMs <= last3sAtMs;
}

/**
 * Determines the current visual/auditory phase of the timer.
 */
export function getTimerPhase(
  remainingMs: number,
  status: TimerStatus,
  warningAtMs: number = DEFAULT_WARNING_THRESHOLD_MS,
  criticalAtMs: number = CRITICAL_THRESHOLD_MS
): TimerPhase {
  if (status === 'finished') {
    return 'finished';
  }
  if (typeof remainingMs !== 'number' || isNaN(remainingMs) || remainingMs <= 0) {
    if (status === 'running') {
      return 'finished';
    }
    return 'normal';
  }
  if (status !== 'running') {
    return 'normal';
  }

  const remainingSeconds = Math.ceil(remainingMs / 1000);
  if (remainingSeconds <= 3 && remainingSeconds > 0) {
    return 'last-3s';
  }
  if (remainingMs <= criticalAtMs && remainingSeconds > 0) {
    return 'critical';
  }
  if (remainingMs <= warningAtMs && remainingSeconds > 0) {
    return 'warning';
  }
  return 'normal';
}

/**
 * Returns initial default timer state.
 */
export function createInitialTimerState(durationMs: number = DEFAULT_TIMER_DURATION_MS): TimerState {
  const safeDuration = typeof durationMs === 'number' && !isNaN(durationMs) && durationMs > 0
    ? durationMs
    : DEFAULT_TIMER_DURATION_MS;
  return {
    status: 'idle',
    durationMs: safeDuration,
    remainingMs: safeDuration,
    warningAtMs: DEFAULT_WARNING_THRESHOLD_MS
  };
}

