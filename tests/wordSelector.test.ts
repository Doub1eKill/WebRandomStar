import { describe, it, expect } from 'vitest';
import { filterWords, selectTargetWord } from '../src/engine/wordSelector.ts';
import { DEFAULT_WORDS } from '../src/data/defaultWords.ts';

describe('Word Selector Engine', () => {
  it('should filter enabled words', () => {
    const words = [
      { id: '1', word: 'A', category: 'moon', enabled: true },
      { id: '2', word: 'B', category: 'moon', enabled: false }
    ];
    const filtered = filterWords(words);
    expect(filtered.length).toBe(1);
    expect(filtered[0].word).toBe('A');
  });

  it('should filter words by category', () => {
    const filtered = filterWords(DEFAULT_WORDS, 'moon');
    expect(filtered.length).toBeGreaterThanOrEqual(1);
    for (const w of filtered) {
      expect(w.category).toBe('moon');
    }
  });

  it('should deterministically select target word with PRNG seed', () => {
    const seed = 'ambassador_test_seed_123';
    const word1 = selectTargetWord(DEFAULT_WORDS, undefined, seed);
    const word2 = selectTargetWord(DEFAULT_WORDS, undefined, seed);

    expect(word1).not.toBeNull();
    expect(word2).not.toBeNull();
    expect(word1?.id).toBe(word2?.id);
    expect(word1?.word).toBe(word2?.word);
  });

  it('should select word matching specified category', () => {
    const selected = selectTargetWord(DEFAULT_WORDS, 'wind', 'seed_wind_1');
    expect(selected).not.toBeNull();
    expect(selected?.category).toBe('wind');
  });
});
