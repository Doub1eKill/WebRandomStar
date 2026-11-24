import React from 'react';

import { useTimerPanelModel, TimerPanelProps } from './useTimerPanelModel.tsx';
import { TimerHeroSection } from './sections/TimerHeroSection.tsx';
import { TimerLayoutSection } from './sections/TimerLayoutSection.tsx';
import { TimerThresholdSection } from './sections/TimerThresholdSection.tsx';
import { TimerSoundSection } from './sections/TimerSoundSection.tsx';
import { TimerPresetsSection } from './sections/TimerPresetsSection.tsx';
import { TimerCustomDurationSection } from './sections/TimerCustomDurationSection.tsx';

export type { TimerPanelProps };

export const TimerPanel: React.FC<TimerPanelProps> = (props) => {
  const m = useTimerPanelModel(props);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <TimerHeroSection m={m} />
      <TimerLayoutSection m={m} />
      <TimerThresholdSection m={m} />
      <TimerSoundSection m={m} />
      <TimerPresetsSection m={m} />
      <TimerCustomDurationSection m={m} />
    </div>
  );
};
