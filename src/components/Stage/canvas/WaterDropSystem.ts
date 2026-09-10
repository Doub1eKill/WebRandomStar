import { CondensationDrop } from './particleTypes.ts';

export class WaterDropSystem {
  private drops: CondensationDrop[] = [];
  private width: number = 0;
  private height: number = 0;
  public opacity: number = 0.0;

  constructor(count: number = 25) {
    for (let i = 0; i < count; i++) {
      this.drops.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        radius: 2.5 + Math.random() * 4.5,
        speed: 0.6 + Math.random() * 1.8,
        opacity: 0.3 + Math.random() * 0.5,
        trail: [],
        maxTrail: 15
      });
    }
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public update(): void {
    if (this.opacity <= 0.01) return;

    for (const drop of this.drops) {
      drop.trail.unshift({ x: drop.x, y: drop.y, alpha: 0.5 });
      if (drop.trail.length > drop.maxTrail) {
        drop.trail.pop();
      }

      // Slightly meandering trickle
      drop.y += drop.speed;
      drop.x += Math.sin(drop.y * 0.04) * 0.4;

      if (drop.y > this.height + 20) {
        drop.y = -10;
        drop.x = Math.random() * this.width;
        drop.trail = [];
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.opacity <= 0.01) return;

    ctx.save();
    for (const drop of this.drops) {
      const alpha = drop.opacity * this.opacity;
      if (alpha <= 0.01) continue;

      // Draw faint water trail
      for (let i = 0; i < drop.trail.length; i++) {
        const pt = drop.trail[i];
        const trailAlpha = (1 - i / drop.trail.length) * 0.25 * this.opacity;
        ctx.fillStyle = `rgba(200, 225, 255, ${trailAlpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, drop.radius * (1 - i / drop.trail.length * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw main glossy drop
      ctx.fillStyle = `rgba(220, 240, 255, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
      ctx.fill();

      // Drop highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(drop.x - drop.radius * 0.35, drop.y - drop.radius * 0.35, drop.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
