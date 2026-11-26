import { describe, it, expect } from 'vitest';
import { filterWords, selectTargetWord, allWordsUsed } from '@/features/words/wordSelector.ts';
import { DEFAULT_WORDS } from '@/data/defaultWords.ts';

describe('Word Selector Engine', () => {
  it('should filter enabled words', () => {
    const words = [
      { id: '1', word: 'A', enabled: true },
      { id: '2', word: 'B', enabled: false }
    ];
    const filtered = filterWords(words);
    expect(filtered.length).toBe(1);
    expect(filtered[0].word).toBe('A');
  });

  it('should deterministically select target word with PRNG seed', () => {
    const seed = 'ambassador_test_seed_123';
    const word1 = selectTargetWord(DEFAULT_WORDS, seed);
    const word2 = selectTargetWord(DEFAULT_WORDS, seed);

    expect(word1).not.toBeNull();
    expect(word2).not.toBeNull();
    expect(word1?.id).toBe(word2?.id);
    expect(word1?.word).toBe(word2?.word);
  });

  it('draws only from the enabled words', () => {
    const words = [
      { id: '1', word: 'A', enabled: false },
      { id: '2', word: 'B', enabled: true }
    ];
    for (let i = 0; i < 10; i++) expect(selectTargetWord(words, `seed_${i}`)?.id).toBe('2');
  });

  it('skips used words until every enabled word is used, then repeats', () => {
    const words = [
      { id: 'a', word: 'A', enabled: true },
      { id: 'b', word: 'B', enabled: true },
      { id: 'c', word: 'C', enabled: false }
    ];
    for (let i = 0; i < 10; i++) expect(selectTargetWord(words, `seed_${i}`, ['a'])?.id).toBe('b');
    expect(allWordsUsed(words, ['a'])).toBe(false);
    expect(allWordsUsed(words, ['a', 'b'])).toBe(true);
    expect(['a', 'b']).toContain(selectTargetWord(words, 'seed_x', ['a', 'b'])?.id);
  });
});
