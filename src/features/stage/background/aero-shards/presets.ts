/** AeroShards tuning constants (split out of AeroShards.tsx in Phase 6, A2). */
export const PLACEMENTS: Record<string, number> = { right: 0, left: 1, center: 2, full: 3 };
export const MATERIALS: Record<string, number> = { pearl: 0, chrome: 1, satin: 2 };
export const INTERACTIONS: Record<string, number> = { none: 0, repel: 1, attract: 2 };
export const FLOWS: Record<string, number> = { stream: 0, vortex: 1, ribbon: 2 };
export const RIPPLE_SPEED = 4.2;
export const RIPPLE_TAIL = 1.8;

export const MATERIAL_PRESETS = {
  pearl: { roughness: 0.46, brightness: 0.92, glow: 0.54, highlightMix: 0.78 },
  chrome: { roughness: 0.1, brightness: 1.12, glow: 0.38, highlightMix: 0.9 },
  satin: { roughness: 0.74, brightness: 0.84, glow: 0.42, highlightMix: 0.66 }
};

export const DETAIL_PRESETS = {
  bold: { count: 0.58, size: 1.32 },
  balanced: { count: 1, size: 0.96 },
  fine: { count: 1.15, size: 0.7 }
};

export const QUALITY_PRESETS = {
  low: { count: 1900, dpr: 1.5, supersamplePixels: 3000000 },
  medium: { count: 3200, dpr: 2, supersamplePixels: 6000000 },
  high: { count: 4600, dpr: 2, supersamplePixels: 8000000 }
};

export const RUNTIME_QUALITY = [{ countScale: 1 }, { countScale: 0.86 }, { countScale: 0.72 }];
export const BLOOM_SCALES = [0.25, 0.22, 0.18];
export const FRAME_STATES = {
  interactive: { interval: 1000 / 60, continuous: true },
  settling: { interval: 1000 / 60, continuous: true },
  ambient: { interval: 1000 / 60, continuous: true },
  partial: { interval: 1000 / 12, continuous: false }
};

/**
 * How the stage backdrop and the sculpture react to each phase (mirrors the Cosmic Canvas
 * stateTargets): `energy` speeds up the shard stream, beam sweep and star drift; `beams` is the
 * spotlight brightness. Question phases stay calm so the question card is easy to read.
 */
export const STAGE_SCENERY: Record<string, { energy: number; beams: number }> = {
  idle: { energy: 0.35, beams: 0.55 },
  'pre-spin': { energy: 0.75, beams: 0.85 },
  'word-spin': { energy: 1, beams: 1 },
  'word-decelerate': { energy: 0.8, beams: 0.95 },
  'word-lock': { energy: 0.6, beams: 1.25 },
  'question-reveal': { energy: 0.4, beams: 0.7 },
  question: { energy: 0.12, beams: 0.3 },
  answered: { energy: 0.12, beams: 0.3 }
};
