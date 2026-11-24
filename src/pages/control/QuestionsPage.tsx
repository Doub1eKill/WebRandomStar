import React from 'react';
import { useSession } from '@/features/session/SessionProvider.tsx';
import { useQuestions } from '@/storage/useRepository.ts';
import { saveQuestions } from '@/storage/storageApi.ts';
import { QuestionBankDashboard } from '@/features/questions/bank/QuestionBankDashboard.tsx';

/** Remote "Question bank" page (Phase 5). */
export const QuestionsPage: React.FC = () => {
  const questions = useQuestions();
  const usedQuestionIds = useSession(s => s.usedQuestionIds);

  return (
    <QuestionBankDashboard
      questions={questions}
      usedQuestionIds={usedQuestionIds}
      onSaveQuestions={saveQuestions}
    />
  );
};

export default QuestionsPage;
