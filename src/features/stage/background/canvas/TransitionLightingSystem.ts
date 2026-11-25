import { AppState } from '@/types/session.ts';
import { TimerPhase } from '@/types/timer.ts';

export class TransitionLightingSystem {
  private bloomIntensity: number = 0;
  private lightBeamProgress: number = 0;
  private timeAccumulator: number = 0;
  private vignetteIntensity: number = 0;
  private width: number = window.innerWidth;
  private height: number = window.innerHeight;

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public reset() {
    this.bloomIntensity = 0;
    this.lightBeamProgress = 0;
    this.timeAccumulator = 0;
    this.vignetteIntensity = 0;
  }

  // `_stageProgress` only drove the removed v2 'sky-clear' phase (D4).
  public update(dt: number, state: AppState, _stageProgress: number = 0, _timerPhase: TimerPhase = 'normal') {
    this.timeAccumulator += dt;

    if (state === 'question-reveal') {
      // Quick subtle light sweep
      this.bloomIntensity += (0.65 - this.bloomIntensity) * 0.2;
      this.lightBeamProgress += dt * 1.5;
      this.vignetteIntensity += (0 - this.vignetteIntensity) * 0.1;
    } else if (state === 'question' || state === 'answered') {
      // Completely steady background with zero fluctuating bloom or vignette
      this.bloomIntensity += (0 - this.bloomIntensity) * 0.15;
      this.vignetteIntensity += (0 - this.vignetteIntensity) * 0.15;
      this.lightBeamProgress = 0;
    } else {
      this.bloomIntensity += (0 - this.bloomIntensity) * 0.1;
      this.vignetteIntensity += (0 - this.vignetteIntensity) * 0.1;
      this.lightBeamProgress = 0;
    }
  }

  public draw(ctx: CanvasRenderingContext2D, state: AppState, _timerPhase: TimerPhase = 'normal') {
    ctx.save();

    // 1. Central Ambient Glow / Dawn Bloom
    if (this.bloomIntensity > 0.01) {
      const cx = this.width / 2;
      const cy = this.height * 0.45;
      const maxRadius = Math.max(this.width, this.height) * 0.65;

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
      gradient.addColorStop(0, `rgba(190, 220, 255, ${this.bloomIntensity * 0.4})`);
      gradient.addColorStop(0.35, `rgba(140, 180, 250, ${this.bloomIntensity * 0.18})`);
      gradient.addColorStop(0.7, `rgba(80, 100, 200, ${this.bloomIntensity * 0.06})`);
      gradient.addColorStop(1, 'rgba(10, 20, 40, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 2. Light Sweep during Question Reveal
    if (state === 'question-reveal') {
      ctx.globalCompositeOperation = 'screen';
      const beamX = (this.lightBeamProgress * this.width * 1.5) - (this.width * 0.25);
      const beamGrad = ctx.createLinearGradient(beamX - 160, 0, beamX + 160, 0);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      beamGrad.addColorStop(0.5, `rgba(220, 240, 255, ${this.bloomIntensity * 0.3})`);
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.restore();
  }
}
