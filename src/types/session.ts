import { Question, QuestionCategory } from './question.ts';
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
  | 'answered'
  // Legacy aliases for backward compatibility if needed
  | 'rain'
  | 'water-drop'
  | 'mist'
  | 'wind'
  | 'leaf'
  | 'sky-clear';

export interface SessionState {
  sessionId: string;
  seed: string;
  currentState: AppState;
  selectedContestantId?: string;
  selectedRound: string;
  selectedCategory?: QuestionCategory;
  selectedWordId?: string;
  selectedKeyword?: string;
  selectedWordItem?: KeywordItem;
  selectedQuestion?: Question;
  usedQuestionIds: string[];
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

export type SyncMessageType =
  | 'STAGE_SYNC_STATE'
  | 'STAGE_START'
  | 'STAGE_SPIN_START'
  | 'STAGE_PAUSE'
  | 'STAGE_RESUME'
  | 'STAGE_SKIP'
  | 'STAGE_DONE'
  | 'STAGE_RESET'
  | 'STAGE_SET_CONTESTANT'
  | 'STAGE_SET_ROUND'
  | 'STAGE_SET_VOLUME'
  | 'STAGE_TOGGLE_MUTE'
  | 'STAGE_SET_CATEGORY'
  | 'STAGE_SET_WORD'
  | 'STAGE_SET_WORD_BANK'
  | 'STAGE_STOP_WORD_SPIN'
  | 'STAGE_SET_APPEARANCE'
  | 'STAGE_SET_TIMER_SOUND_SETTINGS'
  | 'STAGE_SET_DISPLAY_SETTINGS'
  | 'STAGE_SET_MUSIC_STATE'
  | 'TIMER_SET'
  | 'TIMER_START'
  | 'TIMER_PAUSE'
  | 'TIMER_RESUME'
  | 'TIMER_RESET'
  | 'TIMER_FINISH'
  | 'TIMER_ADJUST';

export interface SyncMessage {
  type: SyncMessageType;
  payload?: any;
  timestamp: number;
}

