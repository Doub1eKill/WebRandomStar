import { MusicTrack, MusicState, DEFAULT_MUSIC_STATE } from '@/types/music.ts';
import { getSharedAudioContext } from '@/features/audio/audioContext.ts';

export interface PlayOptions {
  fadeInDuration?: number; // seconds
  startTime?: number; // seconds
  loop?: boolean;
}

export interface StopOptions {
  fadeOutDuration?: number; // seconds
}

type MusicStateListener = (state: MusicState) => void;

/**
 * Dual-Slot Audio Player Engine with Web Audio API & HTML5 Audio
 * Provides smooth crossfading without audio clicks or sudden cutoffs.
 */
export class MusicPlayerEngine {
  private currentTrack: MusicTrack | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.75;
  private isMuted: boolean = false;
  private currentTime: number = 0;
  private duration: number = 0;
  private autoSyncWithStage: boolean = true;
  private phaseTrackMapping = { ...DEFAULT_MUSIC_STATE.phaseTrackMapping };

  private audioSlotA: HTMLAudioElement | null = null;
  private audioSlotB: HTMLAudioElement | null = null;
  private activeSlot: 'A' | 'B' = 'A';

  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private synthInterval: { osc: OscillatorNode; gain: GainNode } | null = null;
  private listeners: Set<MusicStateListener> = new Set();
  private timeUpdateInterval: ReturnType<typeof setInterval> | null = null;
  /** B3: one fade per slot, so cancelling can finish a fade-out instead of orphaning it. */
  private fades = new Map<HTMLAudioElement, { timer: ReturnType<typeof setInterval>; kind: 'in' | 'out' }>();

  constructor() {
    this.initAudioElements();
  }

  private activeAudio(): HTMLAudioElement | null {
    return this.activeSlot === 'A' ? this.audioSlotA : this.audioSlotB;
  }

  /** B6: the single source of truth for how loud the current track should be. */
  private targetVolume(): number {
    if (this.isMuted) return 0;
    return Math.min(1, Math.max(0, (this.currentTrack?.defaultVolume ?? 1) * this.volume));
  }

