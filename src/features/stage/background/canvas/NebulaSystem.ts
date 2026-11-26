import { makeFlareSprite, makeGlowSprite, rgba, seededRandom, STAGE_RGB, Rgb } from './sprites.ts';

interface ParallaxStar {
  x: number; // 0..1 of the layer width (wraps)
  y: number; // 0..1 of the viewport height
  size: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
  sprite: number; // index into the sprite table
  flare: boolean;
}

interface StarLayer {
  stars: ParallaxStar[];
  drift: number; // px/s of horizontal parallax drift at energy 1
}

/**
 * NebulaSystem: the deep-space backdrop of the Cosmic Canvas stage.
 *
 * - Two baked nebula layers (rendered once per resize into offscreen canvases): a wide, soft
 *   violet/indigo cloud field with carved dust lanes, and a nearer diagonal "galactic band"
 *   of cyan, lavender and a faint gold core. They drift at different rates for parallax.
 * - Three parallax star layers (far, mid, near) drawn from cached glow sprites, so each star
 *   costs one drawImage call. Near stars drift faster than far ones; a few carry flares.
 */
export class NebulaSystem {
  private far: HTMLCanvasElement | null = null;
  private band: HTMLCanvasElement | null = null;
  private layers: StarLayer[] = [];
  private sprites: (HTMLCanvasElement | null)[] = [];
  private flares: (HTMLCanvasElement | null)[] = [];
  private width = 0;
  private height = 0;
  private time = 0;
  private driftX = 0;

  constructor() {
    const tints: Rgb[] = [STAGE_RGB.white, STAGE_RGB.ice, STAGE_RGB.lavender, STAGE_RGB.gold];
    this.sprites = tints.map(t => makeGlowSprite(t, 32, 0.12));
    this.flares = tints.map(t => makeFlareSprite(t, 64));

    const rand = seededRandom(20260214);
    const layerSpecs = [
      { count: 120, size: [0.6, 1.3], alpha: [0.25, 0.6], drift: 2.5, flare: 0 },
      { count: 60, size: [1.1, 2.0], alpha: [0.35, 0.8], drift: 6, flare: 0.05 },
      { count: 22, size: [1.8, 3.2], alpha: [0.5, 1.0], drift: 12, flare: 0.45 }
    ];
    this.layers = layerSpecs.map(spec => ({
      drift: spec.drift,
      stars: Array.from({ length: spec.count }, () => {
        const pick = rand();
        return {
          x: rand(),
          y: Math.pow(rand(), 1.25) * 0.86,
          size: spec.size[0] + rand() * (spec.size[1] - spec.size[0]),
          alpha: spec.alpha[0] + rand() * (spec.alpha[1] - spec.alpha[0]),
          twinkleSpeed: 0.6 + rand() * 1.8,
          phase: rand() * Math.PI * 2,
          sprite: pick < 0.5 ? 0 : pick < 0.78 ? 1 : pick < 0.92 ? 2 : 3,
          flare: rand() < spec.flare
        };
      })
    }));
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.far = this.bakeFarLayer(width, height);
    this.band = this.bakeBandLayer(width, height);
  }

  /** `motion` scales drift and twinkle (0 freezes the layer, e.g. for reduced motion). */
  public update(dtMs: number, energy: number, motion: number): void {
    const dt = (dtMs / 1000) * motion;
    this.time += dt;
    this.driftX += dt * (0.35 + energy * 0.9);
  }

