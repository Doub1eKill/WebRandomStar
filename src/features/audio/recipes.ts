/**
 * PF9: procedural sound recipes, moved out of ProceduralAudioEngine unchanged.
 * Each recipe schedules nodes on `ctx` routed into `master`; the engine keeps the
 * mute/enable checks and the shared AudioContext.
 */

export interface RecipeSettings {
  tickVolume: number;
}

/**
 * Royal Spin Start: Whoosh + Rising harmonic build-up
 */
export function playSpinStart(ctx: AudioContext, master: GainNode): void {

    const now = ctx.currentTime;

    // Rising sine tone
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);

    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.2, now + 0.3);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(oscGain);
    oscGain.connect(master);
    osc.start(now);
    osc.stop(now + 0.75);

    // Ethereal whoosh noise
    try {
      const bufferSize = ctx.sampleRate * 0.7;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.linearRampToValueAtTime(1200, now + 0.6);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(master);

      noise.start(now);
      noise.stop(now + 0.7);
    } catch {
      // ignore
    }
}

/**
 * Word Spin Tick: Crisp crystal tick, modulated by speed ratio (0 = slow/deep, 1 = fast/bright)
 */
export function playSpinTick(ctx: AudioContext, master: GainNode, settings: RecipeSettings, speedRatio: number = 1): void {

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = 480 + speedRatio * 440; // 480Hz to 920Hz
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.035);

    const tickGain = Math.min(1, settings.tickVolume * (0.15 + speedRatio * 0.15));
    gain.gain.setValueAtTime(tickGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.045);
}

/**
 * Word Lock Chime: Climax sound with sparkling polyphonic major triad + soft bass pulse
 */
export function playWordLock(ctx: AudioContext, master: GainNode): void {

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    // Shimmering chimes
    notes.forEach((freq, idx) => {
      if (!ctx || !master) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);

      gain.gain.setValueAtTime(0, now + idx * 0.03);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.03 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 1.6);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 1.8);
    });

    // Soft bass impact
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(130, now);
    bass.frequency.exponentialRampToValueAtTime(65, now + 0.4);

    bassGain.gain.setValueAtTime(0.25, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    bass.connect(bassGain);
    bassGain.connect(master);
    bass.start(now);
    bass.stop(now + 0.55);
}

/**
 * Crisp water droplet "plop" with pitch envelope
 */
export function playWaterDrop(ctx: AudioContext, master: GainNode): void {

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    const startFreq = 800 + Math.random() * 500;
    const endFreq = startFreq + 400 + Math.random() * 300;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.25);
}

/**
 * Soft chilly winter wind gust
 */
export function playWindGust(ctx: AudioContext, master: GainNode): void {

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 2.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.linearRampToValueAtTime(550, now + 1.2);
    filter.frequency.linearRampToValueAtTime(260, now + 2.5);
    filter.Q.setValueAtTime(3.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.9);
    gain.gain.linearRampToValueAtTime(0, now + 2.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    noise.start(now);
    noise.stop(now + 2.6);
}

/**
 * Autumn leaf rustle
 */
export function playLeafRustle(ctx: AudioContext, master: GainNode): void {

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    noise.start(now);
    noise.stop(now + 0.8);
}

/**
 * Sky Transition ambient harmonic pad
 */
export function playSkyTransition(ctx: AudioContext, master: GainNode): void {

    const chord = [392.0, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
    const now = ctx.currentTime;

    chord.forEach((freq, idx) => {
      if (!ctx || !master) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.05 + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 1.8);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 2.0);
    });
}

/**
 * Majestic question reveal ethereal harmonic chord
 */
export function playQuestionReveal(ctx: AudioContext, master: GainNode): void {

    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5]; // C5, E5, G5, B5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!ctx || !master) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.04 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 2.5);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 2.8);
    });
}

/**
 * Timer Warning Cue (plays subtle gentle dual chime at ≤30s)
 */
export function playTimerWarning(ctx: AudioContext, master: GainNode): void {

    const now = ctx.currentTime;
    const freqs = [880, 1174.66]; // A5, D6

    freqs.forEach((f, i) => {
      if (!ctx || !master) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.1);

      gain.gain.setValueAtTime(0.12, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
}

/**
 * Timer Finish Sound (Plays decisive royal harmonic gong)
 */
export function playTimerFinish(ctx: AudioContext, master: GainNode): void {

    const now = ctx.currentTime;
    const chord = [261.63, 392.00, 523.25]; // C4, G4, C5 royal triad

    chord.forEach((freq, idx) => {
      if (!ctx || !master) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.02);

      gain.gain.setValueAtTime(0.28, now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 1.6);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + idx * 0.02);
      osc.stop(now + idx * 0.02 + 1.7);
    });
}
