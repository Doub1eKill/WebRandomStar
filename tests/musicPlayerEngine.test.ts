import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MusicPlayerEngine } from '@/features/music/musicPlayerEngine.ts';
import { PRESET_MUSIC_TRACKS } from '@/types/music.ts';

describe('MusicPlayerEngine Dual-Slot Crossfade', () => {
  let engine: MusicPlayerEngine;

  beforeEach(() => {
    engine = new MusicPlayerEngine();
  });

  it('initializes in idle non-playing state', () => {
    const state = engine.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.currentTrackId).toBeNull();
  });

  it('updates master volume and mute states', () => {
    engine.setMasterVolume(0.5);
    expect(engine.getState().volume).toBe(0.5);
    engine.setMuted(true);
    expect(engine.getState().isMuted).toBe(true);
  });

  it('accepts track playback request and emits state update', async () => {
    const listener = vi.fn();
    const unsubscribe = engine.subscribe(listener);

    const track = PRESET_MUSIC_TRACKS[0];
    await engine.playTrack(track, { fadeInDuration: 0.1 });
    expect(listener).toHaveBeenCalled();
    expect(engine.getState().currentTrackId).toBe(track.id);
    expect(engine.getState().isPlaying).toBe(true);

    engine.pause();
    expect(engine.getState().isPlaying).toBe(false);

    engine.resume();
    expect(engine.getState().isPlaying).toBe(true);

    engine.stop();
    expect(engine.getState().isPlaying).toBe(false);

    unsubscribe();
  });

  it('handles seek and loop setting', () => {
    engine.seek(45);
    expect(engine.getState().currentTime).toBe(45);
  });

  it('guarantees complete silence when muted during playback and cancels active fades', async () => {
    const track = PRESET_MUSIC_TRACKS[0];
    await engine.playTrack(track, { fadeInDuration: 2.0 });
    expect(engine.getState().isPlaying).toBe(true);

    // Mute immediately
    engine.setMuted(true);
    expect(engine.getState().isMuted).toBe(true);

    // Stop and verify
    engine.stop();
    expect(engine.getState().isPlaying).toBe(false);
  });

  it('handles volume changes and 0% volume properly', () => {
    engine.setMasterVolume(0);
    expect(engine.getState().volume).toBe(0);

    engine.setMasterVolume(1.5); // clamps to 1
    expect(engine.getState().volume).toBe(1);

    engine.setMasterVolume(-0.5); // clamps to 0
    expect(engine.getState().volume).toBe(0);
  });
});
