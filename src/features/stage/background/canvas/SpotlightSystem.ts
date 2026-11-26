import { AppState } from '@/types/session.ts';
import { rgba, STAGE_RGB, Rgb } from './sprites.ts';

interface Beam {
  anchor: number;   // x of the rig above the frame, 0..1 of the width
  base: number;     // resting angle (radians, 0 = straight down, + = toward the right)
  sweep: number;    // sweep amplitude (radians)
  speed: number;    // sweep speed multiplier
  phase: number;
  spread: number;   // cone half-width at full length, as a fraction of the height
  color: Rgb;
}

/**
 * SpotlightSystem: pageant stage lighting rig for the Cosmic Canvas.
 *
 * Five volumetric beams hang above the frame and sweep slowly (faster while the word spins).
 * On word-lock they swing in and converge on the centre of the stage, then relax again. Where a
 * beam meets the stage floor it leaves a soft light pool; with the water reflection on, the
 * pool also casts a shimmering streak downward. Additive blending keeps it luminous without
 * flattening the text layer above. Intensity per phase comes from stateTargets (beamIntensity).
 */
export class SpotlightSystem {
  private width = 0;
  private height = 0;
  private time = 0;
  private converge = 0;
  private beams: Beam[] = [
    { anchor: 0.1, base: 0.42, sweep: 0.2, speed: 0.8, phase: 0.0, spread: 0.13, color: STAGE_RGB.violet },
    { anchor: 0.3, base: 0.16, sweep: 0.24, speed: 1.0, phase: 1.7, spread: 0.11, color: STAGE_RGB.cyan },
    { anchor: 0.5, base: 0.0, sweep: 0.16, speed: 0.6, phase: 3.1, spread: 0.12, color: STAGE_RGB.gold },
    { anchor: 0.7, base: -0.16, sweep: 0.24, speed: 1.0, phase: 4.4, spread: 0.11, color: STAGE_RGB.cyan },
    { anchor: 0.9, base: -0.42, sweep: 0.2, speed: 0.8, phase: 5.6, spread: 0.13, color: STAGE_RGB.violet }
  ];

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public update(dtMs: number, state: AppState, energy: number, motion: number): void {
    const dt = dtMs / 1000;
    this.time += dt * motion * (0.25 + energy * 0.9);
    const target = state === 'word-lock' ? 1 : 0;
    // Converging is quick and decisive; relaxing afterwards is slow and smooth.
    const rate = target > this.converge ? 5 : 1.4;
    this.converge += (target - this.converge) * (1 - Math.exp(-dt * rate));
  }

  public render(ctx: CanvasRenderingContext2D, intensity: number, reflection: boolean): void {
    const w = this.width;
    const h = this.height;
    if (w <= 0 || h <= 0 || intensity <= 0.01) return;

    const floorY = h * 0.86;
    const focusX = w * 0.5;
    const focusY = h * 0.47;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (const beam of this.beams) {
      const ax = beam.anchor * w;
      const ay = -h * 0.06;
      const swept = beam.base + Math.sin(this.time * beam.speed + beam.phase) * beam.sweep;
      const focusAngle = Math.atan2(focusX - ax, focusY - ay);
      const angle = swept + (focusAngle - swept) * this.converge;

      const length = h * 1.25;
      const dx = Math.sin(angle);
      const dy = Math.cos(angle);
      const ex = ax + dx * length;
      const ey = ay + dy * length;
      const spread = h * beam.spread * (1 - this.converge * 0.35);
      const nx = -dy;
      const ny = dx;
      const a = Math.min(1, intensity) * (0.85 + 0.15 * Math.sin(this.time * 2.3 + beam.phase));

      // Outer soft cone
      const outer = ctx.createLinearGradient(ax, ay, ex, ey);
      outer.addColorStop(0, rgba(beam.color, 0.2 * a));
      outer.addColorStop(0.45, rgba(beam.color, 0.075 * a));
      outer.addColorStop(1, rgba(beam.color, 0));
      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.moveTo(ax - nx * 6, ay - ny * 6);
      ctx.lineTo(ax + nx * 6, ay + ny * 6);
      ctx.lineTo(ex + nx * spread, ey + ny * spread);
      ctx.lineTo(ex - nx * spread, ey - ny * spread);
      ctx.closePath();
      ctx.fill();

      // Bright inner core
      const inner = ctx.createLinearGradient(ax, ay, ex, ey);
      inner.addColorStop(0, rgba(STAGE_RGB.white, 0.22 * a));
      inner.addColorStop(0.3, rgba(beam.color, 0.1 * a));
      inner.addColorStop(0.8, rgba(beam.color, 0));
      ctx.fillStyle = inner;
      ctx.beginPath();
      ctx.moveTo(ax - nx * 2, ay - ny * 2);
      ctx.lineTo(ax + nx * 2, ay + ny * 2);
      ctx.lineTo(ex + nx * spread * 0.35, ey + ny * spread * 0.35);
      ctx.lineTo(ex - nx * spread * 0.35, ey - ny * spread * 0.35);
      ctx.closePath();
      ctx.fill();

      // Light pool where the beam meets the stage floor
      if (dy > 0.2) {
        const t = (floorY - ay) / dy;
        const px = ax + dx * t;
        if (px > -w * 0.2 && px < w * 1.2) {
          const poolR = spread * (t / length) * 1.4 + 30;
          ctx.save();
          ctx.translate(px, floorY);
          ctx.scale(1, 0.22);
          const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, poolR);
          pool.addColorStop(0, rgba(STAGE_RGB.white, 0.2 * a));
          pool.addColorStop(0.35, rgba(beam.color, 0.16 * a));
          pool.addColorStop(1, rgba(beam.color, 0));
          ctx.fillStyle = pool;
          ctx.fillRect(-poolR, -poolR, poolR * 2, poolR * 2);
          ctx.restore();

          if (reflection) {
            // Shimmering reflected streak on the water below the pool
            const shimmer = 0.75 + 0.25 * Math.sin(this.time * 6 + beam.phase * 3);
            const streak = ctx.createLinearGradient(0, floorY, 0, h);
            streak.addColorStop(0, rgba(beam.color, 0.14 * a * shimmer));
            streak.addColorStop(1, rgba(beam.color, 0));
            ctx.fillStyle = streak;
            const sw = poolR * 0.28;
            ctx.fillRect(px - sw / 2, floorY, sw, h - floorY);
          }
        }
      }

      // Lens glow at the rig
      const lens = ctx.createRadialGradient(ax, 0, 0, ax, 0, 70);
      lens.addColorStop(0, rgba(STAGE_RGB.white, 0.35 * a));
      lens.addColorStop(0.3, rgba(beam.color, 0.2 * a));
      lens.addColorStop(1, rgba(beam.color, 0));
      ctx.fillStyle = lens;
      ctx.fillRect(ax - 70, 0, 140, 70);
    }

    // Converged focus: a bright halo where every beam meets
    if (this.converge > 0.05) {
      const r = Math.min(w, h) * 0.32;
      const halo = ctx.createRadialGradient(focusX, focusY, 0, focusX, focusY, r);
      halo.addColorStop(0, rgba(STAGE_RGB.white, 0.22 * this.converge * intensity));
      halo.addColorStop(0.3, rgba(STAGE_RGB.gold, 0.1 * this.converge * intensity));
      halo.addColorStop(1, rgba(STAGE_RGB.violet, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(focusX - r, focusY - r, r * 2, r * 2);
    }

    ctx.restore();
  }
}
