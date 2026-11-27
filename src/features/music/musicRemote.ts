/**
 * B14/B15: music is played by the stage window only.
 *
 * Before Phase 3 the music tab in the remote window drove that window's own (muted) player, so
 * nothing reached the stage, and the stage player always started from the default phase mapping.
 * Now the remote sends music commands over a BroadcastChannel; the stage executes them, persists
 * the mapping, and broadcasts its player state so the remote shows what is really playing.
 */
import { useEffect, useState } from 'react';
import { MusicState, MusicTrack, PhaseTrackMapping, DEFAULT_MUSIC_STATE } from '@/types/music.ts';
import { MusicPlayerEngine } from './musicPlayerEngine.ts';
import { loadMusicStateFromStorage, saveMusicStateToStorage } from './musicStorage.ts';
import { differsOnlyInProgress } from './useMusicPlayerState.ts';

export const MUSIC_CHANNEL_NAME = 'season_transition_music_v1';

export type MusicCommand =
  | { action: 'play'; trackId: string }
  | { action: 'pause' }
  | { action: 'resume' }
  | { action: 'stop'; fadeOutDuration?: number }
  | { action: 'seek'; seconds: number }
  | { action: 'setAutoSync'; enabled: boolean }
  | { action: 'setMapping'; mapping: Partial<PhaseTrackMapping> }
  | { action: 'setTrackVolume'; trackId: string; volume: number }
  | { action: 'tracksChanged' };

type MusicMessage =
  | { kind: 'MUSIC_COMMAND'; command: MusicCommand }
  | { kind: 'MUSIC_STATE'; state: MusicState }
  | { kind: 'MUSIC_HELLO' };

const ACTIONS = new Set(['play', 'pause', 'resume', 'stop', 'seek', 'setAutoSync', 'setMapping', 'setTrackVolume', 'tracksChanged']);
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function parseMusicMessage(data: unknown): MusicMessage | null {
  if (!isObject(data)) return null;
  if (data.kind === 'MUSIC_HELLO') return data as MusicMessage;
  if (data.kind === 'MUSIC_STATE' && isObject(data.state) && isObject(data.state.phaseTrackMapping)) return data as MusicMessage;
  if (data.kind === 'MUSIC_COMMAND' && isObject(data.command) && ACTIONS.has(String(data.command.action))) {
    const c = data.command;
    if (c.action === 'play' && typeof c.trackId !== 'string') return null;
    if (c.action === 'seek' && typeof c.seconds !== 'number') return null;
    if (c.action === 'setAutoSync' && typeof c.enabled !== 'boolean') return null;
    if (c.action === 'setMapping' && !isObject(c.mapping)) return null;
    return data as MusicMessage;
  }
  return null;
}

function openChannel(onMessage: (m: MusicMessage) => void): { post: (m: MusicMessage) => void; close: () => void } {
  if (typeof BroadcastChannel === 'undefined') return { post: () => {}, close: () => {} };
  const channel = new BroadcastChannel(MUSIC_CHANNEL_NAME);
  channel.onmessage = (e: MessageEvent) => {
    const m = parseMusicMessage(e.data);
    if (m) onMessage(m);
  };
  return {
    post: (m) => { try { channel.postMessage(m); } catch { /* closing */ } },
    close: () => channel.close()
  };
}

/** B15: give the stage player the phase mapping / auto-sync saved last time. */
export function hydratePlayerFromStorage(player: MusicPlayerEngine): void {
  const saved = loadMusicStateFromStorage();
  player.setPhaseTrackMapping(saved.phaseTrackMapping);
  player.setAutoSyncWithStage(saved.autoSyncWithStage);
  player.setTrackVolumes(saved.trackVolumes ?? {});
}

interface MusicHostOptions {
  getTracks: () => MusicTrack[];
  /** Re-read the library (tracks added/removed in another window) and return it. */
  reloadTracks: () => Promise<MusicTrack[]>;
}

