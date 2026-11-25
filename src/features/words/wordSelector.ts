import { KeywordItem } from '@/types/word.ts';
import { createPRNG, randomChoice } from '@/shared/lib/prng.ts';

/**
 * Filter words that are enabled and optionally belong to a specific category
 */
export function filterWords(words: KeywordItem[], category?: string): KeywordItem[] {
  let filtered = words.filter(w => w.enabled);
  if (category && category.trim() !== '') {
    const targetCat = category.toLowerCase().trim();
    const catFiltered = filtered.filter(w => w.category.toLowerCase().trim() === targetCat);
    if (catFiltered.length > 0) {
      filtered = catFiltered;
    }
  }
  return filtered;
}

/**
 * Deterministically select a target word using Mulberry32 PRNG
 */
export function selectTargetWord(
  words: KeywordItem[],
  category?: string,
  seed?: string
): KeywordItem | null {
  const eligible = filterWords(words, category);
  if (eligible.length === 0) {
    return null;
  }

  const prng = createPRNG(seed || `word_seed_${Date.now()}`);
  return randomChoice(eligible, prng);
}
