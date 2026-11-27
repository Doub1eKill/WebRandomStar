/**
 * Procedural Web Audio API sound generator for "Royal Word Spin & Luxury Pageant Stage"
 * Generates procedural audio synthesis (Spin Whoosh, Spin Ticks, Word Lock Chime, Question Reveal, Ambient & Timer Chimes)
 * without relying on external MP3 files. Works 100% offline.
 */
import * as recipes from './recipes.ts';
import { getSharedAudioContext } from './audioContext.ts';
import { DEFAULT_TIMER_SOUND_SETTINGS, type EffectVolumeField, type TimerSoundSettings } from '@/types/timer.ts';

/** Effects whose fixed-level recipes go through their own gain bus (see bus()). */
type BusField = 'finishVolume' | 'spinStartVolume' | 'wordLockVolume' | 'revealVolume';
const EFFECT_FIELDS: EffectVolumeField[] = ['warningVolume', 'finishVolume', 'spinStartVolume', 'spinTickVolume', 'wordLockVolume', 'revealVolume'];

class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.8;
  private muted: boolean = false;
  private tickSoundEnabled: boolean = true;
  private warningSoundEnabled: boolean = true;
  private finishSoundEnabled: boolean = true;
  private spinSoundEnabled: boolean = true;
  private tickVolume: number = 0.6;
  /** Per-effect loudness (0-1), set from the timer sound settings. */
  private effectVolumes: Record<EffectVolumeField, number> = {
    warningVolume: DEFAULT_TIMER_SOUND_SETTINGS.warningVolume,
    finishVolume: DEFAULT_TIMER_SOUND_SETTINGS.finishVolume,
    spinStartVolume: DEFAULT_TIMER_SOUND_SETTINGS.spinStartVolume,
    spinTickVolume: DEFAULT_TIMER_SOUND_SETTINGS.spinTickVolume,
    wordLockVolume: DEFAULT_TIMER_SOUND_SETTINGS.wordLockVolume,
    revealVolume: DEFAULT_TIMER_SOUND_SETTINGS.revealVolume
  };
  private buses = new Map<BusField, GainNode>();

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

  /** Set any of the per-effect levels (other fields of the object are ignored). */
  public setEffectVolumes(volumes: Partial<Pick<TimerSoundSettings, EffectVolumeField>>): void {
    for (const field of EFFECT_FIELDS) {
      const v = volumes[field];
      if (typeof v !== 'number' || isNaN(v)) continue;
      this.effectVolumes[field] = Math.max(0, Math.min(1, v));
      const bus = this.buses.get(field as BusField);
      if (bus) bus.gain.value = this.effectVolumes[field];
    }
  }

  public getEffectVolume(field: EffectVolumeField): number {
    return this.effectVolumes[field];
  }

  /** The gain node one fixed-level effect plays into: its own level, then the master gain. */
  private bus(field: BusField, master: GainNode): GainNode {
    let bus = this.buses.get(field);
    if (!bus && this.ctx) {
      bus = this.ctx.createGain();
      bus.gain.value = this.effectVolumes[field];
      bus.connect(master);
      this.buses.set(field, bus);
    }
    return bus ?? master;
  }

  private recipeSettings(): recipes.RecipeSettings {
    // Spin ticks scale their own gain; they have their own level now instead of tickVolume.
    return { tickVolume: this.effectVolumes.spinTickVolume };
  }

  /**
   * Royal Spin Start: Whoosh + Rising harmonic build-up
   */
  public playSpinStart(): void {
    if (this.muted || !this.spinSoundEnabled) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playSpinStart(this.ctx, this.bus('spinStartVolume', this.masterGain));
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
    recipes.playWordLock(this.ctx, this.bus('wordLockVolume', this.masterGain));
  }

  /**
   * Majestic question reveal ethereal harmonic chord
   */
  public playQuestionReveal(): void {
    if (this.muted) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playQuestionReveal(this.ctx, this.bus('revealVolume', this.masterGain));
  }

  /**
   * Timer Finish Sound (Plays decisive royal harmonic gong)
   */
  public playTimerFinish(): void {
    if (!this.finishSoundEnabled || this.muted) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    recipes.playTimerFinish(this.ctx, this.bus('finishVolume', this.masterGain));
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
    // Warning ticks and bells have their own level (they used to follow tickVolume).
    const warnVol = this.effectVolumes.warningVolume;

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

        const peakGain = Math.min(1, warnVol * 0.28);
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

        const tickGain = Math.min(1, warnVol * 0.16);
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
