/**
 * A3: control logic shared by the stage drawer and the remote "Live" page. Both used to
 * re-implement these handlers. Phase 7: both also render through ControlCard and
 * QuizModeToggle (variant "drawer" or "live"), so each keeps its own look.
 */
import { SessionState } from '@/types/session.ts';
import { KeywordItem } from '@/types/word.ts';
import { AppearanceSettings, DEFAULT_APPEARANCE_SETTINGS } from '@/types/appearance.ts';

export const ROUND_OPTIONS = [
  { id: 'intro', label: 'รอบแนะนำตัว (Intro)' },
  { id: 'general', label: 'รอบคำถามทั่วไป (General)' },
  { id: 'attitude', label: 'รอบทัศนคติ (Attitude)' },
  { id: 'scenario', label: 'รอบสถานการณ์จำลอง (Scenario)' },
  { id: 'final', label: 'รอบชิงชนะเลิศ (Final)' }
] as const;

interface Handlers {
  onStart: (forceWord?: KeywordItem) => void;
  onStopSpin?: () => void;
  onSkip: () => void;
  onSetAppearanceSettings?: (settings: AppearanceSettings) => void;
  /** Makes every used question and keyword drawable again (replaces the old Reset button). */
  onReturnAllDrawn?: () => void;
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
    /** SPIN works from idle and straight after Done (answered), with no Reset in between. */
    canSpin: session.currentState === 'idle' || session.currentState === 'answered',
    isKeywordMode: session.appearanceSettings?.quizMode === 'keyword',
    showWordLockPhase: session.appearanceSettings?.showWordLockPhase !== false,
    enabledWords: words.filter(w => w.enabled),
    setQuizMode: (quizMode: 'question' | 'keyword') => patchAppearance({ quizMode }),
    setShowWordLockPhase: (showWordLockPhase: boolean) => patchAppearance({ showWordLockPhase }),
    /** STOP SPIN button: stop the reel, or skip to the question when no stop handler exists. */
    stopSpin: () => (handlers.onStopSpin ? handlers.onStopSpin() : handlers.onSkip()),
    startWithWord: (word: KeywordItem) => handlers.onStart(word),
    /** Used questions + used keywords: what "คืนคำที่สุ่มแล้วทั้งหมด" gives back. */
    drawnCount: session.usedQuestionIds.length + (session.usedWordIds?.length ?? 0),
    /** Asks first, then makes every used question and keyword drawable again. History is kept. */
    returnAllDrawn: () => {
      const count = session.usedQuestionIds.length + (session.usedWordIds?.length ?? 0);
      if (count === 0 || !handlers.onReturnAllDrawn) return;
      if (!window.confirm(`คืนคำถามและคำสำคัญที่สุ่มไปแล้ว ${count} รายการ ให้กลับมาสุ่มได้อีกครั้งหรือไม่?
(ประวัติการตอบยังอยู่ครบ)`)) return;
      handlers.onReturnAllDrawn();
    }
  };
}
