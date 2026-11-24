/**
 * Compatibility facade (Phase 4). The functions keep their names and keys; the data now goes
 * through validated, cached repositories (src/storage/repositories.ts). Saves return a
 * SaveResult instead of void. Removed in Phase 9 once callers use the repositories directly.
 */
import { Question, Contestant } from '@/types/question.ts';
import { KeywordItem } from '@/types/word.ts';
import { HistoryRecord } from '@/types/history.ts';
import { TimerSoundSettings, DEFAULT_TIMER_SOUND_SETTINGS, StageDisplaySettings, DEFAULT_STAGE_DISPLAY_SETTINGS } from '@/types/timer.ts';
import { AppearanceSettings } from '@/types/appearance.ts';
import {
  STORAGE_KEYS,
  questionsRepository,
  wordsRepository,
  contestantsRepository,
  historyRepository,
  appearanceRepository,
  settingsRepository
} from './repositories.ts';
import { SaveResult } from '@/shared/lib/createRepository.ts';
import { toCsvCell } from '@/shared/lib/csv.ts';

export { STORAGE_KEYS };
export type { SaveResult };
export { sanitizeText, parseImportedQuestions } from '@/features/questions/importQuestions.ts';

export const loadQuestions = (): Question[] => questionsRepository.load();
export const saveQuestions = (questions: Question[]): SaveResult => questionsRepository.save(questions);

export const loadWords = (): KeywordItem[] => wordsRepository.load();
export const saveWords = (words: KeywordItem[]): SaveResult => wordsRepository.save(words);

export const loadContestants = (): Contestant[] => contestantsRepository.load();
export const saveContestants = (contestants: Contestant[]): SaveResult => contestantsRepository.save(contestants);

export const loadHistory = (): HistoryRecord[] => historyRepository.load();
export const saveHistory = (history: HistoryRecord[]): SaveResult => historyRepository.save(history);

export const loadAppearanceSettings = (): AppearanceSettings => appearanceRepository.load();
export function saveAppearanceSettings(settings: Partial<AppearanceSettings>): SaveResult {
  return appearanceRepository.save({ ...appearanceRepository.load(), ...settings });
}

export const MAX_HISTORY_RECORDS = 200;

export function appendHistoryRecord(record: HistoryRecord): HistoryRecord[] {
  const updated = [record, ...loadHistory()].slice(0, MAX_HISTORY_RECORDS);
  saveHistory(updated);
  return updated;
}

export function clearHistory(): SaveResult {
  return saveHistory([]);
}

export function exportQuestionsAsJSON(questions: Question[]): string {
  return JSON.stringify(questions, null, 2);
}

export function exportHistoryAsCSV(history: HistoryRecord[]): string {
  const headers = [
    'ID',
    'Timestamp',
    'Round',
    'ContestantNumber',
    'ContestantName',
    'ContestantID',
    'QuestionID',
    'Category',
    'QuestionText',
    'TimerConfiguredSec',
    'TimerUsedSec',
    'IsTimeout'
  ];

  const rows = history.map(rec => [
    toCsvCell(rec.id),
    toCsvCell(new Date(rec.timestamp).toISOString()),
    toCsvCell(rec.round),
    toCsvCell(rec.contestantNumber ?? ''),
    toCsvCell(rec.contestantName ?? ''),
    toCsvCell(rec.contestantId ?? ''),
    toCsvCell(rec.questionId ?? ''),
    toCsvCell(rec.category ?? ''),
    toCsvCell(rec.questionText ?? ''),
    toCsvCell(Math.round(rec.timerConfiguredMs / 1000)),
    toCsvCell(Math.round(rec.timerUsedMs / 1000)),
    toCsvCell(rec.isTimeout)
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export function loadTimerSoundSettings(): TimerSoundSettings {
  const parsed = settingsRepository.load();
  if (Object.keys(parsed).length === 0) return DEFAULT_TIMER_SOUND_SETTINGS;
  return {
    tickSoundEnabled: typeof parsed.tickSoundEnabled === 'boolean' ? parsed.tickSoundEnabled : DEFAULT_TIMER_SOUND_SETTINGS.tickSoundEnabled,
    warningSoundEnabled: typeof parsed.warningSoundEnabled === 'boolean' ? parsed.warningSoundEnabled : DEFAULT_TIMER_SOUND_SETTINGS.warningSoundEnabled,
    finishSoundEnabled: typeof parsed.finishSoundEnabled === 'boolean' ? parsed.finishSoundEnabled : DEFAULT_TIMER_SOUND_SETTINGS.finishSoundEnabled,
    tickVolume: typeof parsed.tickVolume === 'number' ? Math.max(0, Math.min(1, parsed.tickVolume)) : DEFAULT_TIMER_SOUND_SETTINGS.tickVolume
  };
}

export function saveTimerSoundSettings(settings: Partial<TimerSoundSettings>): SaveResult {
  return settingsRepository.save({ ...settingsRepository.load(), ...settings });
}

export function loadStageDisplaySettings(): StageDisplaySettings {
  const parsed = settingsRepository.load();
  if (Object.keys(parsed).length === 0) return DEFAULT_STAGE_DISPLAY_SETTINGS;
  return {
    timerDisplayMode: parsed.timerDisplayMode === 'corner' || parsed.timerDisplayMode === 'compact' ? parsed.timerDisplayMode : 'center',
    showTimerOnlyWhenRunning: typeof parsed.showTimerOnlyWhenRunning === 'boolean' ? parsed.showTimerOnlyWhenRunning : DEFAULT_STAGE_DISPLAY_SETTINGS.showTimerOnlyWhenRunning,
    autoStartTimerOnReveal: typeof parsed.autoStartTimerOnReveal === 'boolean' ? parsed.autoStartTimerOnReveal : DEFAULT_STAGE_DISPLAY_SETTINGS.autoStartTimerOnReveal,
    questionFontSize: parsed.questionFontSize === 'large' || parsed.questionFontSize === 'huge' ? parsed.questionFontSize : 'normal',
    warningThresholdMs: typeof parsed.warningThresholdMs === 'number' && parsed.warningThresholdMs > 0 ? parsed.warningThresholdMs : DEFAULT_STAGE_DISPLAY_SETTINGS.warningThresholdMs,
    criticalThresholdMs: typeof parsed.criticalThresholdMs === 'number' && parsed.criticalThresholdMs > 0 ? parsed.criticalThresholdMs : DEFAULT_STAGE_DISPLAY_SETTINGS.criticalThresholdMs
  };
}

export function saveStageDisplaySettings(settings: Partial<StageDisplaySettings>): SaveResult {
  return settingsRepository.save({ ...settingsRepository.load(), ...settings });
}
