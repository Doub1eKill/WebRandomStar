/**
 * Timer sound and stage display settings (both stored in the shared settings repository).
 * Moved from the storage/storageApi facade in Phase 9; behaviour unchanged.
 */
import { TimerSoundSettings, DEFAULT_TIMER_SOUND_SETTINGS, StageDisplaySettings, DEFAULT_STAGE_DISPLAY_SETTINGS } from '@/types/timer.ts';
import { settingsRepository } from '@/storage/repositories.ts';
import { SaveResult } from '@/shared/lib/createRepository.ts';

export function loadTimerSoundSettings(): TimerSoundSettings {
  const parsed = settingsRepository.load();
  if (Object.keys(parsed).length === 0) return DEFAULT_TIMER_SOUND_SETTINGS;
  return {
    tickSoundEnabled: typeof parsed.tickSoundEnabled === 'boolean' ? parsed.tickSoundEnabled : DEFAULT_TIMER_SOUND_SETTINGS.tickSoundEnabled,
    warningSoundEnabled: typeof parsed.warningSoundEnabled === 'boolean' ? parsed.warningSoundEnabled : DEFAULT_TIMER_SOUND_SETTINGS.warningSoundEnabled,
    finishSoundEnabled: typeof parsed.finishSoundEnabled === 'boolean' ? parsed.finishSoundEnabled : DEFAULT_TIMER_SOUND_SETTINGS.finishSoundEnabled,
    tickVolume: typeof parsed.tickVolume === 'number' ? Math.max(0, Math.min(1, parsed.tickVolume)) : DEFAULT_TIMER_SOUND_SETTINGS.tickVolume
  };
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
