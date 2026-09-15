/**
 * AuroraSystem: Simulates multi-layer undulating cosmic aurora light ribbons and gradients
 * in Cosmic Diamond & Nebula Pageant colors (Deep Midnight, Nebula Violet, Ice Cyan, Lavender)
 */
export class AuroraSystem {
  private time: number = 0;

  public update(dt: number): void {
    this.time += dt * 0.0005;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number = 1.0
  ): void {
    if (intensity <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Layer 1: Cosmic Nebula Violet / Deep Space Wave
    const grad1 = ctx.createLinearGradient(0, 0, width, height * 0.8);
    const offset1 = Math.sin(this.time * 2) * 0.15;
    grad1.addColorStop(0, `rgba(46, 16, 101, ${0.45 * intensity})`);
    grad1.addColorStop(0.4 + offset1, `rgba(109, 40, 217, ${0.35 * intensity})`);
    grad1.addColorStop(1, 'rgba(6, 9, 25, 0)');

    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    // Layer 2: Radiant Nebula & Starlight Ribbons in Upper Sky
    const ribbonCount = 3;
    for (let r = 0; r < ribbonCount; r++) {
      ctx.beginPath();
      const rPhase = this.time * 1.5 + r * 1.8;
      const baseHeight = height * (0.15 + r * 0.12);
      ctx.moveTo(0, baseHeight);

      const segments = 12;
      for (let s = 0; s <= segments; s++) {
        const x = (width / segments) * s;
        const wave = Math.sin(rPhase + s * 0.6) * 45 + Math.cos(rPhase * 0.8 + s * 0.4) * 25;
        const y = baseHeight + wave;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height * 0.6);
      ctx.lineTo(0, height * 0.6);
      ctx.closePath();

      const ribbonGrad = ctx.createLinearGradient(0, baseHeight - 40, 0, height * 0.6);
      if (r === 0) {
        ribbonGrad.addColorStop(0, `rgba(192, 132, 252, ${0.28 * intensity})`); // Lavender Nebula
        ribbonGrad.addColorStop(0.5, `rgba(124, 58, 237, ${0.22 * intensity})`);
        ribbonGrad.addColorStop(1, 'rgba(6, 9, 25, 0)');
      } else if (r === 1) {
        ribbonGrad.addColorStop(0, `rgba(56, 189, 248, ${0.25 * intensity})`); // Starlight Cyan Flare
        ribbonGrad.addColorStop(0.6, `rgba(46, 16, 101, ${0.18 * intensity})`);
        ribbonGrad.addColorStop(1, 'rgba(6, 9, 25, 0)');
      } else {
        ribbonGrad.addColorStop(0, `rgba(165, 243, 252, ${0.2 * intensity})`); // Ice Diamond Starlight
        ribbonGrad.addColorStop(0.5, `rgba(109, 40, 217, ${0.15 * intensity})`);
        ribbonGrad.addColorStop(1, 'rgba(6, 9, 25, 0)');
      }

      ctx.fillStyle = ribbonGrad;
      ctx.fill();
    }

    ctx.restore();
  }
}
