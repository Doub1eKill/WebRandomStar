import { describe, it, expect, beforeEach } from 'vitest';
import { audioEngine } from '../src/engine/audioEngine.ts';

describe('Procedural Web Audio Engine', () => {
  beforeEach(() => {
    audioEngine.setMuted(false);
    audioEngine.setVolume(0.8);
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
      audioEngine.playWaterDrop();
      audioEngine.playWindGust();
      audioEngine.playLeafRustle();
      audioEngine.playStarChime();
      audioEngine.playMeteorWhoosh();
      audioEngine.playQuestionReveal();
      audioEngine.fadeRainOut(0.5);
      audioEngine.playHeartbeatRiser(2.5);
      audioEngine.playSupernovaBoom();
    }).not.toThrow();
  });

  it('should have playHeartbeatRiser, playSupernovaBoom, playSuspenseRiser, and playSupernovaImpact methods defined', () => {
    expect(typeof (audioEngine as any).playHeartbeatRiser).toBe('function');
    expect(typeof (audioEngine as any).playSupernovaBoom).toBe('function');
    expect(typeof (audioEngine as any).playSuspenseRiser).toBe('function');
    expect(typeof (audioEngine as any).playSupernovaImpact).toBe('function');
  });

  it('should trigger playSuspenseRiser and playSupernovaImpact without throwing', () => {
    expect(() => audioEngine.playSuspenseRiser()).not.toThrow();
    expect(() => audioEngine.playSupernovaImpact()).not.toThrow();
  });
});
