import { describe, it, expect } from 'vitest';
import { DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS } from '@/types/music.ts';

describe('Music Types & Default Presets', () => {
  it('has valid default music state with autoSync enabled', () => {
    expect(DEFAULT_MUSIC_STATE.autoSyncWithStage).toBe(true);
    expect(DEFAULT_MUSIC_STATE.volume).toBeGreaterThan(0);
    expect(DEFAULT_MUSIC_STATE.phaseTrackMapping).toBeDefined();
    expect(DEFAULT_MUSIC_STATE.phaseTrackMapping.ambient).toBeDefined();
    expect(DEFAULT_MUSIC_STATE.phaseTrackMapping.spin).toBeDefined();
    expect(DEFAULT_MUSIC_STATE.phaseTrackMapping.question).toBeDefined();
    // No answered-phase music since Done returns straight to idle (2026-11-27).
    expect(Object.keys(DEFAULT_MUSIC_STATE.phaseTrackMapping).sort()).toEqual(['ambient', 'question', 'spin']);
  });

  it('contains pre-configured synthesized tracks', () => {
    // Ambient, spin and question; the answered-phase fanfare was removed (2026-11-27).
    expect(PRESET_MUSIC_TRACKS.map(t => t.id)).toEqual(['preset-ambient-luxury', 'preset-spin-tension', 'preset-question-focus']);
    const ambient = PRESET_MUSIC_TRACKS.find(t => t.id === 'preset-ambient-luxury');
    expect(ambient).toBeDefined();
    expect(ambient?.targetPhase).toBe('ambient');
  });
});
