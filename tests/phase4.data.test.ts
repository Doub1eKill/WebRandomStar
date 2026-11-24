import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRepository, SCHEMA_VERSIONS_KEY } from '../src/shared/lib/createRepository.ts';
import { subscribeOperatorNotices, OperatorNotice } from '../src/engine/operatorNotices.ts';
import { loadContestants, saveContestants, loadQuestions, saveQuestions, exportHistoryAsCSV, STORAGE_KEYS } from '../src/utils/storage.ts';
import { exportHistoryToCSV } from '../src/engine/historyManager.ts';
import { toCsvCell } from '../src/shared/lib/csv.ts';
import { sanitizeFontFamily, resolveFontFamily } from '../src/utils/typography.ts';
import { parseImportedQuestions, mergeQuestions, planImport, backupQuestions, loadQuestionsBackup } from '../src/features/questions/importQuestions.ts';
import { Question } from '../src/types/question.ts';
import { HistoryRecord } from '../src/types/history.ts';

const q = (id: string, text = id): Question => ({ id, text, category: 'rain', difficulty: 'medium', round: 'intro', enabled: true });

beforeEach(() => {
  localStorage.clear();
});

describe('createRepository', () => {
  const repo = () => createRepository<string[]>({
    key: 'test_list',
    label: 'ทดสอบ',
    schemaVersion: 2,
    defaults: () => ['default'],
    validate: raw => (Array.isArray(raw) ? raw.filter(x => typeof x === 'string') : null),
    migrate: (raw, from) => (from < 2 && Array.isArray(raw) ? raw.map(x => String(x).toUpperCase()) : raw),
    legacyKeys: ['old_test_list']
  });

  it('B7: a saved empty list stays empty; only "never saved" gives the defaults', () => {
    const r = repo();
    expect(r.load()).toEqual(['default']);
    r.save([]);
    expect(r.load()).toEqual([]);
  });

  it('S3: keeps the stored format and records the schema version separately', () => {
    const r = repo();
    r.save(['A']);
    expect(localStorage.getItem('test_list')).toBe('["A"]');
    expect(JSON.parse(localStorage.getItem(SCHEMA_VERSIONS_KEY)!)).toEqual({ test_list: 2 });
  });

  it('S3: migrates unversioned data and legacy keys', () => {
    localStorage.setItem('old_test_list', JSON.stringify(['legacy']));
    expect(repo().load()).toEqual(['LEGACY']);
  });

  it('S3: drops malformed entries and reports unreadable data without deleting it', () => {
    localStorage.setItem(SCHEMA_VERSIONS_KEY, JSON.stringify({ test_list: 2 }));
    localStorage.setItem('test_list', JSON.stringify(['ok', 42, null]));
    expect(repo().load()).toEqual(['ok']);

    const notices: OperatorNotice[] = [];
    const off = subscribeOperatorNotices(n => notices.push(n));
    localStorage.setItem('test_list', '{not json');
    expect(repo().load()).toEqual(['default']);
    expect(notices.map(n => n.level)).toEqual(['warning']);
    expect(localStorage.getItem('test_list')).toBe('{not json');
    off();
  });

  it('S4: a failed write is returned and reported to the operator', () => {
    const notices: OperatorNotice[] = [];
    const off = subscribeOperatorNotices(n => notices.push(n));
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
    const result = repo().save(['x']);
    setItem.mockRestore();
    expect(result.ok).toBe(false);
    expect(notices[0]?.level).toBe('error');
    off();
  });

  it('PF12: returns the same parsed object until the stored value changes', () => {
    const r = repo();
    r.save(['a']);
    const first = r.load();
    expect(r.load()).toBe(first);
    localStorage.setItem('test_list', '["b"]');
    expect(r.load()).toEqual(['b']);
  });

  it('B8: notifies subscribers when another window changes the key', () => {
    const r = repo();
    const listener = vi.fn();
    const off = r.subscribe(listener);
    window.dispatchEvent(new StorageEvent('storage', { key: 'test_list' }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'unrelated' }));
    expect(listener).toHaveBeenCalledTimes(1);
    off();
  });
});

describe('B7 through the storage facade', () => {
  it('deleting every contestant no longer brings back the sample data', () => {
    saveContestants([]);
    expect(loadContestants()).toEqual([]);
    saveQuestions([]);
    expect(loadQuestions()).toEqual([]);
  });
});

