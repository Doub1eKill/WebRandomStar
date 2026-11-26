import { KeywordItem } from '@/types/word.ts';
import { createPRNG, randomChoice } from '@/shared/lib/prng.ts';

/** The keywords that can be drawn: the enabled ones. */
export function filterWords(words: KeywordItem[]): KeywordItem[] {
  return words.filter(w => w.enabled);
}

/** True when every enabled keyword is in `usedWordIds`, so the next draw has to repeat one. */
export function allWordsUsed(words: KeywordItem[], usedWordIds: string[] = []): boolean {
  const eligible = filterWords(words);
  return eligible.length > 0 && eligible.every(w => usedWordIds.includes(w.id));
}

/**
 * Deterministically select a target word using Mulberry32 PRNG. Words in `usedWordIds` are
 * skipped until every enabled word is used; then any enabled word can come up again.
 */
export function selectTargetWord(words: KeywordItem[], seed?: string, usedWordIds: string[] = []): KeywordItem | null {
  const eligible = filterWords(words);
  if (eligible.length === 0) {
    return null;
  }
  const unused = eligible.filter(w => !usedWordIds.includes(w.id));

  const prng = createPRNG(seed || `word_seed_${Date.now()}`);
  return randomChoice(unused.length > 0 ? unused : eligible, prng);
}
