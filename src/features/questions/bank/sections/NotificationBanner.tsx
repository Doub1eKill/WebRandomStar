import React from 'react';
import {
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import type { QuestionBankDashboardModel } from '../useQuestionBankDashboardModel.tsx';

export const NotificationBanner: React.FC<{ m: QuestionBankDashboardModel }> = ({ m }) => {
  const { notification } = m;
  return (
    <>
      {/* Notification Banner */}
      {notification && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: notification.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
            color: notification.type === 'success' ? '#86efac' : '#fca5a5',
            fontSize: '0.9rem'
          }}
        >
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}
    </>
  );
};
