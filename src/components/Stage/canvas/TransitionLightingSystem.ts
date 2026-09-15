import { AppState } from '../../../types/session.ts';
import { TimerPhase } from '../../../types/timer.ts';

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

  public update(dt: number, state: AppState, stageProgress: number = 0, timerPhase: TimerPhase = 'normal') {
    this.timeAccumulator += dt;

    if (state === 'sky-clear') {
      // Bloom gently increases as the sky clears
      const targetBloom = Math.sin(stageProgress * Math.PI) * 0.4;
      this.bloomIntensity += (targetBloom - this.bloomIntensity) * 0.1;
      this.lightBeamProgress = stageProgress;
      this.vignetteIntensity += (0 - this.vignetteIntensity) * 0.1;
    } else if (state === 'question-reveal') {
      // Quick subtle light sweep
      this.bloomIntensity += (0.65 - this.bloomIntensity) * 0.2;
      this.lightBeamProgress += dt * 1.5;
      this.vignetteIntensity += (0 - this.vignetteIntensity) * 0.1;
    } else if (state === 'question' || state === 'answered') {
      // Resting ambient highlight with timer-reactive dynamic vignette
      const baseBloom = 0.22 + Math.sin(this.timeAccumulator * 1.2) * 0.04;
      this.bloomIntensity += (baseBloom - this.bloomIntensity) * 0.08;

      let targetVignette = 0;
      if (timerPhase === 'warning') {
        targetVignette = 0.14 + Math.sin(this.timeAccumulator * 1.2) * 0.03;
      } else if (timerPhase === 'critical' || timerPhase === 'last-3s') {
        targetVignette = 0.26 + Math.sin(this.timeAccumulator * 1.5) * 0.04;
      }

      this.vignetteIntensity += (targetVignette - this.vignetteIntensity) * 0.06;
    } else {
      this.bloomIntensity += (0 - this.bloomIntensity) * 0.1;
      this.vignetteIntensity += (0 - this.vignetteIntensity) * 0.08;
      this.lightBeamProgress = 0;
    }
  }

  public draw(ctx: CanvasRenderingContext2D, state: AppState, timerPhase: TimerPhase = 'normal') {
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

    // 2. Dynamic Luxury Edge Breathing Glow during Countdown
    if (this.vignetteIntensity > 0.01 && (state === 'question' || state === 'answered')) {
      const cx = this.width / 2;
      const cy = this.height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      const vignetteGrad = ctx.createRadialGradient(cx, cy, maxDist * 0.6, cx, cy, maxDist);
      vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');

      if (timerPhase === 'last-3s' || timerPhase === 'critical') {
        vignetteGrad.addColorStop(0.8, `rgba(160, 20, 30, ${this.vignetteIntensity * 0.2})`);
        vignetteGrad.addColorStop(1, `rgba(100, 10, 20, ${this.vignetteIntensity * 0.4})`);
      } else if (timerPhase === 'warning') {
        vignetteGrad.addColorStop(0.8, `rgba(150, 90, 20, ${this.vignetteIntensity * 0.15})`);
        vignetteGrad.addColorStop(1, `rgba(90, 50, 10, ${this.vignetteIntensity * 0.3})`);
      } else {
        vignetteGrad.addColorStop(1, `rgba(0, 0, 0, ${this.vignetteIntensity * 0.3})`);
      }

      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 3. Light Sweep during Question Reveal
    if (state === 'question-reveal' || state === 'sky-clear') {
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
