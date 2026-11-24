/**
 * Hash a string into a 32-bit integer seed
 */
export function hashString(str: string): number {
  let hash = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return hash >>> 0;
}

/**
 * Creates a seeded PRNG using the Mulberry32 algorithm
 * Returns a function that outputs deterministic floats in [0, 1)
 */
export function createPRNG(seed: string | number): () => number {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0;

  return function mulberry32(): number {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a random number between min and max (inclusive)
 */
export function randomRange(min: number, max: number, prng: () => number): number {
  return min + prng() * (max - min);
}

/**
 * Pick an item from an array deterministically
 */
export function randomChoice<T>(array: T[], prng: () => number): T {
  if (array.length === 0) {
    throw new Error('Cannot pick from empty array');
  }
  const index = Math.floor(prng() * array.length);
  return array[index];
}
