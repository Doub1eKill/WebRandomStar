import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveTrackToStorage,
  getAllTracksFromStorage,
  deleteTrackFromStorage,
  saveMusicStateToStorage,
  loadMusicStateFromStorage
} from '@/features/music/musicStorage.ts';
import { MusicTrack, DEFAULT_MUSIC_STATE } from '@/types/music.ts';

describe('IndexedDB & LocalStorage Music Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads music state preferences in localStorage', () => {
    const customState = { ...DEFAULT_MUSIC_STATE, volume: 0.45, isMuted: true };
    saveMusicStateToStorage(customState);
    const loaded = loadMusicStateFromStorage();
    expect(loaded.volume).toBe(0.45);
    expect(loaded.isMuted).toBe(true);
  });

  it('saves and retrieves custom tracks', async () => {
    const newTrack: MusicTrack = {
      id: 'custom-1',
      title: 'My Custom Song',
      artist: 'Local Artist',
      sourceType: 'url',
      url: 'https://example.com/song.mp3',
      duration: 150,
      defaultVolume: 0.8,
      loop: true,
      createdAt: Date.now()
    };

    await saveTrackToStorage(newTrack);
    const all = await getAllTracksFromStorage();
    expect(all.some(t => t.id === 'custom-1')).toBe(true);

    await deleteTrackFromStorage('custom-1');
    const afterDelete = await getAllTracksFromStorage();
    expect(afterDelete.some(t => t.id === 'custom-1')).toBe(false);
  });

  it('unassigns phase when the assigned custom track is deleted', async () => {
    const customTrack: MusicTrack = {
      id: 'custom-spin-123',
      title: 'Custom Tension Spin',
      sourceType: 'local_blob',
      duration: 60,
      defaultVolume: 0.8,
      loop: true,
      targetPhase: 'spin',
      createdAt: Date.now()
    };
    await saveTrackToStorage(customTrack);
    const state = loadMusicStateFromStorage();
    state.phaseTrackMapping.spin = 'custom-spin-123';
    saveMusicStateToStorage(state);

    await deleteTrackFromStorage('custom-spin-123');
    const updatedState = loadMusicStateFromStorage();
    expect(updatedState.phaseTrackMapping.spin).not.toBe('custom-spin-123');
  });

  it('revokes Blob Object URL when custom track is deleted', async () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    const blobTrack: MusicTrack = {
      id: 'custom-blob-to-delete',
      title: 'Custom Spin Track',
      sourceType: 'local_blob',
      url: 'blob:http://localhost:5173/sample-uuid',
      duration: 30,
      defaultVolume: 0.8,
      loop: false,
      createdAt: Date.now()
    };

    await saveTrackToStorage(blobTrack);
    await deleteTrackFromStorage('custom-blob-to-delete');

    expect(revokeSpy).toHaveBeenCalledWith('blob:http://localhost:5173/sample-uuid');
    revokeSpy.mockRestore();
  });
});

