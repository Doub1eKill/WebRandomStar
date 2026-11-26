import { makeFlareSprite, makeGlowSprite, rgba, STAGE_RGB, Rgb } from './sprites.ts';

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  drag: number;
  gravity: number;
  size: number;
  age: number;
  life: number;
  spin: number;
  rotation: number;
  sprite: number;
  flare: boolean;
}

interface Ring {
  x: number;
  y: number;
  age: number;
  life: number;
  radius: number;
  color: Rgb;
}

interface Flash {
  x: number;
  y: number;
  age: number;
  life: number;
  radius: number;
}

const MAX_SPARKLES = 320;
const TINTS: Rgb[] = [STAGE_RGB.white, STAGE_RGB.gold, STAGE_RGB.ice, STAGE_RGB.lavender];

/**
 * SparkleBurstSystem: one-shot celebration effects for the Cosmic Canvas stage.
 *
 * - burst(): a diamond-dust explosion with expanding shockwave rings and a soft flash, fired when
 *   the word locks (or the question is revealed straight after the spin).
 * - shower(): a gentle gold-and-diamond rain from the top edge, fired when the operator presses
 *   Done and the stage returns to idle.
 * Particles are capped, use cached sprites and expire within ~2.5 s.
 */
export class SparkleBurstSystem {
  private sparkles: Sparkle[] = [];
  private rings: Ring[] = [];
  private flashes: Flash[] = [];
  private width = 0;
  private height = 0;
  private glows = TINTS.map(t => makeGlowSprite(t, 32, 0.2));
  private flares = TINTS.map(t => makeFlareSprite(t, 64));

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public get active(): boolean {
    return this.sparkles.length > 0 || this.rings.length > 0 || this.flashes.length > 0;
  }

  public burst(x: number, y: number, count = 110, scale = 1): void {
    const room = Math.max(0, MAX_SPARKLES - this.sparkles.length);
    const n = Math.min(count, room);
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (260 + Math.pow(Math.random(), 0.7) * 1100) * scale;
      const pick = Math.random();
      this.sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.72,
        drag: 1.1 + Math.random() * 0.9,
        gravity: 40 + Math.random() * 60,
        size: 3.5 + Math.random() * 6,
        age: 0,
        life: 1.2 + Math.random() * 1.2,
        spin: (Math.random() - 0.5) * 6,
        rotation: Math.random() * Math.PI,
        sprite: pick < 0.35 ? 0 : pick < 0.65 ? 1 : pick < 0.85 ? 2 : 3,
        flare: Math.random() < 0.35
      });
    }
    const base = Math.min(this.width, this.height);
    this.rings.push({ x, y, age: 0, life: 1.1, radius: base * 0.55 * scale, color: STAGE_RGB.gold });
    this.rings.push({ x, y, age: -0.12, life: 1.3, radius: base * 0.75 * scale, color: STAGE_RGB.cyan });
    this.flashes.push({ x, y, age: 0, life: 0.7, radius: base * 0.45 * scale });
  }

  public shower(count = 90): void {
    const room = Math.max(0, MAX_SPARKLES - this.sparkles.length);
    const n = Math.min(count, room);
    for (let i = 0; i < n; i++) {
      this.sparkles.push({
        x: Math.random() * this.width,
        y: -10 - Math.random() * this.height * 0.15,
        vx: (Math.random() - 0.5) * 40,
        vy: 140 + Math.random() * 180,
        drag: 0.2,
        gravity: 30,
        size: 3.5 + Math.random() * 5.5,
        age: 0,
        life: 2.2 + Math.random() * 1.4,
        spin: (Math.random() - 0.5) * 3,
        rotation: Math.random() * Math.PI,
        sprite: Math.random() < 0.6 ? 1 : 0,
        flare: Math.random() < 0.55
      });
    }
  }

  public update(dtMs: number): void {
    if (!this.active) return;
    const dt = dtMs / 1000;
    for (const p of this.sparkles) {
      p.age += dt;
      const damp = Math.exp(-p.drag * dt);
      p.vx *= damp;
      p.vy = p.vy * damp + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.spin * dt;
    }
    this.sparkles = this.sparkles.filter(p => p.age < p.life && p.y < this.height + 40);
    for (const r of this.rings) r.age += dt;
    this.rings = this.rings.filter(r => r.age < r.life);
    for (const f of this.flashes) f.age += dt;
    this.flashes = this.flashes.filter(f => f.age < f.life);
  }

  public render(ctx: CanvasRenderingContext2D, intensity: number): void {
    if (!this.active) return;
    const k = Math.min(1.4, Math.max(0.3, intensity));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (const f of this.flashes) {
      const t = f.age / f.life;
      const a = (1 - t) * (1 - t) * 0.55 * k;
      const r = f.radius * (0.6 + t * 0.6);
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      g.addColorStop(0, rgba(STAGE_RGB.white, a));
      g.addColorStop(0.25, rgba(STAGE_RGB.gold, a * 0.5));
      g.addColorStop(1, rgba(STAGE_RGB.violet, 0));
      ctx.fillStyle = g;
      ctx.fillRect(f.x - r, f.y - r, r * 2, r * 2);
    }

    for (const ring of this.rings) {
      if (ring.age <= 0) continue;
      const t = ring.age / ring.life;
      const ease = 1 - Math.pow(1 - t, 3);
      const a = (1 - t) * 0.6 * k;
      ctx.strokeStyle = rgba(ring.color, a);
      ctx.lineWidth = 1 + (1 - t) * 5;
      ctx.beginPath();
      ctx.ellipse(ring.x, ring.y, ring.radius * ease, ring.radius * ease * 0.62, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const p of this.sparkles) {
      const t = p.age / p.life;
      const twinkle = 0.7 + 0.3 * Math.sin(p.age * 18 + p.rotation * 3);
      const a = Math.min(1, (1 - t) * 1.4) * twinkle * Math.min(1, k);
      if (a <= 0.02) continue;
      const sprite = p.flare ? this.flares[p.sprite] : this.glows[p.sprite];
      if (!sprite) continue;
      const size = p.flare ? p.size * 5 : p.size * 2.4;
      ctx.globalAlpha = a;
      if (p.flare) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
        ctx.restore();
      } else {
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
    }
    ctx.restore();
  }
}
