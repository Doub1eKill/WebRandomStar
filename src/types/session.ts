import { Question } from './question.ts';
import { TimerState, TimerSoundSettings, StageDisplaySettings } from './timer.ts';
import { KeywordItem, WordSpinMode } from './word.ts';
import { AppearanceSettings } from './appearance.ts';
import { MusicState } from './music.ts';

export type AppState =
  | 'idle'
  | 'pre-spin'
  | 'word-spin'
  | 'word-decelerate'
  | 'word-lock'
  | 'question-reveal'
  | 'question'
  | 'answered';

export interface SessionState {
  sessionId: string;
  seed: string;
  currentState: AppState;
  selectedContestantId?: string;
  selectedRound: string;
  selectedWordId?: string;
  selectedKeyword?: string;
  selectedWordItem?: KeywordItem;
  selectedQuestion?: Question;
  usedQuestionIds: string[];
  /**
   * Keywords answered in keyword mode (Done). They are not drawn again until every enabled
   * keyword is used. Optional: sessions saved before 2026-11-26 do not have it.
   */
  usedWordIds?: string[];
  isMuted: boolean;
  volume: number;
  isPaused: boolean;
  timerState: TimerState;
  timerSoundSettings?: TimerSoundSettings;
  stageDisplaySettings?: StageDisplaySettings;
  appearanceSettings?: AppearanceSettings;
  wordSpinMode?: WordSpinMode;
  musicState?: MusicState;
}

// D5: the old SyncMessage / SyncMessageType (payload?: any) were replaced by the typed
// protocol in features/session/sessionChannel.ts.

