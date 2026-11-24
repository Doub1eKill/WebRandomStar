import React from 'react';

import { useQuestionBankDashboardModel, QuestionBankDashboardProps } from './useQuestionBankDashboardModel.tsx';
import { NotificationBanner } from './sections/NotificationBanner.tsx';
import { StatsCards } from './sections/StatsCards.tsx';
import { ActionBar } from './sections/ActionBar.tsx';
import { FilterRow } from './sections/FilterRow.tsx';
import { QuestionTable } from './sections/QuestionTable.tsx';
import { PreviewModal } from './sections/PreviewModal.tsx';
import { EditModal } from './sections/EditModal.tsx';

export type { QuestionBankDashboardProps };

export const QuestionBankDashboard: React.FC<QuestionBankDashboardProps> = (props) => {
  const m = useQuestionBankDashboardModel(props);
  const { questionImport } = m;
  return (
    <div className="ui-panel-stack">
      {questionImport.dialog}
      <NotificationBanner m={m} />
      <StatsCards m={m} />
      <ActionBar m={m} />
      <FilterRow m={m} />
      <QuestionTable m={m} />
      <PreviewModal m={m} />
      <EditModal m={m} />
    </div>
  );
};
