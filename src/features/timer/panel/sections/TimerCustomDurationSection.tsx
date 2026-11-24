import React from 'react';
import {
  Clock,
} from 'lucide-react';

import type { TimerPanelModel } from '../useTimerPanelModel.tsx';

export const TimerCustomDurationSection: React.FC<{ m: TimerPanelModel }> = ({ m }) => {
  const { customMinutes, setCustomMinutes, customSeconds, setCustomSeconds, handleApplyCustom } = m;
  return (
    <>
      {/* 6. Custom Duration Configurator */}
      <form
        onSubmit={handleApplyCustom}
        style={{
          background: 'rgba(15, 23, 42, 0.5)',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}
      >
        <span style={{ color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={16} /> กำหนดเวลาเอง:
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <input
            type="number"
            min="0"
            max="59"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            style={{ width: '55px', padding: '0.4rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
          />
          <span style={{ color: '#94a3b8' }}>นาที</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <input
            type="number"
            min="0"
            max="59"
            value={customSeconds}
            onChange={(e) => setCustomSeconds(e.target.value)}
            style={{ width: '55px', padding: '0.4rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
          />
          <span style={{ color: '#94a3b8' }}>วินาที</span>
        </div>

        <button
          type="submit"
          style={{
            padding: '0.45rem 1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          ตั้งค่าเวลานี้
        </button>
      </form>
    </>
  );
};
