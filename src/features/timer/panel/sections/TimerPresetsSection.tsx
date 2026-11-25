import React from 'react';
import {
  DEFAULT_TIMER_PRESETS,
} from '@/types/timer.ts';
import {
  Zap,
} from 'lucide-react';

import type { TimerPanelModel } from '../useTimerPanelModel.tsx';

export const TimerPresetsSection: React.FC<{ m: TimerPanelModel }> = ({ m }) => {
  const { timerState, onSetDuration } = m;
  return (
    <>
      {/* 5. Timer Presets */}
      <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h4 style={{ margin: '0 0 0.75rem 0', color: '#f8fafc', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={16} color="#eab308" /> ค่าเวลามาตรฐาน (Presets)
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
          {DEFAULT_TIMER_PRESETS.map((p) => {
            const isSelected = timerState.durationMs === p.durationMs;
            return (
              <button
                key={p.label}
                onClick={() => onSetDuration(p.durationMs)}
                style={{
                  padding: '0.75rem 0.6rem',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '8px',
                  color: isSelected ? '#a5b4fc' : '#cbd5e1',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{p.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>{p.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
