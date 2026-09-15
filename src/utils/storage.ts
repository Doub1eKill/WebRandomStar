import { Question, Contestant } from '../types/question.ts';
import { KeywordItem } from '../types/word.ts';
import { HistoryRecord } from '../types/history.ts';
import { TimerSoundSettings, DEFAULT_TIMER_SOUND_SETTINGS, StageDisplaySettings, DEFAULT_STAGE_DISPLAY_SETTINGS } from '../types/timer.ts';
import { AppearanceSettings, DEFAULT_APPEARANCE_SETTINGS } from '../types/appearance.ts';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions.ts';
import { DEFAULT_CONTESTANTS } from '../data/defaultContestants.ts';
import { DEFAULT_WORDS } from '../data/defaultWords.ts';

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

export function loadQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS) || localStorage.getItem(LEGACY_QUESTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_QUESTIONS;
}

export function saveQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch {
    // quota exceeded or disabled
  }
}

export function loadWords(): KeywordItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_WORDS;
}

export function saveWords(words: KeywordItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
  } catch {
    // fallback
  }
}

export function loadAppearanceSettings(): AppearanceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPEARANCE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_APPEARANCE_SETTINGS,
          ...parsed
        };
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_APPEARANCE_SETTINGS;
}

export function saveAppearanceSettings(settings: Partial<AppearanceSettings>): void {
  try {
    const current = loadAppearanceSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.APPEARANCE, JSON.stringify(updated));
  } catch {
    // fallback
  }
}

export function loadContestants(): Contestant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTESTANTS) || localStorage.getItem(LEGACY_CONTESTANTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_CONTESTANTS;
}

export function saveContestants(contestants: Contestant[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTESTANTS, JSON.stringify(contestants));
  } catch {
    // fallback
  }
}

export function loadHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveHistory(history: HistoryRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch {
    // fallback
  }
}

export function appendHistoryRecord(record: HistoryRecord): HistoryRecord[] {
  const current = loadHistory();
  const updated = [record, ...current];
  saveHistory(updated);
  return updated;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch {
    // fallback
  }
}

export function exportQuestionsAsJSON(questions: Question[]): string {
  return JSON.stringify(questions, null, 2);
}

export function parseImportedQuestions(jsonString: string): { success: boolean; data?: Question[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'JSON ต้องเป็น Array ของรายการคำถาม' };
    }

    const validated: Question[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (!item.id || !item.text || !item.category) {
        return { success: false, error: `ข้อมูลแถวที่ ${i + 1} ไม่ครบถ้วน (ต้องมี id, text, category)` };
      }
      validated.push({
        id: String(item.id),
        text: String(item.text),
        category: item.category,
        difficulty: item.difficulty || 'medium',
        round: item.round || 'attitude',
        enabled: item.enabled !== false,
        used: Boolean(item.used),
        tags: Array.isArray(item.tags) ? item.tags : [],
        timeLimit: typeof item.timeLimit === 'number' ? item.timeLimit : undefined,
        notes: item.notes ? String(item.notes) : undefined
      });
    }

    return { success: true, data: validated };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'รูปแบบ JSON ไม่ถูกต้อง' };
  }
}

export function loadTimerSoundSettings(): TimerSoundSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          tickSoundEnabled: typeof parsed.tickSoundEnabled === 'boolean' ? parsed.tickSoundEnabled : DEFAULT_TIMER_SOUND_SETTINGS.tickSoundEnabled,
          warningSoundEnabled: typeof parsed.warningSoundEnabled === 'boolean' ? parsed.warningSoundEnabled : DEFAULT_TIMER_SOUND_SETTINGS.warningSoundEnabled,
          finishSoundEnabled: typeof parsed.finishSoundEnabled === 'boolean' ? parsed.finishSoundEnabled : DEFAULT_TIMER_SOUND_SETTINGS.finishSoundEnabled,
          tickVolume: typeof parsed.tickVolume === 'number' ? Math.max(0, Math.min(1, parsed.tickVolume)) : DEFAULT_TIMER_SOUND_SETTINGS.tickVolume
        };
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_TIMER_SOUND_SETTINGS;
}

export function saveTimerSoundSettings(settings: Partial<TimerSoundSettings>): void {
  try {
    const currentRaw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const current = currentRaw ? JSON.parse(currentRaw) : {};
    const updated = {
      ...current,
      ...settings
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch {
    // fallback
  }
}

export function loadStageDisplaySettings(): StageDisplaySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          timerDisplayMode: parsed.timerDisplayMode === 'corner' || parsed.timerDisplayMode === 'compact' ? parsed.timerDisplayMode : 'center',
          showTimerOnlyWhenRunning: typeof parsed.showTimerOnlyWhenRunning === 'boolean' ? parsed.showTimerOnlyWhenRunning : DEFAULT_STAGE_DISPLAY_SETTINGS.showTimerOnlyWhenRunning,
          autoStartTimerOnReveal: typeof parsed.autoStartTimerOnReveal === 'boolean' ? parsed.autoStartTimerOnReveal : DEFAULT_STAGE_DISPLAY_SETTINGS.autoStartTimerOnReveal,
          questionFontSize: parsed.questionFontSize === 'large' || parsed.questionFontSize === 'huge' ? parsed.questionFontSize : 'normal',
          warningThresholdMs: typeof parsed.warningThresholdMs === 'number' && parsed.warningThresholdMs > 0 ? parsed.warningThresholdMs : DEFAULT_STAGE_DISPLAY_SETTINGS.warningThresholdMs,
          criticalThresholdMs: typeof parsed.criticalThresholdMs === 'number' && parsed.criticalThresholdMs > 0 ? parsed.criticalThresholdMs : DEFAULT_STAGE_DISPLAY_SETTINGS.criticalThresholdMs
        };
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_STAGE_DISPLAY_SETTINGS;
}

export function saveStageDisplaySettings(settings: Partial<StageDisplaySettings>): void {
  try {
    const currentRaw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const current = currentRaw ? JSON.parse(currentRaw) : {};
    const updated = {
      ...current,
      ...settings
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch {
    // fallback
  }
}
