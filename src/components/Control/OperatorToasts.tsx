import React, { useEffect, useState } from 'react';
import { OperatorNotice, subscribeOperatorNotices } from '../../engine/operatorNotices.ts';

const VISIBLE_MS: Record<OperatorNotice['level'], number> = { info: 5000, warning: 7000, error: 10000 };
const MAX_VISIBLE = 3;

/**
 * B10/B11: small, non-blocking notices for the operator in the corner of the screen.
 * Replaces window.alert(), which blocked the whole stage until someone clicked OK.
 */
export const OperatorToasts: React.FC<{ hidden?: boolean }> = ({ hidden = false }) => {
  const [notices, setNotices] = useState<OperatorNotice[]>([]);

  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const unsubscribe = subscribeOperatorNotices(notice => {
      setNotices(prev => [...prev.filter(n => n.message !== notice.message), notice].slice(-MAX_VISIBLE));
      const timer = setTimeout(() => {
        timers.delete(timer);
        setNotices(prev => prev.filter(n => n.id !== notice.id));
      }, VISIBLE_MS[notice.level]);
      timers.add(timer);
    });
    return () => {
      unsubscribe();
      timers.forEach(clearTimeout);
    };
  }, []);

  if (hidden || notices.length === 0) return null;

  return (
    <div className="operator-toasts" role="status" aria-live="polite">
      {notices.map(notice => (
        <div key={notice.id} className={`operator-toast is-${notice.level}`}>
          <span className="operator-toast-message">{notice.message}</span>
          <button
            type="button"
            className="operator-toast-close"
            aria-label="ปิดข้อความ"
            onClick={() => setNotices(prev => prev.filter(n => n.id !== notice.id))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
