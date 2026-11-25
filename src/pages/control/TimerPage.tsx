import React from 'react';
import { useSession, useSessionActions } from '@/features/session/SessionProvider.tsx';
import { TimerPanel } from '@/features/timer/panel/TimerPanel.tsx';

/** Remote "Timer" page (Phase 5). Re-renders only on timer/sound/display changes. */
export const TimerPage: React.FC = () => {
  const timerState = useSession(s => s.timerState);
  const timerSoundSettings = useSession(s => s.timerSoundSettings);
  const stageDisplaySettings = useSession(s => s.stageDisplaySettings);
  const actions = useSessionActions();

  return (
    <TimerPanel
      timerState={timerState}
      timerSoundSettings={timerSoundSettings}
      stageDisplaySettings={stageDisplaySettings}
      onSetDuration={actions.setTimerDuration}
      onStartTimer={actions.startTimer}
      onPauseTimer={actions.pauseTimer}
      onResumeTimer={actions.resumeTimer}
      onResetTimer={actions.resetTimer}
      onFinishTimer={actions.finishTimer}
      onAdjustTimer={actions.adjustTimer}
      onSetTimerSoundSettings={actions.setTimerSoundSettings}
      onSetStageDisplaySettings={actions.setStageDisplaySettings}
    />
  );
};

export default TimerPage;
