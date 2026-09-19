import { KeywordItem } from '../../../types/word.ts';

export interface SpinViewProps {
  reel: KeywordItem[];
  currentIndex: number;
  targetWord: KeywordItem;
  phase: 'pre-spin' | 'word-spin' | 'word-decelerate';
  floatOffset?: number;
}

export interface VisibleSpinItem {
  item: KeywordItem;
  offset: number;
  isCenter: boolean;
}

