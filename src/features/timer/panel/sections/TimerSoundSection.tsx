import React from 'react';
import { audioEngine } from '@/features/audio/audioEngine.ts';
import {
  Clock,
  Bell,
  AlertTriangle,
  Flame,
} from 'lucide-react';

import type { TimerPanelModel } from '../useTimerPanelModel.tsx';

export const TimerSoundSection: React.FC<{ m: TimerPanelModel }> = ({ m }) => {
  const { timerSoundSettings, onSetTimerSoundSettings } = m;
  return (
    <>
      {/* 4. Timer Sound Effects & Audio Toggles */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          padding: '1.25rem',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.09)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Bell size={18} color="#38bdf8" />
          <div>
            <div style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600 }}>
              ระบบเสียงตัวจับเวลา (Timer Audio Controls)
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
              ตั้งค่าเปิด/ปิดเสียงติ๊ก, เสียงเตือนใกล้หมด และเสียงเมื่อหมดเวลา (Sync สู่เวทีแบบ Realtime)
            </div>
          </div>
        </div>

        {/* 3 Sound Toggle Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* Row 1: Tick Sound */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.25)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={15} color="#38bdf8" /> เสียงติ๊กนับถอยหลัง (Countdown Ticks)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>เสียงติ๊กเบาๆ ทุกวินาทีตามจังหวะเวลาปกติ</div>
            </div>
            {onSetTimerSoundSettings && (
              <button
                type="button"
                onClick={() => onSetTimerSoundSettings({ tickSoundEnabled: !timerSoundSettings.tickSoundEnabled })}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: timerSoundSettings.tickSoundEnabled ? '#10b981' : 'rgba(255,255,255,0.1)',
                  color: timerSoundSettings.tickSoundEnabled ? '#000' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
              >
                {timerSoundSettings.tickSoundEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}
              </button>
            )}
          </div>

          {/* Row 2: Warning & Critical Alerts Sound */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.25)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertTriangle size={15} color="#f59e0b" /> เสียงเตือนช่วงใกล้หมดเวลา (Warning / Critical)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>เสียงเตือนพิเศษช่วงวิกฤต (≤10s) และ 3 วินาทีสุดท้าย</div>
            </div>
            {onSetTimerSoundSettings && (
              <button
                type="button"
                onClick={() => onSetTimerSoundSettings({ warningSoundEnabled: !timerSoundSettings.warningSoundEnabled })}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: timerSoundSettings.warningSoundEnabled ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                  color: timerSoundSettings.warningSoundEnabled ? '#000' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
              >
                {timerSoundSettings.warningSoundEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}
              </button>
            )}
          </div>

          {/* Row 3: Finish Timeout Sound */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.25)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Flame size={15} color="#ef4444" /> เสียงสัญญาณเมื่อหมดเวลา (Timeout Finish Gong)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>เสียงระฆังแจ้งเตือนเมื่อนับถึง 00:00</div>
            </div>
            {onSetTimerSoundSettings && (
              <button
                type="button"
                onClick={() => onSetTimerSoundSettings({ finishSoundEnabled: !timerSoundSettings.finishSoundEnabled })}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: timerSoundSettings.finishSoundEnabled ? '#ef4444' : 'rgba(255,255,255,0.1)',
                  color: timerSoundSettings.finishSoundEnabled ? '#fff' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
              >
                {timerSoundSettings.finishSoundEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}
              </button>
            )}
          </div>
        </div>

        {/* Volume Slider & Test Sound Previews */}
        {onSetTimerSoundSettings && (
          <div style={{ marginTop: '0.9rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '95px' }}>ระดับความดังเสียง:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={timerSoundSettings.tickVolume}
                onChange={(e) => onSetTimerSoundSettings({ tickVolume: parseFloat(e.target.value) })}
                style={{ flex: 1, accentColor: '#38bdf8' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', minWidth: '40px', textAlign: 'right', fontWeight: 600 }}>
                {Math.round(timerSoundSettings.tickVolume * 100)}%
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginRight: 'auto' }}>ทดสอบเสียงตัวอย่าง:</span>
              <button
                type="button"
                onClick={() => {
                  audioEngine.setMuted(false);
                  audioEngine.setTickSoundEnabled(true);
                  audioEngine.playTickSound(15);
                }}
                style={{
                  padding: '0.25rem 0.55rem',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '6px',
                  color: '#7dd3fc',
                  fontSize: '0.74rem',
                  cursor: 'pointer'
                }}
              >
                ติ๊กปกติ
              </button>
              <button
                type="button"
                onClick={() => {
                  audioEngine.setMuted(false);
                  audioEngine.setWarningSoundEnabled(true);
                  audioEngine.playTickSound(3);
                }}
                style={{
                  padding: '0.25rem 0.55rem',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '6px',
                  color: '#fde68a',
                  fontSize: '0.74rem',
                  cursor: 'pointer'
                }}
              >
                เตือน 3 วินาที
              </button>
              <button
                type="button"
                onClick={() => {
                  audioEngine.setMuted(false);
                  audioEngine.setFinishSoundEnabled(true);
                  audioEngine.playTimerFinish();
                }}
                style={{
                  padding: '0.25rem 0.55rem',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '6px',
                  color: '#fca5a5',
                  fontSize: '0.74rem',
                  cursor: 'pointer'
                }}
              >
                หมดเวลา
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
