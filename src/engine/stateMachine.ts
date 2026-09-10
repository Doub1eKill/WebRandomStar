import { AppState } from '../types/session.ts';

export const STAGE_SEQUENCE: AppState[] = [
  'idle',
  'rain',
  'water-drop',
  'mist',
  'wind',
  'leaf',
  'sky-opening',
  'constellation',
  'meteor',
  'question',
  'answered'
];

/**
 * Stage durations in milliseconds for automated sequencing
 */
export const STAGE_DURATION: Record<AppState, number> = {
  'idle': 0,
  'rain': 3200,
  'water-drop': 2400,
  'mist': 2800,
  'wind': 2600,
  'leaf': 3200,
  'sky-opening': 2600,
  'constellation': 3400,
  'meteor': 2200,
  'question': 0,   // Waits for presenter/operator
  'answered': 0    // Waits for next contestant
};

/**
 * Returns the next logical state in the natural cycle
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
  return toIndex === fromIndex + 1;
}
