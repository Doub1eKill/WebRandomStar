import React from 'react';
import { useSession, useSessionActions } from '@/features/session/SessionProvider.tsx';
import { useQuestions } from '@/storage/useRepository.ts';
import { questionsRepository } from '@/storage/repositories.ts';
import { QuestionBankDashboard } from '@/features/questions/bank/QuestionBankDashboard.tsx';

/** Remote "Question bank" page (Phase 5). */
export const QuestionsPage: React.FC = () => {
  const questions = useQuestions();
  const usedQuestionIds = useSession(s => s.usedQuestionIds);
  const { resetUsedQuestions } = useSessionActions();

  return (
    <QuestionBankDashboard
      questions={questions}
      usedQuestionIds={usedQuestionIds}
      onSaveQuestions={questionsRepository.save}
      onResetUsedQuestions={resetUsedQuestions}
    />
  );
};

export default QuestionsPage;
