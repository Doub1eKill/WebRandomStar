import { createPRNG, randomChoice } from './prng.ts';

/**
 * Extracts display text from any spin item (Question, KeywordItem, or custom string wrapper)
 */
export function getDisplayText(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item.text === 'string') return item.text;
  if (typeof item.word === 'string') return item.word;
  if (typeof item.displayText === 'string') return item.displayText;
  return String(item);
}

/**
 * Generates an ordered sequence of items for the Carousel reel,
 * guaranteeing that the last item in the sequence is the targetItem.
 */
export function generateSpinReel<T extends { id: string; enabled?: boolean }>(
  allItems: T[],
  targetItem: T,
  reelLength: number = 30,
  seed?: string
): T[] {
  const enabledItems = allItems.filter(w => w.enabled !== false);
  const pool = enabledItems.length > 0 ? enabledItems : [targetItem];
  const prng = createPRNG(seed || `reel_seed_${Date.now()}`);

  const reel: T[] = [];
  for (let i = 0; i < reelLength - 1; i++) {
    reel.push(randomChoice(pool, prng));
  }
  // Ensure the final element is the predetermined target item
  reel.push(targetItem);
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
 * Gets the active visible item based on progress ratio (0 to 1)
 */
export function getWordAtProgress<T>(reel: T[], progress: number): T {
  if (reel.length === 0) {
    throw new Error('Reel cannot be empty');
  }
  const clamped = Math.max(0, Math.min(1, progress));
  const index = Math.min(Math.floor(clamped * reel.length), reel.length - 1);
  return reel[index];
}

