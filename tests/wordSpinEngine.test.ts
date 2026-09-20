import { describe, it, expect } from 'vitest';
import {
  generateSpinReel,
  calculateDecelerationEasing,
  calculateQuinticDecel,
  calculateContinuousDecelTarget,
  getWordAtProgress,
  getDisplayText
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

  it('should calculate continuous deceleration target with forward landing and target index alignment', () => {
    const reelLength = 36;
    const targetIndex = 35;

    // Case 1: Start at 0
    const target1 = calculateContinuousDecelTarget(0, reelLength, targetIndex, 12);
    expect(target1).toBeGreaterThanOrEqual(12);
    expect(target1 % reelLength).toBe(targetIndex);

    // Case 2: Start mid-spin at 45.3
    const target2 = calculateContinuousDecelTarget(45.3, reelLength, targetIndex, 14);
    expect(target2).toBeGreaterThanOrEqual(45.3 + 14);
    expect(target2 % reelLength).toBe(targetIndex);

    // Case 3: High offset at 180.7
    const target3 = calculateContinuousDecelTarget(180.7, reelLength, targetIndex, 12);
    expect(target3).toBeGreaterThanOrEqual(180.7 + 12);
    expect(target3 % reelLength).toBe(targetIndex);
  });

  it('should compute quintic deceleration easing with smooth start and finish', () => {
    expect(calculateQuinticDecel(0)).toBe(0);
    expect(calculateQuinticDecel(1)).toBe(1);
    expect(calculateQuinticDecel(0.5)).toBeCloseTo(0.9375, 4);
    expect(calculateQuinticDecel(0.8)).toBeGreaterThan(0.99);
  });

  it('should retrieve word at progress correctly', () => {
    const targetWord = DEFAULT_WORDS[2];
    const reel = generateSpinReel(DEFAULT_WORDS, targetWord, 10, 'seed_abc');

    const firstWord = getWordAtProgress(reel, 0);
    expect(firstWord).toBeDefined();

    const lastWord = getWordAtProgress(reel, 1);
    expect(lastWord).toEqual(targetWord);
  });

  it('generates a question spin reel where the final item is the target question', () => {
    const sampleQuestions = [
      { id: 'Q1', text: 'คำถามข้อที่ 1', category: 'general', difficulty: 'easy', round: 'intro', enabled: true },
      { id: 'Q2', text: 'คำถามข้อที่ 2', category: 'general', difficulty: 'easy', round: 'intro', enabled: true },
      { id: 'Q3', text: 'คำถามข้อที่ 3', category: 'general', difficulty: 'easy', round: 'intro', enabled: true }
    ];
    const target = sampleQuestions[1];
    const reel = generateSpinReel(sampleQuestions, target, 20, 'test_seed_q');
    expect(reel.length).toBe(20);
    expect(reel[19].id).toBe('Q2');
    expect(reel[19].text).toBe('คำถามข้อที่ 2');
  });

  it('correctly extracts display text with getDisplayText', () => {
    expect(getDisplayText({ text: 'คำถามสำคัญ' })).toBe('คำถามสำคัญ');
    expect(getDisplayText({ word: 'อนาคต' })).toBe('อนาคต');
    expect(getDisplayText({ displayText: 'ข้อความกำหนดเอง' })).toBe('ข้อความกำหนดเอง');
    expect(getDisplayText('ข้อความตรง')).toBe('ข้อความตรง');
    expect(getDisplayText(null)).toBe('');
  });
});

