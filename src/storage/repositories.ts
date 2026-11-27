/**
 * Phase 4: repositories for every localStorage collection. Keys are unchanged
 * (STORAGE_KEYS), so data saved by earlier versions loads as before.
 */
import { Question, Contestant } from '@/types/question.ts';
import { KeywordItem } from '@/types/word.ts';
import { HistoryRecord } from '@/types/history.ts';
import { AppearanceSettings, DEFAULT_APPEARANCE_SETTINGS } from '@/types/appearance.ts';
import { DEFAULT_QUESTIONS } from '@/data/defaultQuestions.ts';
import { DEFAULT_CONTESTANTS, upgradePlaceholderList } from '@/data/defaultContestants.ts';
import { DEFAULT_WORDS } from '@/data/defaultWords.ts';
import { createRepository } from '@/shared/lib/createRepository.ts';

export const STORAGE_KEYS = {
  QUESTIONS: 'season_transition_questions',
  CONTESTANTS: 'season_transition_contestants',
  SESSION: 'season_transition_session',
  HISTORY: 'season_transition_history',
  SETTINGS: 'season_transition_settings',
  WORDS: 'season_transition_words',
  APPEARANCE: 'season_transition_appearance'
} as const;

// Legacy keys for smooth migration
const LEGACY_QUESTIONS_KEY = 'season_quiz_questions_bank';
const LEGACY_CONTESTANTS_KEY = 'season_quiz_contestants_list';

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Categories were removed from questions, keywords and history (2026-11-26). Data saved before
 * still carries a `category` field: it is dropped on load and disappears at the next save.
 */
export function withoutCategory<T>(item: T): T {
  if (!isObject(item) || !('category' in item)) return item;
  const copy: Record<string, unknown> = { ...item };
  delete copy.category;
  return copy as T;
}

/** Keep the well-formed entries of a stored list (S3); anything that is not a list is unusable. */
function listOf<T>(isItem: (v: unknown) => boolean) {
  return (raw: unknown): T[] | null => (Array.isArray(raw) ? (raw.filter(isItem).map(withoutCategory) as T[]) : null);
}

const hasStrings = (...fields: string[]) => (v: unknown) =>
  isObject(v) && fields.every(f => typeof v[f] === 'string');

export const questionsRepository = createRepository<Question[]>({
  key: STORAGE_KEYS.QUESTIONS,
  label: 'คลังคำถาม',
  legacyKeys: [LEGACY_QUESTIONS_KEY],
  schemaVersion: 1,
  defaults: () => DEFAULT_QUESTIONS,
  validate: listOf<Question>(hasStrings('id', 'text'))
});

export const wordsRepository = createRepository<KeywordItem[]>({
  key: STORAGE_KEYS.WORDS,
  label: 'คลังคำสำคัญ',
  schemaVersion: 1,
  defaults: () => DEFAULT_WORDS,
  validate: listOf<KeywordItem>(hasStrings('id', 'word'))
});

export const contestantsRepository = createRepository<Contestant[]>({
  key: STORAGE_KEYS.CONTESTANTS,
  label: 'รายชื่อผู้เข้าแข่งขัน',
  legacyKeys: [LEGACY_CONTESTANTS_KEY],
  schemaVersion: 1,
  defaults: () => DEFAULT_CONTESTANTS,
  validate: raw => upgradePlaceholderList(listOf<Contestant>(hasStrings('id', 'name'))(raw))
});

export const historyRepository = createRepository<HistoryRecord[]>({
  key: STORAGE_KEYS.HISTORY,
  label: 'ประวัติการสุ่ม',
  schemaVersion: 1,
  defaults: () => [],
  validate: listOf<HistoryRecord>(v => isObject(v) && typeof v.id === 'string' && typeof v.timestamp === 'number')
});

export const appearanceRepository = createRepository<AppearanceSettings>({
  key: STORAGE_KEYS.APPEARANCE,
  label: 'การตั้งค่าหน้าตา',
  schemaVersion: 1,
  defaults: () => DEFAULT_APPEARANCE_SETTINGS,
  validate: raw => (isObject(raw) ? { ...DEFAULT_APPEARANCE_SETTINGS, ...raw } as AppearanceSettings : null)
});

/** Timer sound + stage display settings share one stored object (unchanged layout). */
export const settingsRepository = createRepository<Record<string, unknown>>({
  key: STORAGE_KEYS.SETTINGS,
  label: 'การตั้งค่าตัวจับเวลา',
  schemaVersion: 1,
  defaults: () => ({}),
  validate: raw => (isObject(raw) ? raw : null)
});
