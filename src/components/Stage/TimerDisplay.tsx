import React from 'react';
import { TimerState, TimerPhase, TimerDisplayMode } from '../../types/timer.ts';
import { formatTimerDisplay, getTimerPhase } from '../../engine/timerEngine.ts';
import { Clock, AlertTriangle, Volume2, VolumeX, Sparkles } from 'lucide-react';

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

  const formatted = formatTimerDisplay(timerState.remainingMs);

  const progress = timerState.durationMs > 0
    ? Math.max(0, Math.min(100, (timerState.remainingMs / timerState.durationMs) * 100))
    : 0;

  const phaseStyles = isFinished
    ? {
        bg: 'rgba(20, 10, 25, 0.92)',
        border: 'rgba(244, 63, 94, 0.5)',
        glow: '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 35px rgba(244, 63, 94, 0.3)',
        textGrad: 'linear-gradient(180deg, #fecaca 0%, #f87171 100%)',
        accentColor: '#f43f5e',
        label: 'สิ้นสุดเวลา',
        badgeBg: 'rgba(244, 63, 94, 0.2)'
      }
    : {
        bg: 'rgba(7, 17, 38, 0.88)',
        border: 'rgba(56, 189, 248, 0.35)',
        glow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(13, 40, 84, 0.4)',
        textGrad: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
        accentColor: '#38bdf8',
        label: 'กำลังนับเวลา',
        badgeBg: 'rgba(56, 189, 248, 0.15)'
      };

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
          transition: 'background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease, padding 0.4s ease',
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
            {isFinished ? <AlertTriangle size={17} /> : <Clock size={17} />}
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
              textShadow: isFinished
                ? '0 0 25px rgba(244, 63, 94, 0.45)'
                : '0 2px 14px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.25)',
              lineHeight: 1.05
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
                background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
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
          {isFinished ? <AlertTriangle size={16} /> : <Clock size={16} />}
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
        transition: 'background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease, padding 0.4s ease',
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
          {isFinished ? <AlertTriangle size={14} /> : <Clock size={14} />}
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
            textShadow: isFinished
              ? '0 0 20px rgba(244, 63, 94, 0.45)'
              : '0 2px 14px rgba(0, 0, 0, 0.8), 0 0 16px rgba(56, 189, 248, 0.25)',
            lineHeight: 1
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
              background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
              boxShadow: `0 0 12px ${phaseStyles.accentColor}`,
              transition: 'width 0.1s linear'
            }}
          />
        </div>
      )}
    </div>
  );
};

