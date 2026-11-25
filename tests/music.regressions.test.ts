/**
 * Regression tests for music bugs B2–B6. Phase 0 confirmed each bug with an assertion on the
 * broken behaviour; Phase 2 fixed them and these tests now assert the correct behaviour.
 */
import 'fake-indexeddb/auto';
import { Blob as NodeBlob } from 'node:buffer';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MusicPlayerEngine } from '@/features/music/musicPlayerEngine.ts';
import { MusicTrack } from '@/types/music.ts';

/** Minimal HTMLAudioElement stand-in: tracks paused state, volume and listeners. */
class FakeAudio {
  static instances: FakeAudio[] = [];
  src = '';
  currentTime = 0;
  duration = 0;
  loop = false;
  muted = false;
  volume = 1;
  preload = '';
  paused = true;
  private listeners: Record<string, Array<() => void>> = {};
  constructor() { FakeAudio.instances.push(this); }
  addEventListener(type: string, fn: () => void) { (this.listeners[type] ||= []).push(fn); }
  dispatch(type: string) { (this.listeners[type] || []).forEach(fn => fn()); }
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
}

const track = (id: string, defaultVolume = 1): MusicTrack => ({
  id,
  title: id,
  sourceType: 'url',
  url: `https://example.test/${id}.mp3`,
  duration: 120,
  defaultVolume,
  loop: true,
  createdAt: 0
});

const flushMicrotasks = async () => { for (let i = 0; i < 3; i++) await Promise.resolve(); };
const playing = () => FakeAudio.instances.filter(a => !a.paused);

