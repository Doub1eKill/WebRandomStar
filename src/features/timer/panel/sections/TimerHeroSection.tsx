import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';

import type { TimerPanelModel } from '../useTimerPanelModel.tsx';

export const TimerHeroSection: React.FC<{ m: TimerPanelModel }> = ({ m }) => {
  const { timerState, stageDisplaySettings, onStartTimer, onPauseTimer, onResumeTimer, onResetTimer, onFinishTimer, onAdjustTimer, isFinished, isLast3s, isCritical, isWarning, isRunning, isPaused, formatted, progress } = m;
  return (
    <>
      {/* 1. Timer Hero Display & Live Actions */}
      <div
        style={{
          background: isFinished
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(14, 18, 44, 0.75))'
            : isLast3s
            ? 'linear-gradient(135deg, rgba(255, 34, 34, 0.25), rgba(14, 18, 44, 0.75))'
            : isCritical
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(14, 18, 44, 0.75))'
            : isWarning
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(14, 18, 44, 0.75))'
            : 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(14, 18, 44, 0.75))',
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
    </>
  );
};