describe('S1: question import', () => {
  const file = (rows: unknown[]) => JSON.stringify(rows);

  it('rejects unknown categories, rounds and difficulties, and duplicate ids', () => {
    expect(parseImportedQuestions(file([{ id: 'a', text: 't', category: 'lava' }])).error).toContain('หมวด');
    expect(parseImportedQuestions(file([{ id: 'a', text: 't', category: 'rain', round: 'semi' }])).error).toContain('รอบ');
    expect(parseImportedQuestions(file([{ id: 'a', text: 't', category: 'rain', difficulty: 'insane' }])).error).toContain('ความยาก');
    expect(parseImportedQuestions(file([{ id: 'a', text: 't', category: 'rain' }, { id: 'a', text: 'u', category: 'rain' }])).error).toContain('ซ้ำ');
  });

  it('normalises known values and keeps the old defaults', () => {
    const r = parseImportedQuestions(file([{ id: 'a', text: 't', category: 'Rain' }]));
    expect(r.data?.[0]).toMatchObject({ category: 'rain', round: 'attitude', difficulty: 'medium', enabled: true });
  });

  it('rejects oversized input', () => {
    expect(parseImportedQuestions('x'.repeat(2 * 1024 * 1024 + 1)).success).toBe(false);
  });

  it('merge replaces matching ids and appends new ones; plan counts both', () => {
    const existing = [q('a', 'old'), q('b')];
    const incoming = [q('a', 'new'), q('c')];
    expect(planImport(existing, incoming)).toMatchObject({ newCount: 1, updateCount: 1 });
    expect(mergeQuestions(existing, incoming).map(x => `${x.id}:${x.text}`)).toEqual(['a:new', 'b:b', 'c:c']);
  });

  it('backs up the bank before a replace', () => {
    expect(backupQuestions([q('a')])).toBe(true);
    expect(loadQuestionsBackup()?.questions.map(x => x.id)).toEqual(['a']);
  });
});

describe('S2: CSV formula injection', () => {
  it('prefixes text cells that a spreadsheet would run as a formula', () => {
    expect(toCsvCell('=HYPERLINK("http://x")')).toBe(`"'=HYPERLINK(""http://x"")"`);
    expect(toCsvCell('+cmd')).toBe(`"'+cmd"`);
    expect(toCsvCell('@SUM(A1)')).toBe(`"'@SUM(A1)"`);
    expect(toCsvCell('-2+3')).toBe(`"'-2+3"`);
    expect(toCsvCell('-')).toBe('"-"');
    expect(toCsvCell(-5)).toBe('"-5"');
    expect(toCsvCell('สมชาย')).toBe('"สมชาย"');
  });

  it('applies to both history exports', () => {
    const record = {
      id: 'h1', timestamp: 0, sessionId: 's', round: 'intro', contestantId: 'c', contestantName: '=1+1',
      questionId: 'q', questionText: 'Q', category: 'rain', timerConfiguredMs: 60000, timerUsedMs: 1000,
      isTimeout: false, result: 'completed'
    } as HistoryRecord;
    expect(exportHistoryToCSV([record])).toContain(`"'=1+1"`);
    expect(exportHistoryAsCSV([record])).toContain(`"'=1+1"`);
  });
});

describe('S6: custom font name', () => {
  it('keeps font-family characters and strips CSS syntax', () => {
    expect(sanitizeFontFamily(`'Noto Sans Thai', sans-serif`)).toBe(`'Noto Sans Thai', sans-serif`);
    expect(sanitizeFontFamily('ไทยสารบรรณ')).toBe('ไทยสารบรรณ');
    expect(sanitizeFontFamily('x; background:url(http://evil)}')).toBe('x backgroundurlhttpevil');
    expect(resolveFontFamily('custom', { fontFamily: '};body{display:none' } as never)).not.toMatch(/[;{}:]/);
  });
});

describe('storage keys are unchanged', () => {
  it('still writes the same keys as before Phase 4', () => {
    saveQuestions([q('a')]);
    expect(localStorage.getItem(STORAGE_KEYS.QUESTIONS)).toBe(JSON.stringify([q('a')]));
    expect(STORAGE_KEYS.QUESTIONS).toBe('season_transition_questions');
  });
});
