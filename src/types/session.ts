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

// D5: the old SyncMessage / SyncMessageType (payload?: any) were replaced by the typed
// protocol in features/session/sessionChannel.ts.

