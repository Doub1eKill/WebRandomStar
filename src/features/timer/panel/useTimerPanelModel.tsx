/** TimerPanel: props, state and handlers (Phase 6 split; body moved unchanged from TimerPanel.tsx). */
import React, { useState } from 'react';
import {
  TimerState,
  TimerSoundSettings,
  StageDisplaySettings,
  DEFAULT_TIMER_SOUND_SETTINGS,
  DEFAULT_STAGE_DISPLAY_SETTINGS
} from '@/types/timer.ts';
import { formatTimerDisplay, getTimerPhase } from '@/features/timer/timerEngine.ts';
import { useRemainingMs } from '@/features/timer/useRemainingMs.ts';

export interface TimerPanelProps {
  timerState: TimerState;
  timerSoundSettings?: TimerSoundSettings;
  stageDisplaySettings?: StageDisplaySettings;
  onSetDuration: (durationMs: number) => void;
  onStartTimer: (durationMs?: number) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
  onFinishTimer: () => void;
  onAdjustTimer?: (deltaMs: number) => void;
  onSetTimerSoundSettings?: (settings: Partial<TimerSoundSettings>) => void;
  onSetStageDisplaySettings?: (settings: Partial<StageDisplaySettings>) => void;
}

export function useTimerPanelModel(props: TimerPanelProps) {
  const {
  timerState,
  timerSoundSettings = DEFAULT_TIMER_SOUND_SETTINGS,
  stageDisplaySettings = DEFAULT_STAGE_DISPLAY_SETTINGS,
  onSetDuration,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onFinishTimer,
  onAdjustTimer,
  onSetTimerSoundSettings,
  onSetStageDisplaySettings
  } = props;
  const [customMinutes, setCustomMinutes] = useState('1');
  const [customSeconds, setCustomSeconds] = useState('30');

  const remainingMs = useRemainingMs(timerState);
  const phase = getTimerPhase(remainingMs, timerState.status, timerState.warningAtMs || stageDisplaySettings.warningThresholdMs);
  const isFinished = phase === 'finished';
  const isLast3s = phase === 'last-3s';
  const isCritical = phase === 'critical';
  const isWarning = phase === 'warning';
  const isRunning = timerState.status === 'running';
  const isPaused = timerState.status === 'paused';

  const formatted = formatTimerDisplay(remainingMs);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes, 10) || 0;
    const secs = parseInt(customSeconds, 10) || 0;
    const totalMs = (mins * 60 + secs) * 1000;
    if (totalMs > 0) {
      onSetDuration(totalMs);
    }
  };

  const progress = timerState.durationMs > 0
    ? Math.max(0, Math.min(100, (remainingMs / timerState.durationMs) * 100))
    : 0;

  return { timerState, timerSoundSettings, stageDisplaySettings, onSetDuration, onStartTimer, onPauseTimer, onResumeTimer, onResetTimer, onFinishTimer, onAdjustTimer, onSetTimerSoundSettings, onSetStageDisplaySettings, customMinutes, setCustomMinutes, customSeconds, setCustomSeconds, remainingMs, phase, isFinished, isLast3s, isCritical, isWarning, isRunning, isPaused, formatted, handleApplyCustom, progress };
}

export type TimerPanelModel = ReturnType<typeof useTimerPanelModel>;
