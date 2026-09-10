import { Question, Contestant } from '../types/question.ts';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions.ts';
import { DEFAULT_CONTESTANTS } from '../data/defaultContestants.ts';

const STORAGE_QUESTIONS_KEY = 'season_quiz_questions_bank';
const STORAGE_CONTESTANTS_KEY = 'season_quiz_contestants_list';

export function loadQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_QUESTIONS_KEY);
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
    localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(questions));
  } catch {
    // quota exceeded or disabled
  }
}

export function loadContestants(): Contestant[] {
  try {
    const raw = localStorage.getItem(STORAGE_CONTESTANTS_KEY);
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
    localStorage.setItem(STORAGE_CONTESTANTS_KEY, JSON.stringify(contestants));
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
        tags: Array.isArray(item.tags) ? item.tags : []
      });
    }

    return { success: true, data: validated };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'รูปแบบ JSON ไม่ถูกต้อง' };
  }
}
