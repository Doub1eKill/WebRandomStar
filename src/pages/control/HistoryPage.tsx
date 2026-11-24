import React from 'react';
import { useHistory } from '../../hooks/useRepository.ts';
import { clearHistory } from '../../utils/storage.ts';
import { HistoryPanel } from '../../components/Control/HistoryPanel.tsx';

/** Remote "History" page (Phase 5). Updates live as the stage records answers (B8). */
export const HistoryPage: React.FC = () => {
  const history = useHistory();
  return <HistoryPanel history={history} onClearHistory={() => { clearHistory(); }} />;
};

export default HistoryPage;
