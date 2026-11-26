export type HistoryResult = 'completed' | 'timeout' | 'skipped';

export interface HistoryRecord {
  id: string;
  timestamp: number;
  sessionId: string;
  round: string;
  contestantId: string;
  contestantName: string;
  contestantNumber?: string | number;
  questionId: string;
  questionText: string;
  seed: number | string;
  timerConfiguredMs: number;
  timerUsedMs: number;
  isTimeout: boolean;
  result: HistoryResult;
}