  /**
   * Stop the fade running on `audio`. A cancelled fade-out is completed immediately (the slot
   * is paused) so an outgoing track can never keep playing on its own (B3).
   */
  private cancelFade(audio: HTMLAudioElement): void {
    const fade = this.fades.get(audio);
    if (!fade) return;
    clearInterval(fade.timer);
    this.fades.delete(audio);
    if (fade.kind === 'out') {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // ignore
      }
    }
  }

  private cancelAllFades(): void {
    Array.from(this.fades.keys()).forEach(audio => this.cancelFade(audio));
  }

  private initAudioElements(): void {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return;

    try {
      this.audioSlotA = new Audio();
      this.audioSlotB = new Audio();
      this.audioSlotA.preload = 'auto';
      this.audioSlotB.preload = 'auto';

      const attachEvents = (audio: HTMLAudioElement) => {
        audio.addEventListener('timeupdate', () => {
          if (this.isPlaying) {
            this.currentTime = audio.currentTime || 0;
            this.duration = audio.duration || this.currentTrack?.duration || 0;
            this.notifyState();
          }
        });

        audio.addEventListener('ended', () => {
          if (!this.currentTrack?.loop) {
            this.isPlaying = false;
            this.notifyState();
          }
        });

        audio.addEventListener('error', () => {
          // B5: only the slot that is actually playing may fall back to simulated playback;
          // an error on the idle slot says nothing about what the audience hears.
          if (audio !== this.activeAudio() || !this.isPlaying) return;
          // Fallback to simulated playback on decode error
          this.startSimulatedPlayback();
        });
      };

      attachEvents(this.audioSlotA);
      attachEvents(this.audioSlotB);
    } catch {
      // Audio not supported in environment
    }
  }

  private ensureContext(): void {
    if (typeof window === 'undefined') return;
    try {
      // PF9: share the page's single AudioContext with the procedural sound engine
      const shared = this.ctx ? null : getSharedAudioContext();
      if (shared) {
        this.ctx = shared;
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext unavailable
    }
  }

  public subscribe(listener: MusicStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyState(): void {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  public getState(): MusicState {
    return {
      currentTrackId: this.currentTrack?.id || null,
      isPlaying: this.isPlaying,
      volume: this.volume,
      isMuted: this.isMuted,
      currentTime: this.currentTime,
      duration: this.duration,
      autoSyncWithStage: this.autoSyncWithStage,
      phaseTrackMapping: { ...this.phaseTrackMapping }
    };
  }

  public setMasterVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    const effectiveVol = this.isMuted ? 0 : this.volume;

    // B6: apply the track's own default volume too. Only the active slot is touched: a slot that
    // is fading out keeps fading (B3), and a fade-in picks up the new target on its next step.
    const active = this.activeAudio();
    if (active) {
      active.muted = this.isMuted || effectiveVol === 0;
      if (this.fades.get(active)?.kind !== 'in') {
        active.volume = this.targetVolume();
      }
    }

    if (this.ctx && this.masterGain) {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(effectiveVol, this.ctx.currentTime);
      } catch {
        // ignore
      }
    }
    this.notifyState();
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    // B3: muting must not cancel fades. Cancelling used to orphan a fading-out slot, and
    // resetting both slots' volume made the outgoing track fully audible again.

    const effectiveVol = muted ? 0 : this.volume;

    if (this.audioSlotA) this.audioSlotA.muted = muted;
    if (this.audioSlotB) this.audioSlotB.muted = muted;

    const active = this.activeAudio();
    if (active && this.fades.get(active)?.kind !== 'in') {
      active.volume = this.targetVolume();
    }

    if (this.ctx && this.masterGain) {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(effectiveVol, this.ctx.currentTime);
      } catch {
        // ignore
      }
    }

    if (muted && this.synthInterval) {
      this.stopSynthesis(true);
    }

    this.notifyState();
  }

  public setAutoSyncWithStage(enabled: boolean): void {
    this.autoSyncWithStage = enabled;
    this.notifyState();
  }

  public setPhaseTrackMapping(mapping: Partial<typeof this.phaseTrackMapping>): void {
    this.phaseTrackMapping = {
      ...this.phaseTrackMapping,
      ...mapping
    };
    this.notifyState();
  }

  /**
   * Play a track with smooth crossfade
   */
  public async play(track: MusicTrack, options?: PlayOptions): Promise<void> {
    return this.playTrack(track, options);
  }

  public async playTrack(track: MusicTrack, options?: PlayOptions): Promise<void> {
    // B4: same track already playing? Leave it untouched. This check used to run after the
    // synth and fades were stopped, which silenced presets and froze a fade-in half way.
    if (this.currentTrack?.id === track.id && this.isPlaying) {
      return;
    }

    this.ensureContext();
    this.stopSynthesis(true);
    this.stopSimulatedPlayback();
    this.cancelAllFades();

    const fadeIn = options?.fadeInDuration ?? 1.0;
    const startSec = options?.startTime ?? 0;
    const isLoop = options?.loop ?? track.loop;

    this.currentTrack = track;
    this.duration = track.duration;
    this.currentTime = startSec;
    this.isPlaying = true;

    const currentAudio = this.activeSlot === 'A' ? this.audioSlotA : this.audioSlotB;
    const incomingSlot = this.activeSlot === 'A' ? 'B' : 'A';
    const incomingAudio = incomingSlot === 'A' ? this.audioSlotA : this.audioSlotB;

    // Crossfade: Fade out current active slot
    if (currentAudio && !currentAudio.paused) {
      this.fadeOutSlot(currentAudio, fadeIn);
    }

    this.activeSlot = incomingSlot;

    if (track.url && incomingAudio) {
      try {
        incomingAudio.src = track.url;
        incomingAudio.currentTime = startSec;
        incomingAudio.loop = isLoop;
        incomingAudio.muted = this.isMuted;
        incomingAudio.volume = 0;

        const playPromise = incomingAudio.play();
        if (playPromise) {
          playPromise
            .then(() => {
              this.fadeInSlot(incomingAudio, fadeIn);
            })
            .catch(() => {
              // Autoplay policy or media decode error -> start simulated
              this.startSimulatedPlayback();
            });
        }
      } catch {
        this.startSimulatedPlayback();
      }
    } else {
      // Procedural preset without URL -> synthesis or simulated
      this.startPresetSynthesis(track);
    }

    this.notifyState();
  }

  /** Fade `audio` up to targetVolume(), re-reading the target each step (B6). */
  private fadeInSlot(audio: HTMLAudioElement, duration: number): void {
    this.cancelFade(audio);
    if (this.isMuted || this.volume === 0) {
      if (audio) {
        audio.volume = 0;
        audio.muted = true;
      }
      return;
    }

    const steps = 15;
    const interval = Math.max(20, (duration * 1000) / steps);
    let step = 0;

    const timer = setInterval(() => {
      if (this.isMuted || this.volume === 0) {
        if (audio) {
          audio.volume = 0;
          audio.muted = true;
        }
        clearInterval(timer);
        this.fades.delete(audio);
        return;
      }

      step++;
      const current = (this.targetVolume() * step) / steps;
      if (audio) {
        audio.volume = Math.min(1, Math.max(0, current));
      }
      if (step >= steps) {
        clearInterval(timer);
        this.fades.delete(audio);
      }
    }, interval);

    this.fades.set(audio, { timer, kind: 'in' });
  }

  /** Fade `audio` to silence and pause it. Cancelling this fade also pauses it (B3). */
  private fadeOutSlot(audio: HTMLAudioElement, duration: number): void {
    this.cancelFade(audio);
    const initialVol = audio.volume;
    const steps = 12;
    const interval = Math.max(20, (duration * 1000) / steps);
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = initialVol * (1 - step / steps);
      if (audio) {
        audio.volume = Math.max(0, current);
      }
      if (step >= steps || (audio && audio.volume <= 0)) {
        clearInterval(timer);
        this.fades.delete(audio);
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // ignore
        }
      }
    }, interval);

    this.fades.set(audio, { timer, kind: 'out' });
  }

  public pause(): void {
    this.isPlaying = false;
    this.cancelAllFades();

    [this.audioSlotA, this.audioSlotB].forEach(audio => {
      if (audio && !audio.paused) {
        try {
          audio.pause();
        } catch {
          // ignore
        }
      }
    });

    this.stopSimulatedPlayback();
    this.stopSynthesis(true);
    this.notifyState();
  }

  public resume(options?: { fadeIn?: number }): void {
    if (!this.currentTrack) return;
    this.ensureContext();
    this.cancelAllFades();
    this.isPlaying = true;

    const audio = this.activeSlot === 'A' ? this.audioSlotA : this.audioSlotB;
    if (audio && audio.src) {
      try {
        audio.muted = this.isMuted;
        audio.play().catch(() => {});
        this.fadeInSlot(audio, options?.fadeIn ?? 0.4);
      } catch {
        this.startSimulatedPlayback();
      }
    } else {
      this.startPresetSynthesis(this.currentTrack);
    }
    this.notifyState();
  }

  public stop(options?: StopOptions): void {
    this.isPlaying = false;
    this.currentTime = 0;
    this.cancelAllFades();

    const fadeOut = options?.fadeOutDuration ?? 0.8;

    [this.audioSlotA, this.audioSlotB].forEach(audio => {
      if (audio && !audio.paused) {
        if (fadeOut > 0 && !this.isMuted && this.volume > 0) {
          this.fadeOutSlot(audio, fadeOut);
        } else {
          try {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 0;
          } catch {
            // ignore
          }
        }
      }
    });

    this.stopSimulatedPlayback();
    this.stopSynthesis(true);
    this.notifyState();
  }

  public seek(seconds: number): void {
    const clamped = Math.max(0, Math.min(this.duration || 100, seconds));
    this.currentTime = clamped;

    const audio = this.activeSlot === 'A' ? this.audioSlotA : this.audioSlotB;
    if (audio) {
      try {
        audio.currentTime = clamped;
      } catch {
        // ignore
      }
    }
    this.notifyState();
  }

  private startSimulatedPlayback(): void {
    this.stopSimulatedPlayback();
    this.timeUpdateInterval = setInterval(() => {
      if (this.isPlaying) {
        this.currentTime += 0.5;
        if (this.duration && this.currentTime >= this.duration) {
          if (this.currentTrack?.loop) {
            this.currentTime = 0;
          } else {
            this.stop();
          }
        }
        this.notifyState();
      }
    }, 500);
  }

  private stopSimulatedPlayback(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  private startPresetSynthesis(track: MusicTrack): void {
    this.stopSynthesis(true);
    this.startSimulatedPlayback();

    if (!this.ctx || !this.masterGain || this.isMuted || this.volume === 0) return;

    // Light ethereal synthesized arpeggio based on track phase
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqMap: Record<string, number> = {
        'preset-ambient-luxury': 329.63, // E4
        'preset-spin-tension': 220.00,    // A3
        'preset-question-focus': 261.63,  // C4
        'preset-fanfare-royal': 523.25    // C5
      };

      osc.frequency.setValueAtTime(freqMap[track.id] || 440, now);
      osc.type = 'triangle';

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08 * (this.isMuted ? 0 : this.volume), now + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);

      this.synthInterval = { osc, gain };
    } catch {
      // ignore
    }
  }

  private stopSynthesis(immediate: boolean = false): void {
    if (this.synthInterval) {
      try {
        const now = this.ctx?.currentTime || 0;
        if (immediate || this.isMuted || this.volume === 0) {
          this.synthInterval.gain?.gain?.cancelScheduledValues(now);
          this.synthInterval.gain?.gain?.setValueAtTime(0, now);
          this.synthInterval.osc?.stop(now + 0.02);
        } else {
          this.synthInterval.gain?.gain?.linearRampToValueAtTime(0, now + 0.5);
          this.synthInterval.osc?.stop(now + 0.6);
        }
      } catch {
        // ignore
      }
      this.synthInterval = null;
    }
  }
}

export const musicPlayer = new MusicPlayerEngine();
