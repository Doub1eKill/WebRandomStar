import { MusicTrack, MusicState, DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS } from '../types/music.ts';

const DB_NAME = 'RandomizeQuiz_MusicDB';
const DB_VERSION = 1;
const TRACK_STORE = 'tracks';
const MUSIC_STATE_STORAGE_KEY = 'stage_quiz_music_state_v1';
const FALLBACK_TRACKS_KEY = 'stage_quiz_music_fallback_tracks_v1';

// In-memory fallback if IndexedDB is unavailable
let inMemoryTracks: MusicTrack[] = [...PRESET_MUSIC_TRACKS];

function hasIndexedDB(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
}

export function openMusicDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDB()) {
      return reject(new Error('IndexedDB not available'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TRACK_STORE)) {
        db.createObjectStore(TRACK_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load saved music state (volume, mute, autoSync, phase mapping) from LocalStorage
 */
export function loadMusicStateFromStorage(): MusicState {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_MUSIC_STATE;
    const raw = localStorage.getItem(MUSIC_STATE_STORAGE_KEY);
    if (!raw) return DEFAULT_MUSIC_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_MUSIC_STATE,
      ...parsed,
      phaseTrackMapping: {
        ...DEFAULT_MUSIC_STATE.phaseTrackMapping,
        ...(parsed.phaseTrackMapping || {})
      }
    };
  } catch {
    return DEFAULT_MUSIC_STATE;
  }
}

/**
 * Save music state preferences to LocalStorage
 */
export function saveMusicStateToStorage(state: MusicState): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(MUSIC_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota or unavailable
  }
}

/**
 * Get all tracks from IndexedDB or Fallback
 */
export async function getAllTracksFromStorage(): Promise<MusicTrack[]> {
  if (!hasIndexedDB()) {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(FALLBACK_TRACKS_KEY);
        if (raw) {
          const parsed: MusicTrack[] = JSON.parse(raw);
          // Merge presets and custom tracks without duplicates
          const custom = parsed.filter(t => !PRESET_MUSIC_TRACKS.some(p => p.id === t.id));
          return [...PRESET_MUSIC_TRACKS, ...custom];
        }
      }
    } catch {
      // ignore
    }
    return inMemoryTracks;
  }

  try {
    const db = await openMusicDB();
    return new Promise((resolve) => {
      const tx = db.transaction(TRACK_STORE, 'readonly');
      const store = tx.objectStore(TRACK_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const savedTracks: MusicTrack[] = req.result || [];
        
        // Hydrate Blob Object URLs if blob exists
        const hydrated = savedTracks.map(t => {
          if (t.blob && !t.url) {
            try {
              t.url = URL.createObjectURL(t.blob);
            } catch {
              // ignore
            }
          }
          return t;
        });

        // Ensure all presets exist
        const customTracks = hydrated.filter(t => !PRESET_MUSIC_TRACKS.some(p => p.id === t.id));
        resolve([...PRESET_MUSIC_TRACKS, ...customTracks]);
      };

      req.onerror = () => {
        resolve(PRESET_MUSIC_TRACKS);
      };
    });
  } catch {
    return inMemoryTracks;
  }
}

/**
 * Save or update a track in IndexedDB
 */
export async function saveTrackToStorage(track: MusicTrack, fileBlob?: Blob): Promise<MusicTrack> {
  const trackToSave: MusicTrack = {
    ...track,
    blob: fileBlob || track.blob
  };

  if (trackToSave.blob && typeof URL !== 'undefined' && !trackToSave.url) {
    try {
      trackToSave.url = URL.createObjectURL(trackToSave.blob);
    } catch {
      // ignore
    }
  }

  // Update in-memory fallback
  const idx = inMemoryTracks.findIndex(t => t.id === track.id);
  if (idx >= 0) {
    inMemoryTracks[idx] = trackToSave;
  } else {
    inMemoryTracks.push(trackToSave);
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const serializable = inMemoryTracks.map(({ blob: _blob, ...rest }) => rest);
      localStorage.setItem(FALLBACK_TRACKS_KEY, JSON.stringify(serializable));
    }
  } catch {
    // ignore
  }

  if (!hasIndexedDB()) {
    return trackToSave;
  }

  try {
    const db = await openMusicDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(TRACK_STORE, 'readwrite');
      const store = tx.objectStore(TRACK_STORE);
      const req = store.put(trackToSave);

      req.onsuccess = () => resolve(trackToSave);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return trackToSave;
  }
}

/**
 * Delete a track from storage
 */
export async function deleteTrackFromStorage(id: string): Promise<void> {
  const existingTrack = inMemoryTracks.find(t => t.id === id);
  if (existingTrack?.url && typeof URL !== 'undefined' && existingTrack.url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(existingTrack.url);
    } catch {
      // ignore
    }
  }

  inMemoryTracks = inMemoryTracks.filter(t => t.id !== id);

  try {
    if (typeof localStorage !== 'undefined') {
      const serializable = inMemoryTracks.map(({ blob: _blob, ...rest }) => rest);
      localStorage.setItem(FALLBACK_TRACKS_KEY, JSON.stringify(serializable));

      // Clean up any phase mappings pointing to this track
      const musicState = loadMusicStateFromStorage();
      let stateModified = false;
      const newMapping = { ...musicState.phaseTrackMapping };
      (Object.keys(newMapping) as Array<keyof typeof newMapping>).forEach(phase => {
        if (newMapping[phase] === id) {
          // If a preset exists for this phase, fallback to it, else null
          const defaultPreset = DEFAULT_MUSIC_STATE.phaseTrackMapping[phase];
          newMapping[phase] = defaultPreset !== id ? defaultPreset : null;
          stateModified = true;
        }
      });
      if (stateModified) {
        saveMusicStateToStorage({
          ...musicState,
          phaseTrackMapping: newMapping
        });
      }
    }
  } catch {
    // ignore
  }

  if (!hasIndexedDB()) {
    return;
  }

  try {
    const db = await openMusicDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(TRACK_STORE, 'readwrite');
      const store = tx.objectStore(TRACK_STORE);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}

/**
 * Reset track library to default presets
 */
export async function resetTracksToDefault(): Promise<MusicTrack[]> {
  inMemoryTracks.forEach(t => {
    if (t.url && typeof URL !== 'undefined' && t.url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(t.url);
      } catch {
        // ignore
      }
    }
  });

  inMemoryTracks = [...PRESET_MUSIC_TRACKS];

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(FALLBACK_TRACKS_KEY);
    }
  } catch {
    // ignore
  }

  if (hasIndexedDB()) {
    try {
      const db = await openMusicDB();
      const tx = db.transaction(TRACK_STORE, 'readwrite');
      const store = tx.objectStore(TRACK_STORE);
      store.clear();
    } catch {
      // ignore
    }
  }

  return [...PRESET_MUSIC_TRACKS];
}
