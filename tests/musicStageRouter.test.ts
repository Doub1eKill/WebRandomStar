import { describe, it, expect } from 'vitest';
import { getTargetTrackForStagePhase } from '../src/hooks/useMusicStageRouter.ts';
import { DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS } from '../src/types/music.ts';

describe('Music Stage Router', () => {
  it('resolves ambient track for idle state', () => {
    const track = getTargetTrackForStagePhase('idle', DEFAULT_MUSIC_STATE.phaseTrackMapping, PRESET_MUSIC_TRACKS);
    expect(track?.id).toBe('preset-ambient-luxury');
  });

  it('resolves spin track for word-spin and pre-spin states', () => {
    const track1 = getTargetTrackForStagePhase('pre-spin', DEFAULT_MUSIC_STATE.phaseTrackMapping, PRESET_MUSIC_TRACKS);
    expect(track1?.id).toBe('preset-spin-tension');

    const track2 = getTargetTrackForStagePhase('word-spin', DEFAULT_MUSIC_STATE.phaseTrackMapping, PRESET_MUSIC_TRACKS);
    expect(track2?.id).toBe('preset-spin-tension');
  });

  it('resolves question track for question and question-reveal states', () => {
    const track1 = getTargetTrackForStagePhase('question-reveal', DEFAULT_MUSIC_STATE.phaseTrackMapping, PRESET_MUSIC_TRACKS);
    expect(track1?.id).toBe('preset-question-focus');

    const track2 = getTargetTrackForStagePhase('question', DEFAULT_MUSIC_STATE.phaseTrackMapping, PRESET_MUSIC_TRACKS);
    expect(track2?.id).toBe('preset-question-focus');
  });

  it('resolves answered track for answered state', () => {
    const track = getTargetTrackForStagePhase('answered', DEFAULT_MUSIC_STATE.phaseTrackMapping, PRESET_MUSIC_TRACKS);
    expect(track?.id).toBe('preset-fanfare-royal');
  });
});
