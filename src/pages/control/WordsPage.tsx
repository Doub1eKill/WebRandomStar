import React from 'react';
import { KeywordItem } from '@/types/word.ts';
import { useWords } from '@/storage/useRepository.ts';
import { useSession, useSessionActions } from '@/features/session/SessionProvider.tsx';
import { wordsRepository } from '@/storage/repositories.ts';
import { WordBankDashboard } from '@/features/words/WordBankDashboard.tsx';

/** Remote "Word bank" page (Phase 5). */
export const WordsPage: React.FC = () => {
  const words = useWords();
  const usedWordIds = useSession(s => s.usedWordIds);
  const { resetUsedWords } = useSessionActions();

  return (
    <WordBankDashboard
      words={words}
      usedWordIds={usedWordIds}
      onResetUsedWords={resetUsedWords}
      onSaveWord={(word: KeywordItem) => {
        const exists = words.some(w => w.id === word.id);
        wordsRepository.save(exists ? words.map(w => (w.id === word.id ? word : w)) : [...words, word]);
      }}
      onDeleteWord={(id: string) => wordsRepository.save(words.filter(w => w.id !== id))}
      onToggleWord={(id: string) => wordsRepository.save(words.map(w => (w.id === id ? { ...w, enabled: !w.enabled } : w)))}
      onResetWords={(defaults: KeywordItem[]) => wordsRepository.save(defaults)}
    />
  );
};

export default WordsPage;
