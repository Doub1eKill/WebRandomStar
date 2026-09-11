import React, { useRef, useEffect } from 'react';
import { SessionState } from '../../types/session.ts';
import { RainSystem } from './canvas/RainSystem.ts';
import { WaterDropSystem } from './canvas/WaterDropSystem.ts';
import { MistSystem } from './canvas/MistSystem.ts';
import { LeafSystem } from './canvas/LeafSystem.ts';
import { SkySystem } from './canvas/SkySystem.ts';
import { ConstellationSystem } from './canvas/ConstellationSystem.ts';
import { MeteorSystem } from './canvas/MeteorSystem.ts';
import { audioEngine } from '../../engine/audioEngine.ts';

interface StageCanvasProps {
  session: SessionState;
  onMeteorImpact?: () => void;
}

export const StageCanvas: React.FC<StageCanvasProps> = ({ session, onMeteorImpact }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Particle & celestial systems
  const rainRef = useRef<RainSystem>(new RainSystem());
  const dropRef = useRef<WaterDropSystem>(new WaterDropSystem());
  const mistRef = useRef<MistSystem>(new MistSystem());
  const leafRef = useRef<LeafSystem>(new LeafSystem());
  const skyRef = useRef<SkySystem>(new SkySystem());
  const constellationRef = useRef<ConstellationSystem>(new ConstellationSystem());
  const meteorRef = useRef<MeteorSystem>(new MeteorSystem());
  const supernovaFlashRef = useRef<number>(0);

  // Smooth cross-fade target values
  const targetsRef = useRef({
    rainIntensity: 0.04,
    dropOpacity: 0.0,
    mistDensity: 0.08,
    leafOpacity: 0.0,
    skyClarity: 0.15,
    moonOpacity: 0.1,
    constellationOpacity: 0.0
  });

  // Pass candidate nodes to constellation system
  useEffect(() => {
    if (session.candidateNodes) {
      constellationRef.current.setNodes(session.candidateNodes);
    }
  }, [session.candidateNodes]);

  // Handle stage state transitions & synchronized procedural audio
  useEffect(() => {
    const currentState = session.currentState;
    const leaf = leafRef.current;
    const constellation = constellationRef.current;
    const meteor = meteorRef.current;

    switch (currentState) {
      case 'idle':
        targetsRef.current = {
          rainIntensity: 0.04,
          dropOpacity: 0.0,
          mistDensity: 0.08,
          leafOpacity: 0.0,
          skyClarity: 0.15,
          moonOpacity: 0.1,
          constellationOpacity: 0.0
        };
        leaf.active = false;
        meteor.reset();
        constellation.reset();
        supernovaFlashRef.current = 0;
        break;

      case 'rain':
        targetsRef.current = {
          rainIntensity: 1.0,
          dropOpacity: 0.2,
          mistDensity: 0.2,
          leafOpacity: 0.0,
          skyClarity: 0.0,
          moonOpacity: 0.0,
          constellationOpacity: 0.0
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
          moonOpacity: 0.0,
          constellationOpacity: 0.0
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
          moonOpacity: 0.0,
          constellationOpacity: 0.0
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
          moonOpacity: 0.0,
          constellationOpacity: 0.0
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
          moonOpacity: 0.15,
          constellationOpacity: 0.0
        };
        leaf.active = true;
        audioEngine.playLeafRustle();

        // Spawn hero leaf towards target question position
        if (session.meteorTrajectory && !leaf.heroLeaf) {
          leaf.spawnHeroLeaf(session.meteorTrajectory.targetX, session.meteorTrajectory.targetY);
        }
        break;

      case 'sky-opening':
        targetsRef.current = {
          rainIntensity: 0.0,
          dropOpacity: 0.0,
          mistDensity: 0.08,
          leafOpacity: 0.2,
          skyClarity: 0.85,
          moonOpacity: 0.9,
          constellationOpacity: 0.25
        };
        leaf.active = false;
        break;

      case 'constellation':
        targetsRef.current = {
          rainIntensity: 0.0,
          dropOpacity: 0.0,
          mistDensity: 0.02,
          leafOpacity: 0.0,
          skyClarity: 1.0,
          moonOpacity: 0.95,
          constellationOpacity: 1.0
        };
        leaf.active = false;
        audioEngine.playStarChime();
        audioEngine.playHeartbeatRiser(2.5);

        if (session.meteorTrajectory) {
          constellation.setTargetNode(session.meteorTrajectory.targetX, session.meteorTrajectory.targetY);
          const lockTimer = setTimeout(() => {
            constellation.lockOn();
          }, 1800);
          return () => clearTimeout(lockTimer);
        }
        break;

      case 'meteor':
        targetsRef.current = {
          rainIntensity: 0.0,
          dropOpacity: 0.0,
          mistDensity: 0.0,
          leafOpacity: 0.0,
          skyClarity: 1.0,
          moonOpacity: 0.95,
          constellationOpacity: 1.0
        };
        leaf.active = false;
        constellation.lockOn();
        audioEngine.playMeteorWhoosh();

        if (session.meteorTrajectory && !meteor.active) {
          meteor.startMeteor(session.meteorTrajectory, () => {
            supernovaFlashRef.current = 1.0;
            audioEngine.playSupernovaBoom();
            onMeteorImpact?.();
          });
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
          moonOpacity: 0.85,
          constellationOpacity: 0.35 // subtle background stars
        };
        leaf.active = false;
        break;
    }
  }, [session.currentState, session.meteorTrajectory, onMeteorImpact]);

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
      const constellation = constellationRef.current;
      const meteor = meteorRef.current;
      const targets = targetsRef.current;

      // Smoothly interpolate all opacities & densities towards target values
      rain.intensity = lerp(rain.intensity, targets.rainIntensity);
      drop.opacity = lerp(drop.opacity, targets.dropOpacity);
      mist.density = lerp(mist.density, targets.mistDensity);
      leaf.opacity = lerp(leaf.opacity, targets.leafOpacity);
      sky.skyClarity = lerp(sky.skyClarity, targets.skyClarity);
      sky.moonOpacity = lerp(sky.moonOpacity, targets.moonOpacity);
      constellation.opacity = lerp(constellation.opacity, targets.constellationOpacity);

      // Base background
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Deep sky atmosphere gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0b1329');
      skyGrad.addColorStop(0.5, '#0f1d3a');
      skyGrad.addColorStop(1, '#060a14');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Apply screen micro-shake when meteor impacts
      ctx.save();
      if (meteor.shockIntensity > 0) {
        const shake = meteor.shockIntensity;
        const offsetX = (Math.random() - 0.5) * shake;
        const offsetY = (Math.random() - 0.5) * shake;
        ctx.translate(offsetX, offsetY);
      }

      // 1. Sky & Celestial Stars/Moon
      sky.update();
      sky.draw(ctx);

      // 2. Constellation Lines and Candidate Star Nodes
      constellation.update();
      constellation.draw(ctx);

      // 3. Meteor Streak, Shockwave Rings & Stardust Sparks
      meteor.update();
      meteor.draw(ctx);

      // 4. Mist & Fog layer
      mist.update();
      mist.draw(ctx);

      // 5. Rain Drops
      rain.update();
      rain.draw(ctx);

      // 6. Condensation Water Drops
      drop.update();
      drop.draw(ctx);

      // 7. Autumn Leaves (Ambient and Hero Selection)
      leaf.update();
      leaf.draw(ctx);

      // 8. Supernova Full-Screen Flash
      if (supernovaFlashRef.current > 0.01) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${supernovaFlashRef.current * 0.8})`;
        ctx.fillRect(0, 0, width, height);

        const flashGlow = ctx.createRadialGradient(
          width * 0.5, height * 0.5, 40,
          width * 0.5, height * 0.5, width * 0.7
        );
        flashGlow.addColorStop(0, `rgba(253, 224, 71, ${supernovaFlashRef.current * 0.45})`);
        flashGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = flashGlow;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        supernovaFlashRef.current *= 0.86;
      }

      // Restore transform from screen shake
      ctx.restore();

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
