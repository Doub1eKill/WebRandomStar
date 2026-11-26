/**
 * Built-in music presets have no audio files. They used to be "played" by a single oscillator
 * holding one note for the whole phase, which sounded like a stuck tone. Each preset is now a
 * soft looping arpeggio: short notes scheduled slightly ahead on the AudioContext clock, every
 * one with its own stop time, so nothing can keep sounding after the arpeggio is stopped.
 */

export interface ArpeggioPattern {
  /** Note frequencies (Hz), played in order and looped. */
  notes: number[];
  /** Seconds between note starts. */
  stepSec: number;
  /** Length of each note including its fade-out. */
  noteSec: number;
  /** Peak gain of a note before the player volume is applied. */
  level: number;
  type: OscillatorType;
}

// E4 G#4 B4 E5 B4 G#4 — calm, slow
const AMBIENT: ArpeggioPattern = { notes: [329.63, 415.3, 493.88, 659.25, 493.88, 415.3], stepSec: 0.6, noteSec: 1.4, level: 0.05, type: 'sine' };
// A3 C4 E4 A4 E4 C4 — quick, tense
const SPIN: ArpeggioPattern = { notes: [220, 261.63, 329.63, 440, 329.63, 261.63], stepSec: 0.16, noteSec: 0.22, level: 0.045, type: 'triangle' };
// C4 E4 G4 B4 G4 E4 — gentle, thinking
const QUESTION: ArpeggioPattern = { notes: [261.63, 329.63, 392, 493.88, 392, 329.63], stepSec: 0.5, noteSec: 1.1, level: 0.045, type: 'sine' };

export const PRESET_PATTERNS: Record<string, ArpeggioPattern> = {
  'preset-ambient-luxury': AMBIENT,
  'preset-spin-tension': SPIN,
  'preset-question-focus': QUESTION
};

export const patternFor = (trackId: string): ArpeggioPattern => PRESET_PATTERNS[trackId] ?? QUESTION;

const LOOKAHEAD_SEC = 0.25;
const SCHEDULER_MS = 50;
const ATTACK_SEC = 0.02;

export interface ArpeggioHandle {
  stop: () => void;
}

/**
 * Start looping `pattern` into `out`. `level()` is read for every note, so volume changes
 * apply from the next note on.
 */
export function startArpeggio(ctx: AudioContext, out: AudioNode, pattern: ArpeggioPattern, level: () => number): ArpeggioHandle {
  const sounding = new Set<{ osc: OscillatorNode; gain: GainNode }>();
  let nextTime = ctx.currentTime + 0.05;
  let index = 0;

  const scheduleNote = (time: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const peak = pattern.level * level();
    osc.type = pattern.type;
    osc.frequency.setValueAtTime(pattern.notes[index % pattern.notes.length], time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(peak, time + ATTACK_SEC);
    gain.gain.linearRampToValueAtTime(0, time + pattern.noteSec);
    osc.connect(gain);
    gain.connect(out);
    osc.start(time);
    osc.stop(time + pattern.noteSec + 0.02);
    const note = { osc, gain };
    sounding.add(note);
    osc.onended = () => {
      sounding.delete(note);
      try { gain.disconnect(); } catch { /* already disconnected */ }
    };
    index++;
  };

  const tick = () => {
    while (nextTime < ctx.currentTime + LOOKAHEAD_SEC) {
      scheduleNote(nextTime);
      nextTime += pattern.stepSec;
    }
  };

  tick();
  const timer = setInterval(tick, SCHEDULER_MS);

  return {
    stop() {
      clearInterval(timer);
      const now = ctx.currentTime;
      sounding.forEach(({ osc, gain }) => {
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(0, now);
          osc.stop(now + 0.02);
        } catch {
          // note already finished
        }
      });
      sounding.clear();
    }
  };
}
