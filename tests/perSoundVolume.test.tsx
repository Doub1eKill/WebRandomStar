import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from './helpers/render.tsx';
import { MusicPlayerEngine } from '@/features/music/musicPlayerEngine.ts';
import { MusicTrack, DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS, trackLevel } from '@/types/music.ts';
import { hydratePlayerFromStorage, startMusicHost, useRemoteMusic } from '@/features/music/musicRemote.ts';
import { loadMusicStateFromStorage, saveMusicStateToStorage } from '@/features/music/musicStorage.ts';
import { differsOnlyInProgress } from '@/features/music/useMusicPlayerState.ts';
import { normalizeTimerSoundSettings, loadTimerSoundSettings, saveTimerSoundSettings } from '@/features/timer/timerSettings.ts';
import { DEFAULT_TIMER_SOUND_SETTINGS } from '@/types/timer.ts';
import { audioEngine } from '@/features/audio/audioEngine.ts';

class FakeAudio {
  src = ''; currentTime = 0; duration = 0; loop = false; muted = false; volume = 1; preload = ''; paused = true;
  addEventListener() {}
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
}

const track = (id: string, defaultVolume = 0.8): MusicTrack => ({
  id, title: id, sourceType: 'url', url: `https://example.test/${id}.mp3`, duration: 120, defaultVolume, loop: true, createdAt: 0
});

async function flushChannel() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await new Promise(r => setImmediate(r));
  });
}

describe('per-track music volume', () => {
  let stopHost: (() => void) | null = null;

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('Audio', FakeAudio);
  });
  afterEach(() => {
    stopHost?.();
    stopHost = null;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('trackLevel uses the set level, else the track default (presets: full)', () => {
    const file = track('a', 0.8);
    expect(trackLevel(file)).toBe(0.8);
    expect(trackLevel(file, { a: 0.3 })).toBe(0.3);
    expect(trackLevel(file, { a: 7 })).toBe(1);
    expect(trackLevel(file, { a: -1 })).toBe(0);
    expect(trackLevel(PRESET_MUSIC_TRACKS[0])).toBe(1);
  });

  it('a track level scales the playing track at once and shows in the state', async () => {
    vi.useFakeTimers();
    const player = new MusicPlayerEngine();
    player.setMasterVolume(0.5);
    const t = track('song', 0.8);
    await player.playTrack(t, { fadeInDuration: 0.3 });
    await Promise.resolve();
    vi.advanceTimersByTime(1000); // let the fade-in finish
    const audio = (player as unknown as { activeAudio(): FakeAudio | null }).activeAudio();
    expect(audio?.volume).toBeCloseTo(0.4); // track default 0.8 x master 0.5
    player.setTrackVolume('song', 0.4);
    expect(player.getState().trackVolumes).toEqual({ song: 0.4 });
    expect(audio?.volume).toBeCloseTo(0.2);

    // Another track's level does not touch the one playing.
    player.setTrackVolume('other', 0.1);
    expect(audio?.volume).toBeCloseTo(0.2);
  });

  it('saved track levels load back, and older saves have none', () => {
    expect(loadMusicStateFromStorage().trackVolumes).toEqual({});
    saveMusicStateToStorage({ ...DEFAULT_MUSIC_STATE, trackVolumes: { a: 0.25 } });
    expect(loadMusicStateFromStorage().trackVolumes).toEqual({ a: 0.25 });
    const player = new MusicPlayerEngine();
    hydratePlayerFromStorage(player);
    expect(player.getState().trackVolumes).toEqual({ a: 0.25 });
  });

  it('a level change is not mistaken for a progress-only update', () => {
    const a = { ...DEFAULT_MUSIC_STATE, trackVolumes: { x: 0.5 } };
    expect(differsOnlyInProgress(a, { ...a, currentTime: 9 })).toBe(true);
    expect(differsOnlyInProgress(a, { ...a, trackVolumes: { x: 0.6 } })).toBe(false);
  });

  it('the remote sets a track level on the stage player, which saves it', async () => {
    const stagePlayer = new MusicPlayerEngine();
    const library = [track('ambient')];
    stopHost = startMusicHost(stagePlayer, { getTracks: () => library, reloadTracks: async () => library });

    const remote = renderHook(() => useRemoteMusic());
    await flushChannel();

    act(() => remote.result.current.remote.setTrackVolume('ambient', 0.35));
    await flushChannel();
    expect(stagePlayer.getState().trackVolumes).toEqual({ ambient: 0.35 });
    expect(remote.result.current.musicState.trackVolumes).toEqual({ ambient: 0.35 });
    expect(loadMusicStateFromStorage().trackVolumes).toEqual({ ambient: 0.35 });
    remote.unmount();
  });
});

describe('per-effect sound volume', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => audioEngine.setEffectVolumes(DEFAULT_TIMER_SOUND_SETTINGS));

  it('defaults keep the levels the effects had before', () => {
    expect(loadTimerSoundSettings()).toEqual(DEFAULT_TIMER_SOUND_SETTINGS);
    expect(DEFAULT_TIMER_SOUND_SETTINGS).toMatchObject({
      warningVolume: 0.6, spinTickVolume: 0.6, finishVolume: 1, spinStartVolume: 1, wordLockVolume: 1, revealVolume: 1
    });
  });

  it('older settings: warning and spin tick start from the tick level they used to follow', () => {
    const s = normalizeTimerSoundSettings({ tickSoundEnabled: true, warningSoundEnabled: true, finishSoundEnabled: false, tickVolume: 0.3 });
    expect(s).toMatchObject({ tickVolume: 0.3, warningVolume: 0.3, spinTickVolume: 0.3, finishVolume: 1, finishSoundEnabled: false });
  });

  it('levels are clamped and bad values fall back', () => {
    const s = normalizeTimerSoundSettings({ revealVolume: 3, wordLockVolume: -2, finishVolume: 'loud', spinStartVolume: NaN });
    expect(s).toMatchObject({ revealVolume: 1, wordLockVolume: 0, finishVolume: 1, spinStartVolume: 1 });
  });

  it('saved levels load back', () => {
    saveTimerSoundSettings({ ...DEFAULT_TIMER_SOUND_SETTINGS, wordLockVolume: 0.45, warningVolume: 0.9 });
    expect(loadTimerSoundSettings()).toMatchObject({ wordLockVolume: 0.45, warningVolume: 0.9 });
  });

  it('the audio engine takes only the effect levels, clamped', () => {
    audioEngine.setEffectVolumes({ revealVolume: 0.25, finishVolume: 5 });
    expect(audioEngine.getEffectVolume('revealVolume')).toBe(0.25);
    expect(audioEngine.getEffectVolume('finishVolume')).toBe(1);
    expect(audioEngine.getEffectVolume('spinStartVolume')).toBe(1);
    expect(() => {
      audioEngine.playQuestionReveal();
      audioEngine.playTimerFinish();
      audioEngine.playTickSound(3);
    }).not.toThrow();
  });
});
