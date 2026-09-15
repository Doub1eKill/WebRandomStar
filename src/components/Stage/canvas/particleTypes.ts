export interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
  width: number;
}

export interface CondensationDrop {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  trail: { x: number; y: number; alpha: number }[];
  maxTrail: number;
}

export interface MistPuff {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  opacity: number;
  phase: number;
}

export interface LeafParticle {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  vx: number;
  vy: number;
  color: string;
  shapeType: 'oval' | 'maple' | 'willow';
  opacity: number;
  targetX?: number;
  targetY?: number;
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
