import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startArpeggio, PRESET_PATTERNS } from '@/features/music/presetArpeggio.ts';
import { MusicPlayerEngine } from '@/features/music/musicPlayerEngine.ts';
import { resetSharedAudioContextForTests } from '@/features/audio/audioContext.ts';
import { PRESET_MUSIC_TRACKS } from '@/types/music.ts';

/**
 * Regression for the "stuck sound": preset tracks used to start one oscillator per phase that
 * held a single note and had no stop time. Every note must now be short and scheduled to stop.
 */

const param = () => ({ setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() });

interface FakeOsc {
  frequency: ReturnType<typeof param>;
  type: string;
  startAt: number | null;
  stopAt: number | null;
  onended: (() => void) | null;
  connect: () => void;
  start: (t: number) => void;
  stop: (t: number) => void;
}

class FakeAudioContext {
  static last: FakeAudioContext | null = null;
  readonly t0 = Date.now();
  state = 'running';
  destination = {};
  oscillators: FakeOsc[] = [];
  constructor() {
    FakeAudioContext.last = this;
  }
  get currentTime() {
    return (Date.now() - this.t0) / 1000;
  }
  resume() {
    return Promise.resolve();
  }
  createGain() {
    return { gain: param(), connect: vi.fn(), disconnect: vi.fn() };
  }
  createOscillator(): FakeOsc {
    const osc: FakeOsc = {
      frequency: param(),
      type: 'sine',
      startAt: null,
      stopAt: null,
      onended: null,
      connect: vi.fn(),
      start(t) { osc.startAt = t; },
      // like the real node: the earliest stop wins
      stop(t) { osc.stopAt = osc.stopAt === null ? t : Math.min(osc.stopAt, t); }
    };
    this.oscillators.push(osc);
    return osc;
  }
  /** Oscillators that would still be making sound at `time`. */
  soundingAt(time = this.currentTime) {
    return this.oscillators.filter(o => o.startAt !== null && (o.stopAt === null || o.stopAt > time));
  }
}

const frequencies = (ctx: FakeAudioContext) =>
  ctx.oscillators.map(o => o.frequency.setValueAtTime.mock.calls[0][0] as number);

beforeEach(() => {
  // never fake setImmediate: Node's BroadcastChannel (used elsewhere) needs it
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  resetSharedAudioContextForTests();
});

describe('startArpeggio', () => {
  it('plays several different short notes, each with a stop time', () => {
    const ctx = new FakeAudioContext();
    const handle = startArpeggio(ctx as unknown as AudioContext, {} as AudioNode, PRESET_PATTERNS['preset-question-focus'], () => 1);
    vi.advanceTimersByTime(3000);

    expect(ctx.oscillators.length).toBeGreaterThanOrEqual(5);
    expect(new Set(frequencies(ctx)).size).toBeGreaterThanOrEqual(3);
    for (const o of ctx.oscillators) {
      expect(o.stopAt).not.toBeNull();
      expect(o.stopAt! - o.startAt!).toBeLessThan(2);
    }
    handle.stop();
  });

  it('schedules nothing after stop and silences the notes already queued', () => {
    const ctx = new FakeAudioContext();
    const handle = startArpeggio(ctx as unknown as AudioContext, {} as AudioNode, PRESET_PATTERNS['preset-ambient-luxury'], () => 1);
    vi.advanceTimersByTime(1000);
    handle.stop();
    const count = ctx.oscillators.length;

    vi.advanceTimersByTime(5000);
    expect(ctx.oscillators.length).toBe(count);
    expect(ctx.soundingAt()).toHaveLength(0);
  });

  it('has a pattern for every built-in preset', () => {
    for (const track of PRESET_MUSIC_TRACKS) expect(PRESET_PATTERNS[track.id]).toBeDefined();
  });
});

describe('MusicPlayerEngine preset playback', () => {
  const setup = async (trackIndex = 0) => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    const engine = new MusicPlayerEngine();
    await engine.playTrack(PRESET_MUSIC_TRACKS[trackIndex], { fadeInDuration: 0.1 });
    return { engine, ctx: FakeAudioContext.last! };
  };

  it('never leaves an oscillator running after stop', async () => {
    const { engine, ctx } = await setup();
    vi.advanceTimersByTime(4000);
    expect(ctx.oscillators.length).toBeGreaterThan(3);

    engine.stop();
    vi.advanceTimersByTime(5000);
    expect(ctx.soundingAt()).toHaveLength(0);
  });

  it('stops scheduling notes while paused', async () => {
    const { engine, ctx } = await setup();
    vi.advanceTimersByTime(2000);
    engine.pause();
    const count = ctx.oscillators.length;
    vi.advanceTimersByTime(5000);
    expect(ctx.oscillators.length).toBe(count);
    engine.stop();
  });

  it('starts the arpeggio again on unmute while a preset is playing', async () => {
    const { engine, ctx } = await setup();
    engine.setMuted(true);
    vi.advanceTimersByTime(1000);
    const mutedCount = ctx.oscillators.length;
    vi.advanceTimersByTime(3000);
    expect(ctx.oscillators.length).toBe(mutedCount);

    engine.setMuted(false);
    vi.advanceTimersByTime(3000);
    expect(ctx.oscillators.length).toBeGreaterThan(mutedCount);
    engine.stop();
  });

  it('switching tracks stops the previous arpeggio', async () => {
    const { engine, ctx } = await setup(0);
    vi.advanceTimersByTime(2000);
    await engine.playTrack(PRESET_MUSIC_TRACKS[2], { fadeInDuration: 0.1 });
    vi.advanceTimersByTime(3000);

    const ambient = new Set(PRESET_PATTERNS[PRESET_MUSIC_TRACKS[0].id].notes);
    const lateNotes = ctx.oscillators.filter(o => o.startAt! > 2.5);
    expect(lateNotes.length).toBeGreaterThan(0);
    // only one arpeggio is sounding: no ambient-only notes keep being scheduled after the switch
    const ambientOnly = [...ambient].filter(f => !PRESET_PATTERNS[PRESET_MUSIC_TRACKS[2].id].notes.includes(f));
    expect(lateNotes.some(o => ambientOnly.includes(o.frequency.setValueAtTime.mock.calls[0][0]))).toBe(false);
    engine.stop();
  });
});
