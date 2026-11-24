import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from './helpers/render.tsx';
import { MusicPlayerEngine } from '../src/engine/musicPlayerEngine.ts';
import { MusicTrack, DEFAULT_MUSIC_STATE } from '../src/types/music.ts';
import { hydratePlayerFromStorage, startMusicHost, useRemoteMusic } from '../src/features/music/musicRemote.ts';
import { loadMusicStateFromStorage, saveMusicStateToStorage } from '../src/storage/musicStorage.ts';

class FakeAudio {
  src = ''; currentTime = 0; duration = 0; loop = false; muted = false; volume = 1; preload = ''; paused = true;
  addEventListener() {}
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
}

const track = (id: string): MusicTrack => ({
  id, title: id, sourceType: 'url', url: `https://example.test/${id}.mp3`, duration: 120, defaultVolume: 1, loop: true, createdAt: 0
});

async function flushChannel() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await new Promise(r => setImmediate(r));
  });
}

describe('B14/B15: stage plays music commanded from the remote window', () => {
  let stopHost: (() => void) | null = null;

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('Audio', FakeAudio);
  });
  afterEach(() => {
    stopHost?.();
    stopHost = null;
    vi.unstubAllGlobals();
  });

  it('B15: the stage player starts with the mapping saved last time', () => {
    saveMusicStateToStorage({ ...DEFAULT_MUSIC_STATE, phaseTrackMapping: { ...DEFAULT_MUSIC_STATE.phaseTrackMapping, spin: 'my-spin' }, autoSyncWithStage: false });
    const player = new MusicPlayerEngine();
    hydratePlayerFromStorage(player);
    expect(player.getState().phaseTrackMapping.spin).toBe('my-spin');
    expect(player.getState().autoSyncWithStage).toBe(false);
  });

  it('B14: remote commands drive the stage player and the remote sees its state', async () => {
    const stagePlayer = new MusicPlayerEngine();
    const library = [track('ambient'), track('spin')];
    stopHost = startMusicHost(stagePlayer, { getTracks: () => library, reloadTracks: async () => library });

    const remote = renderHook(() => useRemoteMusic());
    await flushChannel();

    act(() => remote.result.current.remote.playTrack(library[1]));
    await flushChannel();
    expect(stagePlayer.getState()).toMatchObject({ currentTrackId: 'spin', isPlaying: true });
    expect(remote.result.current.musicState).toMatchObject({ currentTrackId: 'spin', isPlaying: true });

    act(() => remote.result.current.remote.setPhaseTrackMapping({ question: 'ambient' }));
    await flushChannel();
    expect(stagePlayer.getState().phaseTrackMapping.question).toBe('ambient');
    // B15: the stage persists the mapping so it survives a reload
    expect(loadMusicStateFromStorage().phaseTrackMapping.question).toBe('ambient');

    act(() => remote.result.current.remote.stop());
    await flushChannel();
    expect(stagePlayer.getState().isPlaying).toBe(false);
    remote.unmount();
  });

  it('a track the stage does not know yet is loaded from the shared library, then played', async () => {
    const stagePlayer = new MusicPlayerEngine();
    let library: MusicTrack[] = [];
    const uploaded = track('just-uploaded');
    stopHost = startMusicHost(stagePlayer, {
      getTracks: () => library,
      reloadTracks: async () => { library = [uploaded]; return library; }
    });

    const remote = renderHook(() => useRemoteMusic());
    await flushChannel();
    act(() => remote.result.current.remote.playTrack(uploaded));
    await flushChannel();
    expect(stagePlayer.getState().currentTrackId).toBe('just-uploaded');
    remote.unmount();
  });
});
