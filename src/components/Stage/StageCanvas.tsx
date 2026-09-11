import React, { useRef, useEffect } from 'react';
import { SessionState } from '../../types/session.ts';
import { RainSystem } from './canvas/RainSystem.ts';
import { WaterDropSystem } from './canvas/WaterDropSystem.ts';
import { MistSystem } from './canvas/MistSystem.ts';
import { LeafSystem } from './canvas/LeafSystem.ts';
import { SkySystem } from './canvas/SkySystem.ts';
import { audioEngine } from '../../engine/audioEngine.ts';

interface StageCanvasProps {
  session: SessionState;
  onLeafLanded?: () => void;
  onMeteorImpact?: () => void;
}

export const StageCanvas: React.FC<StageCanvasProps> = ({ session, onLeafLanded, onMeteorImpact }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Natural transition particle systems
  const rainRef = useRef<RainSystem>(new RainSystem());
  const dropRef = useRef<WaterDropSystem>(new WaterDropSystem());
  const mistRef = useRef<MistSystem>(new MistSystem());
  const leafRef = useRef<LeafSystem>(new LeafSystem());
  const skyRef = useRef<SkySystem>(new SkySystem());
  const goldenBloomFlashRef = useRef<number>(0);
  const verticalBeamFlashRef = useRef<number>(0);

  // Smooth cross-fade target values
  const targetsRef = useRef({
    rainIntensity: 0.04,
    dropOpacity: 0.0,
    mistDensity: 0.08,
    leafOpacity: 0.0,
    skyClarity: 0.15,
    moonOpacity: 0.1
  });

  // Handle stage state transitions & synchronized procedural audio
  useEffect(() => {
    const currentState = session.currentState;
    const leaf = leafRef.current;

    switch (currentState) {
      case 'idle':
        targetsRef.current = {
          rainIntensity: 0.04,
          dropOpacity: 0.0,
          mistDensity: 0.08,
          leafOpacity: 0.0,
          skyClarity: 0.15,
          moonOpacity: 0.1
        };
        leaf.reset();
        goldenBloomFlashRef.current = 0;
        verticalBeamFlashRef.current = 0;
        break;

      case 'rain':
        targetsRef.current = {
          rainIntensity: 1.0,
          dropOpacity: 0.2,
          mistDensity: 0.2,
          leafOpacity: 0.0,
          skyClarity: 0.0,
          moonOpacity: 0.0
        };
        leaf.active = false;
        audioEngine.playRainAmbience(1.5);
        break;

      case 'water-drop':
        targetsRef.current = {
          rainIntensity: 0.35,
          dropOpacity: 0.85,
          mistDensity: 0.35,
          leafOpacity: 0.0,
          skyClarity: 0.05,
          moonOpacity: 0.0
        };
        leaf.active = false;
        audioEngine.playWaterDrop();
        break;

      case 'mist':
        targetsRef.current = {
          rainIntensity: 0.0,
          dropOpacity: 0.25,
          mistDensity: 0.95,
          leafOpacity: 0.0,
          skyClarity: 0.1,
          moonOpacity: 0.0
        };
        leaf.active = false;
        audioEngine.fadeRainOut(2.0);
        break;

      case 'wind':
        targetsRef.current = {
          rainIntensity: 0.0,
          dropOpacity: 0.06,
          mistDensity: 0.45,
          leafOpacity: 0.85,
          skyClarity: 0.2,
          moonOpacity: 0.0
        };
        leaf.active = true;
        audioEngine.playWindGust();
        break;

      case 'leaf':
        targetsRef.current = {
          rainIntensity: 0.0,
          dropOpacity: 0.0,
          mistDensity: 0.2,
          leafOpacity: 1.0,
          skyClarity: 0.35,
          moonOpacity: 0.15
        };
        leaf.active = true;
        audioEngine.playLeafRustle();

        // Callback when the diamond hero leaf lands in center
        leaf.onHeroLeafLanded = () => {
          audioEngine.playWaterDrop();
          goldenBloomFlashRef.current = 0.6; // royal amethyst/diamond bloom
          verticalBeamFlashRef.current = 1.0; // upward vertical violet spotlight beam!
          if (onLeafLanded) onLeafLanded();
          else if (onMeteorImpact) onMeteorImpact();
        };

        // Target center position where QuestionCard will bloom
        const targetX = session.meteorTrajectory ? session.meteorTrajectory.targetX : window.innerWidth * 0.5;
        const targetY = session.meteorTrajectory ? session.meteorTrajectory.targetY : window.innerHeight * 0.46;
        if (!leaf.heroLeaf) {
          leaf.spawnHeroLeaf(targetX, targetY);
        }
        break;

      case 'question':
      case 'answered':
        targetsRef.current = {
          rainIntensity: 0.0,
          dropOpacity: 0.0,
          mistDensity: 0.03,
          leafOpacity: 0.0,
          skyClarity: 1.0,
          moonOpacity: 0.85
        };
        leaf.active = false;
        break;
    }
  }, [session.currentState, session.meteorTrajectory, onLeafLanded, onMeteorImpact]);

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

      rainRef.current.resize(width, height);
      dropRef.current.resize(width, height);
      mistRef.current.resize(width, height);
      leafRef.current.resize(width, height);
      skyRef.current.resize(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const lerp = (cur: number, target: number, f: number = 0.06): number => {
      const diff = target - cur;
      if (Math.abs(diff) < 0.001) return target;
      return cur + diff * f;
    };

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const rain = rainRef.current;
      const drop = dropRef.current;
      const mist = mistRef.current;
      const leaf = leafRef.current;
      const sky = skyRef.current;
      const targets = targetsRef.current;

      // Smoothly interpolate all opacities & densities towards target values
      rain.intensity = lerp(rain.intensity, targets.rainIntensity);
      drop.opacity = lerp(drop.opacity, targets.dropOpacity);
      mist.density = lerp(mist.density, targets.mistDensity);
      leaf.opacity = lerp(leaf.opacity, targets.leafOpacity);
      sky.skyClarity = lerp(sky.skyClarity, targets.skyClarity);
      sky.moonOpacity = lerp(sky.moonOpacity, targets.moonOpacity);

      // Base background
      ctx.fillStyle = '#070818';
      ctx.fillRect(0, 0, width, height);

      // Deep sky atmosphere gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#070818');
      skyGrad.addColorStop(0.42, '#100e2b');
      skyGrad.addColorStop(0.78, '#181242');
      skyGrad.addColorStop(1, '#080814');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Sky & Celestial Stars/Moon
      sky.update();
      sky.draw(ctx);

      // 2. Mist & Fog layer
      mist.update();
      mist.draw(ctx);

      // 3. Rain Drops
      rain.update();
      rain.draw(ctx);

      // 4. Condensation Water Drops
      drop.update();
      drop.draw(ctx);

      // 5. Autumn Leaves & Golden Water Ripples
      leaf.update();
      leaf.draw(ctx);

      // 6. Royal Amethyst & Diamond Bloom Illumination upon Leaf Landing
      if (goldenBloomFlashRef.current > 0.01) {
        ctx.save();
        const flashGlow = ctx.createRadialGradient(
          width * 0.5, height * 0.46, 20,
          width * 0.5, height * 0.46, width * 0.65
        );
        flashGlow.addColorStop(0, `rgba(255, 255, 255, ${goldenBloomFlashRef.current * 0.5})`);
        flashGlow.addColorStop(0.35, `rgba(192, 132, 252, ${goldenBloomFlashRef.current * 0.35})`);
        flashGlow.addColorStop(0.7, `rgba(147, 51, 234, ${goldenBloomFlashRef.current * 0.15})`);
        flashGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = flashGlow;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        goldenBloomFlashRef.current *= 0.88;
      }

      // 7. Spectacular Vertical Violet Lens Flare Beam (Official Ambassador Poster Light Column)
      if (verticalBeamFlashRef.current > 0.01) {
        ctx.save();
        const beamAlpha = verticalBeamFlashRef.current;
        const beamX = width * 0.5;

        // Wide soft violet spotlight illumination
        const wideGrad = ctx.createLinearGradient(beamX - 160, 0, beamX + 160, 0);
        wideGrad.addColorStop(0, 'rgba(147, 51, 234, 0)');
        wideGrad.addColorStop(0.5, `rgba(168, 85, 247, ${beamAlpha * 0.32})`);
        wideGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');
        ctx.fillStyle = wideGrad;
        ctx.fillRect(beamX - 160, 0, 320, height);

        // Core vertical violet beam
        const beamGrad = ctx.createLinearGradient(beamX - 50, 0, beamX + 50, 0);
        beamGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
        beamGrad.addColorStop(0.2, `rgba(192, 132, 252, ${beamAlpha * 0.45})`);
        beamGrad.addColorStop(0.5, `rgba(235, 220, 255, ${beamAlpha * 0.92})`);
        beamGrad.addColorStop(0.8, `rgba(192, 132, 252, ${beamAlpha * 0.45})`);
        beamGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(beamX - 50, 0, 100, height);

        // Central diamond-white laser core
        ctx.fillStyle = `rgba(255, 255, 255, ${beamAlpha * 0.96})`;
        ctx.fillRect(beamX - 5, 0, 10, height);

        // Diamond starburst flare at pedestal center
        const starRadius = 80 * beamAlpha;
        const flareGrad = ctx.createRadialGradient(beamX, height * 0.46, 4, beamX, height * 0.46, starRadius);
        flareGrad.addColorStop(0, `rgba(255, 255, 255, ${beamAlpha})`);
        flareGrad.addColorStop(0.3, `rgba(224, 200, 255, ${beamAlpha * 0.85})`);
        flareGrad.addColorStop(0.65, `rgba(168, 85, 247, ${beamAlpha * 0.4})`);
        flareGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = flareGrad;
        ctx.beginPath();
        ctx.arc(beamX, height * 0.46, starRadius, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal lens flare streak across the starburst (anamorphic lens flare)
        const streakGrad = ctx.createLinearGradient(beamX - 260 * beamAlpha, 0, beamX + 260 * beamAlpha, 0);
        streakGrad.addColorStop(0, 'rgba(192, 132, 252, 0)');
        streakGrad.addColorStop(0.5, `rgba(255, 255, 255, ${beamAlpha * 0.9})`);
        streakGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');
        ctx.fillStyle = streakGrad;
        ctx.fillRect(beamX - 260 * beamAlpha, height * 0.46 - 2.5, 520 * beamAlpha, 5);

        ctx.restore();
        verticalBeamFlashRef.current *= 0.91; // Smooth decay
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
