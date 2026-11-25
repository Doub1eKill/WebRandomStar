import React from 'react';
import {
  Layout,
  Sparkles,
  Type
} from 'lucide-react';

import type { TimerPanelModel } from '../useTimerPanelModel.tsx';

export const TimerLayoutSection: React.FC<{ m: TimerPanelModel }> = ({ m }) => {
  const { stageDisplaySettings, onSetStageDisplaySettings } = m;
  return (
    <>
      {/* 2. Stage Layout & Display Modes (การจัดวางและตำแหน่งบนเวที) */}
      {onSetStageDisplaySettings && (
        <div
          style={{
            background: 'rgba(14, 18, 44, 0.65)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid rgba(124, 58, 237, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Layout size={18} color="#a78bfa" />
            <div>
              <div style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600 }}>
                รูปแบบการแสดงผลบนเวที (Stage Display Mode)
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                เลือกตำแหน่งและรูปแบบตัวนับเวลาบนจอเวทีหลัก (Sync อัตโนมัติแบบ Realtime)
              </div>
            </div>
          </div>

          {/* Mode Selector Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
            <button
              onClick={() => onSetStageDisplaySettings({ timerDisplayMode: 'center' })}
              style={{
                padding: '0.75rem 0.6rem',
                background: stageDisplaySettings.timerDisplayMode === 'center' ? 'rgba(124, 58, 237, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: `1.5px solid ${stageDisplaySettings.timerDisplayMode === 'center' ? 'var(--ctl-accent)' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '10px',
                color: stageDisplaySettings.timerDisplayMode === 'center' ? '#c7d2fe' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.88rem' }}>
                <Sparkles size={14} color="#fde047" /> จอใหญ่ตรงกลาง
              </div>
              <div style={{ fontSize: '0.7rem', marginTop: '0.2rem', color: '#94a3b8' }}>
                Grand Center Focus (แนะนำสำหรับเวทีประกวด)
              </div>
            </button>

            <button
              onClick={() => onSetStageDisplaySettings({ timerDisplayMode: 'corner' })}
              style={{
                padding: '0.75rem 0.6rem',
                background: stageDisplaySettings.timerDisplayMode === 'corner' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: `1.5px solid ${stageDisplaySettings.timerDisplayMode === 'corner' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '10px',
                color: stageDisplaySettings.timerDisplayMode === 'corner' ? '#bae6fd' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>📌 มุมขวาบน</div>
              <div style={{ fontSize: '0.7rem', marginTop: '0.2rem', color: '#94a3b8' }}>
                Corner HUD คลาสสิก
              </div>
            </button>

            <button
              onClick={() => onSetStageDisplaySettings({ timerDisplayMode: 'compact' })}
              style={{
                padding: '0.75rem 0.6rem',
                background: stageDisplaySettings.timerDisplayMode === 'compact' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: `1.5px solid ${stageDisplaySettings.timerDisplayMode === 'compact' ? '#a855f7' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '10px',
                color: stageDisplaySettings.timerDisplayMode === 'compact' ? '#e9d5ff' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>🔹 แถบกะทัดรัด</div>
              <div style={{ fontSize: '0.7rem', marginTop: '0.2rem', color: '#94a3b8' }}>
                Floating Capsule HUD
              </div>
            </button>
          </div>

          {/* Visibility & Behavior Toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>ซ่อนจนกว่าจะกดเริ่ม</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ไม่แสดงนาฬิกาล่วงหน้า</div>
              </div>
              <button
                onClick={() => onSetStageDisplaySettings({ showTimerOnlyWhenRunning: !stageDisplaySettings.showTimerOnlyWhenRunning })}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: stageDisplaySettings.showTimerOnlyWhenRunning ? '#10b981' : 'rgba(255,255,255,0.1)',
                  color: stageDisplaySettings.showTimerOnlyWhenRunning ? '#000' : '#94a3b8'
                }}
              >
                {stageDisplaySettings.showTimerOnlyWhenRunning ? 'เปิด (ON)' : 'ปิด (OFF)'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>เริ่มนับเวลาออโต้</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>เมื่อเปิดคำถามสำเร็จ</div>
              </div>
              <button
                onClick={() => onSetStageDisplaySettings({ autoStartTimerOnReveal: !stageDisplaySettings.autoStartTimerOnReveal })}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: stageDisplaySettings.autoStartTimerOnReveal ? '#10b981' : 'rgba(255,255,255,0.1)',
                  color: stageDisplaySettings.autoStartTimerOnReveal ? '#000' : '#94a3b8'
                }}
              >
                {stageDisplaySettings.autoStartTimerOnReveal ? 'เปิด (ON)' : 'ปิด (OFF)'}
              </button>
            </div>
          </div>

          {/* Question Font Scaling Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <Type size={15} color="#38bdf8" />
              <span>ขนาดตัวอักษรคำถามบนเวที:</span>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {(['normal', 'large', 'huge'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => onSetStageDisplaySettings({ questionFontSize: size })}
                  style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: stageDisplaySettings.questionFontSize === size ? 700 : 500,
                    background: stageDisplaySettings.questionFontSize === size ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${stageDisplaySettings.questionFontSize === size ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                    color: stageDisplaySettings.questionFontSize === size ? '#7dd3fc' : '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {size === 'normal' ? 'ปกติ' : size === 'large' ? 'ใหญ่' : 'ใหญ่พิเศษ'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
