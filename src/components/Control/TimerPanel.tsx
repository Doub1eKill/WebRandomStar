import React, { useState } from 'react';
import {
  TimerState,
  TimerSoundSettings,
  StageDisplaySettings,
  DEFAULT_TIMER_PRESETS,
  DEFAULT_TIMER_SOUND_SETTINGS,
  DEFAULT_STAGE_DISPLAY_SETTINGS
} from '../../types/timer.ts';
import { formatTimerDisplay, getTimerPhase } from '../../engine/timerEngine.ts';
import { audioEngine } from '../../engine/audioEngine.ts';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Zap,
  Bell,
  AlertTriangle,
  Flame,
  Layout,
  Sliders,
  Sparkles,
  PlusCircle,
  MinusCircle,
  Type
} from 'lucide-react';

interface TimerPanelProps {
  timerState: TimerState;
  timerSoundSettings?: TimerSoundSettings;
  stageDisplaySettings?: StageDisplaySettings;
  onSetDuration: (durationMs: number) => void;
  onStartTimer: (durationMs?: number) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
  onFinishTimer: () => void;
  onAdjustTimer?: (deltaMs: number) => void;
  onSetTimerSoundSettings?: (settings: Partial<TimerSoundSettings>) => void;
  onSetStageDisplaySettings?: (settings: Partial<StageDisplaySettings>) => void;
}

