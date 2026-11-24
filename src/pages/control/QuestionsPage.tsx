import React from 'react';
import { useSession } from '../../features/session/SessionProvider.tsx';
import { useQuestions } from '../../hooks/useRepository.ts';
import { saveQuestions } from '../../utils/storage.ts';
import { QuestionBankDashboard } from '../../components/Control/QuestionBankDashboard.tsx';

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
