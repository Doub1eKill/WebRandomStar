import { makeFlareSprite, STAGE_RGB } from './sprites.ts';

/**
 * CrownSystem: Draws a regal, translucent diamond crystal crown watermark
 * in the upper-center of the stage with subtle breathing shimmer in Cosmic Diamond & Lavender glow.
 */
export class CrownSystem {
  private shimmerTime: number = 0;
  private glint = makeFlareSprite(STAGE_RGB.gold, 96);

  public update(dt: number): void {
    this.shimmerTime += dt * 0.001;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    opacity: number = 1.0
  ): void {
    if (opacity <= 0.01) return;

    ctx.save();
    const centerX = width / 2;
    const centerY = height * 0.22;
    const crownWidth = Math.min(width * 0.25, 220);
    const crownHeight = crownWidth * 0.55;

    const shimmer = 0.8 + 0.2 * Math.sin(this.shimmerTime * 2);
    ctx.globalAlpha = 0.22 * opacity * shimmer;
    // Gold-to-lavender band with a highlight that travels slowly across the crown
    const sweep = (Math.sin(this.shimmerTime * 0.7) + 1) / 2;
    const stroke = ctx.createLinearGradient(centerX - crownWidth * 0.5, 0, centerX + crownWidth * 0.5, 0);
    stroke.addColorStop(0, '#C084FC');
    stroke.addColorStop(Math.max(0, sweep - 0.18), '#F5D98A');
    stroke.addColorStop(sweep, '#FFFFFF');
    stroke.addColorStop(Math.min(1, sweep + 0.18), '#F5D98A');
    stroke.addColorStop(1, '#C084FC');
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.shadowColor = '#7C3AED';
    ctx.shadowBlur = 24;

    // Draw Crown Path
    ctx.beginPath();
    // Base band
    ctx.moveTo(centerX - crownWidth * 0.45, centerY + crownHeight * 0.4);
    ctx.lineTo(centerX + crownWidth * 0.45, centerY + crownHeight * 0.4);
    ctx.lineTo(centerX + crownWidth * 0.4, centerY + crownHeight * 0.5);
    ctx.lineTo(centerX - crownWidth * 0.4, centerY + crownHeight * 0.5);
    ctx.closePath();

    // Crown peaks (5 peaks: left low, left mid, center high, right mid, right low)
    ctx.moveTo(centerX - crownWidth * 0.45, centerY + crownHeight * 0.4);
    ctx.lineTo(centerX - crownWidth * 0.38, centerY - crownHeight * 0.1); // peak 1
    ctx.lineTo(centerX - crownWidth * 0.22, centerY + crownHeight * 0.2);
    ctx.lineTo(centerX - crownWidth * 0.15, centerY - crownHeight * 0.35); // peak 2
    ctx.lineTo(centerX, centerY + crownHeight * 0.15);
    ctx.lineTo(centerX, centerY - crownHeight * 0.5); // Center peak (tallest)
    ctx.lineTo(centerX, centerY + crownHeight * 0.15);
    ctx.lineTo(centerX + crownWidth * 0.15, centerY - crownHeight * 0.35); // peak 4
    ctx.lineTo(centerX + crownWidth * 0.22, centerY + crownHeight * 0.2);
    ctx.lineTo(centerX + crownWidth * 0.38, centerY - crownHeight * 0.1); // peak 5
    ctx.lineTo(centerX + crownWidth * 0.45, centerY + crownHeight * 0.4);

    ctx.stroke();

    // Little diamond jewels on peak tops
    const jewelPeaks = [
      { x: centerX - crownWidth * 0.38, y: centerY - crownHeight * 0.1, r: 4 },
      { x: centerX - crownWidth * 0.15, y: centerY - crownHeight * 0.35, r: 5 },
      { x: centerX, y: centerY - crownHeight * 0.5, r: 7 },
      { x: centerX + crownWidth * 0.15, y: centerY - crownHeight * 0.35, r: 5 },
      { x: centerX + crownWidth * 0.38, y: centerY - crownHeight * 0.1, r: 4 }
    ];

    ctx.fillStyle = '#A5F3FC';
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 12;
    for (const jewel of jewelPeaks) {
      ctx.beginPath();
      ctx.arc(jewel.x, jewel.y, jewel.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Diamond glint: the centre jewel flashes a gold four-point star every few seconds
    const glintPulse = Math.pow(Math.max(0, Math.sin(this.shimmerTime * 1.1)), 12);
    if (this.glint && glintPulse > 0.02) {
      const top = jewelPeaks[2];
      const size = 70 + glintPulse * 50;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(1, opacity) * glintPulse * 0.9;
      ctx.drawImage(this.glint, top.x - size / 2, top.y - size / 2, size, size);
    }

    ctx.restore();
  }
}
