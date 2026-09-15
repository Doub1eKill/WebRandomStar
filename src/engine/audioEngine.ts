/**
 * Procedural Web Audio API sound generator for "Royal Word Spin & Luxury Pageant Stage"
 * Generates procedural audio synthesis (Spin Whoosh, Spin Ticks, Word Lock Chime, Question Reveal, Ambient & Timer Chimes)
 * without relying on external MP3 files. Works 100% offline.
 */
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
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
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
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
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

  /**
   * Royal Spin Start: Whoosh + Rising harmonic build-up
   */
  public playSpinStart(): void {
    if (this.muted || !this.spinSoundEnabled) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Rising sine tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);

    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.2, now + 0.3);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.75);

    // Ethereal whoosh noise
    try {
      const bufferSize = this.ctx.sampleRate * 0.7;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.linearRampToValueAtTime(1200, now + 0.6);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.7);
    } catch {
      // ignore
    }
  }

  /**
   * Word Spin Tick: Crisp crystal tick, modulated by speed ratio (0 = slow/deep, 1 = fast/bright)
   */
  public playSpinTick(speedRatio: number = 1): void {
    if (this.muted || !this.spinSoundEnabled) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 480 + speedRatio * 440; // 480Hz to 920Hz
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.035);

    const tickGain = Math.min(1, this.tickVolume * (0.15 + speedRatio * 0.15));
    gain.gain.setValueAtTime(tickGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * Word Lock Chime: Climax sound with sparkling polyphonic major triad + soft bass pulse
   */
  public playWordLock(): void {
    if (this.muted || !this.spinSoundEnabled) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    // Shimmering chimes
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);

      gain.gain.setValueAtTime(0, now + idx * 0.03);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.03 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 1.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 1.8);
    });

    // Soft bass impact
    const bass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(130, now);
    bass.frequency.exponentialRampToValueAtTime(65, now + 0.4);

    bassGain.gain.setValueAtTime(0.25, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    bass.connect(bassGain);
    bassGain.connect(this.masterGain);
    bass.start(now);
    bass.stop(now + 0.55);
  }

  /**
   * Continuous pink noise rain generator with low-pass filtering
   */
  public playRainAmbience(fadeDuration: number = 1.5): void {
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
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const now = this.ctx.currentTime;
    const startFreq = 800 + Math.random() * 500;
    const endFreq = startFreq + 400 + Math.random() * 300;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Soft chilly winter wind gust
   */
  public playWindGust(): void {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.linearRampToValueAtTime(550, now + 1.2);
    filter.frequency.linearRampToValueAtTime(260, now + 2.5);
    filter.Q.setValueAtTime(3.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.9);
    gain.gain.linearRampToValueAtTime(0, now + 2.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 2.6);
  }

  /**
   * Autumn leaf rustle
   */
  public playLeafRustle(): void {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.8);
  }

  /**
   * Sky Transition ambient harmonic pad
   */
  public playSkyTransition(): void {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const chord = [392.0, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
    const now = this.ctx.currentTime;

    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.05 + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 2.0);
    });
  }

  /**
   * Majestic question reveal ethereal harmonic chord
   */
  public playQuestionReveal(): void {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5]; // C5, E5, G5, B5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.04 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 2.8);
    });
  }

  /**
   * Timer Warning Cue (plays subtle gentle dual chime at ≤30s)
   */
  public playTimerWarning(): void {
    if (!this.warningSoundEnabled || this.muted) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const freqs = [880, 1174.66]; // A5, D6

    freqs.forEach((f, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.1);

      gain.gain.setValueAtTime(0.12, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }

  /**
   * Timer Finish Sound (Plays decisive royal harmonic gong)
   */
  public playTimerFinish(): void {
    if (!this.finishSoundEnabled || this.muted) return;
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const chord = [261.63, 392.00, 523.25]; // C4, G4, C5 royal triad

    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.02);

      gain.gain.setValueAtTime(0.28, now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 1.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.02);
      osc.stop(now + idx * 0.02 + 1.7);
    });
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
