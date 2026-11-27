export type TimerStatus = 'idle' | 'ready' | 'running' | 'paused' | 'finished';

export type TimerPhase = 'normal' | 'warning' | 'critical' | 'last-3s' | 'finished';

export type TimerDisplayMode = 'center' | 'corner' | 'compact';

export interface TimerSoundSettings {
  tickSoundEnabled: boolean;     // default: true (Normal countdown ticks)
  warningSoundEnabled: boolean;  // default: true (Warning, critical & last-3s alert sounds)
  finishSoundEnabled: boolean;   // default: true (Timeout / completion gong)
  tickVolume: number;            // default: 0.6 (0.0 - 1.0)
  // Per-effect loudness (0.0 - 1.0), on top of the master volume. Defaults keep the levels the
  // effects had before they got their own sliders (2026-11-27).
  warningVolume: number;         // default: 0.6 (warning ticks and last-3s bells; used to follow tickVolume)
  finishVolume: number;          // default: 1 (timeout gong)
  spinStartVolume: number;       // default: 1 (spin start whoosh)
  spinTickVolume: number;        // default: 0.6 (spin ticks; used to follow tickVolume)
  wordLockVolume: number;        // default: 1 (word lock chime)
  revealVolume: number;          // default: 1 (question reveal chord)
}

/** The per-effect loudness fields of TimerSoundSettings. */
export type EffectVolumeField =
  | 'warningVolume' | 'finishVolume' | 'spinStartVolume' | 'spinTickVolume' | 'wordLockVolume' | 'revealVolume';

export interface StageDisplaySettings {
  timerDisplayMode: TimerDisplayMode;  // default: 'center'
  showTimerOnlyWhenRunning: boolean;   // default: true
  autoStartTimerOnReveal: boolean;     // default: false
  questionFontSize: 'normal' | 'large' | 'huge'; // default: 'normal'
  warningThresholdMs: number;          // default: 30000 (30s)
  criticalThresholdMs: number;         // default: 10000 (10s)
}

export interface TimerState {
  status: TimerStatus;
  durationMs: number;
  remainingMs: number;
  startTimestamp?: number;
  warningAtMs?: number; // default e.g. 30000ms (30s)
  pausedRemainingMs?: number;
}

export interface TimerPreset {
  label: string;
  durationMs: number;
  description?: string;
}

export const DEFAULT_TIMER_PRESETS: TimerPreset[] = [
  { label: '30s', durationMs: 30 * 1000, description: 'Quick / ซักถามด่วน' },
  { label: '1m', durationMs: 60 * 1000, description: 'Short / รอบทั่วไป' },
  { label: '1m 30s', durationMs: 90 * 1000, description: 'Standard / มาตรฐาน' },
  { label: '2m', durationMs: 120 * 1000, description: 'Final / รอบตัดสิน' }
];

export const DEFAULT_TIMER_SOUND_SETTINGS: TimerSoundSettings = {
  tickSoundEnabled: true,
  warningSoundEnabled: true,
  finishSoundEnabled: true,
  tickVolume: 0.6,
  warningVolume: 0.6,
  finishVolume: 1,
  spinStartVolume: 1,
  spinTickVolume: 0.6,
  wordLockVolume: 1,
  revealVolume: 1
};

export const DEFAULT_STAGE_DISPLAY_SETTINGS: StageDisplaySettings = {
  timerDisplayMode: 'center',
  showTimerOnlyWhenRunning: true,
  autoStartTimerOnReveal: false,
  questionFontSize: 'normal',
  warningThresholdMs: 30 * 1000,
  criticalThresholdMs: 10 * 1000
};


