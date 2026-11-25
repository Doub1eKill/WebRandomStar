import React from 'react';
import {
  Sliders,
} from 'lucide-react';

import type { TimerPanelModel } from '../useTimerPanelModel.tsx';

export const TimerThresholdSection: React.FC<{ m: TimerPanelModel }> = ({ m }) => {
  const { stageDisplaySettings, onSetStageDisplaySettings } = m;
  return (
    <>
      {/* 3. Warning & Critical Alerts Threshold Controls */}
      {onSetStageDisplaySettings && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.55)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
            <Sliders size={18} color="#f59e0b" />
            <div>
              <div style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600 }}>
                เกณฑ์เวลาเตือนและช่วงวิกฤต (Alert Thresholds)
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                กำหนดวินาทีที่ระบบจะเปลี่ยนสีและส่งสัญญาณเตือน
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Warning threshold */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fde68a', marginBottom: '0.35rem' }}>
                <span>ช่วงเตือน (Warning):</span>
                <strong>{Math.round(stageDisplaySettings.warningThresholdMs / 1000)} วินาที</strong>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={Math.round(stageDisplaySettings.warningThresholdMs / 1000)}
                onChange={(e) => onSetStageDisplaySettings({ warningThresholdMs: parseInt(e.target.value, 10) * 1000 })}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            {/* Critical threshold */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fca5a5', marginBottom: '0.35rem' }}>
                <span>ช่วงวิกฤต (Critical):</span>
                <strong>{Math.round(stageDisplaySettings.criticalThresholdMs / 1000)} วินาที</strong>
              </div>
              <input
                type="range"
                min="3"
                max="20"
                step="1"
                value={Math.round(stageDisplaySettings.criticalThresholdMs / 1000)}
                onChange={(e) => onSetStageDisplaySettings({ criticalThresholdMs: parseInt(e.target.value, 10) * 1000 })}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
