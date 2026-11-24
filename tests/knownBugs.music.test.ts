/**
 * Phase 0: tests that confirm suspected music bugs (⚠️ items in the plan).
 * Each test asserts TODAY's broken behaviour so we know the bug is real.
 * Phase 2 fixes them and flips each assertion to the correct behaviour.
 */
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MusicPlayerEngine } from '../src/engine/musicPlayerEngine.ts';
import { MusicTrack } from '../src/types/music.ts';

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

const track = (id: string): MusicTrack => ({
  id,
  title: id,
  sourceType: 'url',
  url: `https://example.test/${id}.mp3`,
  duration: 120,
  defaultVolume: 1,
  loop: true,
  createdAt: 0
});

const flushMicrotasks = async () => { for (let i = 0; i < 3; i++) await Promise.resolve(); };

describe('musicPlayerEngine known bugs', () => {
  beforeEach(() => {
    FakeAudio.instances = [];
    vi.stubGlobal('Audio', FakeAudio);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('[known bug B3 → Phase 2] a fade cancelled mid-crossfade leaves the old track playing at full volume', async () => {
    const player = new MusicPlayerEngine();
    const [slotA, slotB] = FakeAudio.instances;

    await player.playTrack(track('ambient'), { fadeInDuration: 1 }); // lands in slot B
    await flushMicrotasks();
    vi.advanceTimersByTime(1500);

    await player.playTrack(track('spin'), { fadeInDuration: 1 });    // ambient fades out of B, spin into A
    await flushMicrotasks();
    vi.advanceTimersByTime(300);

    player.setMuted(false); // what useStageSync does on every snapshot from another window (B3 trigger test)
    vi.advanceTimersByTime(3000);

    expect(slotA.src).toContain('spin');
    expect(slotB.src).toContain('ambient');
    // Correct behaviour: only slot A plays. Today both play, and setMuted() also resets the
    // outgoing slot to the master volume (0.75), so the old track is fully audible again.
    expect(slotA.paused).toBe(false);
    expect(slotB.paused).toBe(false);
    expect(slotB.volume).toBe(0.75);
  });

  it('[known bug B4 → Phase 2] replaying the track that is already playing cancels its fade-in and leaves it quiet', async () => {
    const player = new MusicPlayerEngine();
    const slotB = FakeAudio.instances[1];

    await player.playTrack(track('ambient'), { fadeInDuration: 1 });
    await flushMicrotasks();
    vi.advanceTimersByTime(200); // fade-in partly done

    await player.playTrack(track('ambient')); // same id: early-returns AFTER cancelAllFades()
    vi.advanceTimersByTime(3000);

    expect(slotB.paused).toBe(false);
    expect(slotB.volume).toBeLessThan(0.75); // Phase 2: must reach the target volume (0.75)
  });

  it('[known bug B5 → Phase 2] an error on the inactive slot starts the simulated clock over real playback', async () => {
    const player = new MusicPlayerEngine();
    const [slotA] = FakeAudio.instances;

    await player.playTrack(track('ambient'), { fadeInDuration: 0.1 }); // slot B is active
    await flushMicrotasks();
    slotA.dispatch('error'); // idle slot, unrelated to what is playing

    vi.advanceTimersByTime(2000); // the real element reports no timeupdate in this window
    expect(player.getState().currentTime).toBeGreaterThan(0); // Phase 2: must stay 0
  });

  it('[known bug B6 → Phase 2] changing master volume ignores the track default volume', async () => {
    const player = new MusicPlayerEngine();
    const slotB = FakeAudio.instances[1];
    const quiet = { ...track('quiet'), defaultVolume: 0.5 };

    await player.playTrack(quiet, { fadeInDuration: 0.1 });
    await flushMicrotasks();
    vi.advanceTimersByTime(500);
    expect(slotB.volume).toBeCloseTo(0.375); // 0.5 × 0.75 after fade-in

    player.setMasterVolume(0.75);
    expect(slotB.volume).toBe(0.75); // Phase 2: must stay 0.375
  });
});

describe('musicStorage known bugs', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('[known bug B2 → Phase 2] an uploaded track reuses its dead blob URL after a reload', async () => {
    vi.resetModules();
    const firstPage = await import('../src/storage/musicStorage.ts');
    const upload: MusicTrack = { ...track('custom-b2'), sourceType: 'local_blob', url: undefined };
    const saved = await firstPage.saveTrackToStorage(upload, new Blob(['fake mp3 bytes'], { type: 'audio/mpeg' }));
    const urlFromFirstPage = saved.url!;
    expect(urlFromFirstPage.startsWith('blob:')).toBe(true);

    // Simulate a page reload: blob URLs die with the page and module state starts fresh.
    URL.revokeObjectURL(urlFromFirstPage);
    vi.resetModules();
    const secondPage = await import('../src/storage/musicStorage.ts');
    const reloaded = (await secondPage.getAllTracksFromStorage()).find(t => t.id === 'custom-b2');

    expect(reloaded?.blob).toBeDefined();               // the audio data itself survived
    expect(reloaded?.url).toBe(urlFromFirstPage);       // Phase 2: must be a NEW blob URL
  });
});
