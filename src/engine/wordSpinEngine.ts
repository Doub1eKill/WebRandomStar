import { KeywordItem } from '../types/word.ts';
import { createPRNG, randomChoice } from './prng.ts';

/**
 * Generates an ordered sequence of words for the Word Carousel reel,
 * guaranteeing that the last word in the sequence is the targetWord.
 */
export function generateSpinReel(
  allWords: KeywordItem[],
  targetWord: KeywordItem,
  reelLength: number = 30,
  seed?: string
): KeywordItem[] {
  const enabledWords = allWords.filter(w => w.enabled);
  const pool = enabledWords.length > 0 ? enabledWords : [targetWord];
  const prng = createPRNG(seed || `reel_seed_${Date.now()}`);

  const reel: KeywordItem[] = [];
  for (let i = 0; i < reelLength - 1; i++) {
    reel.push(randomChoice(pool, prng));
  }
  // Ensure the final element is the predetermined target word
  reel.push(targetWord);
  return reel;
}

/**
 * Calculates a continuous stopping target index on the reel that:
 * 1. Is ahead of currentFloat by at least minRunway items (smooth deceleration runway)
 * 2. Matches targetIndex modulo reelLength so it lands precisely on the predetermined target word
 * 3. Never causes backwards movement or positional discontinuity
 */
export function calculateContinuousDecelTarget(
  currentFloat: number,
  reelLength: number,
  targetIndex: number,
  minRunway: number = 12
): number {
  const safeLength = Math.max(1, reelLength);
  const safeTarget = ((targetIndex % safeLength) + safeLength) % safeLength;
  const rawTarget = currentFloat + minRunway;
  const cycles = Math.floor(rawTarget / safeLength);
  let candidate = cycles * safeLength + safeTarget;
  if (candidate < currentFloat + minRunway) {
    candidate += safeLength;
  }
  return candidate;
}

/**
 * Deceleration easing curve: fast initial spin with smooth exponential/cubic ease-out
 */
export function calculateDecelerationEasing(t: number): number {
  // Clamp between 0 and 1
  const clamped = Math.max(0, Math.min(1, t));
  // 1 - (1 - t)^3 (Cubic ease out)
  return 1 - Math.pow(1 - clamped, 3);
}

/**
 * High-precision quintic deceleration curve for ultra-silky gradual stop (zero harsh deceleration spike)
 */
export function calculateQuinticDecel(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 4);
}

/**
 * Gets the active visible word item based on progress ratio (0 to 1)
 */
export function getWordAtProgress(reel: KeywordItem[], progress: number): KeywordItem {
  if (reel.length === 0) {
    throw new Error('Reel cannot be empty');
  }
  const clamped = Math.max(0, Math.min(1, progress));
  const index = Math.min(Math.floor(clamped * reel.length), reel.length - 1);
  return reel[index];
}

