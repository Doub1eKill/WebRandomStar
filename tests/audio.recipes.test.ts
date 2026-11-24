/**
 * PF9: with a fake AudioContext every sound actually executes (the older audio tests run with
 * no AudioContext, so the sound bodies were never exercised), and both engines share one context.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

class FakeParam {
  value = 0;
  setValueAtTime() { return this; }
  linearRampToValueAtTime() { return this; }
  exponentialRampToValueAtTime() { return this; }
  setTargetAtTime() { return this; }
  cancelScheduledValues() { return this; }
}

class FakeNode {
  gain = new FakeParam();
  frequency = new FakeParam();
  Q = new FakeParam();
  type = '';
  buffer: unknown = null;
  loop = false;
  connect() { return this; }
  disconnect() {}
  start() {}
  stop() {}
}

let created = 0;
class FakeAudioContext {
  currentTime = 0;
  sampleRate = 8000;
  state = 'running';
  destination = new FakeNode();
  constructor() { created++; }
  createGain() { return new FakeNode(); }
  createOscillator() { return new FakeNode(); }
  createBiquadFilter() { return new FakeNode(); }
  createBufferSource() { return new FakeNode(); }
  createBuffer(_channels: number, length: number) {
    const data = new Float32Array(Math.ceil(length));
    return { getChannelData: () => data };
  }
  resume() { return Promise.resolve(); }
}

describe('PF9: audio recipes and the shared AudioContext', () => {
  beforeEach(() => {
    created = 0;
    vi.resetModules();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('Audio', class { addEventListener() {} });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('every sound runs end to end without throwing', async () => {
    const { audioEngine } = await import('@/features/audio/audioEngine.ts');
    audioEngine.setMuted(false);
    audioEngine.setSpinSoundEnabled(true);
    audioEngine.setTickSoundEnabled(true);
    audioEngine.setWarningSoundEnabled(true);
    audioEngine.setFinishSoundEnabled(true);

    expect(() => {
      audioEngine.playSpinStart();
      audioEngine.playSpinTick(0.4);
      audioEngine.playWordLock();
      audioEngine.playQuestionReveal();
      audioEngine.playTimerWarning();
      audioEngine.playTimerFinish();
      for (const s of [12, 10, 5, 3, 2, 1, 0]) audioEngine.playTickSound(s);
      audioEngine.playWaterDrop();
      audioEngine.playWindGust();
      audioEngine.playLeafRustle();
      audioEngine.playSkyTransition();
      audioEngine.playRainAmbience(0.1);
      audioEngine.fadeRainOut(0.1);
    }).not.toThrow();
  });

  it('the sound engine and the music player share one AudioContext', async () => {
    const { audioEngine } = await import('@/features/audio/audioEngine.ts');
    const { MusicPlayerEngine } = await import('@/features/music/musicPlayerEngine.ts');
    audioEngine.setMuted(false);
    audioEngine.playSpinStart();
    const player = new MusicPlayerEngine();
    await player.playTrack({ id: 'p', title: 'p', sourceType: 'preset', duration: 10, defaultVolume: 1, loop: true, createdAt: 0 });
    player.stop({ fadeOutDuration: 0 });
    expect(created).toBe(1);
  });
});
