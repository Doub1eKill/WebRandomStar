export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionRound = 'intro' | 'general' | 'attitude' | 'scenario' | 'final' | string;

export interface Question {
  id: string;
  text: string;
  difficulty: QuestionDifficulty;
  round: QuestionRound;
  enabled: boolean;
  used?: boolean;
  tags?: string[];
  timeLimit?: number; // Optional custom time limit in seconds
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contestant {
  id: string;
  number: number | string;
  name: string;
  faculty: string;
  title?: 'ดาว' | 'เดือน' | 'ดาวจำแลง' | 'ทั่วไป' | string;
  round?: string;
  avatarUrl?: string;
  status?: 'waiting' | 'answering' | 'completed';
  questionsAnswered?: number;
  timeUsedMs?: number;
}
