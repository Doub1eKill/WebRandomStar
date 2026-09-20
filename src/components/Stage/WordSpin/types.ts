import { KeywordItem } from '../../../types/word.ts';
import { Question } from '../../../types/question.ts';

export type SpinItem = KeywordItem | Question | { id: string; text?: string; word?: string; displayText?: string; category?: string; enabled?: boolean };

export interface SpinViewProps {
  reel: SpinItem[];
  currentIndex: number;
  targetWord?: SpinItem;
  phase: 'pre-spin' | 'word-spin' | 'word-decelerate';
  floatOffset?: number;
  displayType?: 'keyword' | 'question';
}

export interface VisibleSpinItem {
  item: SpinItem;
  offset: number;
  isCenter: boolean;
}

