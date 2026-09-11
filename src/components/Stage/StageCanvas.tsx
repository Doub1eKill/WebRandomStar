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

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: string;
}

export const StageCanvas: React.FC<StageCanvasProps> = ({
  session,
  onLeafLanded,
  onMeteorImpact
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas particle & atmospheric systems
  const rainRef = useRef<RainSystem>(new RainSystem());
  const dropRef = useRef<WaterDropSystem>(new WaterDropSystem());
  const mistRef = useRef<MistSystem>(new MistSystem());
  const leafRef = useRef<LeafSystem>(new LeafSystem());
  const skyRef = useRef<SkySystem>(new SkySystem());
  const goldenBloomFlashRef = useRef<number>(0);
  const verticalBeamFlashRef = useRef<number>(0);

  // Cinematic Suspense & Supernova Engine refs
  const suspenseTimerRef = useRef<number>(0);
  const isSuspenseActiveRef = useRef<boolean>(false);
  const dimVignetteRef = useRef<number>(0);
  const shockwaveRingsRef = useRef<ShockwaveRing[]>([]);

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
        suspenseTimerRef.current = 0;
        isSuspenseActiveRef.current = false;
        dimVignetteRef.current = 0;
        shockwaveRingsRef.current = [];
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

        // Callback when the diamond hero leaf reaches the center pedestal
        leaf.onHeroLeafArrived = () => {
          isSuspenseActiveRef.current = true;
          suspenseTimerRef.current = 1.2; // 1.2s suspense beat
          dimVignetteRef.current = 0.72; // Hall spotlight dimming
          audioEngine.playSuspenseRiser(); // Deep heartbeat pulse & crystalline riser
        };

        // Fallback or explicit landing callback
        leaf.onHeroLeafLanded = () => {
          if (!isSuspenseActiveRef.current && suspenseTimerRef.current <= 0) {
            leaf.dissolveHeroLeaf();
            audioEngine.playSupernovaImpact();
            goldenBloomFlashRef.current = 0.9;
            verticalBeamFlashRef.current = 1.0;
            setTimeout(() => {
              if (onLeafLanded) onLeafLanded();
              else if (onMeteorImpact) onMeteorImpact();
            }, 400);
          }
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
        setTimeout(() => {
          leaf.active = false;
        }, 1500);
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

      // --- 6. Cinematic Suspense Buildup (1.2s beat before QuestionCard reveals) ---
      if (isSuspenseActiveRef.current) {
        suspenseTimerRef.current -= 0.016;

        // Stage Dimming Vignette to focus attention on center
        if (dimVignetteRef.current > 0.01) {
          ctx.save();
          const vig = ctx.createRadialGradient(
            width * 0.5, height * 0.46, 50,
            width * 0.5, height * 0.46, width * 0.8
          );
          vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
          vig.addColorStop(0.5, `rgba(4, 3, 16, ${dimVignetteRef.current * 0.55})`);
          vig.addColorStop(1, `rgba(2, 2, 10, ${dimVignetteRef.current})`);
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        // Contracting Diamond Laser Rings
        if (suspenseTimerRef.current > 0) {
          ctx.save();
          const progress = Math.min(1, Math.max(0, 1 - (suspenseTimerRef.current / 1.2)));
          const centerX = width * 0.5;
          const centerY = height * 0.46;

          [0, 0.28, 0.56].forEach((offset) => {
            const p = (progress + offset) % 1;
            const ringRadius = Math.max(1, (1 - p) * 220);
            const ringAlpha = Math.sin(p * Math.PI) * 0.85;

            ctx.strokeStyle = `rgba(224, 200, 255, ${ringAlpha})`;
            ctx.lineWidth = 1.8 + (1 - p) * 1.5;
            ctx.shadowColor = '#c084fc';
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.ellipse(centerX, centerY, ringRadius, ringRadius * 0.48, 0, 0, Math.PI * 2);
            ctx.stroke();
          });

          // Pulsing core beacon at center pedestal
          const corePulse = Math.sin(Date.now() * 0.015) * 0.25 + 0.8;
          const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 38 * corePulse);
          coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * corePulse})`);
          coreGrad.addColorStop(0.4, `rgba(192, 132, 252, ${0.65 * corePulse})`);
          coreGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 38 * corePulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        // Supernova Climax trigger upon countdown completion
        if (suspenseTimerRef.current <= 0) {
          isSuspenseActiveRef.current = false;
          dimVignetteRef.current = 0.35; // Fades out smoothly

          // 1. Dissolve hero leaf into supernova core
          leaf.dissolveHeroLeaf();

          // 2. Supernova impact audio
          audioEngine.playSupernovaImpact();

          // 3. High-intensity bloom & vertical lens flare
          goldenBloomFlashRef.current = 1.0;
          verticalBeamFlashRef.current = 1.0;

          // 4. Screen-wide Shockwave Rings
          const centerX = width * 0.5;
          const centerY = height * 0.46;
          const maxDist = Math.max(width, height) * 0.88;
          shockwaveRingsRef.current = [
            { x: centerX, y: centerY, radius: 10, maxRadius: maxDist, alpha: 1.0, speed: 28, color: '#ffffff' },
            { x: centerX, y: centerY, radius: 6, maxRadius: maxDist * 0.82, alpha: 0.9, speed: 20, color: '#c084fc' },
            { x: centerX, y: centerY, radius: 2, maxRadius: maxDist * 0.65, alpha: 0.8, speed: 14, color: '#a855f7' }
          ];

          // 5. Sparkles scatter burst
          leaf.spawnSparkles(centerX, centerY, 28);

          // 6. Reveal QuestionCard precisely 400ms into the supernova flash & expanding shockwave
          setTimeout(() => {
            if (onLeafLanded) onLeafLanded();
            else if (onMeteorImpact) onMeteorImpact();
          }, 400);
        }
      } else if (dimVignetteRef.current > 0.01) {
        dimVignetteRef.current *= 0.92;
      }

      // Render Expanding Shockwave Rings across screen
      if (shockwaveRingsRef.current.length > 0) {
        ctx.save();
        for (let i = shockwaveRingsRef.current.length - 1; i >= 0; i--) {
          const sw = shockwaveRingsRef.current[i];
          sw.radius += sw.speed;
          sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

          if (sw.alpha <= 0.01 || sw.radius >= sw.maxRadius) {
            shockwaveRingsRef.current.splice(i, 1);
            continue;
          }

          ctx.strokeStyle = sw.color === '#ffffff'
            ? `rgba(255, 255, 255, ${sw.alpha * 0.95})`
            : `rgba(192, 132, 252, ${sw.alpha * 0.85})`;
          ctx.lineWidth = Math.max(1, 4.5 * sw.alpha);
          ctx.shadowColor = sw.color;
          ctx.shadowBlur = 18;

          ctx.beginPath();
          ctx.ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.48, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 7. Royal Amethyst & Diamond Bloom Illumination upon Supernova
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
