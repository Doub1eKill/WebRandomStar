import { MusicTrack, MusicState, DEFAULT_MUSIC_STATE } from '../types/music.ts';

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

  private synthInterval: any = null;
  private listeners: Set<MusicStateListener> = new Set();
  private timeUpdateInterval: any = null;

  constructor() {
    this.initAudioElements();
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
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx && AudioCtx) {
        this.ctx = new AudioCtx();
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

    if (this.audioSlotA) this.audioSlotA.volume = effectiveVol;
    if (this.audioSlotB) this.audioSlotB.volume = effectiveVol;

    if (this.ctx && this.masterGain) {
      try {
        this.masterGain.gain.setTargetAtTime(effectiveVol, this.ctx.currentTime, 0.05);
      } catch {
        // ignore
      }
    }
    this.notifyState();
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.setMasterVolume(this.volume);
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
  public async playTrack(track: MusicTrack, options?: PlayOptions): Promise<void> {
    this.ensureContext();
    this.stopSynthesis();
    this.stopSimulatedPlayback();

    const fadeIn = options?.fadeInDuration ?? 1.0;
    const startSec = options?.startTime ?? 0;
    const isLoop = options?.loop ?? track.loop;

    // Same track already playing? Resume
    if (this.currentTrack?.id === track.id && this.isPlaying) {
      return;
    }

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
        incomingAudio.volume = 0;

        const playPromise = incomingAudio.play();
        if (playPromise) {
          playPromise
            .then(() => {
              this.fadeInSlot(incomingAudio, fadeIn, (track.defaultVolume ?? 1) * (this.isMuted ? 0 : this.volume));
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

  private fadeInSlot(audio: HTMLAudioElement, duration: number, targetVol: number): void {
    const steps = 15;
    const interval = (duration * 1000) / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = (targetVol * step) / steps;
      if (audio) {
        audio.volume = Math.min(1, Math.max(0, current));
      }
      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);
  }

  private fadeOutSlot(audio: HTMLAudioElement, duration: number): void {
    const initialVol = audio.volume;
    const steps = 12;
    const interval = (duration * 1000) / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = initialVol * (1 - step / steps);
      if (audio) {
        audio.volume = Math.max(0, current);
      }
      if (step >= steps) {
        clearInterval(timer);
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // ignore
        }
      }
    }, interval);
  }

  public pause(): void {
    this.isPlaying = false;
    const audio = this.activeSlot === 'A' ? this.audioSlotA : this.audioSlotB;
    if (audio && !audio.paused) {
      try {
        audio.pause();
      } catch {
        // ignore
      }
    }
    this.stopSimulatedPlayback();
    this.stopSynthesis();
    this.notifyState();
  }

  public resume(options?: { fadeIn?: number }): void {
    if (!this.currentTrack) return;
    this.ensureContext();
    this.isPlaying = true;

    const audio = this.activeSlot === 'A' ? this.audioSlotA : this.audioSlotB;
    if (audio && audio.src) {
      try {
        audio.play().catch(() => {});
        this.fadeInSlot(audio, options?.fadeIn ?? 0.4, (this.currentTrack.defaultVolume ?? 1) * (this.isMuted ? 0 : this.volume));
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

    const fadeOut = options?.fadeOutDuration ?? 0.8;
    const audio = this.activeSlot === 'A' ? this.audioSlotA : this.audioSlotB;
    if (audio && !audio.paused) {
      this.fadeOutSlot(audio, fadeOut);
    }

    this.stopSimulatedPlayback();
    this.stopSynthesis();
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
    this.stopSynthesis();
    this.startSimulatedPlayback();

    if (!this.ctx || !this.masterGain || this.isMuted) return;

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

  private stopSynthesis(): void {
    if (this.synthInterval) {
      try {
        this.synthInterval.gain?.gain?.linearRampToValueAtTime(0, (this.ctx?.currentTime || 0) + 0.5);
        this.synthInterval.osc?.stop((this.ctx?.currentTime || 0) + 0.6);
      } catch {
        // ignore
      }
      this.synthInterval = null;
    }
  }
}

export const musicPlayer = new MusicPlayerEngine();
