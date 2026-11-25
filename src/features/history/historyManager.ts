import { HistoryRecord, HistoryResult } from '@/types/history.ts';
import { Question } from '@/types/question.ts';
import { Contestant } from '@/types/question.ts';
import { toCsvCell } from '@/shared/lib/csv.ts';
import { historyRepository } from '@/storage/repositories.ts';
import { SaveResult } from '@/shared/lib/createRepository.ts';

export interface CreateRecordParams {
  sessionId: string;
  round: string;
  contestant?: Contestant;
  question: Question;
  seed: number | string;
  timerConfiguredMs: number;
  timerUsedMs: number;
  isTimeout: boolean;
  result?: HistoryResult;
}

export function createHistoryRecord(params: CreateRecordParams): HistoryRecord {
  const {
    sessionId,
    round,
    contestant,
    question,
    seed,
    timerConfiguredMs,
    timerUsedMs,
    isTimeout,
    result = isTimeout ? 'timeout' : 'completed'
  } = params;

  return {
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    sessionId,
    round,
    contestantId: contestant?.id || 'unknown',
    contestantName: contestant?.name || 'ไม่ระบุผู้เข้าแข่งขัน',
    contestantNumber: contestant?.number,
    questionId: question.id,
    questionText: question.text,
    category: question.category,
    seed,
    timerConfiguredMs,
    timerUsedMs,
    isTimeout,
    result
  };
}

export function exportHistoryToJSON(records: HistoryRecord[]): string {
  return JSON.stringify(records, null, 2);
}

export function exportHistoryToCSV(records: HistoryRecord[]): string {
  const headers = [
    'Timestamp',
    'Date & Time',
    'Session ID',
    'Round',
    'Contestant Number',
    'Contestant Name',
    'Question ID',
    'Category',
    'Question Text',
    'Configured Time (s)',
    'Time Used (s)',
    'Timeout',
    'Result'
  ];

  // S2: quote every text cell and neutralise spreadsheet formulas.
  const escapeCSV = (value: string | number | undefined): string => toCsvCell(value);

  const rows = records.map(r => {
    const dateTime = new Date(r.timestamp).toLocaleString('th-TH');
    return [
      r.timestamp,
      escapeCSV(dateTime),
      escapeCSV(r.sessionId),
      escapeCSV(r.round),
      escapeCSV(r.contestantNumber || '-'),
      escapeCSV(r.contestantName),
      escapeCSV(r.questionId),
      escapeCSV(r.category),
      escapeCSV(r.questionText),
      Math.round(r.timerConfiguredMs / 1000),
      Math.round(r.timerUsedMs / 1000),
      r.isTimeout ? 'Yes' : 'No',
      escapeCSV(r.result)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function filterHistory(
  records: HistoryRecord[],
  filters: { round?: string; contestantId?: string; search?: string }
): HistoryRecord[] {
  return records.filter(r => {
    if (filters.round && filters.round !== 'all' && r.round !== filters.round) {
      return false;
    }
    if (filters.contestantId && filters.contestantId !== 'all' && r.contestantId !== filters.contestantId) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = r.contestantName.toLowerCase().includes(q);
      const matchQText = r.questionText.toLowerCase().includes(q);
      const matchQId = r.questionId.toLowerCase().includes(q);
      if (!matchName && !matchQText && !matchQId) return false;
    }
    return true;
  });
}

/** Newest first; keeps at most MAX_HISTORY_RECORDS (moved from storage/storageApi in Phase 9). */
export const MAX_HISTORY_RECORDS = 200;

export function appendHistoryRecord(record: HistoryRecord): HistoryRecord[] {
  const updated = [record, ...historyRepository.load()].slice(0, MAX_HISTORY_RECORDS);
  historyRepository.save(updated);
  return updated;
}

export function clearHistory(): SaveResult {
  return historyRepository.save([]);
}
