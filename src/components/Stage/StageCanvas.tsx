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

  // Pass candidate nodes to constellation system
  useEffect(() => {
    if (session.candidateNodes) {
      constellationRef.current.setNodes(session.candidateNodes);
    }
  }, [session.candidateNodes]);

  // Handle stage state transitions & synchronized procedural audio
  useEffect(() => {
    const currentState = session.currentState;
    const rain = rainRef.current;
    const drop = dropRef.current;
    const mist = mistRef.current;
    const leaf = leafRef.current;
    const sky = skyRef.current;
    const constellation = constellationRef.current;
    const meteor = meteorRef.current;

    switch (currentState) {
      case 'idle':
        rain.intensity = 0.04;
        drop.opacity = 0;
        mist.density = 0.08;
        leaf.active = false;
        sky.skyClarity = 0.15;
        sky.moonOpacity = 0.1;
        constellation.opacity = 0;
        meteor.reset();
        break;

      case 'rain':
        rain.intensity = 1.0;
        drop.opacity = 0.2;
        mist.density = 0.2;
        leaf.active = false;
        sky.skyClarity = 0.0;
        sky.moonOpacity = 0.0;
        constellation.opacity = 0;
        audioEngine.playRainAmbience(1.5);
        break;

      case 'water-drop':
        rain.intensity = 0.4;
        drop.opacity = 0.85;
        mist.density = 0.35;
        leaf.active = false;
        sky.skyClarity = 0.05;
        sky.moonOpacity = 0.0;
        constellation.opacity = 0;
        audioEngine.playWaterDrop();
        break;

      case 'mist':
        rain.intensity = 0.0;
        drop.opacity = 0.25;
        mist.density = 0.95;
        leaf.active = false;
        sky.skyClarity = 0.1;
        sky.moonOpacity = 0.0;
        constellation.opacity = 0;
        audioEngine.fadeRainOut(2.0);
        break;

      case 'wind':
        rain.intensity = 0.0;
        drop.opacity = 0.08;
        mist.density = 0.45;
        leaf.active = true;
        sky.skyClarity = 0.2;
        sky.moonOpacity = 0.0;
        constellation.opacity = 0;
        audioEngine.playWindGust();
        break;

      case 'leaf':
        rain.intensity = 0.0;
        drop.opacity = 0.0;
        mist.density = 0.25;
        leaf.active = true;
        sky.skyClarity = 0.35;
        sky.moonOpacity = 0.15;
        constellation.opacity = 0;
        audioEngine.playLeafRustle();

        // Spawn hero leaf towards target question position
        if (session.meteorTrajectory && !leaf.heroLeaf) {
          leaf.spawnHeroLeaf(session.meteorTrajectory.targetX, session.meteorTrajectory.targetY);
        }
        break;

      case 'sky-opening':
        rain.intensity = 0.0;
        drop.opacity = 0.0;
        mist.density = 0.08;
        leaf.active = false;
        sky.skyClarity = 0.85;
        sky.moonOpacity = 0.9;
        constellation.opacity = 0.2;
        break;

      case 'constellation':
        rain.intensity = 0.0;
        drop.opacity = 0.0;
        mist.density = 0.02;
        leaf.active = false;
        sky.skyClarity = 1.0;
        sky.moonOpacity = 0.95;
        constellation.opacity = 1.0;
        audioEngine.playStarChime();
        break;

      case 'meteor':
        rain.intensity = 0.0;
        drop.opacity = 0.0;
        mist.density = 0.0;
        leaf.active = false;
        sky.skyClarity = 1.0;
        sky.moonOpacity = 0.95;
        constellation.opacity = 1.0;
        audioEngine.playMeteorWhoosh();

        if (session.meteorTrajectory && !meteor.active) {
          meteor.startMeteor(session.meteorTrajectory, () => {
            onMeteorImpact?.();
          });
        }
        break;

      case 'question':
      case 'answered':
        rain.intensity = 0.0;
        drop.opacity = 0.0;
        mist.density = 0.04;
        leaf.active = false;
        sky.skyClarity = 1.0;
        sky.moonOpacity = 0.85;
        constellation.opacity = 0.3; // subtle background stars
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

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

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

      // 1. Sky & Celestial Stars/Moon
      skyRef.current.update();
      skyRef.current.draw(ctx);

      // 2. Constellation Lines and Candidate Star Nodes
      constellationRef.current.update();
      constellationRef.current.draw(ctx);

      // 3. Meteor Streak & Stardust Sparks
      meteorRef.current.update();
      meteorRef.current.draw(ctx);

      // 4. Mist & Fog layer
      mistRef.current.update();
      mistRef.current.draw(ctx);

      // 5. Rain Drops
      rainRef.current.update();
      rainRef.current.draw(ctx);

      // 6. Condensation Water Drops
      dropRef.current.update();
      dropRef.current.draw(ctx);

      // 7. Autumn Leaves (Ambient and Hero Selection)
      leafRef.current.update();
      leafRef.current.draw(ctx);

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
