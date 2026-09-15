import React from 'react';
import { TimerState, TimerPhase, TimerDisplayMode } from '../../types/timer.ts';
import { formatTimerDisplay, getTimerPhase } from '../../engine/timerEngine.ts';
import { Clock, AlertTriangle, Flame, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface TimerDisplayProps {
  timerState: TimerState;
  soundEnabled?: boolean;
  variant?: TimerDisplayMode;
  className?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timerState,
  soundEnabled = true,
  variant = 'corner',
  className = ''
}) => {
  if (timerState.status === 'idle') {
    return null;
  }

  const phase: TimerPhase = getTimerPhase(timerState.remainingMs, timerState.status, timerState.warningAtMs);
  const isFinished = phase === 'finished';
  const isLast3s = phase === 'last-3s';
  const isCritical = phase === 'critical';
  const isWarning = phase === 'warning';
  const isRunning = timerState.status === 'running';

  const formatted = formatTimerDisplay(timerState.remainingMs);
  const remainingSeconds = Math.ceil(timerState.remainingMs / 1000);

  const progress = timerState.durationMs > 0
    ? Math.max(0, Math.min(100, (timerState.remainingMs / timerState.durationMs) * 100))
    : 0;

  // Dynamic phase styling parameters
  const phaseStyles = {
    'normal': {
      bg: 'rgba(10, 14, 32, 0.9)',
      border: 'rgba(56, 189, 248, 0.4)',
      glow: '0 16px 48px rgba(0, 0, 0, 0.7), 0 0 35px rgba(56, 189, 248, 0.25)',
      textGrad: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
      accentColor: '#38bdf8',
      label: 'กำลังนับเวลา',
      badgeBg: 'rgba(56, 189, 248, 0.18)'
    },
    'warning': {
      bg: 'rgba(28, 20, 10, 0.92)',
      border: 'rgba(245, 158, 11, 0.7)',
      glow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 45px rgba(245, 158, 11, 0.4)',
      textGrad: 'linear-gradient(180deg, #fef08a 0%, #f59e0b 100%)',
      accentColor: '#f59e0b',
      label: 'ช่วงเตือนเวลา',
      badgeBg: 'rgba(245, 158, 11, 0.3)'
    },
    'critical': {
      bg: 'rgba(42, 10, 18, 0.94)',
      border: 'rgba(239, 68, 68, 0.85)',
      glow: '0 18px 56px rgba(0, 0, 0, 0.85), 0 0 55px rgba(239, 68, 68, 0.6)',
      textGrad: 'linear-gradient(180deg, #fee2e2 0%, #ef4444 100%)',
      accentColor: '#ef4444',
      label: '10 วินาทีสุดท้าย',
      badgeBg: 'rgba(239, 68, 68, 0.35)'
    },
    'last-3s': {
      bg: 'rgba(55, 6, 18, 0.98)',
      border: 'rgba(255, 34, 34, 1)',
      glow: '0 20px 65px rgba(0, 0, 0, 0.95), 0 0 75px rgba(255, 34, 34, 0.85)',
      textGrad: 'linear-gradient(180deg, #ffffff 0%, #ff2222 100%)',
      accentColor: '#ff2222',
      label: 'นับถอยหลัง!',
      badgeBg: 'rgba(255, 34, 34, 0.45)'
    },
    'finished': {
      bg: 'rgba(35, 8, 14, 0.95)',
      border: 'rgba(239, 68, 68, 0.9)',
      glow: '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 45px rgba(239, 68, 68, 0.5)',
      textGrad: 'linear-gradient(180deg, #fecaca 0%, #f87171 100%)',
      accentColor: '#ef4444',
      label: 'สิ้นสุดเวลา',
      badgeBg: 'rgba(239, 68, 68, 0.3)'
    }
  }[phase];

  // 1. CENTER FOCUS VARIANT (จอใหญ่ตรงกลางเวทีสำหรับจับเวลา)
  if (variant === 'center') {
    return (
      <div
        className={`stage-timer-center-hero timer-phase-${phase} ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          padding: isFinished ? '1.25rem 2.5rem' : '1.5rem 3rem',
          background: phaseStyles.bg,
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: `2px solid ${phaseStyles.border}`,
          borderRadius: '32px',
          boxShadow: phaseStyles.glow,
          transition: 'background 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease, padding 0.4s ease',
          userSelect: 'none',
          position: 'relative'
        }}
      >
        {/* Top Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '0.5rem'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 1rem',
              borderRadius: '9999px',
              background: phaseStyles.badgeBg,
              border: `1px solid ${phaseStyles.border}`,
              color: phaseStyles.accentColor,
              fontSize: '0.88rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              transition: 'all 0.4s ease'
            }}
          >
            {isFinished ? (
              <AlertTriangle size={17} />
            ) : isLast3s ? (
              <Flame size={17} style={{ opacity: 0.95 }} />
            ) : isCritical || isWarning ? (
              <AlertTriangle size={17} />
            ) : (
              <Clock size={17} />
            )}
            <span>{phaseStyles.label}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: '#cbd5e1',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}
            >
              <Sparkles size={14} color="#fde047" />
              <span>TIME FOCUS</span>
            </div>

            <div
              title={soundEnabled ? 'เปิดเสียงติ๊กถอยหลัง (Tick Sound ON)' : 'ปิดเสียงติ๊กถอยหลัง (Tick Sound OFF)'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: soundEnabled ? '#38bdf8' : '#64748b',
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '0.3rem 0.6rem',
                borderRadius: '8px',
                fontSize: '0.75rem'
              }}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </div>
          </div>
        </div>

        {/* Massive Digits Display */}
        <div
          className="timer-digit-wrapper"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0.25rem 0',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"'
          }}
        >
          <span
            className="stage-timer-digits"
            style={{
              fontFamily: "'Outfit', 'Cinzel', monospace, system-ui",
              fontSize: isFinished ? 'clamp(3rem, 6.5vw, 5.5rem)' : 'clamp(4.5rem, 9.5vw, 8.5rem)',
              fontWeight: 800,
              letterSpacing: '0.08em',
              fontVariantNumeric: 'tabular-nums',
              fontFeatureSettings: '"tnum"',
              display: 'inline-block',
              minWidth: isFinished ? 'auto' : '2.6ch',
              textAlign: 'center',
              background: phaseStyles.textGrad,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: isLast3s
                ? '0 0 35px rgba(255, 34, 34, 0.7), 0 0 15px rgba(255, 255, 255, 0.6)'
                : isCritical
                ? '0 0 30px rgba(239, 68, 68, 0.6)'
                : isWarning
                ? '0 0 24px rgba(245, 158, 11, 0.5)'
                : '0 0 20px rgba(56, 189, 248, 0.35)',
              lineHeight: 1.05,
              transition: 'text-shadow 0.4s ease'
            }}
          >
            {isFinished ? 'หมดเวลา' : formatted}
          </span>
        </div>

        {/* Wide Glowing Progress Track */}
        {!isFinished && (
          <div
            style={{
              width: '100%',
              height: '10px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '9999px',
              overflow: 'hidden',
              marginTop: '0.75rem',
              position: 'relative'
            }}
          >
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
                boxShadow: `0 0 16px ${phaseStyles.accentColor}`,
                transition: 'width 0.1s linear'
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // 2. COMPACT VARIANT (แถบแคปซูลกะทัดรัด)
  if (variant === 'compact') {
    return (
      <div
        className={`stage-timer-compact timer-phase-${phase} ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 1.15rem',
          background: phaseStyles.bg,
          backdropFilter: 'blur(20px)',
          border: `1.5px solid ${phaseStyles.border}`,
          borderRadius: '9999px',
          boxShadow: phaseStyles.glow,
          transition: 'background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease',
          userSelect: 'none'
        }}
      >
        <div style={{ color: phaseStyles.accentColor, display: 'flex', alignItems: 'center' }}>
          {isFinished ? <AlertTriangle size={16} /> : isLast3s ? <Flame size={16} /> : <Clock size={16} />}
        </div>
        <span
          style={{
            fontFamily: "'Outfit', monospace, system-ui",
            fontSize: '1.6rem',
            fontWeight: 800,
            background: phaseStyles.textGrad,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
            display: 'inline-block',
            minWidth: isFinished ? 'auto' : '2.4ch',
            textAlign: 'center',
            lineHeight: 1
          }}
        >
          {isFinished ? 'หมดเวลา' : formatted}
        </span>
      </div>
    );
  }

  // 3. CORNER HUD VARIANT (มุมขวาบนมาตรฐาน)
  return (
    <div
      className={`stage-timer-hud timer-phase-${phase} ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isFinished ? '0.75rem 1.6rem' : '0.85rem 1.75rem',
        background: phaseStyles.bg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `2px solid ${phaseStyles.border}`,
        borderRadius: '24px',
        boxShadow: phaseStyles.glow,
        transition: 'background 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease, padding 0.4s ease',
        userSelect: 'none',
        position: 'relative'
      }}
    >
      {/* Top Meta Header: Status & Sound Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          gap: '1rem',
          marginBottom: '0.35rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            background: phaseStyles.badgeBg,
            color: phaseStyles.accentColor,
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            transition: 'all 0.4s ease'
          }}
        >
          {isFinished ? (
            <AlertTriangle size={14} />
          ) : isLast3s ? (
            <Flame size={14} style={{ opacity: 0.95 }} />
          ) : isCritical || isWarning ? (
            <AlertTriangle size={14} />
          ) : (
            <Clock size={14} />
          )}
          <span>{phaseStyles.label}</span>
        </div>

        {/* Subtle Sound Indicator */}
        <div
          title={soundEnabled ? 'เปิดเสียงติ๊กถอยหลัง (Tick Sound ON)' : 'ปิดเสียงติ๊กถอยหลัง (Tick Sound OFF)'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: soundEnabled ? '#38bdf8' : '#64748b',
            opacity: 0.85,
            fontSize: '0.7rem'
          }}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </div>
      </div>

      {/* Main Large Countdown Digits */}
      <div
        className="timer-digit-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0.1rem 0',
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"'
        }}
      >
        <span
          className="stage-timer-digits"
          style={{
            fontFamily: "'Outfit', 'Cinzel', monospace, system-ui",
            fontSize: isFinished ? '2.4rem' : 'clamp(2.75rem, 5.5vw, 4.5rem)',
            fontWeight: 800,
            letterSpacing: '0.06em',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
            display: 'inline-block',
            minWidth: isFinished ? 'auto' : '2.6ch',
            textAlign: 'center',
            background: phaseStyles.textGrad,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: isLast3s
              ? '0 0 30px rgba(255, 34, 34, 0.7), 0 0 12px rgba(255, 255, 255, 0.6)'
              : isCritical
              ? '0 0 22px rgba(239, 68, 68, 0.6)'
              : isWarning
              ? '0 0 18px rgba(245, 158, 11, 0.5)'
              : '0 0 14px rgba(56, 189, 248, 0.3)',
            lineHeight: 1,
            transition: 'text-shadow 0.4s ease'
          }}
        >
          {isFinished ? 'หมดเวลา' : formatted}
        </span>
      </div>

      {/* Glowing Dynamic Progress Track */}
      {!isFinished && (
        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginTop: '0.45rem',
            position: 'relative'
          }}
        >
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
              boxShadow: `0 0 12px ${phaseStyles.accentColor}`,
              transition: 'width 0.1s linear'
            }}
          />
        </div>
      )}
    </div>
  );
};

