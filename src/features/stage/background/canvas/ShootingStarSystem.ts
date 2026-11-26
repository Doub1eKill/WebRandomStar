import { makeGlowSprite, rgba, STAGE_RGB } from './sprites.ts';

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  age: number;
  life: number;
  gold: boolean;
}

const MAX_METEORS = 6;

/**
 * ShootingStarSystem: occasional meteors streaking across the upper sky, with a white head and a
 * violet tail (--meteor-head / --meteor-tail in tokens.css); about one in five is gold. How often
 * they appear scales with stage energy, so the sky comes alive during the spin and stays calm
 * while a question is on screen. Spawning stops entirely under reduced motion.
 */
export class ShootingStarSystem {
  private meteors: Meteor[] = [];
  private width = 0;
  private height = 0;
  private cooldown = 1.5;
  private head = makeGlowSprite(STAGE_RGB.ice, 48, 0.2);
  private goldHead = makeGlowSprite(STAGE_RGB.gold, 48, 0.2);

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /** `rate` is meteors per second on average (0 = none). */
  public update(dtMs: number, rate: number, enabled: boolean): void {
    const dt = dtMs / 1000;
    if (enabled && rate > 0.001) {
      this.cooldown -= dt;
      if (this.cooldown <= 0) {
        this.spawn();
        // Exponential-ish gaps with a floor, so they never come in a regular rhythm
        const mean = 1 / rate;
        this.cooldown = mean * (0.4 + Math.random() * 1.2);
      }
    }
    for (const m of this.meteors) {
      m.age += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
    }
    this.meteors = this.meteors.filter(m => m.age < m.life);
  }

  /** Launch a meteor immediately (used for the word-lock flourish). */
  public spawn(fromLeft = Math.random() < 0.5): void {
    if (this.meteors.length >= MAX_METEORS || this.width <= 0) return;
    // Angle below the horizon: shallow, so the streak crosses the sky rather than falling.
    const angle = 0.28 + Math.random() * 0.3;
    const speed = 900 + Math.random() * 600;
    this.meteors.push({
      x: fromLeft ? Math.random() * this.width * 0.55 : this.width * (0.45 + Math.random() * 0.55),
      y: Math.random() * this.height * 0.35,
      vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
      vy: Math.sin(angle) * speed,
      length: 140 + Math.random() * 160,
      age: 0,
      life: 0.8 + Math.random() * 0.5,
      gold: Math.random() < 0.2
    });
  }

  public render(ctx: CanvasRenderingContext2D, intensity: number): void {
    if (this.meteors.length === 0 || intensity <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const m of this.meteors) {
      const t = m.age / m.life;
      const fade = Math.sin(Math.PI * Math.min(1, t)) * Math.min(1, intensity);
      if (fade <= 0.01) continue;
      const speed = Math.hypot(m.vx, m.vy) || 1;
      const tx = m.x - (m.vx / speed) * m.length;
      const ty = m.y - (m.vy / speed) * m.length;
      const tail = m.gold ? STAGE_RGB.gold : STAGE_RGB.violet;

      const grad = ctx.createLinearGradient(tx, ty, m.x, m.y);
      grad.addColorStop(0, rgba(tail, 0));
      grad.addColorStop(0.6, rgba(tail, 0.45 * fade));
      grad.addColorStop(1, rgba(STAGE_RGB.white, 0.95 * fade));
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      const sprite = m.gold ? this.goldHead : this.head;
      if (sprite) {
        ctx.globalAlpha = fade;
        ctx.drawImage(sprite, m.x - 14, m.y - 14, 28, 28);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }
}
