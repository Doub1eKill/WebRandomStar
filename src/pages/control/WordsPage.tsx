import React from 'react';
import { KeywordItem } from '@/types/word.ts';
import { useQuestions, useWords } from '@/storage/useRepository.ts';
import { saveWords } from '@/storage/storageApi.ts';
import { WordBankDashboard } from '@/features/words/WordBankDashboard.tsx';

/** Remote "Word bank" page (Phase 5). */
export const WordsPage: React.FC = () => {
  const words = useWords();
  const questions = useQuestions();

  return (
    <WordBankDashboard
      words={words}
      questions={questions}
      onSaveWord={(word: KeywordItem) => {
        const exists = words.some(w => w.id === word.id);
        saveWords(exists ? words.map(w => (w.id === word.id ? word : w)) : [...words, word]);
      }}
      onDeleteWord={(id: string) => saveWords(words.filter(w => w.id !== id))}
      onToggleWord={(id: string) => saveWords(words.map(w => (w.id === id ? { ...w, enabled: !w.enabled } : w)))}
      onResetWords={(defaults: KeywordItem[]) => saveWords(defaults)}
    />
  );
};

export default WordsPage;
