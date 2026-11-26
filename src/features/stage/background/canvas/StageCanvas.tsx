import React, { useRef, useEffect } from 'react';
import { SessionState } from '@/types/session.ts';
import { AuroraSystem } from './AuroraSystem.ts';
import { CrystalSystem } from './CrystalSystem.ts';
import { CrownSystem } from './CrownSystem.ts';
import { ReflectionSystem } from './ReflectionSystem.ts';
import { MistSystem } from './MistSystem.ts';
import { SkySystem } from './SkySystem.ts';
import { TransitionLightingSystem } from './TransitionLightingSystem.ts';
import { NebulaSystem } from './NebulaSystem.ts';
import { SpotlightSystem } from './SpotlightSystem.ts';
import { ShootingStarSystem } from './ShootingStarSystem.ts';
import { SparkleBurstSystem } from './SparkleBurstSystem.ts';
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

  // Spectacle layers: deep nebula + parallax stars, spotlight rig, meteors, celebration bursts
  const nebulaRef = useLazyRef(() => new NebulaSystem());
  const spotlightRef = useLazyRef(() => new SpotlightSystem());
  const meteorRef = useLazyRef(() => new ShootingStarSystem());
  const sparkleRef = useLazyRef(() => new SparkleBurstSystem());
  const prevStateRef = useRef(session.currentState);
  /** prefers-reduced-motion: freezes drift and sweeps, and skips meteors and bursts. */
  const reducedMotionRef = useRef(false);

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

    // One-shot celebrations. They key off the transition, so a reload mid-question fires nothing.
    const previousState = prevStateRef.current;
    prevStateRef.current = currentState;
    if (previousState !== currentState && !reducedMotionRef.current) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.45;
      if (currentState === 'word-lock') {
        sparkleRef.current.burst(cx, cy, 120);
        meteorRef.current.spawn(true);
        meteorRef.current.spawn(false);
      } else if (currentState === 'question-reveal' && previousState !== 'word-lock') {
        // Word-lock phase switched off: celebrate the reveal instead
        sparkleRef.current.burst(cx, cy, 80, 0.8);
      } else if (currentState === 'idle' && (previousState === 'question' || previousState === 'answered')) {
        // Done: gold diamond shower as the stage resets
        sparkleRef.current.shower(140);
      }
    }

    STATE_SOUNDS[currentState]?.();
  }, [session.currentState, lightingRef, meteorRef, sparkleRef]); // refs from useLazyRef are stable

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
    let vignette: CanvasGradient | null = null;

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

      // Edge vignette: darkens the corners so the lit centre of the stage reads as deep space
      vignette = ctx.createRadialGradient(width / 2, height * 0.45, Math.min(width, height) * 0.25,
        width / 2, height * 0.45, Math.max(width, height) * 0.75);
      vignette.addColorStop(0, 'rgba(3, 4, 14, 0)');
      vignette.addColorStop(0.6, 'rgba(3, 4, 14, 0.28)');
      vignette.addColorStop(1, 'rgba(3, 4, 14, 0.72)');

      crystalRef.current.init(width, height, sessionRef.current.appearanceSettings?.particleDensity || 1.0);
      mistRef.current.resize(width, height);
      skyRef.current.resize(width, height);
      lightingRef.current.resize(width, height);
      nebulaRef.current.resize(width, height);
      spotlightRef.current.resize(width, height);
      meteorRef.current.resize(width, height);
      sparkleRef.current.resize(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const motionQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    const syncMotion = () => {
      reducedMotionRef.current = !!motionQuery?.matches;
    };
    syncMotion();
    motionQuery?.addEventListener?.('change', syncMotion);

    const lerp = (cur: number, target: number, f: number = 0.06): number => {
      const diff = target - cur;
      if (Math.abs(diff) < 0.001) return target;
      return cur + diff * f;
    };

    let curAurora = 0.7;
    let curCrystal = 0.7;
    let curCrown = 0.5;
    let curReflection = 0.65;
    let curBeam = INITIAL_TARGETS.beamIntensity;
    let curEnergy = INITIAL_TARGETS.energy;
    let curMeteorRate = INITIAL_TARGETS.meteorRate;

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
      const nebula = nebulaRef.current;
      const spotlights = spotlightRef.current;
      const meteors = meteorRef.current;
      const sparkles = sparkleRef.current;
      const targets = targetsRef.current;
      const appearance = currentSession.appearanceSettings;
      const glow = appearance?.glowIntensity || 1.0;
      // Reduced motion: every layer is still drawn, but nothing drifts, sweeps or twinkles.
      const motion = reducedMotionRef.current ? 0 : 1;
      const motionDtMs = dtMs * motion;

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
      curBeam = lerp(curBeam, targets.beamIntensity, 0.05);
      curEnergy = lerp(curEnergy, targets.energy, 0.04);
      curMeteorRate = lerp(curMeteorRate, targets.meteorRate);

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

      // 2. Deep nebula clouds + parallax starfield (slow drift, faster while the word spins)
      nebula.update(dtMs, curEnergy, motion);
      nebula.render(ctx, Math.min(1.4, 0.55 + 0.45 * glow) * (0.75 + 0.25 * sky.skyClarity), curEnergy);

      // 3. Aurora Light Ribbon Layer
      if (appearance?.showAurora !== false) {
        aurora.update(motionDtMs);
        aurora.render(ctx, width, height, curAurora * glow);
      }

      // 4. Stars & Celestial Sky
      if (motion) sky.update();
      sky.draw(ctx);

      if (vignette) {
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
      }

      // 5. Shooting stars across the upper sky
      meteors.update(dtMs, curMeteorRate, motion > 0);
      meteors.render(ctx, Math.min(1, glow));

      // 6. Subtle Royal Crown Silhouette (Watermark)
      if (appearance?.showCrownSilhouette !== false) {
        crown.update(motionDtMs);
        crown.render(ctx, width, height, curCrown);
      }

      // 7. Floating Sparkling Crystals & Bokeh
      if (appearance?.showCrystals !== false) {
        crystal.update(motionDtMs, width, height);
        crystal.render(ctx, curCrystal);
      }

      // 8. Water Mirror Reflection Layer
      const showReflection = appearance?.showWaterReflection !== false;
      if (showReflection) {
        reflection.update(motionDtMs);
        reflection.render(ctx, width, height, curReflection);
      }

      // 9. Stage spotlight rig (drawn over the water so the floor pools and streaks show)
      spotlights.update(dtMs, currentSession.currentState, curEnergy, motion);
      if (appearance?.showLightRays !== false) {
        spotlights.render(ctx, curBeam * glow, showReflection);
      }

      // 10. Natural layer (mist)
      if (mist.density > 0.01) {
        if (motion) mist.update();
        mist.draw(ctx);
      }

      // 11. Stage Spotlight, Dynamic Vignette & Timer Glow
      lighting.update(dt, currentSession.currentState, 0.5, timerPhase);
      lighting.draw(ctx, currentSession.currentState, timerPhase);

      // 12. Celebration bursts (word-lock, Done) on top of everything
      sparkles.update(dtMs);
      sparkles.render(ctx, glow);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      motionQuery?.removeEventListener?.('change', syncMotion);
    };
  }, [auroraRef, crownRef, crystalRef, lightingRef, mistRef, reflectionRef, skyRef,
      nebulaRef, spotlightRef, meteorRef, sparkleRef]); // stable refs: runs once

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
