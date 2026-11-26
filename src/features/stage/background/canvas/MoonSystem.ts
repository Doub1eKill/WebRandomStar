import { makeFlareSprite, rgba, seededRandom, STAGE_RGB } from './sprites.ts';

/**
 * MoonSystem: the luminous moon in the upper right of the Cosmic Canvas stage, in the stage
 * palette: --moon-silver #f8fafc with a lavender --moon-glow halo and violet-indigo shading.
 *
 * The moon body is baked once per resize: a limb-darkened sphere with maria and craters, cut to
 * a waxing crescent by a soft terminator. The dark side keeps a faint blue earthshine instead of
 * a flat disc painted over the sky (the old crescent showed a dark circle against the nebula).
 * Each frame adds the live light: layered violet/ice halos, a thin 22-degree ice halo ring, a
 * corona glint on the lit limb, two thin wisps of cloud drifting across the face, and a
 * shimmering moonlight path on the water when the reflection is switched on.
 */
export class MoonSystem {
  private time = 0;
  private body: HTMLCanvasElement | null = null;
  private radius = 40;
  private x = 0;
  private y = 0;
  private width = 0;
  private height = 0;
  private glint = makeFlareSprite(STAGE_RGB.ice, 128);

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.radius = Math.max(36, Math.min(height * 0.085, 112));
    this.x = width * 0.82;
    this.y = height * 0.2;
    this.body = this.bake(this.radius);
  }

  public update(dtMs: number, motion: number): void {
    this.time += (dtMs / 1000) * motion;
  }

  public render(ctx: CanvasRenderingContext2D, opacity: number, glow: number): void {
    if (opacity <= 0.01 || !this.body) return;
    const R = this.radius;
    const { x, y } = this;
    const t = this.time;
    // Boosted so the moon is a feature even at the idle phase's moonOpacity (0.5)
    const a = Math.min(1, 0.5 + 0.8 * opacity);
    const g = Math.min(1.5, glow);
    const breathe = 0.88 + 0.12 * Math.sin(t * 0.9);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Wide violet aura, then a tighter ice-white glow
    const aura = ctx.createRadialGradient(x, y, R * 0.8, x, y, R * 7);
    aura.addColorStop(0, rgba(STAGE_RGB.lavender, 0.22 * a * g * breathe));
    aura.addColorStop(0.35, rgba(STAGE_RGB.violet, 0.1 * a * g));
    aura.addColorStop(1, rgba(STAGE_RGB.violet, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(x - R * 7, y - R * 7, R * 14, R * 14);

    const inner = ctx.createRadialGradient(x, y, R * 0.9, x, y, R * 2.6);
    inner.addColorStop(0, rgba(STAGE_RGB.white, 0.45 * a * g));
    inner.addColorStop(0.4, rgba(STAGE_RGB.ice, 0.16 * a * g));
    inner.addColorStop(1, rgba(STAGE_RGB.ice, 0));
    ctx.fillStyle = inner;
    ctx.fillRect(x - R * 2.6, y - R * 2.6, R * 5.2, R * 5.2);

    // 22-degree halo ring: thin, icy, slightly brighter on top
    const ringR = R * 4.1;
    const ring = ctx.createLinearGradient(x, y - ringR, x, y + ringR);
    ring.addColorStop(0, rgba(STAGE_RGB.ice, 0.16 * a * breathe));
    ring.addColorStop(0.5, rgba(STAGE_RGB.lavender, 0.08 * a));
    ring.addColorStop(1, rgba(STAGE_RGB.ice, 0.03 * a));
    ctx.strokeStyle = ring;
    ctx.lineWidth = Math.max(2, R * 0.09);
    ctx.beginPath();
    ctx.arc(x, y, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = Math.max(4, R * 0.28);
    ctx.globalAlpha = 0.35;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Moon body: solid, so the violet sky never shows through and greys it
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = Math.min(1, 0.7 + 0.8 * opacity);
    ctx.drawImage(this.body, x - R * 1.1, y - R * 1.1, R * 2.2, R * 2.2);
    ctx.globalAlpha = 1;

    // Thin cloud wisps drifting across the face
    for (let i = 0; i < 2; i++) {
      const span = R * 7;
      const phase = ((t * (0.035 + i * 0.015) + i * 0.55) % 1) * span - span / 2;
      const wx = x + phase;
      const wy = y + R * (i === 0 ? 0.35 : -0.45);
      const wr = R * (1.6 + i * 0.4);
      ctx.save();
      ctx.translate(wx, wy);
      ctx.scale(1, 0.16);
      const wisp = ctx.createRadialGradient(0, 0, 0, 0, 0, wr);
      wisp.addColorStop(0, `rgba(124, 58, 237, ${0.3 * a})`);
      wisp.addColorStop(1, 'rgba(124, 58, 237, 0)');
      ctx.fillStyle = wisp;
      ctx.fillRect(-wr, -wr, wr * 2, wr * 2);
      ctx.restore();
    }

    // Corona glint on the lit limb
    const glintPulse = 0.55 + 0.45 * Math.pow(Math.max(0, Math.sin(t * 0.7)), 6);
    if (this.glint) {
      ctx.globalCompositeOperation = 'lighter';
      const size = R * 2.4 * glintPulse;
      ctx.globalAlpha = 0.75 * a * glintPulse;
      ctx.drawImage(this.glint, x + R * 0.62 - size / 2, y - R * 0.55 - size / 2, size, size);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /** Moonlight path on the water below the moon (drawn after the water layer). */
  public renderReflection(ctx: CanvasRenderingContext2D, opacity: number, glow: number): void {
    if (opacity <= 0.01 || this.width <= 0) return;
    const R = this.radius;
    const waterY = this.height * 0.8;
    const t = this.time;
    const a = Math.min(1, 0.4 + 0.9 * opacity) * Math.min(1.3, glow);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const rows = 26;
    const rowH = (this.height - waterY) / rows;
    for (let i = 0; i < rows; i++) {
      const depth = i / rows;
      const wobble = Math.sin(t * 2.2 + i * 1.7) * 0.5 + Math.sin(t * 1.3 + i * 0.6) * 0.5;
      const w = R * (0.7 + depth * 2.2) * (0.7 + 0.3 * wobble);
      const cx = this.x + Math.sin(t * 0.8 + i * 0.9) * R * 0.25 * depth;
      const alpha = (0.5 - depth * 0.38) * a * (0.6 + 0.4 * Math.sin(t * 3 + i * 2.1));
      if (alpha <= 0.005) continue;
      const grad = ctx.createLinearGradient(cx - w, 0, cx + w, 0);
      grad.addColorStop(0, rgba(STAGE_RGB.ice, 0));
      grad.addColorStop(0.5, rgba(STAGE_RGB.white, alpha));
      grad.addColorStop(1, rgba(STAGE_RGB.ice, 0));
      ctx.fillStyle = grad;
      ctx.fillRect(cx - w, waterY + i * rowH, w * 2, Math.max(1.5, rowH * 0.55));
    }
    ctx.restore();
  }

  private bake(R: number): HTMLCanvasElement | null {
    if (typeof document === 'undefined') return null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = Math.ceil(R * 2.2 * dpr);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(dpr, dpr);
    ctx.translate(R * 1.1, R * 1.1);
    const rand = seededRandom(1969);

    // Sphere with limb darkening, lit from the upper right
    const sphere = ctx.createRadialGradient(R * 0.25, -R * 0.3, R * 0.1, 0, 0, R);
    sphere.addColorStop(0, '#FFFFFF');
    sphere.addColorStop(0.45, '#F8FAFC');
    sphere.addColorStop(0.85, '#E0E7FF');
    sphere.addColorStop(1, '#C4B5FD');
    ctx.fillStyle = sphere;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.clip();

    // Maria: large soft grey-violet seas
    for (let i = 0; i < 7; i++) {
      const mx = (rand() - 0.4) * R * 1.3;
      const my = (rand() - 0.5) * R * 1.3;
      const mr = R * (0.2 + rand() * 0.32);
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
      g.addColorStop(0, 'rgba(167, 139, 250, 0.2)');
      g.addColorStop(1, 'rgba(167, 139, 250, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
    }

    // Craters: dark bowl with a bright rim on the sunward side
    for (let i = 0; i < 11; i++) {
      const ang = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * R * 0.85;
      const cx = Math.cos(ang) * dist;
      const cy = Math.sin(ang) * dist;
      const cr = R * (0.03 + rand() * 0.09);
      ctx.fillStyle = 'rgba(167, 139, 250, 0.12)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = Math.max(0.6, cr * 0.25);
      ctx.beginPath();
      ctx.arc(cx, cy, cr, -Math.PI * 0.15, Math.PI * 0.6);
      ctx.stroke();
    }

    // Soft terminator: the shadowed side keeps a faint blue earthshine (source-atop keeps it
    // inside the disc, so no dark circle is painted over the sky)
    ctx.globalCompositeOperation = 'source-atop';
    // Waxing gibbous: the shadow disc sits well to the left, leaving most of the face lit
    const sx = -R * 1.22;
    const sy = R * 0.1;
    const shadow = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 1.02);
    shadow.addColorStop(0, 'rgba(46, 16, 101, 0.78)');
    shadow.addColorStop(0.8, 'rgba(46, 16, 101, 0.7)');
    shadow.addColorStop(1, 'rgba(46, 16, 101, 0)');
    ctx.fillStyle = shadow;
    ctx.fillRect(-R * 1.1, -R * 1.1, R * 2.2, R * 2.2);
    ctx.restore();

    // Bright rim on the lit limb
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(1, R * 0.04);
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.985, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();
    // Faint earthshine rim on the dark limb
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.985, Math.PI * 0.75, Math.PI * 1.25);
    ctx.stroke();
    return canvas;
  }
}
