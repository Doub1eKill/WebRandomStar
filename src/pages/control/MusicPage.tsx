import React from 'react';
import { useSessionActions } from '../../features/session/SessionProvider.tsx';
import { useRemoteMusic } from '../../features/music/musicRemote.ts';
import { MusicPanel } from '../../components/Control/MusicPanel.tsx';
import { useControlMusic } from './controlMusic.ts';

/** Remote "Music" page (Phase 5). Plays on the stage window (B14). */
export const MusicPage: React.FC = () => {
  const actions = useSessionActions();
  const { stageMusic, library } = useControlMusic();
  // PF5: only this page needs playback progress for its progress bar.
  const { musicState } = useRemoteMusic({ withProgress: true });

  return (
    <MusicPanel
      musicState={musicState}
      tracks={library.tracks}
      onPlayTrack={(track) => stageMusic.playTrack(track)}
      onPauseTrack={() => stageMusic.pause()}
      onResumeTrack={() => stageMusic.resume()}
      onStopMusic={() => stageMusic.stop({ fadeOutDuration: 0.8 })}
      onSeekMusic={(sec) => stageMusic.seek(sec)}
      // Volume and mute are session settings; the stage host applies them to its player.
      onSetVolume={(vol) => actions.setVolume(vol)}
      onToggleMute={() => actions.toggleMute()}
      onToggleAutoSync={() => stageMusic.setAutoSyncWithStage(!musicState.autoSyncWithStage)}
      onAssignPhaseTrack={(phase, trackId) => {
        stageMusic.setPhaseTrackMapping({ [phase]: trackId });
      }}
      onAddTrack={library.addTrack}
      onDeleteTrack={library.deleteTrack}
      onResetPresets={library.resetPresets}
    />
  );
};

export default MusicPage;
