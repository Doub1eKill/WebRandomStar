import React, { useRef, useEffect } from 'react';
import { SessionState } from '../../types/session.ts';
import { RainSystem } from './canvas/RainSystem.ts';
import { WaterDropSystem } from './canvas/WaterDropSystem.ts';
import { MistSystem } from './canvas/MistSystem.ts';
import { LeafSystem } from './canvas/LeafSystem.ts';

interface StageCanvasProps {
  session: SessionState;
}

export const StageCanvas: React.FC<StageCanvasProps> = ({ session }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Particle systems
  const rainSystemRef = useRef<RainSystem>(new RainSystem());
  const dropSystemRef = useRef<WaterDropSystem>(new WaterDropSystem());
  const mistSystemRef = useRef<MistSystem>(new MistSystem());
  const leafSystemRef = useRef<LeafSystem>(new LeafSystem());

  // Handle stage state changes & triggers
  useEffect(() => {
    const currentState = session.currentState;
    const rain = rainSystemRef.current;
    const drops = dropSystemRef.current;
    const mist = mistSystemRef.current;
    const leaf = leafSystemRef.current;

    switch (currentState) {
      case 'idle':
        rain.intensity = 0.05;
        drops.opacity = 0;
        mist.density = 0.05;
        leaf.active = false;
        break;

      case 'rain':
        rain.intensity = 1.0;
        drops.opacity = 0.2;
        mist.density = 0.15;
        leaf.active = false;
        break;

      case 'water-drop':
        rain.intensity = 0.4;
        drops.opacity = 0.85;
        mist.density = 0.3;
        leaf.active = false;
        break;

      case 'mist':
        rain.intensity = 0.0;
        drops.opacity = 0.3;
        mist.density = 0.95;
        leaf.active = false;
        break;

      case 'wind':
        rain.intensity = 0.0;
        drops.opacity = 0.1;
        mist.density = 0.5;
        leaf.active = true;
        break;

      case 'leaf':
        rain.intensity = 0.0;
        drops.opacity = 0.0;
        mist.density = 0.35;
        leaf.active = true;
        // Trigger hero leaf to landing target coordinate
        if (session.meteorTrajectory && !leaf.heroLeaf) {
          leaf.spawnHeroLeaf(session.meteorTrajectory.targetX, session.meteorTrajectory.targetY);
        }
        break;

      default:
        // Remaining stages clear the rain/mist/leaf
        rain.intensity = 0.0;
        drops.opacity = 0.0;
        mist.density = 0.1;
        leaf.active = false;
        break;
    }
  }, [session.currentState, session.meteorTrajectory]);

  // Canvas resize and render loop
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

      rainSystemRef.current.resize(width, height);
      dropSystemRef.current.resize(width, height);
      mistSystemRef.current.resize(width, height);
      leafSystemRef.current.resize(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // 60 FPS Render Loop
    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Base background color
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Deep sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0b1329');
      skyGrad.addColorStop(0.6, '#0f1d3a');
      skyGrad.addColorStop(1, '#060a14');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Update and draw systems
      rainSystemRef.current.update();
      rainSystemRef.current.draw(ctx);

      dropSystemRef.current.update();
      dropSystemRef.current.draw(ctx);

      mistSystemRef.current.update();
      mistSystemRef.current.draw(ctx);

      leafSystemRef.current.update();
      leafSystemRef.current.draw(ctx);

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
