import { describe, it, expect } from 'vitest';
import {
  getNextState,
  isValidTransition,
  STAGE_SEQUENCE,
  STAGE_DURATION
} from '../src/engine/stateMachine.ts';
import { AppState } from '../src/types/session.ts';

describe('Stage State Machine', () => {
  it('should have exact 8 natural states in sequence', () => {
    const expectedSequence: AppState[] = [
      'idle',
      'rain',
      'water-drop',
      'mist',
      'wind',
      'leaf',
      'question',
      'answered'
    ];
    expect(STAGE_SEQUENCE).toEqual(expectedSequence);
  });

  it('should transition correctly through natural sequence', () => {
    expect(getNextState('idle')).toBe('rain');
    expect(getNextState('rain')).toBe('water-drop');
    expect(getNextState('water-drop')).toBe('mist');
    expect(getNextState('mist')).toBe('wind');
    expect(getNextState('wind')).toBe('leaf');
    expect(getNextState('leaf')).toBe('question');
    expect(getNextState('question')).toBe('answered');
    expect(getNextState('answered')).toBe('idle');
  });

  it('should validate legal and illegal transitions', () => {
    expect(isValidTransition('idle', 'rain')).toBe(true);
    expect(isValidTransition('rain', 'water-drop')).toBe(true);
    // Direct jump from idle to question is illegal in normal flow
    expect(isValidTransition('idle', 'question')).toBe(false);
    // Leaf to question is legal
    expect(isValidTransition('leaf', 'question')).toBe(true);
    // Reset to idle is always valid
    expect(isValidTransition('leaf', 'idle')).toBe(true);
  });

  it('should define durations for all active animated stages with total 7.5s pacing', () => {
    expect(STAGE_DURATION['rain']).toBe(1200);
    expect(STAGE_DURATION['leaf']).toBe(2000);

    const activeStages: AppState[] = [
      'rain', 'water-drop', 'mist', 'wind', 'leaf'
    ];
    const totalDuration = activeStages.reduce((acc, st) => acc + STAGE_DURATION[st], 0);
    expect(totalDuration).toBe(7500);
  });
});
