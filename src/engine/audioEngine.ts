/**
 * Procedural Web Audio API sound generator for "Season Transition" ambiance
 * Generates natural audio synthesis (Rain, Drops, Wind, Leaves, Stars, Meteor, Reveal)
 * without relying on external MP3 files. Works 100% offline.
 */
class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private volume: number = 0.8;
  private muted: boolean = false;

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

  /**
   * Continuous pink noise rain generator with low-pass filtering
   */
  public playRainAmbience(fadeDuration: number = 1.5): void {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    if (this.rainNode) return; // already playing

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
   * Star & Constellation celestial chime
   */
  public playStarChime(): void {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const frequencies = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
    const now = this.ctx.currentTime;

    frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 1.3);
    });
  }

  /**
   * Meteor whoosh and impact strike sound
   */
  public playMeteorWhoosh(): void {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Sub-bass sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.8);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.0);

    // High frequency streak noise
    const bufferSize = this.ctx.sampleRate * 0.9;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 0.8);
    filter.Q.setValueAtTime(4, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.9);
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
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 2.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 3.0);
    });
  }
}

export const audioEngine = new ProceduralAudioEngine();
