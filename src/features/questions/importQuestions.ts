/**
 * S1: safe question import. Validates every row against the values the app understands,
 * rejects duplicate ids, limits the file size, and lets the operator merge into the bank
 * (default) or replace it after an automatic backup.
 */
import { Question, CATEGORY_CONFIGS } from '@/types/question.ts';

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
export const QUESTION_ROUNDS = ['intro', 'general', 'attitude', 'scenario', 'final'] as const;
export const QUESTION_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export const QUESTIONS_BACKUP_KEY = 'season_transition_questions_backup';
const MAX_TEXT_LENGTH = 2000;

/** Remove HTML/script markup from imported text. */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

const knownCategory = (value: string): string | null => {
  const lower = value.trim().toLowerCase();
  return Object.keys(CATEGORY_CONFIGS).includes(lower) ? lower : null;
};

export interface ImportResult {
  success: boolean;
  data?: Question[];
  error?: string;
}

export function parseImportedQuestions(jsonString: string): ImportResult {
  if (jsonString.length > MAX_IMPORT_BYTES) {
    return { success: false, error: `ไฟล์ใหญ่เกิน ${MAX_IMPORT_BYTES / 1024 / 1024} MB` };
  }
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'JSON ต้องเป็น Array ของรายการคำถาม' };
    }

    const validated: Question[] = [];
    const seenIds = new Set<string>();
    for (let i = 0; i < parsed.length; i++) {
      const row = i + 1;
      const item = parsed[i];
      if (!item || typeof item !== 'object' || !item.id || !item.text || !item.category) {
        return { success: false, error: `ข้อมูลแถวที่ ${row} ไม่ครบถ้วน (ต้องมี id, text, category)` };
      }

      const id = sanitizeText(String(item.id));
      const text = sanitizeText(String(item.text));
      if (!id || !text) {
        return { success: false, error: `แถวที่ ${row}: id หรือ text ว่างหลังตัด HTML ออก` };
      }
      if (text.length > MAX_TEXT_LENGTH) {
        return { success: false, error: `แถวที่ ${row}: ข้อความยาวเกิน ${MAX_TEXT_LENGTH} ตัวอักษร` };
      }
      if (seenIds.has(id)) {
        return { success: false, error: `แถวที่ ${row}: id "${id}" ซ้ำกับแถวก่อนหน้า` };
      }
      seenIds.add(id);

      const category = knownCategory(sanitizeText(String(item.category)));
      if (!category) {
        return { success: false, error: `แถวที่ ${row}: ไม่รู้จักหมวด "${item.category}" (ใช้ได้: ${Object.keys(CATEGORY_CONFIGS).join(', ')})` };
      }

      const round = item.round === undefined ? 'attitude' : String(item.round).trim().toLowerCase();
      if (!(QUESTION_ROUNDS as readonly string[]).includes(round)) {
        return { success: false, error: `แถวที่ ${row}: ไม่รู้จักรอบ "${item.round}" (ใช้ได้: ${QUESTION_ROUNDS.join(', ')})` };
      }

      const difficulty = item.difficulty === undefined ? 'medium' : String(item.difficulty).trim().toLowerCase();
      if (!(QUESTION_DIFFICULTIES as readonly string[]).includes(difficulty)) {
        return { success: false, error: `แถวที่ ${row}: ไม่รู้จักระดับความยาก "${item.difficulty}" (ใช้ได้: ${QUESTION_DIFFICULTIES.join(', ')})` };
      }

      validated.push({
        id,
        text,
        category,
        difficulty: difficulty as Question['difficulty'],
        round: round as Question['round'],
        enabled: item.enabled !== false,
        used: Boolean(item.used),
        tags: Array.isArray(item.tags) ? item.tags.map((t: unknown) => sanitizeText(String(t))).filter(Boolean) : [],
        timeLimit: typeof item.timeLimit === 'number' ? item.timeLimit : undefined,
        notes: item.notes ? sanitizeText(String(item.notes)) : undefined
      });
    }

    return { success: true, data: validated };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'รูปแบบ JSON ไม่ถูกต้อง' };
  }
}

export interface ImportPlan {
  incoming: Question[];
  newCount: number;
  updateCount: number;
}

export function planImport(existing: Question[], incoming: Question[]): ImportPlan {
  const existingIds = new Set(existing.map(q => q.id));
  const updateCount = incoming.filter(q => existingIds.has(q.id)).length;
  return { incoming, newCount: incoming.length - updateCount, updateCount };
}

/** Imported questions replace those with the same id; everything else is kept. */
export function mergeQuestions(existing: Question[], incoming: Question[]): Question[] {
  const byId = new Map(incoming.map(q => [q.id, q]));
  const merged = existing.map(q => byId.get(q.id) ?? q);
  const existingIds = new Set(existing.map(q => q.id));
  return [...merged, ...incoming.filter(q => !existingIds.has(q.id))];
}

/** Keep a copy of the bank before it is replaced, so a bad import can be undone. */
export function backupQuestions(existing: Question[]): boolean {
  try {
    localStorage.setItem(QUESTIONS_BACKUP_KEY, JSON.stringify({ savedAt: new Date().toISOString(), questions: existing }));
    return true;
  } catch {
    return false;
  }
}

export function loadQuestionsBackup(): { savedAt: string; questions: Question[] } | null {
  try {
    const raw = localStorage.getItem(QUESTIONS_BACKUP_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && Array.isArray(parsed.questions) ? parsed : null;
  } catch {
    return null;
  }
}

/** Pretty-printed JSON, the same format parseImportedQuestions accepts. */
export function exportQuestionsAsJSON(questions: Question[]): string {
  return JSON.stringify(questions, null, 2);
}
