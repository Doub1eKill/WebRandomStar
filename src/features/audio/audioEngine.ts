/**
 * Procedural Web Audio API sound generator for "Royal Word Spin & Luxury Pageant Stage"
 * Generates procedural audio synthesis (Spin Whoosh, Spin Ticks, Word Lock Chime, Question Reveal, Ambient & Timer Chimes)
 * without relying on external MP3 files. Works 100% offline.
 */
import * as recipes from './recipes.ts';
import { getSharedAudioContext } from './audioContext.ts';
class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private volume: number = 0.8;
  private muted: boolean = false;
  private tickSoundEnabled: boolean = true;
  private warningSoundEnabled: boolean = true;
  private finishSoundEnabled: boolean = true;
  private spinSoundEnabled: boolean = true;
  private tickVolume: number = 0.6;

  public init(): void {
    if (this.ctx) return;
    try {
      // PF9: share the page's single AudioContext with the music player
      this.ctx = getSharedAudioContext();
      if (!this.ctx) return;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  private ensureContext(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return !!(this.ctx && this.masterGain);
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.ctx && this.masterGain) {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
      } catch {
        // ignore
      }
    }
    if (this.muted && this.rainGain && this.ctx) {
      try {
        this.rainGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch {
        // ignore
      }
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setTickSoundEnabled(enabled: boolean): void {
    this.tickSoundEnabled = enabled;
  }

  public isTickSoundEnabled(): boolean {
    return this.tickSoundEnabled;
  }

  public setWarningSoundEnabled(enabled: boolean): void {
    this.warningSoundEnabled = enabled;
  }

  public isWarningSoundEnabled(): boolean {
    return this.warningSoundEnabled;
  }

  public setFinishSoundEnabled(enabled: boolean): void {
    this.finishSoundEnabled = enabled;
  }

  public isFinishSoundEnabled(): boolean {
    return this.finishSoundEnabled;
  }

  public setSpinSoundEnabled(enabled: boolean): void {
    this.spinSoundEnabled = enabled;
  }

  public isSpinSoundEnabled(): boolean {
    return this.spinSoundEnabled;
  }

  public setTickVolume(vol: number): void {
    this.tickVolume = Math.max(0, Math.min(1, vol));
  }

  public getTickVolume(): number {
    return this.tickVolume;
  }

  private recipeSettings(): recipes.RecipeSettings {
    return { tickVolume: this.tickVolume };
  }

  /**
   * Royal Spin Start: Whoosh + Rising harmonic build-up
   */
  public playSpinStart(): void {
    if (this.muted || !this.spinSoundEnabled) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playSpinStart(this.ctx, this.masterGain);
  }

  /**
   * Word Spin Tick: Crisp crystal tick, modulated by speed ratio (0 = slow/deep, 1 = fast/bright)
   */
  public playSpinTick(speedRatio: number = 1): void {
    if (this.muted || !this.spinSoundEnabled) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playSpinTick(this.ctx, this.masterGain, this.recipeSettings(), speedRatio);
  }

  /**
   * Word Lock Chime: Climax sound with sparkling polyphonic major triad + soft bass pulse
   */
  public playWordLock(): void {
    if (this.muted || !this.spinSoundEnabled) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playWordLock(this.ctx, this.masterGain);
  }

  /**
   * Continuous pink noise rain generator with low-pass filtering
   */
  public playRainAmbience(fadeDuration: number = 1.5): void {
    if (this.muted) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    if (this.rainNode) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.rainGain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + fadeDuration);

    whiteNoise.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);

    whiteNoise.start();
    this.rainNode = whiteNoise;
  }

  /**
   * Fade out and stop rain sound
   */
  public fadeRainOut(fadeDuration: number = 2.0): void {
    if (!this.ctx || !this.rainGain) return;
    const now = this.ctx.currentTime;
    this.rainGain.gain.setValueAtTime(this.rainGain.gain.value, now);
    this.rainGain.gain.linearRampToValueAtTime(0, now + fadeDuration);

    const oldNode = this.rainNode;
    setTimeout(() => {
      try {
        (oldNode as AudioBufferSourceNode)?.stop();
        (oldNode as AudioBufferSourceNode)?.disconnect();
      } catch {
        // ignore
      }
    }, fadeDuration * 1000 + 100);

    this.rainNode = null;
    this.rainGain = null;
  }

  /**
   * Crisp water droplet "plop" with pitch envelope
   */
  public playWaterDrop(): void {
    if (this.muted) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playWaterDrop(this.ctx, this.masterGain);
  }

  /**
   * Soft chilly winter wind gust
   */
  public playWindGust(): void {
    if (this.muted) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playWindGust(this.ctx, this.masterGain);
  }

  /**
   * Autumn leaf rustle
   */
  public playLeafRustle(): void {
    if (this.muted) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playLeafRustle(this.ctx, this.masterGain);
  }

  /**
   * Sky Transition ambient harmonic pad
   */
  public playSkyTransition(): void {
    if (this.muted) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playSkyTransition(this.ctx, this.masterGain);
  }

  /**
   * Majestic question reveal ethereal harmonic chord
   */
  public playQuestionReveal(): void {
    if (this.muted) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playQuestionReveal(this.ctx, this.masterGain);
  }

  /**
   * Timer Warning Cue (plays subtle gentle dual chime at ≤30s)
   */
  public playTimerWarning(): void {
    if (!this.warningSoundEnabled || this.muted) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playTimerWarning(this.ctx, this.masterGain);
  }

  /**
   * Timer Finish Sound (Plays decisive royal harmonic gong)
   */
  public playTimerFinish(): void {
    if (!this.finishSoundEnabled || this.muted) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playTimerFinish(this.ctx, this.masterGain);
  }

  /**
   * Procedural tick sound for timer countdown (Luxury Crystal Chronometer).
   */
  public playTickSound(remainingSeconds: number): void {
    if (this.muted) return;

    if (remainingSeconds <= 0) {
      if (this.finishSoundEnabled) {
        this.playTimerFinish();
      }
      return;
    }

    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const baseVol = this.tickVolume;

    if (remainingSeconds <= 3) {
      // Last 3s: Melodic Royal Countdown Bells (3s = G5, 2s = A5, 1s = C6)
      if (this.warningSoundEnabled) {
        const bellFreqs: Record<number, number> = {
          3: 783.99, // G5
          2: 880.00, // A5
          1: 1046.50 // C6
        };
        const freq = bellFreqs[remainingSeconds] || 1046.50;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const peakGain = Math.min(1, baseVol * 0.28);
        gain.gain.setValueAtTime(peakGain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.25);
        return;
      }
      if (!this.tickSoundEnabled) return;
    } else if (remainingSeconds <= 10) {
      // Critical (10s to 4s): Warm crystal tick (sine wave, non-intrusive)
      if (this.warningSoundEnabled) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(720, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.045);

        const tickGain = Math.min(1, baseVol * 0.16);
        gain.gain.setValueAtTime(tickGain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.055);
        return;
      }
      if (!this.tickSoundEnabled) return;
    } else {
      if (!this.tickSoundEnabled) return;
    }

    // Normal soft crystal chronometer tick
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

    const tickGain = Math.min(1, baseVol * 0.12);
    gain.gain.setValueAtTime(tickGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }
}

export const audioEngine = new ProceduralAudioEngine();
