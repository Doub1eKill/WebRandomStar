/**
 * A3: control logic shared by the stage drawer and the remote "Live" page. Both used to
 * re-implement these handlers; the two keep their own markup until Phase 7 unifies the UI.
 */
import { SessionState } from '../../types/session.ts';
import { QuestionCategory } from '../../types/question.ts';
import { KeywordItem } from '../../types/word.ts';
import { AppearanceSettings, DEFAULT_APPEARANCE_SETTINGS } from '../../types/appearance.ts';

export const ROUND_OPTIONS = [
  { id: 'intro', label: 'รอบแนะนำตัว (Intro)' },
  { id: 'general', label: 'รอบคำถามทั่วไป (General)' },
  { id: 'attitude', label: 'รอบทัศนคติ (Attitude)' },
  { id: 'scenario', label: 'รอบสถานการณ์จำลอง (Scenario)' },
  { id: 'final', label: 'รอบชิงชนะเลิศ (Final)' }
] as const;

interface Handlers {
  onStart: (forceCategory?: QuestionCategory, forceWord?: KeywordItem) => void;
  onStopSpin?: () => void;
  onSkip: () => void;
  onSetAppearanceSettings?: (settings: AppearanceSettings) => void;
}

export function stageControls(session: SessionState, words: KeywordItem[], handlers: Handlers) {
  const appearance = session.appearanceSettings || DEFAULT_APPEARANCE_SETTINGS;
  const patchAppearance = (patch: Partial<AppearanceSettings>) =>
    handlers.onSetAppearanceSettings?.({ ...appearance, ...patch });

  return {
    isIdle: session.currentState === 'idle',
    isWordSpinning: session.currentState === 'word-spin',
    isQuestionActive: session.currentState === 'question',
    isAnswered: session.currentState === 'answered',
    isKeywordMode: session.appearanceSettings?.quizMode === 'keyword',
    showWordLockPhase: session.appearanceSettings?.showWordLockPhase !== false,
    enabledWords: words.filter(w => w.enabled),
    setQuizMode: (quizMode: 'question' | 'keyword') => patchAppearance({ quizMode }),
    setShowWordLockPhase: (showWordLockPhase: boolean) => patchAppearance({ showWordLockPhase }),
    /** STOP SPIN button: stop the reel, or skip to the question when no stop handler exists. */
    stopSpin: () => (handlers.onStopSpin ? handlers.onStopSpin() : handlers.onSkip()),
    startWithWord: (word: KeywordItem) => handlers.onStart(word.category as QuestionCategory, word)
  };
}
