import React, { useRef, useEffect } from 'react';
import { SessionState } from '../../types/session.ts';
import { AuroraSystem } from './canvas/AuroraSystem.ts';
import { CrystalSystem } from './canvas/CrystalSystem.ts';
import { CrownSystem } from './canvas/CrownSystem.ts';
import { ReflectionSystem } from './canvas/ReflectionSystem.ts';
import { RainSystem } from './canvas/RainSystem.ts';
import { WaterDropSystem } from './canvas/WaterDropSystem.ts';
import { MistSystem } from './canvas/MistSystem.ts';
import { LeafSystem } from './canvas/LeafSystem.ts';
import { SkySystem } from './canvas/SkySystem.ts';
import { TransitionLightingSystem } from './canvas/TransitionLightingSystem.ts';
import { audioEngine } from '../../engine/audioEngine.ts';

interface StageCanvasProps {
  session: SessionState;
  onLeafLanded?: () => void;
  onQuestionReady?: () => void;
}

export const StageCanvas: React.FC<StageCanvasProps> = ({
  session,
  onLeafLanded: _onLeafLanded,
  onQuestionReady: _onQuestionReady
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas luxury pageant & atmospheric systems
  const auroraRef = useRef<AuroraSystem>(new AuroraSystem());
  const crystalRef = useRef<CrystalSystem>(new CrystalSystem());
  const crownRef = useRef<CrownSystem>(new CrownSystem());
  const reflectionRef = useRef<ReflectionSystem>(new ReflectionSystem());

  // Natural layer systems (retained for organic richness)
  const rainRef = useRef<RainSystem>(new RainSystem());
  const dropRef = useRef<WaterDropSystem>(new WaterDropSystem());
  const mistRef = useRef<MistSystem>(new MistSystem());
  const leafRef = useRef<LeafSystem>(new LeafSystem());
  const skyRef = useRef<SkySystem>(new SkySystem());
  const lightingRef = useRef<TransitionLightingSystem>(new TransitionLightingSystem());

  // Target values for smooth cross-fading
  const targetsRef = useRef({
    auroraIntensity: 0.8,
    crystalOpacity: 0.85,
    crownOpacity: 0.6,
    reflectionOpacity: 0.7,
    rainIntensity: 0.0,
    dropOpacity: 0.0,
    mistDensity: 0.05,
    leafOpacity: 0.0,
    skyClarity: 0.85,
    moonOpacity: 0.6
  });

  // Handle stage state transitions & synchronized procedural audio
  useEffect(() => {
    const currentState = session.currentState;
    const leaf = leafRef.current;

    switch (currentState) {
      case 'idle':
        targetsRef.current = {
          auroraIntensity: 0.7,
          crystalOpacity: 0.7,
          crownOpacity: 0.5,
          reflectionOpacity: 0.65,
          rainIntensity: 0.0,
          dropOpacity: 0.0,
          mistDensity: 0.05,
          leafOpacity: 0.0,
          skyClarity: 0.6,
          moonOpacity: 0.5
        };
        leaf.reset();
        lightingRef.current.reset();
        break;

      case 'pre-spin':
        targetsRef.current = {
          auroraIntensity: 1.0,
          crystalOpacity: 0.9,
          crownOpacity: 0.8,
          reflectionOpacity: 0.8,
          rainIntensity: 0.0,
          dropOpacity: 0.0,
          mistDensity: 0.03,
          leafOpacity: 0.0,
          skyClarity: 0.8,
          moonOpacity: 0.6
        };
        audioEngine.playSpinStart();
        break;

      case 'word-spin':
        targetsRef.current = {
          auroraIntensity: 1.2,
          crystalOpacity: 1.0,
          crownOpacity: 0.85,
          reflectionOpacity: 0.9,
          rainIntensity: 0.0,
          dropOpacity: 0.0,
          mistDensity: 0.02,
          leafOpacity: 0.0,
          skyClarity: 0.9,
          moonOpacity: 0.7
        };
        audioEngine.playSpinTick(1.0);
        break;

      case 'word-decelerate':
        targetsRef.current = {
          auroraIntensity: 1.1,
          crystalOpacity: 0.95,
          crownOpacity: 0.9,
          reflectionOpacity: 0.85,
          rainIntensity: 0.0,
          dropOpacity: 0.0,
          mistDensity: 0.02,
          leafOpacity: 0.0,
          skyClarity: 0.95,
          moonOpacity: 0.8
        };
        audioEngine.playSpinTick(0.4);
        break;

      case 'word-lock':
        targetsRef.current = {
          auroraIntensity: 1.3,
          crystalOpacity: 1.0,
          crownOpacity: 1.0,
          reflectionOpacity: 1.0,
          rainIntensity: 0.0,
          dropOpacity: 0.0,
          mistDensity: 0.0,
          leafOpacity: 0.0,
          skyClarity: 1.0,
          moonOpacity: 0.9
        };
        audioEngine.playWordLock();
        break;

      case 'question-reveal':
        targetsRef.current = {
          auroraIntensity: 1.0,
          crystalOpacity: 0.8,
          crownOpacity: 0.6,
          reflectionOpacity: 0.7,
          rainIntensity: 0.0,
          dropOpacity: 0.0,
          mistDensity: 0.0,
          leafOpacity: 0.0,
          skyClarity: 1.0,
          moonOpacity: 0.9
        };
        audioEngine.playQuestionReveal();
        break;

      case 'question':
      case 'answered':
        targetsRef.current = {
          auroraIntensity: 0.85,
          crystalOpacity: 0.75,
          crownOpacity: 0.5,
          reflectionOpacity: 0.65,
          rainIntensity: 0.0,
          dropOpacity: 0.0,
          mistDensity: 0.0,
          leafOpacity: 0.0,
          skyClarity: 1.0,
          moonOpacity: 0.85
        };
        leaf.active = false;
        break;

      // Legacy fallback states
      case 'rain':
        targetsRef.current.rainIntensity = 1.0;
        audioEngine.playRainAmbience(1.5);
        break;
      case 'water-drop':
        audioEngine.playWaterDrop();
        break;
      case 'wind':
        audioEngine.playWindGust();
        break;
      case 'leaf':
        audioEngine.playLeafRustle();
        break;
      case 'sky-clear':
        audioEngine.playSkyTransition();
        break;
    }
  }, [session.currentState]);

  // Setup Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      crystalRef.current.init(width, height, session.appearanceSettings?.particleDensity || 1.0);
      rainRef.current.resize(width, height);
      dropRef.current.resize(width, height);
      mistRef.current.resize(width, height);
      leafRef.current.resize(width, height);
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

      const width = window.innerWidth;
      const height = window.innerHeight;

      const aurora = auroraRef.current;
      const crystal = crystalRef.current;
      const crown = crownRef.current;
      const reflection = reflectionRef.current;

      const rain = rainRef.current;
      const drop = dropRef.current;
      const mist = mistRef.current;
      const leaf = leafRef.current;
      const sky = skyRef.current;
      const lighting = lightingRef.current;
      const targets = targetsRef.current;

      const timerPhase = session.timerState
        ? (session.timerState.status === 'finished'
            ? 'finished'
            : session.timerState.status === 'running'
            ? (Math.ceil(session.timerState.remainingMs / 1000) <= 3
                ? 'last-3s'
                : Math.ceil(session.timerState.remainingMs / 1000) <= 10
                ? 'critical'
                : session.timerState.remainingMs <= (session.timerState.warningAtMs || 30000)
                ? 'warning'
                : 'normal')
            : 'normal')
        : 'normal';

      // Smoothly interpolate opacities & densities
      curAurora = lerp(curAurora, targets.auroraIntensity);
      curCrystal = lerp(curCrystal, targets.crystalOpacity);
      curCrown = lerp(curCrown, targets.crownOpacity);
      curReflection = lerp(curReflection, targets.reflectionOpacity);

      rain.intensity = lerp(rain.intensity, targets.rainIntensity);
      drop.opacity = lerp(drop.opacity, targets.dropOpacity);
      mist.density = lerp(mist.density, targets.mistDensity);
      leaf.opacity = lerp(leaf.opacity, targets.leafOpacity);
      sky.skyClarity = lerp(sky.skyClarity, targets.skyClarity);
      sky.moonOpacity = lerp(sky.moonOpacity, targets.moonOpacity);

      // 1. Luxury Night Sky Background Base (#071126 to #0D2854)
      ctx.fillStyle = '#071126';
      ctx.fillRect(0, 0, width, height);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#071126');
      skyGrad.addColorStop(0.35, '#0D2854');
      skyGrad.addColorStop(0.7, '#1b1448');
      skyGrad.addColorStop(1, '#070b1a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Aurora Light Ribbon Layer
      aurora.update(dtMs);
      aurora.render(ctx, width, height, curAurora * (session.appearanceSettings?.glowIntensity || 1.0));

      // 3. Stars & Celestial Sky
      sky.update();
      sky.draw(ctx);

      // 4. Subtle Royal Crown Silhouette (Watermark)
      if (session.appearanceSettings?.showCrownSilhouette !== false) {
        crown.update(dtMs);
        crown.render(ctx, width, height, curCrown);
      }

      // 5. Floating Sparkling Crystals & Bokeh
      crystal.update(dtMs, width, height);
      crystal.render(ctx, curCrystal);

      // 6. Water Mirror Reflection Layer
      if (session.appearanceSettings?.showWaterReflection !== false) {
        reflection.update(dtMs);
        reflection.render(ctx, width, height, curReflection);
      }

      // 7. Natural Layer (Rain, Mist, Leaves if active)
      if (rain.intensity > 0.01) {
        rain.update();
        rain.draw(ctx);
      }
      if (drop.opacity > 0.01) {
        drop.update();
        drop.draw(ctx);
      }
      if (mist.density > 0.01) {
        mist.update();
        mist.draw(ctx);
      }
      if (leaf.opacity > 0.01) {
        leaf.update();
        leaf.draw(ctx);
      }

      // 8. Stage Spotlight, Dynamic Vignette & Timer Glow
      lighting.update(dt, session.currentState, 0.5, timerPhase);
      lighting.draw(ctx, session.currentState, timerPhase);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [session]);

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