  public render(ctx: CanvasRenderingContext2D, intensity: number, energy: number): void {
    const w = this.width;
    const h = this.height;
    if (w <= 0 || h <= 0 || intensity <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Baked nebula clouds, oversized by 12 % so the slow sway never shows an edge.
    const breathe = 0.88 + 0.12 * Math.sin(this.time * 0.35);
    if (this.far) {
      const ox = Math.sin(this.time * 0.045) * w * 0.035 - w * 0.06;
      const oy = Math.cos(this.time * 0.038) * h * 0.02 - h * 0.06;
      ctx.globalAlpha = Math.min(1, 0.6 * intensity * breathe);
      ctx.drawImage(this.far, ox, oy, w * 1.12, h * 1.12);
    }
    if (this.band) {
      const ox = Math.sin(this.time * 0.07 + 1.3) * w * 0.05 - w * 0.06;
      const oy = Math.cos(this.time * 0.055) * h * 0.03 - h * 0.06;
      ctx.globalAlpha = Math.min(1, (0.7 + energy * 0.25) * intensity);
      ctx.drawImage(this.band, ox, oy, w * 1.12, h * 1.12);
    }

    // Parallax starfield
    for (let l = 0; l < this.layers.length; l++) {
      const layer = this.layers[l];
      const shift = (this.driftX * layer.drift) / Math.max(w, 1);
      for (const s of layer.stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(this.time * s.twinkleSpeed + s.phase);
        const a = s.alpha * twinkle * Math.min(1, intensity);
        if (a < 0.02) continue;
        let fx = (s.x - shift) % 1;
        if (fx < 0) fx += 1;
        const x = fx * w;
        const y = s.y * h;
        const sprite = s.flare ? this.flares[s.sprite] : this.sprites[s.sprite];
        if (!sprite) continue;
        const size = s.flare ? s.size * 9 * (0.75 + 0.25 * twinkle) : s.size * 4;
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      }
    }

    ctx.restore();
  }

  private bakeFarLayer(width: number, height: number): HTMLCanvasElement | null {
    if (typeof document === 'undefined') return null;
    // Half resolution is plenty for soft clouds and keeps the bake under a few ms.
    const w = Math.max(1, Math.round(width * 0.5));
    const h = Math.max(1, Math.round(height * 0.5));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const rand = seededRandom(7041);

    ctx.globalCompositeOperation = 'lighter';
    const palette: [Rgb, number][] = [
      [STAGE_RGB.violet, 0.11],
      [STAGE_RGB.indigo, 0.16],
      [STAGE_RGB.lavender, 0.05],
      [STAGE_RGB.magenta, 0.07],
      [STAGE_RGB.cyan, 0.07]
    ];
    for (let i = 0; i < 26; i++) {
      const [color, alpha] = palette[i % palette.length];
      const x = rand() * w;
      const y = rand() * h * 0.85;
      const r = (0.18 + rand() * 0.32) * Math.max(w, h);
      const sx = 0.7 + rand() * 0.9;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rand() * Math.PI);
      ctx.scale(sx, 1 / sx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, rgba(color, alpha));
      g.addColorStop(0.5, rgba(color, alpha * 0.4));
      g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.restore();
    }

    // Dark dust lanes carved out of the glow give the clouds depth and structure.
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 9; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = (0.08 + rand() * 0.16) * Math.max(w, h);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rand() * Math.PI);
      ctx.scale(2.4, 0.45);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.restore();
    }

    // Static stardust baked into the far layer (hundreds of stars for free).
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 520; i++) {
      const a = 0.08 + rand() * 0.4;
      const tint = rand() < 0.2 ? STAGE_RGB.ice : rand() < 0.1 ? STAGE_RGB.gold : STAGE_RGB.white;
      ctx.fillStyle = rgba(tint, a);
      ctx.fillRect(rand() * w, rand() * h, rand() < 0.85 ? 0.6 : 1.1, rand() < 0.85 ? 0.6 : 1.1);
    }
    return canvas;
  }

  private bakeBandLayer(width: number, height: number): HTMLCanvasElement | null {
    if (typeof document === 'undefined') return null;
    const w = Math.max(1, Math.round(width * 0.5));
    const h = Math.max(1, Math.round(height * 0.5));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const rand = seededRandom(9157);
    ctx.globalCompositeOperation = 'lighter';

    // A diagonal "galactic band" from lower-left to upper-right, built from elongated wisps.
    const angle = -0.36;
    const cx = w * 0.5;
    const cy = h * 0.42;
    const length = Math.hypot(w, h) * 0.62;
    const wisps: [Rgb, number][] = [
      [STAGE_RGB.violet, 0.14],
      [STAGE_RGB.cyan, 0.09],
      [STAGE_RGB.lavender, 0.1],
      [STAGE_RGB.ice, 0.05]
    ];
    for (let i = 0; i < 34; i++) {
      const t = rand() * 2 - 1;
      const across = (rand() - 0.5) * h * 0.22 * (1 - Math.abs(t) * 0.5);
      const x = cx + Math.cos(angle) * t * length - Math.sin(angle) * across;
      const y = cy + Math.sin(angle) * t * length + Math.cos(angle) * across;
      const [color, alpha] = wisps[i % wisps.length];
      const r = (0.05 + rand() * 0.11) * Math.max(w, h);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + (rand() - 0.5) * 0.5);
      ctx.scale(2.6 + rand() * 1.6, 0.55);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, rgba(color, alpha));
      g.addColorStop(0.55, rgba(color, alpha * 0.35));
      g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.restore();
    }

    // Warm gold core where the band is densest: the pageant's gold accent, kept faint.
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.22);
    core.addColorStop(0, rgba(STAGE_RGB.gold, 0.1));
    core.addColorStop(0.4, rgba(STAGE_RGB.lavender, 0.05));
    core.addColorStop(1, rgba(STAGE_RGB.lavender, 0));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.scale(2.2, 0.6);
    ctx.translate(-cx, -cy);
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Dense cluster stars along the band
    for (let i = 0; i < 260; i++) {
      const t = rand() * 2 - 1;
      const across = (rand() - 0.5) * (rand() - 0.5) * h * 0.4;
      const x = cx + Math.cos(angle) * t * length - Math.sin(angle) * across;
      const y = cy + Math.sin(angle) * t * length + Math.cos(angle) * across;
      ctx.fillStyle = rgba(rand() < 0.3 ? STAGE_RGB.ice : STAGE_RGB.white, 0.15 + rand() * 0.45);
      const s = rand() < 0.9 ? 0.7 : 1.3;
      ctx.fillRect(x, y, s, s);
    }
    return canvas;
  }
}
