import React from 'react';
import { DEFAULT_APPEARANCE_SETTINGS } from '../../types/appearance.ts';
import { useSession, useSessionActions } from '../../features/session/SessionProvider.tsx';
import { AppearanceSettingsPanel } from '../../components/Control/AppearanceSettings.tsx';
import { useControlMusic } from './controlMusic.ts';

/** Remote "Appearance" page (Phase 5). */
export const AppearancePage: React.FC = () => {
  const appearanceSettings = useSession(s => s.appearanceSettings);
  const actions = useSessionActions();
  const { musicState, stageMusic, library } = useControlMusic();

  return (
    <AppearanceSettingsPanel
      settings={appearanceSettings || DEFAULT_APPEARANCE_SETTINGS}
      onChange={actions.setAppearanceSettings}
      tracks={library.tracks}
      musicState={musicState}
      onAssignPhaseTrack={(phase, trackId) => {
        stageMusic.setPhaseTrackMapping({ [phase]: trackId });
      }}
      onAddTrack={library.addTrack}
      onDeleteTrack={library.deleteTrack}
      onPlayTrack={(track) => stageMusic.playTrack(track)}
      onStopMusic={() => stageMusic.stop()}
    />
  );
};

export default AppearancePage;
