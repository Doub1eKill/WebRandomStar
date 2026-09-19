import { describe, it, expect } from 'vitest';
import { getNextState, isValidTransition } from '../src/engine/stateMachine.ts';

describe('Word Spin Stop Mode Transitions', () => {
  it('transitions from word-spin to word-decelerate', () => {
    const next = getNextState('word-spin');
    expect(next).toBe('word-decelerate');
  });

  it('transitions from word-decelerate to word-lock', () => {
    const next = getNextState('word-decelerate');
    expect(next).toBe('word-lock');
  });

  it('validates transition sequence for word spin stages', () => {
    expect(isValidTransition('word-spin', 'word-decelerate')).toBe(true);
    expect(isValidTransition('word-decelerate', 'word-lock')).toBe(true);
    expect(isValidTransition('word-lock', 'question-reveal')).toBe(true);
  });
});
