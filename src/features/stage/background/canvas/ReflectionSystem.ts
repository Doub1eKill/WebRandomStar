/**
 * ReflectionSystem: Renders a reflective water plane on the lower third of the canvas
 * with soft vertical gradient and subtle horizontal wave distortions in Cosmic Violet/Cyan.
 */
export class ReflectionSystem {
  private waveTime: number = 0;

  public update(dt: number): void {
    this.waveTime += dt * 0.001;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    opacity: number = 1.0
  ): void {
    if (opacity <= 0.01) return;

    ctx.save();
    const waterY = height * 0.78;
    const waterHeight = height - waterY;

    // Gradient fade from shoreline to deep cosmic void
    const waterGrad = ctx.createLinearGradient(0, waterY, 0, height);
    waterGrad.addColorStop(0, `rgba(46, 16, 101, ${0.45 * opacity})`); // Violet nebula shoreline
    waterGrad.addColorStop(0.3, `rgba(11, 16, 43, ${0.75 * opacity})`); // Deep cosmic navy
    waterGrad.addColorStop(1, `rgba(6, 9, 25, ${0.95 * opacity})`);    // Cosmic midnight void

    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterY, width, waterHeight);

    // Subtle water ripples / starlight ice-cyan highlights
    ctx.strokeStyle = `rgba(165, 243, 252, ${0.16 * opacity})`;
    ctx.lineWidth = 1.5;

    const rippleCount = 4;
    for (let i = 0; i < rippleCount; i++) {
      const lineY = waterY + 15 + i * 22;
      const waveOffset = Math.sin(this.waveTime * 1.5 + i * 1.2) * 12;

      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.bezierCurveTo(
        width * 0.3,
        lineY + waveOffset,
        width * 0.7,
        lineY - waveOffset,
        width,
        lineY
      );
      ctx.stroke();
    }

    ctx.restore();
  }
}
