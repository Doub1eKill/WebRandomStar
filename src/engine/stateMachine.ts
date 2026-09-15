import { AppState } from '../types/session.ts';

/**
 * Version 3.0 Royal Word Spin State Sequence
 */
export const STAGE_SEQUENCE: AppState[] = [
  'idle',
  'pre-spin',
  'word-spin',
  'word-decelerate',
  'word-lock',
  'question-reveal',
  'question',
  'answered'
];

/**
 * State durations in milliseconds for automated transition
 */
export const STAGE_DURATION: Record<AppState, number> = {
  'idle': 0,
  'pre-spin': 800,
  'word-spin': 2500,
  'word-decelerate': 2000,
  'word-lock': 1500,
  'question-reveal': 1000,
  'question': 0,   // Waits for presenter/operator
  'answered': 0,   // Waits for next contestant

  // Legacy fallback mappings
  'rain': 1200,
  'water-drop': 1200,
  'mist': 1300,
  'wind': 1300,
  'leaf': 1500,
  'sky-clear': 1200
};

/**
 * Returns the next logical state in the sequence
 */
export function getNextState(currentState: AppState): AppState {
  const currentIndex = STAGE_SEQUENCE.indexOf(currentState);
  if (currentIndex === -1 || currentIndex === STAGE_SEQUENCE.length - 1) {
    return 'idle';
  }
  return STAGE_SEQUENCE[currentIndex + 1];
}

/**
 * Check whether moving from one state to another is allowed
 */
export function isValidTransition(from: AppState, to: AppState): boolean {
  // Always allow resetting to idle
  if (to === 'idle') return true;

  // Allow immediate skip to question if already in an active animation sequence
  if (to === 'question' && from !== 'idle' && from !== 'answered') return true;

  // Normal step-by-step transition
  const fromIndex = STAGE_SEQUENCE.indexOf(from);
  const toIndex = STAGE_SEQUENCE.indexOf(to);
  if (fromIndex !== -1 && toIndex !== -1) {
    return toIndex === fromIndex + 1;
  }

  return true;
}
