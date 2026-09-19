import { describe, it, expect } from 'vitest';
import {
  getNextState,
  isValidTransition,
  STAGE_SEQUENCE,
  STAGE_DURATION
} from '../src/engine/stateMachine.ts';
import { AppState } from '../src/types/session.ts';

describe('Version 3.0 Stage State Machine (Royal Word Spin)', () => {
  it('should have exact 8 states in Royal Word Spin sequence', () => {
    const expectedSequence: AppState[] = [
      'idle',
      'pre-spin',
      'word-spin',
      'word-decelerate',
      'word-lock',
      'question-reveal',
      'question',
      'answered'
    ];
    expect(STAGE_SEQUENCE).toEqual(expectedSequence);
  });

  it('should transition correctly through royal word spin sequence', () => {
    expect(getNextState('idle')).toBe('pre-spin');
    expect(getNextState('pre-spin')).toBe('word-spin');
    expect(getNextState('word-spin')).toBe('word-decelerate');
    expect(getNextState('word-decelerate')).toBe('word-lock');
    expect(getNextState('word-lock')).toBe('question-reveal');
    expect(getNextState('question-reveal')).toBe('question');
    expect(getNextState('question')).toBe('answered');
    expect(getNextState('answered')).toBe('idle');
  });

  it('skips word-lock phase when showWordLockPhase is false', () => {
    expect(getNextState('word-decelerate', false)).toBe('question-reveal');
  });

  it('includes word-lock phase when showWordLockPhase is true', () => {
    expect(getNextState('word-decelerate', true)).toBe('word-lock');
    expect(getNextState('word-decelerate')).toBe('word-lock');
  });

  it('should validate legal and illegal transitions', () => {
    expect(isValidTransition('idle', 'pre-spin')).toBe(true);
    expect(isValidTransition('pre-spin', 'word-spin')).toBe(true);
    expect(isValidTransition('word-spin', 'word-decelerate')).toBe(true);
    expect(isValidTransition('word-lock', 'question-reveal')).toBe(true);
    // Direct jump from idle to question is illegal in normal flow
    expect(isValidTransition('idle', 'question')).toBe(false);
    // Quick skip to question from any active animation is legal
    expect(isValidTransition('word-spin', 'question')).toBe(true);
    expect(isValidTransition('word-decelerate', 'question')).toBe(true);
    // Reset to idle is always valid
    expect(isValidTransition('word-spin', 'idle')).toBe(true);
    expect(isValidTransition('word-lock', 'idle')).toBe(true);
  });

  it('should define durations for all active animated stages', () => {
    expect(STAGE_DURATION['pre-spin']).toBe(800);
    expect(STAGE_DURATION['word-spin']).toBe(2500);
    expect(STAGE_DURATION['word-decelerate']).toBe(2000);
    expect(STAGE_DURATION['word-lock']).toBe(1500);
    expect(STAGE_DURATION['question-reveal']).toBe(1000);

    const activeStages: AppState[] = [
      'pre-spin', 'word-spin', 'word-decelerate', 'word-lock', 'question-reveal'
    ];
    const totalDuration = activeStages.reduce((acc, st) => acc + STAGE_DURATION[st], 0);
    expect(totalDuration).toBe(7800);
  });
});
