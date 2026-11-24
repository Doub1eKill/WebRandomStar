import { describe, it, expect } from 'vitest';
import {
  createHistoryRecord,
  exportHistoryToJSON,
  exportHistoryToCSV,
  filterHistory
} from '@/features/history/historyManager.ts';
import { Question, Contestant } from '@/types/question.ts';

const mockQuestion: Question = {
  id: 'q1',
  text: 'คำถามจำลองความท้าทาย',
  category: 'Wind',
  difficulty: 'medium',
  round: 'Round 1',
  enabled: true
};

const mockContestant: Contestant = {
  id: 'c1',
  number: '01',
  name: 'สมชาย ใจดี',
  faculty: 'วิศวกรรมศาสตร์'
};

describe('History Manager Engine', () => {
  it('should create a valid history record with calculated fields', () => {
    const record = createHistoryRecord({
      sessionId: 'sess_1',
      round: 'Round 1',
      contestant: mockContestant,
      question: mockQuestion,
      seed: 'seed123',
      timerConfiguredMs: 90000,
      timerUsedMs: 45000,
      isTimeout: false
    });

    expect(record.id).toBeDefined();
    expect(record.contestantName).toBe('สมชาย ใจดี');
    expect(record.questionId).toBe('q1');
    expect(record.timerUsedMs).toBe(45000);
    expect(record.result).toBe('completed');
  });

  it('should export records to valid JSON string', () => {
    const record = createHistoryRecord({
      sessionId: 'sess_1',
      round: 'Round 1',
      contestant: mockContestant,
      question: mockQuestion,
      seed: 'seed123',
      timerConfiguredMs: 90000,
      timerUsedMs: 90000,
      isTimeout: true
    });

    const json = exportHistoryToJSON([record]);
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].result).toBe('timeout');
  });

  it('should export records to CSV format with headers', () => {
    const record = createHistoryRecord({
      sessionId: 'sess_1',
      round: 'Round 1',
      contestant: mockContestant,
      question: mockQuestion,
      seed: 'seed123',
      timerConfiguredMs: 90000,
      timerUsedMs: 30000,
      isTimeout: false
    });

    const csv = exportHistoryToCSV([record]);
    expect(csv).toContain('Timestamp,Date & Time,Session ID');
    expect(csv).toContain('"สมชาย ใจดี"');
    expect(csv).toContain('"Wind"');
  });

  it('should filter records by search query and round', () => {
    const rec1 = createHistoryRecord({
      sessionId: 's1',
      round: 'Round 1',
      contestant: mockContestant,
      question: mockQuestion,
      seed: '1',
      timerConfiguredMs: 90000,
      timerUsedMs: 30000,
      isTimeout: false
    });

    const rec2 = createHistoryRecord({
      sessionId: 's1',
      round: 'Round 2',
      contestant: { id: 'c2', number: '02', name: 'วิภา มีสุข', faculty: 'แพทย์ศาสตร์' },
      question: { ...mockQuestion, id: 'q2', text: 'คำถามแพทย์' },
      seed: '2',
      timerConfiguredMs: 90000,
      timerUsedMs: 30000,
      isTimeout: false
    });

    const filtered = filterHistory([rec1, rec2], { round: 'Round 1' });
    expect(filtered.length).toBe(1);
    expect(filtered[0].contestantName).toBe('สมชาย ใจดี');

    const searchFiltered = filterHistory([rec1, rec2], { search: 'วิภา' });
    expect(searchFiltered.length).toBe(1);
    expect(searchFiltered[0].contestantName).toBe('วิภา มีสุข');
  });
});
