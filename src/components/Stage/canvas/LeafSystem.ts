import { LeafParticle } from './particleTypes.ts';

interface LeafTrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

interface LeafRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export class LeafSystem {
  private ambientLeaves: LeafParticle[] = [];
  public heroLeaf: LeafParticle | null = null;
  private heroTrail: LeafTrailParticle[] = [];
  private ripples: LeafRipple[] = [];
  public onHeroLeafLanded?: () => void;
  private width: number = 0;
  private height: number = 0;
  public active: boolean = false;
  public heroLanded: boolean = false;
  public opacity: number = 0.0;

  private colors = [
    '#d97706', // amber
    '#b45309', // deep amber
    '#ca8a04', // golden autumn
    '#ea580c', // orange red
    '#92400e'  // warm rust
  ];

  constructor(ambientCount: number = 16) {
    for (let i = 0; i < ambientCount; i++) {
      this.ambientLeaves.push(this.createRandomLeaf());
    }
  }

  private createRandomLeaf(): LeafParticle {
    return {
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      size: 14 + Math.random() * 18,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      vx: 1.5 + Math.random() * 2.5,
      vy: 0.8 + Math.random() * 1.5,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      shapeType: Math.random() < 0.5 ? 'oval' : 'willow',
      opacity: 0.6 + Math.random() * 0.3
    };
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public reset(): void {
    this.heroLeaf = null;
    this.heroLanded = false;
    this.heroTrail = [];
    this.ripples = [];
    this.active = false;
  }

  public spawnHeroLeaf(targetX: number, targetY: number): void {
    this.heroLeaf = {
      x: -40,
      y: this.height * 0.35 + (Math.random() - 0.5) * 100,
      size: 32,
      rotation: 0,
      rotSpeed: 0.04,
      vx: 4.5,
      vy: 1.8,
      color: '#f59e0b',
      shapeType: 'maple',
      opacity: 1,
      targetX,
      targetY
    };
    this.heroLanded = false;
    this.heroTrail = [];
    this.ripples = [];
  }

  private spawnRipples(x: number, y: number): void {
    const delays = [0, 16, 32];
    delays.forEach((delay, idx) => {
      setTimeout(() => {
        this.ripples.push({
          x,
          y,
          radius: 8 + idx * 6,
          maxRadius: 220 + idx * 40,
          alpha: 1.0,
          speed: 3.6 - idx * 0.35
        });
      }, delay * 16);
    });
  }

  public update(): void {
    if (!this.active && this.opacity <= 0.01) return;

    // Update ambient leaves
    for (const leaf of this.ambientLeaves) {
      leaf.x += leaf.vx;
      leaf.y += leaf.vy + Math.sin(leaf.x * 0.02) * 0.8;
      leaf.rotation += leaf.rotSpeed;

      if (leaf.x > this.width + 50 || leaf.y > this.height + 50) {
        leaf.x = -40;
        leaf.y = Math.random() * this.height * 0.7;
      }
    }

    // Update hero selection leaf & emit golden stardust
    if (this.heroLeaf && !this.heroLanded) {
      const targetX = this.heroLeaf.targetX ?? this.width * 0.5;
      const targetY = this.heroLeaf.targetY ?? this.height * 0.5;

      const dx = targetX - this.heroLeaf.x;
      const dy = targetY - this.heroLeaf.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Emit trailing golden stardust particles
      const trailColors = ['#f59e0b', '#fbbf24', '#fde047', '#ffffff'];
      for (let i = 0; i < 2; i++) {
        this.heroTrail.push({
          x: this.heroLeaf.x + (Math.random() - 0.5) * 12,
          y: this.heroLeaf.y + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 0.8 - 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: 1.5 + Math.random() * 2.8,
          alpha: 0.85 + Math.random() * 0.15,
          color: trailColors[Math.floor(Math.random() * trailColors.length)]
        });
      }

      if (dist < 8) {
        this.heroLeaf.x = targetX;
        this.heroLeaf.y = targetY;
        if (!this.heroLanded) {
          this.heroLanded = true;
          this.spawnRipples(targetX, targetY);
          this.onHeroLeafLanded?.();
        }
      } else {
        this.heroLeaf.x += (dx / dist) * Math.min(dist * 0.05 + 1.2, 5.0);
        this.heroLeaf.y += (dy / dist) * Math.min(dist * 0.05 + 1.2, 5.0) + Math.sin(this.heroLeaf.x * 0.05) * 1.5;
        this.heroLeaf.rotation += this.heroLeaf.rotSpeed;
      }
    }

    // Update stardust trail decay
    for (let i = this.heroTrail.length - 1; i >= 0; i--) {
      const p = this.heroTrail[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.024;
      if (p.alpha <= 0) {
        this.heroTrail.splice(i, 1);
      }
    }

    // Update water ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += r.speed;
      r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);
      if (r.radius >= r.maxRadius || r.alpha <= 0.01) {
        this.ripples.splice(i, 1);
      }
    }
  }

  private drawLeafShape(ctx: CanvasRenderingContext2D, leaf: LeafParticle): void {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rotation);
    ctx.fillStyle = leaf.color;
    ctx.globalAlpha = leaf.opacity * this.opacity;

    // Leaf silhouette
    ctx.beginPath();
    ctx.moveTo(0, -leaf.size);
    ctx.bezierCurveTo(leaf.size * 0.6, -leaf.size * 0.4, leaf.size * 0.6, leaf.size * 0.4, 0, leaf.size);
    ctx.bezierCurveTo(-leaf.size * 0.6, leaf.size * 0.4, -leaf.size * 0.6, -leaf.size * 0.4, 0, -leaf.size);
    ctx.fill();

    // Central leaf vein
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -leaf.size * 0.9);
    ctx.lineTo(0, leaf.size * 0.9);
    ctx.stroke();

    ctx.restore();
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.opacity <= 0.01) return;

    // 1. Draw glowing stardust trail from hero leaf
    if (this.heroTrail.length > 0) {
      ctx.save();
      for (const p of this.heroTrail) {
        const a = p.alpha * this.opacity;
        if (a <= 0.01) continue;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. Draw ambient leaves
    for (const leaf of this.ambientLeaves) {
      this.drawLeafShape(ctx, leaf);
    }

    // 3. Draw golden water ripples upon leaf landing
    if (this.ripples.length > 0) {
      ctx.save();
      for (const r of this.ripples) {
        const a = r.alpha * this.opacity;
        if (a <= 0.01) continue;

        ctx.strokeStyle = `rgba(253, 224, 71, ${a * 0.88})`;
        ctx.lineWidth = Math.max(1, 3.2 * a);
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.52, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.55})`;
        ctx.lineWidth = Math.max(0.8, 1.4 * a);
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius * 0.72, r.radius * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Draw hero selection leaf
    if (this.heroLeaf) {
      // Golden beacon glow around hero leaf
      ctx.save();
      const glow = ctx.createRadialGradient(
        this.heroLeaf.x, this.heroLeaf.y, 4,
        this.heroLeaf.x, this.heroLeaf.y, this.heroLeaf.size * 1.8
      );
      glow.addColorStop(0, `rgba(245, 158, 11, ${0.45 * this.opacity})`);
      glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.heroLeaf.x, this.heroLeaf.y, this.heroLeaf.size * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      this.drawLeafShape(ctx, this.heroLeaf);
    }
  }
}
