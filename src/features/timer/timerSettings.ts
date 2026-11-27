/**
 * Timer sound and stage display settings (both stored in the shared settings repository).
 * Moved from the storage/storageApi facade in Phase 9; behaviour unchanged.
 */
import { TimerSoundSettings, DEFAULT_TIMER_SOUND_SETTINGS, StageDisplaySettings, DEFAULT_STAGE_DISPLAY_SETTINGS } from '@/types/timer.ts';
import { settingsRepository } from '@/storage/repositories.ts';
import { SaveResult } from '@/shared/lib/createRepository.ts';

const level = (v: unknown, fallback: number): number =>
  typeof v === 'number' && !isNaN(v) ? Math.max(0, Math.min(1, v)) : fallback;

/**
 * Fill in and clamp timer sound settings read from storage (or a saved session). Settings saved
 * before the per-effect sliders have no warning / spin tick level: those sounds used to follow
 * tickVolume, so they start from it.
 */
export function normalizeTimerSoundSettings(parsed: Record<string, unknown> | null | undefined): TimerSoundSettings {
  const d = DEFAULT_TIMER_SOUND_SETTINGS;
  if (!parsed || typeof parsed !== 'object') return { ...d };
  const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
  const tickVolume = level(parsed.tickVolume, d.tickVolume);
  return {
    tickSoundEnabled: bool(parsed.tickSoundEnabled, d.tickSoundEnabled),
    warningSoundEnabled: bool(parsed.warningSoundEnabled, d.warningSoundEnabled),
    finishSoundEnabled: bool(parsed.finishSoundEnabled, d.finishSoundEnabled),
    tickVolume,
    warningVolume: level(parsed.warningVolume, tickVolume),
    finishVolume: level(parsed.finishVolume, d.finishVolume),
    spinStartVolume: level(parsed.spinStartVolume, d.spinStartVolume),
    spinTickVolume: level(parsed.spinTickVolume, tickVolume),
    wordLockVolume: level(parsed.wordLockVolume, d.wordLockVolume),
    revealVolume: level(parsed.revealVolume, d.revealVolume)
  };
}

export function loadTimerSoundSettings(): TimerSoundSettings {
  const parsed = settingsRepository.load();
  if (Object.keys(parsed).length === 0) return { ...DEFAULT_TIMER_SOUND_SETTINGS };
  return normalizeTimerSoundSettings(parsed);
}

export function saveTimerSoundSettings(settings: Partial<TimerSoundSettings>): SaveResult {
  return settingsRepository.save({ ...settingsRepository.load(), ...settings });
}

export function loadStageDisplaySettings(): StageDisplaySettings {
  const parsed = settingsRepository.load();
  if (Object.keys(parsed).length === 0) return DEFAULT_STAGE_DISPLAY_SETTINGS;
  return {
    timerDisplayMode: parsed.timerDisplayMode === 'corner' || parsed.timerDisplayMode === 'compact' ? parsed.timerDisplayMode : 'center',
    showTimerOnlyWhenRunning: typeof parsed.showTimerOnlyWhenRunning === 'boolean' ? parsed.showTimerOnlyWhenRunning : DEFAULT_STAGE_DISPLAY_SETTINGS.showTimerOnlyWhenRunning,
    autoStartTimerOnReveal: typeof parsed.autoStartTimerOnReveal === 'boolean' ? parsed.autoStartTimerOnReveal : DEFAULT_STAGE_DISPLAY_SETTINGS.autoStartTimerOnReveal,
    questionFontSize: parsed.questionFontSize === 'large' || parsed.questionFontSize === 'huge' ? parsed.questionFontSize : 'normal',
    warningThresholdMs: typeof parsed.warningThresholdMs === 'number' && parsed.warningThresholdMs > 0 ? parsed.warningThresholdMs : DEFAULT_STAGE_DISPLAY_SETTINGS.warningThresholdMs,
    criticalThresholdMs: typeof parsed.criticalThresholdMs === 'number' && parsed.criticalThresholdMs > 0 ? parsed.criticalThresholdMs : DEFAULT_STAGE_DISPLAY_SETTINGS.criticalThresholdMs
  };
}

export function saveStageDisplaySettings(settings: Partial<StageDisplaySettings>): SaveResult {
  return settingsRepository.save({ ...settingsRepository.load(), ...settings });
}
