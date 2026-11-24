import { describe, it, expect } from 'vitest';
import {
  calculateRemainingMs,
  calculateTimeUsedMs,
  formatTimerDisplay,
  isWarningTime,
  isCriticalTime,
  isLast3Seconds,
  getTimerPhase,
  createInitialTimerState
} from '@/features/timer/timerEngine.ts';

describe('Timer Engine Pure Calculations', () => {
  it('should calculate remaining time correctly based on startTimestamp', () => {
    const start = 10000;
    const duration = 90000; // 90s
    const now = 25000; // 15s elapsed
    expect(calculateRemainingMs(start, duration, now)).toBe(75000);
  });

  it('should clamp remaining time to 0 when elapsed exceeds duration', () => {
    const start = 10000;
    const duration = 90000;
    const now = 110000; // 100s elapsed
    expect(calculateRemainingMs(start, duration, now)).toBe(0);
  });

  it('should return paused remaining when provided', () => {
    expect(calculateRemainingMs(undefined, 90000, Date.now(), 45000)).toBe(45000);
  });

  it('should format milliseconds to mm:ss correctly', () => {
    expect(formatTimerDisplay(90000)).toBe('01:30');
    expect(formatTimerDisplay(60000)).toBe('01:00');
    expect(formatTimerDisplay(5000)).toBe('00:05');
    expect(formatTimerDisplay(0)).toBe('00:00');
    expect(formatTimerDisplay(125000)).toBe('02:05');
  });

  it('should calculate time used correctly', () => {
    expect(calculateTimeUsedMs(90000, 30000)).toBe(60000);
    expect(calculateTimeUsedMs(90000, 0)).toBe(90000);
  });

  it('should identify warning time correctly when ≤ 30s', () => {
    expect(isWarningTime(30000, 'running', 30000)).toBe(true);
    expect(isWarningTime(15000, 'running', 30000)).toBe(true);
    expect(isWarningTime(31000, 'running', 30000)).toBe(false);
    expect(isWarningTime(0, 'running', 30000)).toBe(false);
    expect(isWarningTime(15000, 'paused', 30000)).toBe(false);
  });

  it('should identify critical time (≤10s) and last 3 seconds (≤3s)', () => {
    expect(isCriticalTime(10000, 'running')).toBe(true);
    expect(isCriticalTime(4000, 'running')).toBe(true);
    expect(isCriticalTime(11000, 'running')).toBe(false);

    expect(isLast3Seconds(3000, 'running')).toBe(true);
    expect(isLast3Seconds(1000, 'running')).toBe(true);
    expect(isLast3Seconds(4000, 'running')).toBe(false);
  });

  it('should determine correct timer phase', () => {
    expect(getTimerPhase(45000, 'running')).toBe('normal');
    expect(getTimerPhase(25000, 'running')).toBe('warning');
    expect(getTimerPhase(8000, 'running')).toBe('critical');
    expect(getTimerPhase(2500, 'running')).toBe('last-3s');
    expect(getTimerPhase(0, 'finished')).toBe('finished');
    expect(getTimerPhase(0, 'running')).toBe('finished');
    expect(getTimerPhase(25000, 'paused')).toBe('normal');
  });

  it('should respect custom warning and critical thresholds in getTimerPhase', () => {
    // Custom warning: 20s (20000ms), Custom critical: 5s (5000ms)
    expect(getTimerPhase(25000, 'running', 20000, 5000)).toBe('normal');
    expect(getTimerPhase(18000, 'running', 20000, 5000)).toBe('warning');
    expect(getTimerPhase(4500, 'running', 20000, 5000)).toBe('critical');
    expect(getTimerPhase(2000, 'running', 20000, 5000)).toBe('last-3s');
  });

  it('should create valid initial timer state', () => {
    const state = createInitialTimerState(60000);
    expect(state.status).toBe('idle');
    expect(state.durationMs).toBe(60000);
    expect(state.remainingMs).toBe(60000);
  });

  it('should defensively handle NaN, undefined and null without crashing or producing NaN:NaN', () => {
    expect(formatTimerDisplay(NaN)).toBe('00:00');
    expect(formatTimerDisplay(undefined as unknown as number)).toBe('00:00');
    expect(formatTimerDisplay(null as unknown as number)).toBe('00:00');
    expect(formatTimerDisplay(-5000)).toBe('00:00');

    expect(calculateRemainingMs(NaN, NaN)).toBeGreaterThan(0);
    expect(calculateRemainingMs(undefined, NaN)).toBeGreaterThan(0);
    expect(calculateTimeUsedMs(NaN, NaN)).toBe(90000);
    expect(getTimerPhase(NaN, 'running')).toBe('finished');
  });
});

