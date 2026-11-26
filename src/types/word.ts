export type WordSpinMode = 'vertical' | 'orbital' | '3d' | 'ribbon';

export interface KeywordItem {
  id: string;
  word: string;
  englishTheme?: string;
  color?: string;
  enabled: boolean;
  priority?: number;
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WordBankState {
  words: KeywordItem[];
  selectedWordId?: string;
}
