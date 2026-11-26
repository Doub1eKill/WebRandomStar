/**
 * Pre-rendered glow sprites for the Cosmic Canvas stage. Drawing a cached sprite with
 * drawImage is far cheaper than building a radial gradient per particle per frame, which
 * keeps the projector PC at 60 fps with a few hundred stars and sparkles on screen.
 */

export type Rgb = readonly [number, number, number];

/** Palette shared by the stage layers (Cosmic Diamond & Nebula Pageant, see tokens.css). */
export const STAGE_RGB = {
  violet: [124, 58, 237] as Rgb,      // --accent-nebula-violet #7c3aed
  lavender: [192, 132, 252] as Rgb,   // --accent-lavender #c084fc
  cyan: [56, 189, 248] as Rgb,        // --accent-diamond-cyan #38bdf8
  ice: [165, 243, 252] as Rgb,        // --star-gold / ice #a5f3fc
  gold: [245, 217, 138] as Rgb,       // gold accent #F5D98A
  white: [255, 255, 255] as Rgb,
  magenta: [192, 38, 211] as Rgb,     // deep nebula pink (#c026d3), used faintly
  indigo: [46, 16, 101] as Rgb        // deep nebula indigo (#2e1065)
} as const;

export const rgba = (c: Rgb, a: number): string => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

const makeCanvas = (size: number): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
};

/** Soft round glow: white-hot core fading through the tint to transparent. */
export function makeGlowSprite(tint: Rgb, size = 64, core = 0.18): HTMLCanvasElement | null {
  const canvas = makeCanvas(size);
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return null;
  const r = size / 2;
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(core, rgba(tint, 0.9));
  grad.addColorStop(0.45, rgba(tint, 0.28));
  grad.addColorStop(1, rgba(tint, 0));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/** Four-point diamond flare (long thin cross plus a small glow), for bright stars and sparkles. */
export function makeFlareSprite(tint: Rgb, size = 96): HTMLCanvasElement | null {
  const canvas = makeCanvas(size);
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return null;
  const r = size / 2;
  ctx.globalCompositeOperation = 'lighter';

  const glow = ctx.createRadialGradient(r, r, 0, r, r, r * 0.42);
  glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
  glow.addColorStop(0.3, rgba(tint, 0.7));
  glow.addColorStop(1, rgba(tint, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // Thin spikes: a tapered diamond along each axis
  const spike = (horizontal: boolean, length: number, width: number) => {
    const grad = horizontal
      ? ctx.createLinearGradient(r - length, r, r + length, r)
      : ctx.createLinearGradient(r, r - length, r, r + length);
    grad.addColorStop(0, rgba(tint, 0));
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(1, rgba(tint, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    if (horizontal) {
      ctx.moveTo(r - length, r);
      ctx.lineTo(r, r - width);
      ctx.lineTo(r + length, r);
      ctx.lineTo(r, r + width);
    } else {
      ctx.moveTo(r, r - length);
      ctx.lineTo(r + width, r);
      ctx.lineTo(r, r + length);
      ctx.lineTo(r - width, r);
    }
    ctx.closePath();
    ctx.fill();
  };
  spike(true, r * 0.98, size * 0.022);
  spike(false, r * 0.98, size * 0.022);
  return canvas;
}

/** Tiny deterministic PRNG (mulberry32) so baked layers look the same on every load. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
