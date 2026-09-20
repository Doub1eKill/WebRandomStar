import { CrystalParticle } from './particleTypes.ts';

/**
 * CrystalSystem: Floating, sparkling 2D/3D crystal particles and bokeh
 * with depth, parallax, and rotation in Cosmic Diamond & Starlight palette.
 */
export class CrystalSystem {
  private particles: CrystalParticle[] = [];
  private maxParticles: number = 65;

  public init(width: number, height: number, density: number = 1.0): void {
    const count = Math.floor(this.maxParticles * density);
    this.particles = [];
    const colors = [
      '#ffffff', // Pure Diamond
      '#F8FAFC', // Crisp Starlight White
      '#A5F3FC', // Ice Cyan
      '#C084FC', // Lavender Nebula
      '#E0E7FF'  // Diamond Silver
    ];

    for (let i = 0; i < count; i++) {
      const typeChoice = Math.random();
      const type: 'diamond' | 'star' | 'bokeh' =
        typeChoice < 0.45 ? 'diamond' : typeChoice < 0.75 ? 'star' : 'bokeh';

      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: type === 'bokeh' ? 6 + Math.random() * 12 : 2.5 + Math.random() * 5.5,
        opacity: 0.25 + Math.random() * 0.7,
        twinkleSpeed: 0.0015 + Math.random() * 0.0035,
        twinklePhase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.15 - Math.random() * 0.35, // slow upward float
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        color: colors[Math.floor(Math.random() * colors.length)],
        type
      });
    }
  }

  public update(dt: number, width: number, height: number): void {
    for (const p of this.particles) {
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.rotation += p.rotSpeed * (dt / 16);
      p.twinklePhase += p.twinkleSpeed * dt;

      // Wrap edges
      if (p.y < -20) p.y = height + 10;
      if (p.x < -20) p.x = width + 10;
      if (p.x > width + 20) p.x = -10;
    }
  }

  public render(ctx: CanvasRenderingContext2D, opacityFactor: number = 1.0): void {
    if (opacityFactor <= 0.01) return;

    ctx.save();
    for (const p of this.particles) {
      const currentTwinkle = 0.5 + 0.5 * Math.sin(p.twinklePhase);
      const alpha = p.opacity * currentTwinkle * opacityFactor;
      if (alpha <= 0.02) continue;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;

      if (p.type === 'diamond') {
        // 4-point diamond crystal
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.5, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.5, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'star') {
        // 4-point star flare
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.5);
        ctx.lineTo(p.size * 0.22, -p.size * 0.22);
        ctx.lineTo(p.size * 1.5, 0);
        ctx.lineTo(p.size * 0.22, p.size * 0.22);
        ctx.lineTo(0, p.size * 1.5);
        ctx.lineTo(-p.size * 0.22, p.size * 0.22);
        ctx.lineTo(-p.size * 1.5, 0);
        ctx.lineTo(-p.size * 0.22, -p.size * 0.22);
        ctx.closePath();
        ctx.fill();
      } else {
        // Soft celestial bokeh orb
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.restore();
  }
}

