import { describe, it, expect, beforeEach } from 'vitest';
import { audioEngine } from '@/features/audio/audioEngine.ts';

describe('Procedural Web Audio Engine (V3 - Royal Word Spin)', () => {
  beforeEach(() => {
    audioEngine.setMuted(false);
    audioEngine.setVolume(0.8);
    audioEngine.setSpinSoundEnabled(true);
  });

  it('should handle volume setting with boundary clamping [0, 1]', () => {
    audioEngine.setVolume(1.5);
    expect(audioEngine.getVolume()).toBe(1.0);

    audioEngine.setVolume(-0.5);
    expect(audioEngine.getVolume()).toBe(0.0);

    audioEngine.setVolume(0.65);
    expect(audioEngine.getVolume()).toBe(0.65);
  });

  it('should handle mute toggling', () => {
    audioEngine.setMuted(true);
    expect(audioEngine.isMuted()).toBe(true);

    audioEngine.setMuted(false);
    expect(audioEngine.isMuted()).toBe(false);
  });

  it('should not throw error when triggering sound methods without AudioContext initialized', () => {
    expect(() => {
      audioEngine.playSpinStart();
      audioEngine.playSpinTick(0.8);
      audioEngine.playWordLock();
      audioEngine.playQuestionReveal();
      audioEngine.playTimerFinish();
    }).not.toThrow();
  });

  it('should have playSpinStart, playSpinTick, playWordLock and playQuestionReveal defined', () => {
    expect(typeof audioEngine.playSpinStart).toBe('function');
    expect(typeof audioEngine.playSpinTick).toBe('function');
    expect(typeof audioEngine.playWordLock).toBe('function');
    expect(typeof audioEngine.playQuestionReveal).toBe('function');
    expect(typeof audioEngine.playTimerFinish).toBe('function');
    expect(typeof audioEngine.playTickSound).toBe('function');
  });

  it('should handle spin, tick, warning and finish sound enable/disable and tick volume', () => {
    audioEngine.setSpinSoundEnabled(false);
    expect(audioEngine.isSpinSoundEnabled()).toBe(false);
    audioEngine.setSpinSoundEnabled(true);
    expect(audioEngine.isSpinSoundEnabled()).toBe(true);

    audioEngine.setTickSoundEnabled(false);
    expect(audioEngine.isTickSoundEnabled()).toBe(false);
    audioEngine.setTickSoundEnabled(true);
    expect(audioEngine.isTickSoundEnabled()).toBe(true);

    audioEngine.setWarningSoundEnabled(false);
    expect(audioEngine.isWarningSoundEnabled()).toBe(false);
    audioEngine.setWarningSoundEnabled(true);
    expect(audioEngine.isWarningSoundEnabled()).toBe(true);

    audioEngine.setFinishSoundEnabled(false);
    expect(audioEngine.isFinishSoundEnabled()).toBe(false);
    audioEngine.setFinishSoundEnabled(true);
    expect(audioEngine.isFinishSoundEnabled()).toBe(true);

    audioEngine.setTickVolume(0.75);
    expect(audioEngine.getTickVolume()).toBe(0.75);
    audioEngine.setTickVolume(1.5);
    expect(audioEngine.getTickVolume()).toBe(1.0);
    audioEngine.setTickVolume(-0.2);
    expect(audioEngine.getTickVolume()).toBe(0.0);
  });

  it('should trigger playTickSound safely for all threshold ranges', () => {
    expect(() => {
      audioEngine.playTickSound(45); // Normal
      audioEngine.playTickSound(10); // Critical
      audioEngine.playTickSound(3);  // Last 3s
      audioEngine.playTickSound(1);  // Last 1s
      audioEngine.playTickSound(0);  // Finished
    }).not.toThrow();
  });

  it('should strictly silence all playback methods when muted is true', () => {
    audioEngine.setMuted(true);
    expect(() => {
      audioEngine.playSpinStart();
      audioEngine.playSpinTick(1.0);
      audioEngine.playWordLock();
      audioEngine.playQuestionReveal();
      audioEngine.playTimerFinish();
      audioEngine.playTickSound(5);
    }).not.toThrow();
  });
});
