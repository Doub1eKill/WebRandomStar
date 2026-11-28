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

/**
 * What the stage shows (2026-11-29):
 * - `quiz`: the word/question spin (the normal stage)
 * - `standby`: the event's key visual, for before the draw and other times it is not in use
 * - `winner`: the winner announcement, with the winners chosen in the control window
 */
export type StageScreen = 'quiz' | 'standby' | 'winner';

export const STAGE_SCREENS: readonly StageScreen[] = ['quiz', 'standby', 'winner'];

/** One winner on the winner screen: who, and the award shown with them (may be empty). */
export interface WinnerEntry {
  contestantId: string;
  award: string;
}

/**
 * What the winner screen shows, fixed when the operator presses "announce" (2026-11-29): the
 * prepared heading (round / award) and winners at that moment. Editing the prepared list does
 * not change it; the next announcement replaces it and plays the reveal again.
 */
export interface WinnerAnnouncement {
  /** Changes on every announcement, so the stage replays the reveal. */
  id: string;
  /** When it was announced (ms). An old one (e.g. after a reload) is shown without the reveal. */
  at: number;
  headline: string;
  winners: WinnerEntry[];
  /** Play the reveal sound at the burst. */
  sound: boolean;
}

/** Limits that keep the winner screen readable and the synced state small. */
export const MAX_WINNERS = 12;
export const MAX_WINNER_TEXT = 80;

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
  /** Optional: sessions saved before 2026-11-29 do not have these; read them with the helpers. */
  stageScreen?: StageScreen;
  /** Winners being prepared in the control window (not on screen until announced). */
  winners?: WinnerEntry[];
  /** Prepared heading (round / award); empty shows DEFAULT_WINNER_HEADLINE once announced. */
  winnerHeadline?: string;
  /** What the winner screen shows; none = waiting for the announcement. */
  winnerAnnouncement?: WinnerAnnouncement;
}

export const DEFAULT_WINNER_HEADLINE = 'THE WINNER';

export const isStageScreen = (v: unknown): v is StageScreen =>
  typeof v === 'string' && (STAGE_SCREENS as readonly string[]).includes(v);

/** The screen to show, `quiz` for anything missing or unknown. */
export const stageScreenOf = (s: Pick<SessionState, 'stageScreen'>): StageScreen =>
  isStageScreen(s.stageScreen) ? s.stageScreen : 'quiz';

/**
 * Clean a winner list from any source (a command, saved state): known shape only, each contestant
 * once, award capped, at most MAX_WINNERS entries.
 */
export function sanitizeWinners(value: unknown): WinnerEntry[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: WinnerEntry[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const { contestantId, award } = item as Record<string, unknown>;
    if (typeof contestantId !== 'string' || !contestantId || seen.has(contestantId)) continue;
    seen.add(contestantId);
    out.push({ contestantId, award: typeof award === 'string' ? award.slice(0, MAX_WINNER_TEXT) : '' });
    if (out.length >= MAX_WINNERS) break;
  }
  return out;
}

/** Clean a winner-screen heading: a string, capped; anything else becomes empty (= default). */
export const sanitizeWinnerHeadline = (value: unknown): string =>
  typeof value === 'string' ? value.slice(0, MAX_WINNER_TEXT) : '';

/** Clean a saved announcement; anything malformed or without winners becomes undefined. */
export function sanitizeAnnouncement(value: unknown): WinnerAnnouncement | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const v = value as Record<string, unknown>;
  const winners = sanitizeWinners(v.winners);
  if (typeof v.id !== 'string' || !v.id || winners.length === 0) return undefined;
  return {
    id: v.id,
    at: typeof v.at === 'number' && Number.isFinite(v.at) ? v.at : 0,
    headline: sanitizeWinnerHeadline(v.headline),
    winners,
    sound: v.sound !== false
  };
}

// D5: the old SyncMessage / SyncMessageType (payload?: any) were replaced by the typed
// protocol in features/session/sessionChannel.ts.

