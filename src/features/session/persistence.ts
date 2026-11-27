import { SessionState } from '@/types/session.ts';
import { STORAGE_KEYS, withoutCategory } from '@/storage/repositories.ts';
import { loadAppearanceSettings } from '@/features/appearance/appearanceSettings.ts';
import { loadTimerSoundSettings, loadStageDisplaySettings, normalizeTimerSoundSettings } from '@/features/timer/timerSettings.ts';
import { createInitialTimerState, DEFAULT_TIMER_DURATION_MS } from '@/features/timer/timerEngine.ts';

export function createInitialSession(): SessionState {
  return {
    sessionId: 'session-' + Date.now(),
    seed: 'seed-' + Math.floor(Math.random() * 100000),
    currentState: 'idle',
    selectedRound: 'intro',
    usedQuestionIds: [],
    usedWordIds: [],
    isMuted: false,
    volume: 0.8,
    isPaused: false,
    timerState: createInitialTimerState(),
    timerSoundSettings: loadTimerSoundSettings(),
    stageDisplaySettings: loadStageDisplaySettings(),
    appearanceSettings: loadAppearanceSettings()
  };
}

/**
 * Restore the session saved under STORAGE_KEYS.SESSION (same key and sanitising rules as before
 * Phase 3). A reload in the middle of an animation goes back to idle.
 */
export function loadPersistedSession(): SessionState {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (saved) {
      const parsed = JSON.parse(saved);
      const soundSettings = parsed.timerSoundSettings ? normalizeTimerSoundSettings(parsed.timerSoundSettings) : loadTimerSoundSettings();
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

      // Sessions saved before categories were removed carry them; drop them (see withoutCategory).
      const { selectedCategory: _dropped, ...rest } = parsed;
      const base = {
        ...rest,
        selectedQuestion: rest.selectedQuestion && withoutCategory(rest.selectedQuestion),
        selectedWordItem: rest.selectedWordItem && withoutCategory(rest.selectedWordItem),
        timerState: safeTimerState,
        timerSoundSettings: soundSettings,
        stageDisplaySettings: displaySettings,
        appearanceSettings
      };

      // Reset animation state to idle if reloaded mid-transition
      if (parsed.currentState !== 'question' && parsed.currentState !== 'answered') {
        return { ...base, currentState: 'idle', isPaused: false };
      }
      return base;
    }
  } catch {
    // ignore
  }
  return createInitialSession();
}

export function savePersistedSession(state: SessionState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(state));
  } catch {
    // ignore (quota / disabled storage); surfaced to the operator in Phase 4 (S4)
  }
}
