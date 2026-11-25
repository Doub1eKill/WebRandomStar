import { MistPuff } from './particleTypes.ts';

export class MistSystem {
  private puffs: MistPuff[] = [];
  private width: number = 0;
  private height: number = 0;
  public density: number = 0.0; // 0 to 1

  constructor(count: number = 18) {
    for (let i = 0; i < count; i++) {
      this.puffs.push({
        x: Math.random() * 1920,
        y: 200 + Math.random() * 800,
        radius: 180 + Math.random() * 240,
        speedX: 0.3 + Math.random() * 0.5,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: 0.12 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public update(): void {
    if (this.density <= 0.01) return;

    for (const puff of this.puffs) {
      puff.x += puff.speedX;
      puff.y += Math.sin(puff.phase) * 0.3 + puff.speedY;
      puff.phase += 0.01;

      if (puff.x - puff.radius > this.width) {
        puff.x = -puff.radius;
        puff.y = Math.random() * this.height;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.density <= 0.01) return;

    ctx.save();
    for (const puff of this.puffs) {
      const alpha = puff.opacity * this.density;
      if (alpha <= 0.01) continue;

      const grad = ctx.createRadialGradient(
        puff.x, puff.y, 10,
        puff.x, puff.y, puff.radius
      );
      grad.addColorStop(0, `rgba(192, 132, 252, ${alpha * 0.45})`);
      grad.addColorStop(0.4, `rgba(147, 51, 234, ${alpha * 0.22})`);
      grad.addColorStop(0.8, `rgba(88, 28, 135, ${alpha * 0.1})`);
      grad.addColorStop(1, 'rgba(7, 8, 24, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
