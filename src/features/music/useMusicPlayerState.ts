import { useEffect, useState } from 'react';
import { MusicState } from '@/types/music.ts';
import { musicPlayer, MusicPlayerEngine } from './musicPlayerEngine.ts';

/** True when two states differ only in playback progress (currentTime / duration). */
export function differsOnlyInProgress(a: MusicState, b: MusicState): boolean {
  return (
    a.currentTrackId === b.currentTrackId &&
    a.isPlaying === b.isPlaying &&
    a.volume === b.volume &&
    a.isMuted === b.isMuted &&
    a.autoSyncWithStage === b.autoSyncWithStage &&
    a.phaseTrackMapping.ambient === b.phaseTrackMapping.ambient &&
    a.phaseTrackMapping.spin === b.phaseTrackMapping.spin &&
    a.phaseTrackMapping.question === b.phaseTrackMapping.question &&
    JSON.stringify(a.trackVolumes ?? {}) === JSON.stringify(b.trackVolumes ?? {})
  );
}

interface Options {
  /** Re-render on every playback progress update (~4×/s while playing). Only progress bars need this. */
  withProgress?: boolean;
  /** Initial value before the player's first notification. */
  initial?: () => MusicState;
  player?: MusicPlayerEngine;
}

/**
 * Subscribe to the music player (PF5). By default progress-only updates are ignored, so
 * components that just need the current track / mapping do not re-render while music plays.
 */
export function useMusicPlayerState({ withProgress = false, initial, player = musicPlayer }: Options = {}): MusicState {
  const [state, setState] = useState<MusicState>(() => (initial ? initial() : player.getState()));

  useEffect(() => {
    return player.subscribe(next => {
      setState(prev => (!withProgress && differsOnlyInProgress(prev, next) ? prev : next));
    });
  }, [player, withProgress]);

  return state;
}
