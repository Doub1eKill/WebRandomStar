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

interface LeafSparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rot: number;
  rotSpeed: number;
}

export class LeafSystem {
  private ambientLeaves: LeafParticle[] = [];
  public heroLeaf: LeafParticle | null = null;
  private heroTrail: LeafTrailParticle[] = [];
  private ripples: LeafRipple[] = [];
  private sparkles: LeafSparkle[] = [];
  public onHeroLeafLanded?: () => void;
  private width: number = 0;
  private height: number = 0;
  public active: boolean = false;
  public heroLanded: boolean = false;
  public opacity: number = 0.0;

  // Royal Pageant & Transition Palette: Amethyst, Frosted Diamond, Royal Gold
  private colors = [
    '#c084fc', // amethyst violet
    '#a855f7', // royal purple
    '#e0e7ff', // frosted diamond
    '#ede9fe', // lavender crystal
    '#fbbf24', // pageant gold
    '#818cf8'  // twilight periwinkle
  ];

  constructor(ambientCount: number = 18) {
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
      opacity: 0.65 + Math.random() * 0.3
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
    this.sparkles = [];
    this.active = false;
  }

  public spawnHeroLeaf(targetX: number, targetY: number): void {
    this.heroLeaf = {
      x: -40,
      y: this.height * 0.35 + (Math.random() - 0.5) * 100,
      size: 34,
      rotation: 0,
      rotSpeed: 0.035,
      vx: 4.8,
      vy: 1.8,
      color: '#ffffff',
      shapeType: 'maple',
      opacity: 1,
      targetX,
      targetY
    };
    this.heroLanded = false;
    this.heroTrail = [];
    this.ripples = [];
    this.sparkles = [];
  }

  private spawnRipples(x: number, y: number): void {
    const delays = [0, 14, 28, 42];
    delays.forEach((delay, idx) => {
      setTimeout(() => {
        this.ripples.push({
          x,
          y,
          radius: 8 + idx * 6,
          maxRadius: 240 + idx * 45,
          alpha: 1.0,
          speed: 3.8 - idx * 0.35
        });
      }, delay * 16);
    });
  }

