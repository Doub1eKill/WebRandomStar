import { createPRNG, randomChoice } from '@/shared/lib/prng.ts';

/**
 * Extracts display text from any spin item (Question, KeywordItem, or custom string wrapper)
 */
export function getDisplayText(item: unknown): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  const fields = item as { text?: unknown; word?: unknown; displayText?: unknown };
  if (typeof fields.text === 'string') return fields.text;
  if (typeof fields.word === 'string') return fields.word;
  if (typeof fields.displayText === 'string') return fields.displayText;
  return String(item);
}

/**
 * Generates an ordered sequence of items for the Carousel reel, with the target item at
 * `targetIndex` (the last slot by default) and random items from the pool everywhere else.
 */
export function generateSpinReel<T extends { id: string; enabled?: boolean }>(
  allItems: T[],
  targetItem: T,
  reelLength: number = 30,
  seed?: string,
  targetIndex: number = reelLength - 1
): T[] {
  const enabledItems = allItems.filter(w => w.enabled !== false);
  const pool = enabledItems.length > 0 ? enabledItems : [targetItem];
  const prng = createPRNG(seed || `reel_seed_${Date.now()}`);

  const reel: T[] = [];
  for (let i = 0; i < reelLength; i++) {
    reel.push(i === targetIndex ? targetItem : randomChoice(pool, prng));
  }
  return reel;
}

// ── Stopping the reel at the spin speed ─────────────────────────────────────────────────
// The reel spins at a constant speed, then brakes onto the target. The brake used to run a
// fixed-length ease-out to wherever the target happened to be (8 to 50 items away), so the
// reel jumped to 3–18× its spin speed before slowing down. Now the brake starts at exactly
// the spin speed and only ever slows down: the target is placed where an automatic spin
// will stop, and the brake curve is matched to the remaining distance.

/**
 * Reel speed while spinning, in items per millisecond. The question reel used to crawl at
 * 0.0038 (3.8 questions/s); the operator asked for it to spin about as fast as the keyword reel.
 */
export const SPIN_SPEED_ITEMS_PER_MS = { keyword: 0.013, question: 0.013 } as const;

/** How long the brake takes: inside the 2,000ms word-decelerate phase, so the reel rests before the lock. */
export const DECEL_DURATION_MS = 1700;

// Brake "shape" = distance / (spin speed × brake time). 1/3 is a cubic ease-out, 0.5 is even
// braking; above ~0.8 the reel would visibly speed up before slowing down.
const MIN_BRAKE_SHAPE = 1 / 3;
const MAX_BRAKE_SHAPE = 0.8;
const PREFERRED_BRAKE_SHAPE = 0.55;

/**
 * How far ahead of the centre each spin view shows items (window range + the 0.6 margin the
 * views render with; the orbital ring shows the next 7 slots). A slot further ahead than this
 * is off screen, so it can be changed without anyone seeing it.
 */
export function spinViewLookahead(mode: 'vertical' | 'orbital' | '3d' | 'ribbon', displayType: 'keyword' | 'question'): number {
  if (mode === 'orbital') return 7.6;
  if (mode === 'ribbon' && displayType === 'question') return 2.6;
  return 4.6;
}

/** Reel slot for the target, so that an automatic spin of `spinMs` brakes onto it with no change of speed. */
export function plannedTargetIndex(speed: number, spinMs: number, decelMs: number = DECEL_DURATION_MS): number {
  return Math.round(speed * spinMs + PREFERRED_BRAKE_SHAPE * speed * decelMs);
}

/**
 * Distance travelled after a fraction `t` (0–1) of the brake: a cubic Hermite curve that leaves
 * at `speed` (items/ms) and comes to rest exactly `distance` items later.
 */
export function brakePosition(t: number, distance: number, speed: number, decelMs: number = DECEL_DURATION_MS): number {
  const u = Math.max(0, Math.min(1, t));
  const momentum = speed * decelMs;
  return distance * (3 * u * u - 2 * u * u * u) + momentum * (u - 2 * u * u + u * u * u);
}

/**
 * Where the reel stops when the brake starts at `position`: the target's slot that lets it brake
 * smoothly from `speed`. If no such slot exists (a manual stop, or a paused or throttled spin),
 * the first slot past both the shortest smooth brake and the visible window is rewritten to the
 * target; `rewriteIndex` is that slot in the reel, or null when nothing needs to change.
 */
export function chooseStopSlot(
  reel: { id: string }[],
  targetId: string,
  position: number,
  speed: number,
  lookahead: number,
  decelMs: number = DECEL_DURATION_MS
): { stop: number; rewriteIndex: number | null } {
  const length = reel.length;
  const momentum = speed * decelMs;
  const wrap = (i: number) => ((i % length) + length) % length;

  const preferred = position + PREFERRED_BRAKE_SHAPE * momentum;
  let best: number | null = null;
  for (let i = Math.ceil(position + MIN_BRAKE_SHAPE * momentum); i <= Math.floor(position + MAX_BRAKE_SHAPE * momentum); i++) {
    if (reel[wrap(i)]?.id === targetId && (best === null || Math.abs(i - preferred) < Math.abs(best - preferred))) {
      best = i;
    }
  }
  if (best !== null) return { stop: best, rewriteIndex: null };

  const stop = Math.ceil(position + Math.max(MIN_BRAKE_SHAPE * momentum, lookahead));
  return { stop, rewriteIndex: wrap(stop) };
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

