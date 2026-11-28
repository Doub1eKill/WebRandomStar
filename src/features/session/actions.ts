import { KeywordItem } from '@/types/word.ts';
import { TimerSoundSettings, StageDisplaySettings } from '@/types/timer.ts';
import { AppearanceSettings } from '@/types/appearance.ts';
import { StageScreen, WinnerEntry } from '@/types/session.ts';
import { SessionCommand } from './commands.ts';

/** Named action functions over `dispatch` (same API the old useStageSync exposed). */
export function createSessionActions(d: (command: SessionCommand) => void) {
  return {
    startJourney: (_viewport?: { width: number; height: number }, forceWord?: KeywordItem) =>
      d({ type: 'START_JOURNEY', forceWord }),
    stopWordSpin: () => d({ type: 'STOP_WORD_SPIN' }),
    pauseJourney: () => d({ type: 'TOGGLE_PAUSE' }),
    skipToQuestion: () => d({ type: 'SKIP_TO_QUESTION' }),
    markAnswered: () => d({ type: 'MARK_ANSWERED' }),
    resetStage: () => d({ type: 'RESET_STAGE' }),
    resetUsedQuestions: () => d({ type: 'RESET_USED_QUESTIONS' }),
    resetUsedWords: () => d({ type: 'RESET_USED_WORDS' }),
    setContestant: (contestantId: string) => d({ type: 'SET_CONTESTANT', contestantId }),
    setRound: (round: string) => d({ type: 'SET_ROUND', round }),
    setVolume: (volume: number) => d({ type: 'SET_VOLUME', volume }),
    toggleMute: () => d({ type: 'TOGGLE_MUTE' }),
    setAppearanceSettings: (settings: AppearanceSettings) => d({ type: 'SET_APPEARANCE', settings }),
    setTimerDuration: (durationMs: number) => d({ type: 'SET_TIMER_DURATION', durationMs }),
    startTimer: (durationMs?: number) => d({ type: 'START_TIMER', durationMs }),
    pauseTimer: () => d({ type: 'PAUSE_TIMER' }),
    resumeTimer: () => d({ type: 'RESUME_TIMER' }),
    resetTimer: () => d({ type: 'RESET_TIMER' }),
    finishTimer: () => d({ type: 'FINISH_TIMER' }),
    adjustTimer: (deltaMs: number) => d({ type: 'ADJUST_TIMER', deltaMs }),
    setTimerSoundSettings: (settings: Partial<TimerSoundSettings>) => d({ type: 'SET_TIMER_SOUND_SETTINGS', settings }),
    setStageDisplaySettings: (settings: Partial<StageDisplaySettings>) => d({ type: 'SET_STAGE_DISPLAY_SETTINGS', settings }),
    setStageScreen: (screen: StageScreen) => d({ type: 'SET_STAGE_SCREEN', screen }),
    /** Replace the winner list; `headline` is left as it is when omitted. */
    setWinners: (winners: WinnerEntry[], headline?: string) => d({ type: 'SET_WINNERS', winners, headline }),
    /** Put the prepared heading and winners on the winner screen and play the reveal. */
    announceWinners: (sound = true) => d({ type: 'ANNOUNCE_WINNERS', sound }),
    /** Take the result off the winner screen (back to "and the winner is…"). */
    clearAnnouncement: () => d({ type: 'CLEAR_ANNOUNCEMENT' })
  };
}

export type SessionActions = ReturnType<typeof createSessionActions>;
