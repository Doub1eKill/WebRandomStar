import { describe, it, expect } from 'vitest';
import {
  generateSpinReel,
  calculateDecelerationEasing,
  getWordAtProgress,
  getDisplayText,
  SPIN_SPEED_ITEMS_PER_MS,
  DECEL_DURATION_MS,
  plannedTargetIndex,
  brakePosition,
  chooseStopSlot,
  spinViewLookahead
} from '@/features/stage/word-spin/wordSpinEngine.ts';
import { STAGE_DURATION } from '@/features/session/stateMachine.ts';
import { DEFAULT_WORDS } from '@/data/defaultWords.ts';

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

  it('places the target at the requested slot', () => {
    const targetWord = DEFAULT_WORDS[3];
    const reel = generateSpinReel(DEFAULT_WORDS, targetWord, 50, 'seed_slot', 42);
    expect(reel.length).toBe(50);
    expect(reel[42]).toEqual(targetWord);
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

describe('Constant-speed spin: the brake never speeds the reel up', () => {
  const speedAt = (t: number, distance: number, speed: number) => {
    const h = 1e-4;
    return (brakePosition(t + h, distance, speed) - brakePosition(t - h, distance, speed)) / (2 * h * DECEL_DURATION_MS);
  };

  it.each([
    ['keyword', SPIN_SPEED_ITEMS_PER_MS.keyword],
    ['question', SPIN_SPEED_ITEMS_PER_MS.question]
  ])('an automatic %s spin brakes onto the planned slot, leaving at spin speed and only slowing down', (_mode, speed) => {
    const target = plannedTargetIndex(speed, STAGE_DURATION['word-spin']);
    const reel = Array.from({ length: target + 10 }, (_, i) => ({ id: i === target ? 'T' : `x${i}` }));

    // The brake starts when the 2,500ms spin ends, give or take a frame or two of timing.
    for (const lateMs of [-40, 0, 40]) {
      const position = speed * (STAGE_DURATION['word-spin'] + lateMs);
      const { stop, rewriteIndex } = chooseStopSlot(reel, 'T', position, speed, spinViewLookahead('orbital', 'question'));
      expect(rewriteIndex).toBeNull();
      expect(stop).toBe(target);

      const distance = stop - position;
      expect(brakePosition(1, distance, speed)).toBeCloseTo(distance, 9);
      expect(speedAt(0.0002, distance, speed)).toBeCloseTo(speed, 4);
      let previous = Infinity;
      for (let t = 0.01; t < 1; t += 0.01) {
        const v = speedAt(t, distance, speed);
        expect(v).toBeLessThanOrEqual(speed * 1.1); // at most a 10% swell, never a jump
        expect(v).toBeGreaterThanOrEqual(0);
        previous = v;
      }
      expect(previous).toBeLessThan(speed * 0.1);
    }
  });

  it('a stop the plan did not expect rewrites one slot past the visible window', () => {
    const speed = SPIN_SPEED_ITEMS_PER_MS.question;
    const reel = Array.from({ length: 40 }, (_, i) => ({ id: i === 13 ? 'T' : `x${i}` }));
    const lookahead = spinViewLookahead('vertical', 'question');
    const position = 20.3; // e.g. a manual stop long after the planned slot went by
    const { stop, rewriteIndex } = chooseStopSlot(reel, 'T', position, speed, lookahead);
    expect(stop - position).toBeGreaterThanOrEqual(lookahead);
    expect(rewriteIndex).toBe(stop % reel.length);
  });
});

