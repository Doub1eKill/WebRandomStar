import { RainDrop } from './particleTypes.ts';

export class RainSystem {
  private drops: RainDrop[] = [];
  private width: number = 0;
  private height: number = 0;
  public intensity: number = 1.0; // 0 (stopped) to 1 (full rain)

  constructor(count: number = 120) {
    for (let i = 0; i < count; i++) {
      this.drops.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        length: 15 + Math.random() * 25,
        speed: 12 + Math.random() * 14,
        opacity: 0.2 + Math.random() * 0.4,
        angle: 0.18, // slightly slanted
        width: 1 + Math.random() * 1.5
      });
    }
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public update(): void {
    if (this.intensity <= 0.01) return;

    for (const drop of this.drops) {
      drop.x += Math.sin(drop.angle) * drop.speed;
      drop.y += Math.cos(drop.angle) * drop.speed;

      if (drop.y > this.height) {
        drop.y = -drop.length - Math.random() * 50;
        drop.x = Math.random() * (this.width + 200) - 100;
      }
      if (drop.x > this.width + 100) {
        drop.x = -50;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.intensity <= 0.01) return;

    ctx.save();
    ctx.lineCap = 'round';

    for (const drop of this.drops) {
      const alpha = drop.opacity * this.intensity;
      if (alpha <= 0.01) continue;

      ctx.strokeStyle = `rgba(224, 231, 255, ${alpha * 0.8})`;
      ctx.lineWidth = drop.width;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 4;

      const endX = drop.x + Math.sin(drop.angle) * drop.length;
      const endY = drop.y + Math.cos(drop.angle) * drop.length;

      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    ctx.restore();
  }
}
