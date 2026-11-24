import { MusicTrack, MusicState, DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS } from '../types/music.ts';

const DB_NAME = 'RandomizeQuiz_MusicDB';
const DB_VERSION = 1;
const TRACK_STORE = 'tracks';
const MUSIC_STATE_STORAGE_KEY = 'stage_quiz_music_state_v1';
const FALLBACK_TRACKS_KEY = 'stage_quiz_music_fallback_tracks_v1';

// In-memory fallback if IndexedDB is unavailable
let inMemoryTracks: MusicTrack[] = [...PRESET_MUSIC_TRACKS];

/**
 * B2 / S8: object URLs (`blob:…`) only live as long as the page. They are never written to
 * storage; instead each track's URL is created once per page from its stored Blob and reused
 * on every later load, then revoked when the track is deleted or the library is reset.
 */
const runtimeUrls = new Map<string, string>();

function isBlobUrl(url?: string): url is string {
  return typeof url === 'string' && url.startsWith('blob:');
}

function urlForBlob(id: string, blob: Blob): string | undefined {
  const existing = runtimeUrls.get(id);
  if (existing) return existing;
  try {
    const url = URL.createObjectURL(blob);
    runtimeUrls.set(id, url);
    return url;
  } catch {
    return undefined;
  }
}

function adoptRuntimeUrl(id: string, url: string): void {
  const existing = runtimeUrls.get(id);
  if (existing && existing !== url) {
    try { URL.revokeObjectURL(existing); } catch { /* ignore */ }
  }
  runtimeUrls.set(id, url);
}

function forgetRuntimeUrl(id: string): void {
  const url = runtimeUrls.get(id);
  if (url) {
    try { URL.revokeObjectURL(url); } catch { /* ignore */ }
    runtimeUrls.delete(id);
  }
}

/** Drop page-scoped blob URLs before persisting. */
function toPersisted<T extends { url?: string }>(track: T): T {
  if (!isBlobUrl(track.url)) return track;
  const { url: _url, ...rest } = track;
  return rest as T;
}

/** Give a loaded track a URL that works in this page (or none if its audio data is gone). */
function hydrate(track: MusicTrack): MusicTrack {
  if (track.blob) {
    return { ...track, url: urlForBlob(track.id, track.blob) };
  }
  const live = runtimeUrls.get(track.id);
  if (live) return { ...track, url: live };
  return isBlobUrl(track.url) ? toPersisted(track) : track;
}

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
          const custom = parsed.filter(t => !PRESET_MUSIC_TRACKS.some(p => p.id === t.id)).map(hydrate);
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

        // B2: always derive the URL from the stored Blob; a stored blob: URL is from a dead page.
        const hydrated = savedTracks.map(hydrate);

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

  if (trackToSave.blob && typeof URL !== 'undefined') {
    if (isBlobUrl(trackToSave.url)) {
      // The caller already made a URL for this blob (e.g. to read the duration): reuse it.
      adoptRuntimeUrl(trackToSave.id, trackToSave.url);
    } else if (!trackToSave.url) {
      if (fileBlob) forgetRuntimeUrl(trackToSave.id); // new audio data replaces the old URL
      trackToSave.url = urlForBlob(trackToSave.id, trackToSave.blob);
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
      const serializable = inMemoryTracks.map(({ blob: _blob, ...rest }) => toPersisted(rest));
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
      const req = store.put(toPersisted(trackToSave));

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
  if (isBlobUrl(existingTrack?.url) && existingTrack.url !== runtimeUrls.get(id) && typeof URL !== 'undefined') {
    try {
      URL.revokeObjectURL(existingTrack.url);
    } catch {
      // ignore
    }
  }
  forgetRuntimeUrl(id);

  inMemoryTracks = inMemoryTracks.filter(t => t.id !== id);

  try {
    if (typeof localStorage !== 'undefined') {
      const serializable = inMemoryTracks.map(({ blob: _blob, ...rest }) => toPersisted(rest));
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
  Array.from(runtimeUrls.keys()).forEach(forgetRuntimeUrl);

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
