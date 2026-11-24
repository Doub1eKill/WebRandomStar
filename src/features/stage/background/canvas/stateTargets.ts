/**
 * A8: what the canvas does when the stage enters each phase, as data instead of a 140-line
 * switch. Values are copied unchanged from the former StageCanvas switch.
 */
import { AppState } from '@/types/session.ts';
import { audioEngine } from '@/features/audio/audioEngine.ts';

export interface LayerTargets {
  auroraIntensity: number;
  crystalOpacity: number;
  crownOpacity: number;
  reflectionOpacity: number;
  rainIntensity: number;
  dropOpacity: number;
  mistDensity: number;
  leafOpacity: number;
  skyClarity: number;
  moonOpacity: number;
}

/** Initial targets before any phase change (unchanged from StageCanvas). */
export const INITIAL_TARGETS: LayerTargets = {
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
};

const QUESTION_TARGETS: LayerTargets = {
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

/** Layer targets that replace the current ones when the stage enters a phase. */
export const STATE_TARGETS: Partial<Record<AppState, LayerTargets>> = {
  'idle': {
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
  },
  'pre-spin': {
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
  },
  'word-spin': {
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
  },
  'word-decelerate': {
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
  },
  'word-lock': {
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
  },
  'question-reveal': {
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
  },
  'question': QUESTION_TARGETS,
  'answered': QUESTION_TARGETS
};

/** Legacy phases only adjust the current targets in place (unreachable since v3; see plan D4). */
export const LEGACY_TARGET_PATCHES: Partial<Record<AppState, Partial<LayerTargets>>> = {
  'rain': { rainIntensity: 1.0 }
};

/** Sound played when the stage enters a phase. */
export const STATE_SOUNDS: Partial<Record<AppState, () => void>> = {
  'pre-spin': () => audioEngine.playSpinStart(),
  'word-spin': () => audioEngine.playSpinTick(1.0),
  'word-decelerate': () => audioEngine.playSpinTick(0.4),
  'word-lock': () => audioEngine.playWordLock(),
  'question-reveal': () => audioEngine.playQuestionReveal(),
  // Legacy fallback states
  'rain': () => audioEngine.playRainAmbience(1.5),
  'water-drop': () => audioEngine.playWaterDrop(),
  'wind': () => audioEngine.playWindGust(),
  'leaf': () => audioEngine.playLeafRustle(),
  'sky-clear': () => audioEngine.playSkyTransition()
};