describe('musicPlayerEngine', () => {
  beforeEach(() => {
    FakeAudio.instances = [];
    vi.stubGlobal('Audio', FakeAudio);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('B3: setMuted() during a crossfade no longer leaves the old track playing', async () => {
    const player = new MusicPlayerEngine();
    const [slotA, slotB] = FakeAudio.instances;

    await player.playTrack(track('ambient'), { fadeInDuration: 1 }); // slot B
    await flushMicrotasks();
    vi.advanceTimersByTime(1500);

    await player.playTrack(track('spin'), { fadeInDuration: 1 });    // ambient out of B, spin into A
    await flushMicrotasks();
    vi.advanceTimersByTime(300);

    player.setMuted(false); // what the stage did on every snapshot from another window
    vi.advanceTimersByTime(3000);

    expect(slotA.src).toContain('spin');
    expect(slotA.paused).toBe(false);
    expect(slotA.volume).toBeCloseTo(0.75); // fade-in still completed
    expect(slotB.paused).toBe(true);        // outgoing track finished fading and stopped
  });

  it('B3: three quick track changes end with exactly one slot playing', async () => {
    const player = new MusicPlayerEngine();
    for (const id of ['ambient', 'spin', 'question']) {
      await player.playTrack(track(id), { fadeInDuration: 1 });
      await flushMicrotasks();
      vi.advanceTimersByTime(200);
    }
    vi.advanceTimersByTime(3000);
    expect(playing()).toHaveLength(1);
    expect(playing()[0].src).toContain('question');
  });

  it('B4: replaying the track that is already playing does not interrupt its fade-in', async () => {
    const player = new MusicPlayerEngine();
    const slotB = FakeAudio.instances[1];

    await player.playTrack(track('ambient'), { fadeInDuration: 1 });
    await flushMicrotasks();
    vi.advanceTimersByTime(200);

    await player.playTrack(track('ambient'));
    vi.advanceTimersByTime(3000);

    expect(slotB.paused).toBe(false);
    expect(slotB.volume).toBeCloseTo(0.75);
  });

  it('B5: an error on the idle slot does not start the simulated clock', async () => {
    const player = new MusicPlayerEngine();
    const [slotA] = FakeAudio.instances;

    await player.playTrack(track('ambient'), { fadeInDuration: 0.1 }); // slot B is active
    await flushMicrotasks();
    slotA.dispatch('error');

    vi.advanceTimersByTime(2000);
    expect(player.getState().currentTime).toBe(0);
  });

  it('B5: an error on the playing slot still falls back to simulated playback', async () => {
    const player = new MusicPlayerEngine();
    const slotB = FakeAudio.instances[1];

    await player.playTrack(track('ambient'), { fadeInDuration: 0.1 });
    await flushMicrotasks();
    slotB.dispatch('error');

    vi.advanceTimersByTime(2000);
    expect(player.getState().currentTime).toBeGreaterThan(0);
  });

  it('B6: master volume changes keep the track default volume', async () => {
    const player = new MusicPlayerEngine();
    const slotB = FakeAudio.instances[1];

    await player.playTrack(track('quiet', 0.5), { fadeInDuration: 0.1 });
    await flushMicrotasks();
    vi.advanceTimersByTime(500);
    expect(slotB.volume).toBeCloseTo(0.375); // 0.5 × 0.75

    player.setMasterVolume(0.75);
    expect(slotB.volume).toBeCloseTo(0.375);
    player.setMasterVolume(0.5);
    expect(slotB.volume).toBeCloseTo(0.25);
    player.setMuted(true);
    expect(slotB.muted).toBe(true);
    player.setMuted(false);
    expect(slotB.volume).toBeCloseTo(0.25);
  });
});

describe('musicStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.resetModules();
  });

  const upload = (): MusicTrack => ({ ...track('custom-b2'), sourceType: 'local_blob', url: undefined });
  // fake-indexeddb clones with Node's structuredClone, which keeps Node Blobs but turns
  // happy-dom Blobs into plain objects. Browsers keep any Blob, so use Node's here.
  const audioBlob = () => new NodeBlob(['fake mp3 bytes'], { type: 'audio/mpeg' }) as unknown as Blob;

  it('B2: an uploaded track gets a fresh blob URL after a reload', async () => {
    vi.resetModules();
    const firstPage = await import('@/features/music/musicStorage.ts');
    const saved = await firstPage.saveTrackToStorage(upload(), audioBlob());
    const urlFromFirstPage = saved.url!;
    expect(urlFromFirstPage.startsWith('blob:')).toBe(true);

    // Simulate a page reload: blob URLs die with the page and module state starts fresh.
    URL.revokeObjectURL(urlFromFirstPage);
    vi.resetModules();
    const secondPage = await import('@/features/music/musicStorage.ts');
    const reloaded = (await secondPage.getAllTracksFromStorage()).find(t => t.id === 'custom-b2');

    expect(reloaded?.blob).toBeDefined();
    expect(reloaded?.url?.startsWith('blob:')).toBe(true);
    expect(reloaded?.url).not.toBe(urlFromFirstPage);
  });

  it('S8: loading the library repeatedly in one page reuses one URL per track', async () => {
    vi.resetModules();
    const storage = await import('@/features/music/musicStorage.ts');
    const create = vi.spyOn(URL, 'createObjectURL');
    await storage.saveTrackToStorage(upload(), audioBlob());
    const urls = new Set<string | undefined>();
    for (let i = 0; i < 3; i++) {
      urls.add((await storage.getAllTracksFromStorage()).find(t => t.id === 'custom-b2')?.url);
    }
    expect(urls.size).toBe(1);
    expect(create).toHaveBeenCalledTimes(1);
    create.mockRestore();
  });

  it('B2: blob URLs are never written to the localStorage fallback', async () => {
    vi.resetModules();
    const storage = await import('@/features/music/musicStorage.ts');
    await storage.saveTrackToStorage(upload(), audioBlob());
    const fallback = localStorage.getItem('stage_quiz_music_fallback_tracks_v1') || '';
    expect(fallback).toContain('custom-b2');
    expect(fallback).not.toContain('blob:');
  });

  it('deleting a track revokes its URL', async () => {
    vi.resetModules();
    const storage = await import('@/features/music/musicStorage.ts');
    const saved = await storage.saveTrackToStorage(upload(), audioBlob());
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    await storage.deleteTrackFromStorage('custom-b2');
    expect(revoke).toHaveBeenCalledWith(saved.url);
    revoke.mockRestore();
  });

  it('B2 migration: records saved by the old version with a dead blob URL get a fresh one', async () => {
    vi.resetModules();
    const storage = await import('@/features/music/musicStorage.ts');
    const db = await storage.openMusicDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('tracks', 'readwrite');
      tx.objectStore('tracks').put({ ...upload(), id: 'legacy', url: 'blob:dead-from-old-page', blob: audioBlob() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    const legacy = (await storage.getAllTracksFromStorage()).find(t => t.id === 'legacy');
    expect(legacy?.url?.startsWith('blob:')).toBe(true);
    expect(legacy?.url).not.toBe('blob:dead-from-old-page');
  });
});
