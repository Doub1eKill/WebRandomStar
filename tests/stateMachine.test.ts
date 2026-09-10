import { describe, it, expect } from 'vitest';
import {
  getNextState,
  isValidTransition,
  STAGE_SEQUENCE,
  STAGE_DURATION
} from '../src/engine/stateMachine.ts';
import { AppState } from '../src/types/session.ts';

describe('Stage State Machine', () => {
  it('should have exact 11 natural states in sequence', () => {
    const expectedSequence: AppState[] = [
      'idle',
      'rain',
      'water-drop',
      'mist',
      'wind',
      'leaf',
      'sky-opening',
      'constellation',
      'meteor',
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
    expect(getNextState('leaf')).toBe('sky-opening');
    expect(getNextState('sky-opening')).toBe('constellation');
    expect(getNextState('constellation')).toBe('meteor');
    expect(getNextState('meteor')).toBe('question');
    expect(getNextState('question')).toBe('answered');
    expect(getNextState('answered')).toBe('idle');
  });

  it('should validate legal and illegal transitions', () => {
    expect(isValidTransition('idle', 'rain')).toBe(true);
    expect(isValidTransition('rain', 'water-drop')).toBe(true);
    // Direct jump from idle to question is illegal in normal flow
    expect(isValidTransition('idle', 'question')).toBe(false);
    // Reset to idle is always valid
    expect(isValidTransition('leaf', 'idle')).toBe(true);
    expect(isValidTransition('meteor', 'idle')).toBe(true);
  });

  it('should define durations for all active animated stages', () => {
    expect(STAGE_DURATION['rain']).toBeGreaterThan(0);
    expect(STAGE_DURATION['mist']).toBeGreaterThan(0);
    expect(STAGE_DURATION['constellation']).toBeGreaterThan(0);
    expect(STAGE_DURATION['meteor']).toBeGreaterThan(0);
  });
});