  private spawnSparkles(x: number, y: number): void {
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i + (Math.random() - 0.5) * 0.3;
      const speed = 2.0 + Math.random() * 4.0;
      this.sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.7,
        size: 5 + Math.random() * 9,
        alpha: 1.0,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.08
      });
    }
  }

  public update(): void {
    if (!this.active && this.opacity <= 0.01) return;

    // Update ambient transition leaves
    for (const leaf of this.ambientLeaves) {
      leaf.x += leaf.vx;
      leaf.y += leaf.vy + Math.sin(leaf.x * 0.02) * 0.8;
      leaf.rotation += leaf.rotSpeed;

      if (leaf.x > this.width + 50 || leaf.y > this.height + 50) {
        leaf.x = -40;
        leaf.y = Math.random() * this.height * 0.7;
      }
    }

    // Update Crystalline Diamond hero leaf & emit stardust
    if (this.heroLeaf && !this.heroLanded) {
      const targetX = this.heroLeaf.targetX ?? this.width * 0.5;
      const targetY = this.heroLeaf.targetY ?? this.height * 0.5;

      const dx = targetX - this.heroLeaf.x;
      const dy = targetY - this.heroLeaf.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Emit trailing diamond & violet stardust particles
      const trailColors = ['#ffffff', '#f3e8ff', '#e0e7ff', '#d8b4fe', '#c084fc'];
      for (let i = 0; i < 3; i++) {
        this.heroTrail.push({
          x: this.heroLeaf.x + (Math.random() - 0.5) * 14,
          y: this.heroLeaf.y + (Math.random() - 0.5) * 14,
          vx: (Math.random() - 0.5) * 0.9 - 0.9,
          vy: (Math.random() - 0.5) * 0.9,
          radius: 1.5 + Math.random() * 3.2,
          alpha: 0.9 + Math.random() * 0.1,
          color: trailColors[Math.floor(Math.random() * trailColors.length)]
        });
      }

      if (dist < 8) {
        this.heroLeaf.x = targetX;
        this.heroLeaf.y = targetY;
        if (!this.heroLanded) {
          this.heroLanded = true;
          this.spawnRipples(targetX, targetY);
          this.spawnSparkles(targetX, targetY);
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

    // Update diamond starburst sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.rot += s.rotSpeed;
      s.alpha -= 0.022;
      s.size *= 0.985;
      if (s.alpha <= 0.01) {
        this.sparkles.splice(i, 1);
      }
    }
  }

  private drawLeafShape(ctx: CanvasRenderingContext2D, leaf: LeafParticle): void {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rotation);
    ctx.globalAlpha = leaf.opacity * this.opacity;

    const isHero = leaf === this.heroLeaf;

    if (isHero) {
      // Faceted Crystalline Diamond Hero Leaf
      const grad = ctx.createLinearGradient(0, -leaf.size, 0, leaf.size);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#f3e8ff');
      grad.addColorStop(0.7, '#e0e7ff');
      grad.addColorStop(1, '#c084fc');
      ctx.fillStyle = grad;

      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 20;
    } else {
      ctx.fillStyle = leaf.color;
    }

    // Leaf silhouette
    ctx.beginPath();
    ctx.moveTo(0, -leaf.size);
    ctx.bezierCurveTo(leaf.size * 0.65, -leaf.size * 0.4, leaf.size * 0.65, leaf.size * 0.4, 0, leaf.size);
    ctx.bezierCurveTo(-leaf.size * 0.65, leaf.size * 0.4, -leaf.size * 0.65, -leaf.size * 0.4, 0, -leaf.size);
    ctx.fill();

    if (isHero) {
      // Crystalline Facet Highlights & Veins
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      // Center vein
      ctx.moveTo(0, -leaf.size * 0.92);
      ctx.lineTo(0, leaf.size * 0.92);
      // Diamond facets
      ctx.moveTo(0, -leaf.size * 0.3);
      ctx.lineTo(leaf.size * 0.45, 0);
      ctx.moveTo(0, -leaf.size * 0.3);
      ctx.lineTo(-leaf.size * 0.45, 0);
      ctx.moveTo(0, leaf.size * 0.3);
      ctx.lineTo(leaf.size * 0.45, 0);
      ctx.moveTo(0, leaf.size * 0.3);
      ctx.lineTo(-leaf.size * 0.45, 0);
      ctx.stroke();

      // Diamond perimeter glint
      ctx.strokeStyle = 'rgba(235, 220, 255, 0.75)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // Central leaf vein for ambient leaf
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -leaf.size * 0.9);
      ctx.lineTo(0, leaf.size * 0.9);
      ctx.stroke();
    }

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
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 10;
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

    // 3. Draw concentric violet-diamond water ripples upon leaf landing
    if (this.ripples.length > 0) {
      ctx.save();
      for (const r of this.ripples) {
        const a = r.alpha * this.opacity;
        if (a <= 0.01) continue;

        // Outer Amethyst ripple
        ctx.strokeStyle = `rgba(192, 132, 252, ${a * 0.88})`;
        ctx.lineWidth = Math.max(1, 3.2 * a);
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.52, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Diamond-white ripple
        ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.92})`;
        ctx.lineWidth = Math.max(0.8, 1.6 * a);
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius * 0.72, r.radius * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Draw Diamond Starburst Sparkles expanding upon landing
    if (this.sparkles.length > 0) {
      ctx.save();
      for (const s of this.sparkles) {
        const a = s.alpha * this.opacity;
        if (a <= 0.01) continue;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.globalAlpha = a;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 12;

        const sz = s.size;
        const inner = sz * 0.24;
        // 4-pointed diamond starburst
        ctx.beginPath();
        ctx.moveTo(0, -sz);
        ctx.quadraticCurveTo(0, -inner, inner, 0);
        ctx.quadraticCurveTo(0, inner, 0, sz);
        ctx.quadraticCurveTo(0, inner, -inner, 0);
        ctx.quadraticCurveTo(0, -inner, 0, -sz);
        ctx.fill();

        ctx.restore();
      }
      ctx.restore();
    }

    // 5. Draw hero selection leaf
    if (this.heroLeaf) {
      // Amethyst Diamond aura glow around hero leaf
      ctx.save();
      const glow = ctx.createRadialGradient(
        this.heroLeaf.x, this.heroLeaf.y, 4,
        this.heroLeaf.x, this.heroLeaf.y, this.heroLeaf.size * 2.2
      );
      glow.addColorStop(0, `rgba(255, 255, 255, ${0.7 * this.opacity})`);
      glow.addColorStop(0.35, `rgba(192, 132, 252, ${0.45 * this.opacity})`);
      glow.addColorStop(0.7, `rgba(168, 85, 247, ${0.2 * this.opacity})`);
      glow.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.heroLeaf.x, this.heroLeaf.y, this.heroLeaf.size * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      this.drawLeafShape(ctx, this.heroLeaf);
    }
  }
}