/** Stage side: execute remote music commands, persist settings, publish player state. */
export function startMusicHost(player: MusicPlayerEngine, options: MusicHostOptions): () => void {
  let lastSaved: MusicState | null = null;

  const channel = openChannel(message => {
    if (message.kind === 'MUSIC_HELLO') {
      channel.post({ kind: 'MUSIC_STATE', state: player.getState() });
      return;
    }
    if (message.kind !== 'MUSIC_COMMAND') return;
    const c = message.command;
    switch (c.action) {
      case 'play': {
        const known = options.getTracks().find(t => t.id === c.trackId);
        if (known) {
          player.playTrack(known);
        } else {
          // Probably uploaded in the remote window a moment ago: reload, then play.
          options.reloadTracks().then(tracks => {
            const track = tracks.find(t => t.id === c.trackId);
            if (track) player.playTrack(track);
          });
        }
        break;
      }
      case 'pause': player.pause(); break;
      case 'resume': player.resume(); break;
      case 'stop': player.stop({ fadeOutDuration: c.fadeOutDuration ?? 0.8 }); break;
      case 'seek': player.seek(c.seconds); break;
      case 'setAutoSync': player.setAutoSyncWithStage(c.enabled); break;
      case 'setMapping': player.setPhaseTrackMapping(c.mapping); break;
      case 'setTrackVolume': if (typeof c.trackId === 'string' && typeof c.volume === 'number') player.setTrackVolume(c.trackId, c.volume); break;
      case 'tracksChanged': options.reloadTracks(); break;
    }
  });

  const unsubscribe = player.subscribe(state => {
    channel.post({ kind: 'MUSIC_STATE', state });
    // Persist settings (not playback progress) from one place only: the stage.
    if (!lastSaved || !differsOnlyInProgress(lastSaved, state)) {
      lastSaved = state;
      saveMusicStateToStorage(state);
    }
  });

  return () => {
    unsubscribe();
    channel.close();
  };
}

export interface MusicRemote {
  playTrack: (track: MusicTrack) => void;
  pause: () => void;
  resume: () => void;
  stop: (options?: { fadeOutDuration?: number }) => void;
  seek: (seconds: number) => void;
  setAutoSyncWithStage: (enabled: boolean) => void;
  setPhaseTrackMapping: (mapping: Partial<PhaseTrackMapping>) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  tracksChanged: () => void;
}

/**
 * Remote side: the stage player's state plus a command proxy.
 * `withProgress` = re-render on playback progress (only the music tab needs it, PF5).
 */
export function useRemoteMusic({ withProgress = false } = {}): { musicState: MusicState; remote: MusicRemote } {
  const [musicState, setMusicState] = useState<MusicState>(() => ({ ...DEFAULT_MUSIC_STATE, ...loadMusicStateFromStorage() }));
  const [channel, setChannel] = useState<ReturnType<typeof openChannel> | null>(null);

  useEffect(() => {
    const ch = openChannel(message => {
      if (message.kind === 'MUSIC_STATE') {
        setMusicState(prev => (!withProgress && differsOnlyInProgress(prev, message.state) ? prev : message.state));
      }
    });
    ch.post({ kind: 'MUSIC_HELLO' });
    setChannel(ch);
    return () => {
      ch.close();
      setChannel(null);
    };
  }, [withProgress]);

  const send = (command: MusicCommand) => channel?.post({ kind: 'MUSIC_COMMAND', command });

  return {
    musicState,
    remote: {
      playTrack: track => send({ action: 'play', trackId: track.id }),
      pause: () => send({ action: 'pause' }),
      resume: () => send({ action: 'resume' }),
      stop: options => send({ action: 'stop', fadeOutDuration: options?.fadeOutDuration }),
      seek: seconds => send({ action: 'seek', seconds }),
      setAutoSyncWithStage: enabled => send({ action: 'setAutoSync', enabled }),
      setPhaseTrackMapping: mapping => send({ action: 'setMapping', mapping }),
      setTrackVolume: (trackId, volume) => send({ action: 'setTrackVolume', trackId, volume }),
      tracksChanged: () => send({ action: 'tracksChanged' })
    }
  };
}
