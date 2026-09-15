import { describe, it, expect } from 'vitest';
import {
  generateSpinReel,
  calculateDecelerationEasing,
  getWordAtProgress
} from '../src/engine/wordSpinEngine.ts';
import { DEFAULT_WORDS } from '../src/data/defaultWords.ts';

describe('Word Spin Engine', () => {
  it('should generate a reel with the target word at the very end', () => {
    const targetWord = DEFAULT_WORDS[0];
    const reel = generateSpinReel(DEFAULT_WORDS, targetWord, 20, 'reel_seed_99');

    expect(reel.length).toBe(20);
    expect(reel[reel.length - 1]).toEqual(targetWord);
  });

  it('should compute deceleration easing properly', () => {
    expect(calculateDecelerationEasing(0)).toBe(0);
    expect(calculateDecelerationEasing(1)).toBe(1);
    // At t=0.5, easing should already be > 0.5 because it is fast at first then decelerates
    expect(calculateDecelerationEasing(0.5)).toBeGreaterThan(0.7);
  });

  it('should retrieve word at progress correctly', () => {
    const targetWord = DEFAULT_WORDS[2];
    const reel = generateSpinReel(DEFAULT_WORDS, targetWord, 10, 'seed_abc');

    const firstWord = getWordAtProgress(reel, 0);
    expect(firstWord).toBeDefined();

    const lastWord = getWordAtProgress(reel, 1);
    expect(lastWord).toEqual(targetWord);
  });
});