export const TimerPanel: React.FC<TimerPanelProps> = ({
  timerState,
  timerSoundSettings = DEFAULT_TIMER_SOUND_SETTINGS,
  stageDisplaySettings = DEFAULT_STAGE_DISPLAY_SETTINGS,
  onSetDuration,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onFinishTimer,
  onAdjustTimer,
  onSetTimerSoundSettings,
  onSetStageDisplaySettings
}) => {
  const [customMinutes, setCustomMinutes] = useState('1');
  const [customSeconds, setCustomSeconds] = useState('30');

  const phase = getTimerPhase(timerState.remainingMs, timerState.status, timerState.warningAtMs || stageDisplaySettings.warningThresholdMs);
  const isFinished = phase === 'finished';
  const isLast3s = phase === 'last-3s';
  const isCritical = phase === 'critical';
  const isWarning = phase === 'warning';
  const isRunning = timerState.status === 'running';
  const isPaused = timerState.status === 'paused';

  const formatted = formatTimerDisplay(timerState.remainingMs);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes, 10) || 0;
    const secs = parseInt(customSeconds, 10) || 0;
    const totalMs = (mins * 60 + secs) * 1000;
    if (totalMs > 0) {
      onSetDuration(totalMs);
    }
  };

  const progress = timerState.durationMs > 0
    ? Math.max(0, Math.min(100, (timerState.remainingMs / timerState.durationMs) * 100))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Timer Hero Display & Live Actions */}
      <div
        style={{
          background: isFinished
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(15, 23, 42, 0.75))'
            : isLast3s
            ? 'linear-gradient(135deg, rgba(255, 34, 34, 0.25), rgba(15, 23, 42, 0.75))'
            : isCritical
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(15, 23, 42, 0.75))'
            : isWarning
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(15, 23, 42, 0.75))'
            : 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.75))',
          border: `1.5px solid ${
            isFinished
              ? 'rgba(239, 68, 68, 0.6)'
              : isLast3s
              ? 'rgba(255, 34, 34, 0.8)'
              : isCritical
              ? 'rgba(239, 68, 68, 0.6)'
              : isWarning
              ? 'rgba(245, 158, 11, 0.5)'
              : 'rgba(255, 255, 255, 0.15)'
          }`,
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: isLast3s
            ? '0 0 40px rgba(255, 34, 34, 0.35)'
            : isCritical
            ? '0 0 35px rgba(239, 68, 68, 0.3)'
            : isWarning
            ? '0 0 30px rgba(245, 158, 11, 0.25)'
            : '0 8px 32px rgba(0, 0, 0, 0.35)',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              background: isRunning
                ? 'rgba(34, 197, 94, 0.2)'
                : isPaused
                ? 'rgba(234, 179, 8, 0.2)'
                : isFinished
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(255, 255, 255, 0.1)',
              color: isRunning ? '#86efac' : isPaused ? '#fde047' : isFinished ? '#fca5a5' : '#94a3b8',
              border: `1px solid ${isRunning ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
            }}
          >
            {timerState.status}
          </span>

          {/* Dynamic Phase Indicator Badge */}
          {isLast3s ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255, 34, 34, 0.3)', color: '#ff8888', border: '1px solid rgba(255, 34, 34, 0.6)' }}>
              <Flame size={14} /> 3 วินาทีสุดท้าย (Last 3s)
            </span>
          ) : isCritical ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
              <AlertTriangle size={14} /> วิกฤต (≤{Math.round(stageDisplaySettings.criticalThresholdMs / 1000)}s Critical)
            </span>
          ) : isWarning ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(245, 158, 11, 0.25)', color: '#fde68a', border: '1px solid rgba(245, 158, 11, 0.5)' }}>
              <AlertTriangle size={14} /> ช่วงเตือน (≤{Math.round(stageDisplaySettings.warningThresholdMs / 1000)}s Warning)
            </span>
          ) : null}
        </div>

        <div
          style={{
            fontFamily: "'Outfit', monospace, system-ui",
            fontSize: '4.2rem',
            fontWeight: 800,
            color: isFinished ? '#fca5a5' : isLast3s ? '#ff4444' : isCritical ? '#f87171' : isWarning ? '#fde68a' : '#f8fafc',
            letterSpacing: '0.06em',
            margin: '0.4rem 0',
            lineHeight: 1
          }}
        >
          {isFinished ? 'หมดเวลา' : formatted}
        </div>

        {/* Progress bar */}
        <div style={{ height: '6px', width: '100%', maxWidth: '340px', margin: '0.75rem auto', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: isLast3s
                ? 'linear-gradient(90deg, #ff2222, #f43f5e)'
                : isCritical
                ? 'linear-gradient(90deg, #ef4444, #f97316)'
                : isWarning
                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(90deg, #0284c7, #38bdf8)',
              transition: 'width 0.18s linear'
            }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          {!isRunning ? (
            <button
              onClick={() => isPaused ? onResumeTimer() : onStartTimer()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.75rem 1.6rem',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.35)'
              }}
            >
              <Play size={18} /> {isPaused ? 'นับต่อ (Resume)' : 'เริ่มจับเวลา (Start) [T]'}
            </button>
          ) : (
            <button
              onClick={onPauseTimer}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.75rem 1.6rem',
                background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Pause size={18} /> พักชั่วคราว (Pause) [T]
            </button>
          )}

          <button
            onClick={onResetTimer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1.15rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              color: '#cbd5e1',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={16} /> รีเซ็ต (Reset)
          </button>

          <button
            onClick={onFinishTimer}
            disabled={isFinished}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1.15rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              color: '#fca5a5',
              fontSize: '0.9rem',
              cursor: isFinished ? 'not-allowed' : 'pointer',
              opacity: isFinished ? 0.5 : 1
            }}
          >
            <CheckCircle2 size={16} /> จบเวลา (Finish)
          </button>
        </div>

        {/* Quick Live Time Adjust (+30s, +10s, -10s) */}
        {onAdjustTimer && (
          <div style={{ marginTop: '1.1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginRight: '0.25rem' }}>ปรับเวลาสดบนเวที:</span>
            <button
              onClick={() => onAdjustTimer(30000)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.75rem',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '8px',
                color: '#7dd3fc',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={14} /> +30 วินาที
            </button>
            <button
              onClick={() => onAdjustTimer(10000)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.75rem',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                borderRadius: '8px',
                color: '#86efac',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={14} /> +10 วินาที
            </button>
            <button
              onClick={() => onAdjustTimer(-10000)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.75rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <MinusCircle size={14} /> -10 วินาที
            </button>
          </div>
        )}
      </div>

      {/* 2. Stage Layout & Display Modes (การจัดวางและตำแหน่งบนเวที) */}
      {onSetStageDisplaySettings && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid rgba(99, 102, 241, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Layout size={18} color="#818cf8" />
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
                background: stageDisplaySettings.timerDisplayMode === 'center' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: `1.5px solid ${stageDisplaySettings.timerDisplayMode === 'center' ? '#6366f1' : 'rgba(255, 255, 255, 0.1)'}`,
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
    </div>
  );
};

