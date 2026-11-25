import React, { useRef, useEffect } from 'react';
import { SessionState } from '@/types/session.ts';
import { AuroraSystem } from './AuroraSystem.ts';
import { CrystalSystem } from './CrystalSystem.ts';
import { CrownSystem } from './CrownSystem.ts';
import { ReflectionSystem } from './ReflectionSystem.ts';
import { MistSystem } from './MistSystem.ts';
import { SkySystem } from './SkySystem.ts';
import { TransitionLightingSystem } from './TransitionLightingSystem.ts';
import { INITIAL_TARGETS, STATE_SOUNDS, STATE_TARGETS, LayerTargets } from './stateTargets.ts';
import { getLiveRemainingMs } from '@/features/timer/timerEngine.ts';
import { useLazyRef } from '@/shared/lib/useLazyRef.ts';

interface StageCanvasProps {
  session: SessionState;
}

export const StageCanvas: React.FC<StageCanvasProps> = ({ session }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas luxury pageant & atmospheric systems (PF2: constructed once, not on every render)
  const auroraRef = useLazyRef(() => new AuroraSystem());
  const crystalRef = useLazyRef(() => new CrystalSystem());
  const crownRef = useLazyRef(() => new CrownSystem());
  const reflectionRef = useLazyRef(() => new ReflectionSystem());

  // Natural layer systems. D4/PF8: the rain, water-drop and leaf layers were removed. Every v3
  // phase targets them at 0; only v2 phases used them (rain also faded out over ~1 s on load).
  const mistRef = useLazyRef(() => new MistSystem());
  const skyRef = useLazyRef(() => new SkySystem());
  const lightingRef = useLazyRef(() => new TransitionLightingSystem());

  // Target values for smooth cross-fading
  const targetsRef = useRef<LayerTargets>({ ...INITIAL_TARGETS });

  const sessionRef = useRef<SessionState>(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Handle stage state transitions & synchronized procedural audio (A8: table-driven)
  useEffect(() => {
    const currentState = session.currentState;
    const nextTargets = STATE_TARGETS[currentState];
    if (nextTargets) targetsRef.current = { ...nextTargets };

    if (currentState === 'idle') {
      lightingRef.current.reset();
    }

    STATE_SOUNDS[currentState]?.();
  }, [session.currentState, lightingRef]); // refs from useLazyRef are stable

  // Update crystal density only when appearance settings actually change
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    crystalRef.current.init(width, height, session.appearanceSettings?.particleDensity || 1.0);
  }, [session.appearanceSettings?.particleDensity, crystalRef]);

  // Setup Continuous Canvas render loop (runs once on mount, 60fps stable)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // PF7: viewport size and the background gradient only change on resize, so compute them
    // there instead of on every frame.
    let viewWidth = window.innerWidth;
    let viewHeight = window.innerHeight;
    let skyGrad: CanvasGradient | null = null;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      viewWidth = width;
      viewHeight = height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#060919');
      skyGrad.addColorStop(0.35, '#0b102b');
      skyGrad.addColorStop(0.7, '#120d31');
      skyGrad.addColorStop(1, '#060919');

      crystalRef.current.init(width, height, sessionRef.current.appearanceSettings?.particleDensity || 1.0);
      mistRef.current.resize(width, height);
      skyRef.current.resize(width, height);
      lightingRef.current.resize(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const lerp = (cur: number, target: number, f: number = 0.06): number => {
      const diff = target - cur;
      if (Math.abs(diff) < 0.001) return target;
      return cur + diff * f;
    };

    let curAurora = 0.7;
    let curCrystal = 0.7;
    let curCrown = 0.5;
    let curReflection = 0.65;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      const dtMs = dt * 1000;
      lastTime = time;

      const currentSession = sessionRef.current;
      const width = viewWidth;
      const height = viewHeight;

      const aurora = auroraRef.current;
      const crystal = crystalRef.current;
      const crown = crownRef.current;
      const reflection = reflectionRef.current;

      const mist = mistRef.current;
      const sky = skyRef.current;
      const lighting = lightingRef.current;
      const targets = targetsRef.current;

      // PF1: remainingMs is no longer rewritten into the session every tick, derive it live.
      const liveRemainingMs = currentSession.timerState ? getLiveRemainingMs(currentSession.timerState) : 0;
      const timerPhase = currentSession.timerState
        ? (currentSession.timerState.status === 'finished'
            ? 'finished'
            : currentSession.timerState.status === 'running'
            ? (Math.ceil(liveRemainingMs / 1000) <= 3
                ? 'last-3s'
                : Math.ceil(liveRemainingMs / 1000) <= 10
                ? 'critical'
                : liveRemainingMs <= (currentSession.timerState.warningAtMs || 30000)
                ? 'warning'
                : 'normal')
            : 'normal')
        : 'normal';

      // Smoothly interpolate opacities & densities
      curAurora = lerp(curAurora, targets.auroraIntensity);
      curCrystal = lerp(curCrystal, targets.crystalOpacity);
      curCrown = lerp(curCrown, targets.crownOpacity);
      curReflection = lerp(curReflection, targets.reflectionOpacity);

      mist.density = lerp(mist.density, targets.mistDensity);
      sky.skyClarity = lerp(sky.skyClarity, targets.skyClarity);
      sky.moonOpacity = lerp(sky.moonOpacity, targets.moonOpacity);

      // 1. Cosmic Void & Nebula Night Sky Background Base (#060919 to #0b102b)
      ctx.fillStyle = '#060919';
      ctx.fillRect(0, 0, width, height);

      if (skyGrad) {
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Aurora Light Ribbon Layer
      aurora.update(dtMs);
      aurora.render(ctx, width, height, curAurora * (currentSession.appearanceSettings?.glowIntensity || 1.0));

      // 3. Stars & Celestial Sky
      sky.update();
      sky.draw(ctx);

      // 4. Subtle Royal Crown Silhouette (Watermark)
      if (currentSession.appearanceSettings?.showCrownSilhouette !== false) {
        crown.update(dtMs);
        crown.render(ctx, width, height, curCrown);
      }

      // 5. Floating Sparkling Crystals & Bokeh
      crystal.update(dtMs, width, height);
      crystal.render(ctx, curCrystal);

      // 6. Water Mirror Reflection Layer
      if (currentSession.appearanceSettings?.showWaterReflection !== false) {
        reflection.update(dtMs);
        reflection.render(ctx, width, height, curReflection);
      }

      // 7. Natural layer (mist)
      if (mist.density > 0.01) {
        mist.update();
        mist.draw(ctx);
      }

      // 8. Stage Spotlight, Dynamic Vignette & Timer Glow
      lighting.update(dt, currentSession.currentState, 0.5, timerPhase);
      lighting.draw(ctx, currentSession.currentState, timerPhase);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [auroraRef, crownRef, crystalRef, lightingRef, mistRef, reflectionRef, skyRef]); // stable refs: runs once

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        display: 'block'
      }}
    />
  );
};
