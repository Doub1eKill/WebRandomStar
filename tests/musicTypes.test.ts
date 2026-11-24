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
    expect(DEFAULT_MUSIC_STATE.phaseTrackMapping.answered).toBeDefined();
  });

  it('contains pre-configured synthesized tracks', () => {
    expect(PRESET_MUSIC_TRACKS.length).toBeGreaterThanOrEqual(4);
    const ambient = PRESET_MUSIC_TRACKS.find(t => t.id === 'preset-ambient-luxury');
    expect(ambient).toBeDefined();
    expect(ambient?.targetPhase).toBe('ambient');
  });
});
