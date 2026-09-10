import { MeteorTrajectory } from '../../../types/session.ts';

interface StardustSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class MeteorSystem {
  public active: boolean = false;
  private trajectory: MeteorTrajectory | null = null;
  private currentX: number = 0;
  private currentY: number = 0;
  private hasStruck: boolean = false;
  public onImpactCallback?: () => void;
  private trail: { x: number; y: number; alpha: number }[] = [];
  private sparks: StardustSpark[] = [];

  public startMeteor(traj: MeteorTrajectory, onImpact?: () => void): void {
    this.trajectory = traj;
    this.currentX = traj.startX;
    this.currentY = traj.startY;
    this.hasStruck = false;
    this.active = true;
    this.trail = [];
    this.sparks = [];
    this.onImpactCallback = onImpact;
  }

  public reset(): void {
    this.active = false;
    this.hasStruck = false;
    this.trajectory = null;
    this.trail = [];
    this.sparks = [];
  }

  public update(): void {
    if (!this.active || !this.trajectory) return;

    // Update stardust sparks after impact
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const spark = this.sparks[i];
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.life++;
      spark.vx *= 0.96;
      spark.vy *= 0.96;
      if (spark.life >= spark.maxLife) {
        this.sparks.splice(i, 1);
      }
    }

    if (this.hasStruck) return;

    // Record trail
    this.trail.unshift({ x: this.currentX, y: this.currentY, alpha: 1.0 });
    if (this.trail.length > 28) {
      this.trail.pop();
    }

    // Step toward target
    const dx = this.trajectory.targetX - this.currentX;
    const dy = this.trajectory.targetY - this.currentY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.trajectory.speed) {
      // Impact!
      this.currentX = this.trajectory.targetX;
      this.currentY = this.trajectory.targetY;
      this.hasStruck = true;
      this.createExplosion(this.currentX, this.currentY);
      this.onImpactCallback?.();
    } else {
      this.currentX += (dx / dist) * this.trajectory.speed;
      this.currentY += (dy / dist) * this.trajectory.speed;
    }
  }

  private createExplosion(x: number, y: number): void {
    const sparkCount = 45;
    const colors = ['#ffffff', '#fde047', '#38bdf8', '#fbbf24'];

    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 30 + Math.random() * 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 3.5
      });
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    // 1. Draw glowing meteor trail
    for (let i = 0; i < this.trail.length; i++) {
      const pt = this.trail[i];
      const ratio = 1 - i / this.trail.length;
      const width = ratio * 7 + 1;

      ctx.strokeStyle = `rgba(56, 189, 248, ${ratio * 0.75})`;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';

      if (i > 0) {
        const prev = this.trail[i - 1];
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }
    }

    // 2. Draw meteor burning head (before impact)
    if (!this.hasStruck) {
      const headGlow = ctx.createRadialGradient(
        this.currentX, this.currentY, 2,
        this.currentX, this.currentY, 24
      );
      headGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
      headGlow.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)');
      headGlow.addColorStop(0.7, 'rgba(253, 224, 71, 0.4)');
      headGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');

      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(this.currentX, this.currentY, 24, 0, Math.PI * 2);
      ctx.fill();

      // Bright white core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.currentX, this.currentY, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw stardust sparks
    for (const spark of this.sparks) {
      const alpha = 1 - spark.life / spark.maxLife;
      ctx.fillStyle = spark.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
