import { KeywordItem } from '@/types/word.ts';
import { createPRNG, randomChoice } from '@/shared/lib/prng.ts';

/** The keywords that can be drawn: the enabled ones. */
export function filterWords(words: KeywordItem[]): KeywordItem[] {
  return words.filter(w => w.enabled);
}

/**
 * Deterministically select a target word using Mulberry32 PRNG
 */
export function selectTargetWord(words: KeywordItem[], seed?: string): KeywordItem | null {
  const eligible = filterWords(words);
  if (eligible.length === 0) {
    return null;
  }

  const prng = createPRNG(seed || `word_seed_${Date.now()}`);
  return randomChoice(eligible, prng);
}
