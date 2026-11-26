/**
 * A8: what the canvas does when the stage enters each phase, as data instead of a 140-line
 * switch. The first seven values are copied unchanged from the former StageCanvas switch;
 * beamIntensity / energy / meteorRate drive the spotlight rig, nebula drift and shooting stars.
 * Question phases keep them low and steady so the question stays easy to read.
 */
import { AppState } from '@/types/session.ts';
import { audioEngine } from '@/features/audio/audioEngine.ts';

export interface LayerTargets {
  auroraIntensity: number;
  crystalOpacity: number;
  crownOpacity: number;
  reflectionOpacity: number;
  mistDensity: number;
  skyClarity: number;
  moonOpacity: number;
  /** Spotlight rig brightness (0 = off). */
  beamIntensity: number;
  /** Overall motion energy: beam sweep speed, nebula drift and parallax. */
  energy: number;
  /** Average shooting stars per second. */
  meteorRate: number;
}

/** Initial targets before any phase change (unchanged from StageCanvas). */
export const INITIAL_TARGETS: LayerTargets = {
  auroraIntensity: 0.8,
  crystalOpacity: 0.85,
  crownOpacity: 0.6,
  reflectionOpacity: 0.7,
  mistDensity: 0.05,
  skyClarity: 0.85,
  moonOpacity: 0.6,
  beamIntensity: 0.55,
  energy: 0.35,
  meteorRate: 0.12
};

const QUESTION_TARGETS: LayerTargets = {
  auroraIntensity: 0.85,
  crystalOpacity: 0.75,
  crownOpacity: 0.5,
  reflectionOpacity: 0.65,
  mistDensity: 0.0,
  skyClarity: 1.0,
  moonOpacity: 0.85,
  beamIntensity: 0.3,
  energy: 0.12,
  meteorRate: 0.03
};

/** Layer targets that replace the current ones when the stage enters a phase. */
export const STATE_TARGETS: Partial<Record<AppState, LayerTargets>> = {
  'idle': {
    auroraIntensity: 0.7,
    crystalOpacity: 0.7,
    crownOpacity: 0.5,
    reflectionOpacity: 0.65,
    mistDensity: 0.05,
    skyClarity: 0.6,
    moonOpacity: 0.5,
    beamIntensity: 0.55,
    energy: 0.35,
    meteorRate: 0.12
  },
  'pre-spin': {
    auroraIntensity: 1.0,
    crystalOpacity: 0.9,
    crownOpacity: 0.8,
    reflectionOpacity: 0.8,
    mistDensity: 0.03,
    skyClarity: 0.8,
    moonOpacity: 0.6,
    beamIntensity: 0.85,
    energy: 0.75,
    meteorRate: 0.35
  },
  'word-spin': {
    auroraIntensity: 1.2,
    crystalOpacity: 1.0,
    crownOpacity: 0.85,
    reflectionOpacity: 0.9,
    mistDensity: 0.02,
    skyClarity: 0.9,
    moonOpacity: 0.7,
    beamIntensity: 1.0,
    energy: 1.0,
    meteorRate: 0.6
  },
  'word-decelerate': {
    auroraIntensity: 1.1,
    crystalOpacity: 0.95,
    crownOpacity: 0.9,
    reflectionOpacity: 0.85,
    mistDensity: 0.02,
    skyClarity: 0.95,
    moonOpacity: 0.8,
    beamIntensity: 0.95,
    energy: 0.8,
    meteorRate: 0.45
  },
  'word-lock': {
    auroraIntensity: 1.3,
    crystalOpacity: 1.0,
    crownOpacity: 1.0,
    reflectionOpacity: 1.0,
    mistDensity: 0.0,
    skyClarity: 1.0,
    moonOpacity: 0.9,
    beamIntensity: 1.25,
    energy: 0.6,
    meteorRate: 0.2
  },
  'question-reveal': {
    auroraIntensity: 1.0,
    crystalOpacity: 0.8,
    crownOpacity: 0.6,
    reflectionOpacity: 0.7,
    mistDensity: 0.0,
    skyClarity: 1.0,
    moonOpacity: 0.9,
    beamIntensity: 0.7,
    energy: 0.4,
    meteorRate: 0.08
  },
  'question': QUESTION_TARGETS,
  'answered': QUESTION_TARGETS
};

/** Sound played when the stage enters a phase. */
export const STATE_SOUNDS: Partial<Record<AppState, () => void>> = {
  'pre-spin': () => audioEngine.playSpinStart(),
  'word-spin': () => audioEngine.playSpinTick(1.0),
  'word-decelerate': () => audioEngine.playSpinTick(0.4),
  'word-lock': () => audioEngine.playWordLock(),
  'question-reveal': () => audioEngine.playQuestionReveal()
};
