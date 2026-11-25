import React from 'react';
import { useHistory } from '@/storage/useRepository.ts';
import { clearHistory } from '@/features/history/historyManager.ts';
import { HistoryPanel } from '@/features/history/HistoryPanel.tsx';

/** Remote "History" page (Phase 5). Updates live as the stage records answers (B8). */
export const HistoryPage: React.FC = () => {
  const history = useHistory();
  return <HistoryPanel history={history} onClearHistory={() => { clearHistory(); }} />;
};

export default HistoryPage;
