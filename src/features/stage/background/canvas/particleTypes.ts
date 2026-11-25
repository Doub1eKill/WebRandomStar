export interface MistPuff {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  opacity: number;
  phase: number;
}

export interface CrystalParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  type: 'diamond' | 'star' | 'bokeh';
}
