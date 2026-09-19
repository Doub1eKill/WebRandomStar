import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveTrackToStorage,
  getAllTracksFromStorage,
  deleteTrackFromStorage,
  saveMusicStateToStorage,
  loadMusicStateFromStorage
} from '../src/storage/musicStorage.ts';
import { MusicTrack, DEFAULT_MUSIC_STATE } from '../src/types/music.ts';

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
});
