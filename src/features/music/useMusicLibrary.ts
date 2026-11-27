/**
 * A3 + S8: the music library (add / delete / reset tracks) in one place for both windows.
 * The library lives in IndexedDB, which every window shares; after a change this hook tells
 * the other windows to reload it, so the stage and the remote always list the same tracks.
 */
import { useCallback, useEffect, useState } from 'react';
import { MusicTrack, PRESET_MUSIC_TRACKS } from '@/types/music.ts';
import { MusicPlayerEngine } from './musicPlayerEngine.ts';
import {
  getAllTracksFromStorage,
  saveTrackToStorage,
  deleteTrackFromStorage,
  loadMusicStateFromStorage,
  resetTracksToDefault
} from './musicStorage.ts';
import { MusicRemote } from './musicRemote.ts';

const LIBRARY_CHANNEL_NAME = 'season_transition_music_library_v1';

/** Player controls for the window that owns the player (the stage). */
export function localMusicControls(player: MusicPlayerEngine): MusicRemote {
  return {
    playTrack: track => { player.playTrack(track); },
    pause: () => player.pause(),
    resume: () => player.resume(),
    stop: options => player.stop(options),
    seek: seconds => player.seek(seconds),
    setAutoSyncWithStage: enabled => player.setAutoSyncWithStage(enabled),
    setPhaseTrackMapping: mapping => player.setPhaseTrackMapping(mapping),
    setTrackVolume: (trackId, volume) => player.setTrackVolume(trackId, volume),
    tracksChanged: () => {}
  };
}

export interface MusicLibrary {
  tracks: MusicTrack[];
  reload: () => Promise<MusicTrack[]>;
  addTrack: (track: MusicTrack, fileBlob?: Blob) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  resetPresets: () => Promise<void>;
}

/**
 * @param controls  where play/stop/mapping commands go (local player or the remote proxy)
 * @param currentTrackId  the track playing now, so deleting it stops it first
 */
export function useMusicLibrary(controls: MusicRemote, currentTrackId: string | null): MusicLibrary {
  const [tracks, setTracks] = useState<MusicTrack[]>(() => PRESET_MUSIC_TRACKS);

  const reload = useCallback(
    () => getAllTracksFromStorage().then(list => {
      setTracks(list);
      return list;
    }),
    []
  );

  const [channel, setChannel] = useState<BroadcastChannel | null>(null);
  useEffect(() => {
    reload();
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel(LIBRARY_CHANNEL_NAME);
    ch.onmessage = () => { reload(); };
    setChannel(ch);
    return () => {
      ch.close();
      setChannel(null);
    };
  }, [reload]);

  const announce = () => {
    try { channel?.postMessage('changed'); } catch { /* closing */ }
    controls.tracksChanged();
  };

  return {
    tracks,
    reload,
    addTrack: async (track, fileBlob) => {
      const saved = await saveTrackToStorage(track, fileBlob);
      setTracks(prev => [...prev.filter(t => t.id !== saved.id), saved]);
      announce();
    },
    deleteTrack: async id => {
      if (currentTrackId === id) controls.stop();
      await deleteTrackFromStorage(id);
      setTracks(prev => prev.filter(t => t.id !== id));
      // deleteTrackFromStorage re-pointed any phase that used this track; apply it to the player.
      controls.setPhaseTrackMapping(loadMusicStateFromStorage().phaseTrackMapping);
      announce();
    },
    resetPresets: async () => {
      setTracks(await resetTracksToDefault());
      announce();
    }
  };
}
