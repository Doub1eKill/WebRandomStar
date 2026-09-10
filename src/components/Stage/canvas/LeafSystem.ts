import { LeafParticle } from './particleTypes.ts';

export class LeafSystem {
  private ambientLeaves: LeafParticle[] = [];
  public heroLeaf: LeafParticle | null = null;
  private width: number = 0;
  private height: number = 0;
  public active: boolean = false;
  public heroLanded: boolean = false;

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
  }

  public update(): void {
    if (!this.active) return;

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

    // Update hero selection leaf
    if (this.heroLeaf && !this.heroLanded) {
      const targetX = this.heroLeaf.targetX ?? this.width * 0.5;
      const targetY = this.heroLeaf.targetY ?? this.height * 0.5;

      const dx = targetX - this.heroLeaf.x;
      const dy = targetY - this.heroLeaf.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 8) {
        this.heroLeaf.x = targetX;
        this.heroLeaf.y = targetY;
        this.heroLanded = true;
      } else {
        this.heroLeaf.x += (dx / dist) * Math.min(dist * 0.05 + 1.2, 5.0);
        this.heroLeaf.y += (dy / dist) * Math.min(dist * 0.05 + 1.2, 5.0) + Math.sin(this.heroLeaf.x * 0.05) * 1.5;
        this.heroLeaf.rotation += this.heroLeaf.rotSpeed;
      }
    }
  }

  private drawLeafShape(ctx: CanvasRenderingContext2D, leaf: LeafParticle): void {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rotation);
    ctx.fillStyle = leaf.color;
    ctx.globalAlpha = leaf.opacity;

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
    if (!this.active) return;

    for (const leaf of this.ambientLeaves) {
      this.drawLeafShape(ctx, leaf);
    }

    if (this.heroLeaf) {
      // Golden beacon glow around hero leaf
      ctx.save();
      const glow = ctx.createRadialGradient(
        this.heroLeaf.x, this.heroLeaf.y, 4,
        this.heroLeaf.x, this.heroLeaf.y, this.heroLeaf.size * 1.8
      );
      glow.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
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
