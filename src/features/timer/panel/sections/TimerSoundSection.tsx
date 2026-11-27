import React from 'react';
import { audioEngine } from '@/features/audio/audioEngine.ts';
import {
  Clock,
  Bell,
  AlertTriangle,
  Flame,
} from 'lucide-react';

import type { TimerPanelModel } from '../useTimerPanelModel.tsx';
import { DEFAULT_TIMER_SOUND_SETTINGS, type EffectVolumeField, type TimerSoundSettings } from '@/types/timer.ts';

type VolumeField = 'tickVolume' | EffectVolumeField;

/** One slider per sound: the timer sounds first, then the spin and reveal effects. */
const EFFECT_ROWS: { field: VolumeField; label: string; color: string }[] = [
  { field: 'tickVolume', label: 'ติ๊กนับถอยหลัง', color: '#38bdf8' },
  { field: 'warningVolume', label: 'เตือนใกล้หมดเวลา', color: '#f59e0b' },
  { field: 'finishVolume', label: 'หมดเวลา', color: '#ef4444' },
  { field: 'spinStartVolume', label: 'เริ่มสุ่ม', color: '#a78bfa' },
  { field: 'spinTickVolume', label: 'ติ๊กระหว่างสุ่ม', color: '#c084fc' },
  { field: 'wordLockVolume', label: 'ล็อกคำ', color: '#f472b6' },
  { field: 'revealVolume', label: 'เปิดคำถาม', color: '#facc15' }
];

/**
 * Play one sound here on the control window at the levels shown. This window's engine is not
 * the stage's, so give it the current levels first.
 */
function previewEffect(field: VolumeField, settings: TimerSoundSettings): void {
  audioEngine.setMuted(false);
  audioEngine.setTickVolume(settings.tickVolume);
  audioEngine.setEffectVolumes(settings);
  switch (field) {
    case 'tickVolume': audioEngine.setTickSoundEnabled(true); audioEngine.playTickSound(15); break;
    case 'warningVolume': audioEngine.setWarningSoundEnabled(true); audioEngine.playTickSound(3); break;
    case 'finishVolume': audioEngine.setFinishSoundEnabled(true); audioEngine.playTimerFinish(); break;
    case 'spinStartVolume': audioEngine.playSpinStart(); break;
    case 'spinTickVolume': audioEngine.playSpinTick(0.8); break;
    case 'wordLockVolume': audioEngine.playWordLock(); break;
    case 'revealVolume': audioEngine.playQuestionReveal(); break;
  }
}

export const TimerSoundSection: React.FC<{ m: TimerPanelModel }> = ({ m }) => {
  const { timerSoundSettings, onSetTimerSoundSettings } = m;
  return (
    <>
      {/* 4. Timer Sound Effects & Audio Toggles */}
      <div
        style={{
          background: 'rgba(14, 18, 44, 0.65)',
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
              ตั้งค่าเปิด/ปิดเสียงติ๊ก, เสียงเตือนใกล้หมด, เสียงเมื่อหมดเวลา และความดังของแต่ละเสียง (Sync สู่เวทีแบบ Realtime)
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

        {/* Per-sound volume sliders, each with a preview button */}
        {onSetTimerSoundSettings && (
          <div style={{ marginTop: '0.9rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: 600, marginBottom: '0.2rem' }}>
              ระดับเสียงของแต่ละเสียง (Per-sound volume)
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.6rem' }}>
              ตั้งความดังล่วงหน้าแยกแต่ละเสียง (คูณกับระดับเสียงหลัก) กด "ทดสอบ" เพื่อฟังที่ระดับนั้น
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {EFFECT_ROWS.map(row => {
                const value = timerSoundSettings[row.field] ?? DEFAULT_TIMER_SOUND_SETTINGS[row.field];
                return (
                  <div key={row.field} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1', minWidth: '150px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                      {row.label}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={value}
                      onChange={(e) => onSetTimerSoundSettings({ [row.field]: parseFloat(e.target.value) })}
                      aria-label={`ระดับเสียง${row.label}`}
                      style={{ flex: 1, minWidth: '120px', accentColor: row.color }}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1', minWidth: '40px', textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {Math.round(value * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => previewEffect(row.field, timerSoundSettings)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: `1px solid ${row.color}55`,
                        borderRadius: '6px',
                        color: '#e2e8f0',
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      ทดสอบ
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
