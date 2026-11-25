import React from 'react';

import { useAppearanceSettingsModel, AppearanceSettingsProps } from './useAppearanceSettingsModel.tsx';
import { CompetitionModeSection } from './sections/CompetitionModeSection.tsx';
import { BackgroundModeSection } from './sections/BackgroundModeSection.tsx';
import { TypographySection } from './sections/TypographySection.tsx';
import { SpinModeSection } from './sections/SpinModeSection.tsx';
import { SpinStopModeSection } from './sections/SpinStopModeSection.tsx';
import { SpinAudioSection } from './sections/SpinAudioSection.tsx';
import { WordLockSection } from './sections/WordLockSection.tsx';
import { VisualEffectsSection } from './sections/VisualEffectsSection.tsx';
import { EffectSlidersSection } from './sections/EffectSlidersSection.tsx';

export type { AppearanceSettingsProps };

export const AppearanceSettingsPanel: React.FC<AppearanceSettingsProps> = (props) => {
  const m = useAppearanceSettingsModel(props);
  return (
    <div className="appearance-settings-panel">
      <CompetitionModeSection m={m} />
      <BackgroundModeSection m={m} />
      <TypographySection m={m} />
      <SpinModeSection m={m} />
      <SpinStopModeSection m={m} />
      <SpinAudioSection m={m} />
      <WordLockSection m={m} />
      <VisualEffectsSection m={m} />
      <EffectSlidersSection m={m} />
    </div>
  );
};
