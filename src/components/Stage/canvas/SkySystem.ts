interface BackgroundStar {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
}

export class SkySystem {
  private stars: BackgroundStar[] = [];
  private width: number = 0;
  private height: number = 0;
  public skyClarity: number = 0.0; // 0 (hidden by rain/mist) to 1 (crystal clear night)
  public moonOpacity: number = 0.0;

  constructor(starCount: number = 90) {
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080 * 0.75, // mainly upper sky
        radius: 0.8 + Math.random() * 1.6,
        alpha: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public update(): void {
    if (this.skyClarity <= 0.01) return;

    for (const star of this.stars) {
      star.phase += star.twinkleSpeed;
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.skyClarity <= 0.01) return;

    ctx.save();

    // 1. Draw twinkling background diamond stars
    for (const star of this.stars) {
      const currentAlpha = star.alpha * (0.6 + 0.4 * Math.sin(star.phase)) * this.skyClarity;
      if (currentAlpha <= 0.01) continue;

      ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      // 4-point diamond glint on brighter stars
      if (star.radius > 1.8 && currentAlpha > 0.4) {
        ctx.strokeStyle = `rgba(224, 231, 255, ${currentAlpha * 0.5})`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(star.x - star.radius * 2.5, star.y);
        ctx.lineTo(star.x + star.radius * 2.5, star.y);
        ctx.moveTo(star.x, star.y - star.radius * 2.5);
        ctx.lineTo(star.x, star.y + star.radius * 2.5);
        ctx.stroke();
      }
    }

    // 2. Draw Reflective Stage Pedestal Horizon Arc (matching poster stage curve)
    const horizonGrad = ctx.createRadialGradient(
      this.width * 0.5, this.height * 1.05, 20,
      this.width * 0.5, this.height * 1.05, this.width * 0.75
    );
    horizonGrad.addColorStop(0, `rgba(168, 85, 247, ${0.22 * this.skyClarity})`);
    horizonGrad.addColorStop(0.35, `rgba(139, 92, 246, ${0.1 * this.skyClarity})`);
    horizonGrad.addColorStop(1, 'rgba(7, 8, 24, 0)');
    ctx.fillStyle = horizonGrad;
    ctx.beginPath();
    ctx.ellipse(this.width * 0.5, this.height * 0.96, this.width * 0.65, this.height * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle metallic stage rim highlight
    ctx.strokeStyle = `rgba(192, 132, 252, ${0.28 * this.skyClarity})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(this.width * 0.5, this.height * 0.88, this.width * 0.55, this.height * 0.14, 0, Math.PI, Math.PI * 2);
    ctx.stroke();

    // 3. Draw serene Moon in top quadrant
    if (this.moonOpacity > 0.01) {
      const moonX = this.width * 0.8;
      const moonY = this.height * 0.22;
      const moonRadius = 40;

      // Soft Moon Glow with Violet Halo
      const moonGlow = ctx.createRadialGradient(
        moonX, moonY, moonRadius * 0.8,
        moonX, moonY, moonRadius * 3.2
      );
      moonGlow.addColorStop(0, `rgba(241, 245, 249, ${0.32 * this.moonOpacity})`);
      moonGlow.addColorStop(0.4, `rgba(192, 132, 252, ${0.18 * this.moonOpacity})`);
      moonGlow.addColorStop(1, 'rgba(7, 8, 24, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Moon body (Silver crescent)
      ctx.fillStyle = `rgba(248, 250, 252, ${0.9 * this.moonOpacity})`;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Crescent shadow
      ctx.fillStyle = `rgba(16, 14, 43, ${0.95 * this.moonOpacity})`;
      ctx.beginPath();
      ctx.arc(moonX - moonRadius * 0.4, moonY - moonRadius * 0.2, moonRadius * 0.88, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
