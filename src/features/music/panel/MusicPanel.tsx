import React from 'react';

import { useMusicPanelModel, MusicPanelProps } from './useMusicPanelModel.tsx';
import { MusicMasterSection } from './sections/MusicMasterSection.tsx';
import { NowPlayingSection } from './sections/NowPlayingSection.tsx';
import { PhaseAssignmentSection } from './sections/PhaseAssignmentSection.tsx';
import { TrackLibrarySection } from './sections/TrackLibrarySection.tsx';
import { AddUrlModal } from './sections/AddUrlModal.tsx';

export type { MusicPanelProps };

export const MusicPanel: React.FC<MusicPanelProps> = (props) => {
  const m = useMusicPanelModel(props);
  return (
    <div className="ui-panel-stack">
      <MusicMasterSection m={m} />
      <NowPlayingSection m={m} />
      <PhaseAssignmentSection m={m} />
      <TrackLibrarySection m={m} />
      <AddUrlModal m={m} />
    </div>
  );
};
