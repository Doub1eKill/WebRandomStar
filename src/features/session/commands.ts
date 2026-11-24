import { AppState } from '../../types/session.ts';
import { QuestionCategory } from '../../types/question.ts';
import { KeywordItem } from '../../types/word.ts';
import { TimerSoundSettings, StageDisplaySettings } from '../../types/timer.ts';
import { AppearanceSettings } from '../../types/appearance.ts';

/** Commands any window may send to the stage host (A1/B1). */
export type SessionCommand =
  | { type: 'START_JOURNEY'; forceCategory?: QuestionCategory; forceWord?: KeywordItem }
  | { type: 'STOP_WORD_SPIN' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SKIP_TO_QUESTION' }
  | { type: 'MARK_ANSWERED' }
  | { type: 'RESET_STAGE' }
  | { type: 'SET_CONTESTANT'; contestantId: string }
  | { type: 'SET_ROUND'; round: string }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_APPEARANCE'; settings: AppearanceSettings }
  | { type: 'SET_TIMER_DURATION'; durationMs: number }
  | { type: 'START_TIMER'; durationMs?: number }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESUME_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'FINISH_TIMER' }
  | { type: 'ADJUST_TIMER'; deltaMs: number }
  | { type: 'SET_TIMER_SOUND_SETTINGS'; settings: Partial<TimerSoundSettings> }
  | { type: 'SET_STAGE_DISPLAY_SETTINGS'; settings: Partial<StageDisplaySettings> };

/** Commands only the host's own scheduler issues. They are never accepted from the channel. */
export type InternalCommand =
  | { type: 'ADVANCE_PHASE'; from: AppState }
  | { type: 'TIMER_EXPIRED' };

export type AnyCommand = SessionCommand | InternalCommand;

export const REMOTE_COMMAND_TYPES: ReadonlySet<SessionCommand['type']> = new Set<SessionCommand['type']>([
  'START_JOURNEY', 'STOP_WORD_SPIN', 'TOGGLE_PAUSE', 'SKIP_TO_QUESTION', 'MARK_ANSWERED', 'RESET_STAGE',
  'SET_CONTESTANT', 'SET_ROUND', 'SET_VOLUME', 'TOGGLE_MUTE', 'SET_APPEARANCE',
  'SET_TIMER_DURATION', 'START_TIMER', 'PAUSE_TIMER', 'RESUME_TIMER', 'RESET_TIMER', 'FINISH_TIMER', 'ADJUST_TIMER',
  'SET_TIMER_SOUND_SETTINGS', 'SET_STAGE_DISPLAY_SETTINGS'
]);
