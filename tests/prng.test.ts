import { describe, it, expect } from 'vitest';
import { createPRNG, randomRange, randomChoice, hashString } from '../src/engine/prng.ts';

describe('Seeded PRNG (Mulberry32)', () => {
  it('should produce identical float sequences from the same seed string', () => {
    const prngA = createPRNG('session-seed-1234');
    const prngB = createPRNG('session-seed-1234');

    const seqA = [prngA(), prngA(), prngA(), prngA(), prngA()];
    const seqB = [prngB(), prngB(), prngB(), prngB(), prngB()];

    expect(seqA).toEqual(seqB);
  });

  it('should produce different sequences from different seeds', () => {
    const prngA = createPRNG('seed-alpha');
    const prngB = createPRNG('seed-beta');

    expect(prngA()).not.toBe(prngB());
  });

  it('should generate numbers within 0 <= n < 1', () => {
    const prng = createPRNG('range-test');
    for (let i = 0; i < 100; i++) {
      const val = prng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('should support randomRange and randomChoice helpers', () => {
    const prng = createPRNG('helper-test');
    const num = randomRange(10, 20, prng);
    expect(num).toBeGreaterThanOrEqual(10);
    expect(num).toBeLessThanOrEqual(20);

    const items = ['a', 'b', 'c'];
    const picked = randomChoice(items, prng);
    expect(items).toContain(picked);
  });

  it('should produce consistent hash from hashString', () => {
    expect(hashString('test')).toBe(hashString('test'));
    expect(hashString('test1')).not.toBe(hashString('test2'));
  });
});
