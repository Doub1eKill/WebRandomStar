import React from 'react';
import { TimerState, TimerPhase, TimerDisplayMode, StageDisplaySettings, DEFAULT_STAGE_DISPLAY_SETTINGS } from '../../types/timer.ts';
import { formatTimerDisplay, getTimerPhase } from '../../engine/timerEngine.ts';
import { Clock, AlertTriangle, Flame, Pause } from 'lucide-react';

interface TimerDisplayProps {
  timerState: TimerState;
  soundEnabled?: boolean;
  variant?: TimerDisplayMode;
  stageDisplaySettings?: StageDisplaySettings;
  className?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timerState,
  variant = 'corner',
  stageDisplaySettings = DEFAULT_STAGE_DISPLAY_SETTINGS,
  className = ''
}) => {
  if (timerState.status === 'idle') {
    return null;
  }

  const warningThresholdMs = stageDisplaySettings?.warningThresholdMs ?? timerState.warningAtMs ?? 30000;
  const criticalThresholdMs = stageDisplaySettings?.criticalThresholdMs ?? 10000;

  const phase: TimerPhase = getTimerPhase(
    timerState.remainingMs,
    timerState.status,
    warningThresholdMs,
    criticalThresholdMs
  );

  const isFinished = phase === 'finished';
  const isLast3s = phase === 'last-3s';
  const isCritical = phase === 'critical';
  const isWarning = phase === 'warning';
  const isPaused = timerState.status === 'paused';

  const formatted = formatTimerDisplay(timerState.remainingMs);

  const progress = timerState.durationMs > 0
    ? Math.max(0, Math.min(100, (timerState.remainingMs / timerState.durationMs) * 100))
    : 0;

  // Compute dynamic phase styles matching the controller and alert thresholds
  const getPhaseStyles = () => {
    if (isFinished) {
      return {
        bg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.22), rgba(15, 23, 42, 0.92))',
        border: 'rgba(244, 63, 94, 0.6)',
        glow: '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 35px rgba(244, 63, 94, 0.35)',
        accentColor: '#fca5a5',
        numeralColor: '#fca5a5',
        textShadow: '0 0 24px rgba(244, 63, 94, 0.5)',
        label: 'สิ้นสุดเวลา',
        badgeBg: 'rgba(244, 63, 94, 0.25)',
        badgeBorder: 'rgba(244, 63, 94, 0.5)',
        icon: (size: number) => <AlertTriangle size={size} />,
        progressGrad: 'linear-gradient(90deg, #f43f5e, #e11d48)'
      };
    }
    if (isLast3s) {
      return {
        bg: 'linear-gradient(135deg, rgba(255, 34, 34, 0.28), rgba(15, 23, 42, 0.94))',
        border: 'rgba(255, 34, 34, 0.8)',
        glow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 45px rgba(255, 34, 34, 0.45)',
        accentColor: '#ff8888',
        numeralColor: '#ff4444',
        textShadow: '0 0 30px rgba(255, 34, 34, 0.65)',
        label: '3 วินาทีสุดท้าย (Last 3s)',
        badgeBg: 'rgba(255, 34, 34, 0.3)',
        badgeBorder: 'rgba(255, 34, 34, 0.6)',
        icon: (size: number) => <Flame size={size} />,
        progressGrad: 'linear-gradient(90deg, #ff2222, #f43f5e)'
      };
    }
    if (isCritical) {
      return {
        bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22), rgba(15, 23, 42, 0.92))',
        border: 'rgba(239, 68, 68, 0.6)',
        glow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.35)',
        accentColor: '#fca5a5',
        numeralColor: '#f87171',
        textShadow: '0 0 25px rgba(239, 68, 68, 0.5)',
        label: `วิกฤต (≤${Math.round(criticalThresholdMs / 1000)}s Critical)`,
        badgeBg: 'rgba(239, 68, 68, 0.25)',
        badgeBorder: 'rgba(239, 68, 68, 0.5)',
        icon: (size: number) => <AlertTriangle size={size} />,
        progressGrad: 'linear-gradient(90deg, #ef4444, #f97316)'
      };
    }
    if (isWarning) {
      return {
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(15, 23, 42, 0.92))',
        border: 'rgba(245, 158, 11, 0.5)',
        glow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.3)',
        accentColor: '#fde68a',
        numeralColor: '#fde68a',
        textShadow: '0 0 25px rgba(245, 158, 11, 0.45)',
        label: `ช่วงเตือน (≤${Math.round(warningThresholdMs / 1000)}s Warning)`,
        badgeBg: 'rgba(245, 158, 11, 0.25)',
        badgeBorder: 'rgba(245, 158, 11, 0.5)',
        icon: (size: number) => <AlertTriangle size={size} />,
        progressGrad: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
      };
    }
    if (isPaused) {
      return {
        bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.18), rgba(15, 23, 42, 0.92))',
        border: 'rgba(234, 179, 8, 0.45)',
        glow: '0 16px 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(234, 179, 8, 0.25)',
        accentColor: '#fde047',
        numeralColor: '#fef08a',
        textShadow: '0 0 20px rgba(234, 179, 8, 0.35)',
        label: 'พักชั่วคราว (Paused)',
        badgeBg: 'rgba(234, 179, 8, 0.2)',
        badgeBorder: 'rgba(234, 179, 8, 0.4)',
        icon: (size: number) => <Pause size={size} />,
        progressGrad: 'linear-gradient(90deg, #ca8a04, #eab308)'
      };
    }
    return {
      bg: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(7, 17, 38, 0.92))',
      border: 'rgba(56, 189, 248, 0.35)',
      glow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(13, 40, 84, 0.4)',
      accentColor: '#38bdf8',
      numeralColor: '#ffffff',
      textShadow: '0 0 25px rgba(56, 189, 248, 0.35)',
      label: 'กำลังนับเวลา',
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      badgeBorder: 'rgba(56, 189, 248, 0.35)',
      icon: (size: number) => <Clock size={size} />,
      progressGrad: 'linear-gradient(90deg, #0284c7, #38bdf8)'
    };
  };

  const phaseStyles = getPhaseStyles();

  // 1. CENTER FOCUS VARIANT (จอใหญ่ตรงกลางเวทีสำหรับจับเวลา)
  if (variant === 'center') {
    return (
      <div
        className={`stage-timer-center-hero animate-timer-float-in timer-phase-${phase} ${className}`}
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
          transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, padding 0.3s ease',
          userSelect: 'none',
          position: 'relative'
        }}
      >
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
              fontFamily: "'Outfit', monospace, system-ui",
              fontSize: isFinished ? 'clamp(3rem, 6.5vw, 5.5rem)' : 'clamp(4.5rem, 9.5vw, 8.5rem)',
              fontWeight: 800,
              letterSpacing: '0.06em',
              fontVariantNumeric: 'tabular-nums',
              fontFeatureSettings: '"tnum"',
              display: 'inline-block',
              minWidth: isFinished ? 'auto' : '2.6ch',
              textAlign: 'center',
              color: phaseStyles.numeralColor,
              textShadow: phaseStyles.textShadow,
              lineHeight: 1.05,
              transition: 'color 0.3s ease, text-shadow 0.3s ease'
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
                background: phaseStyles.progressGrad,
                boxShadow: `0 0 16px ${phaseStyles.accentColor}`,
                transition: 'width 0.1s linear, background 0.4s ease, box-shadow 0.4s ease'
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
          transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
          userSelect: 'none'
        }}
      >
        <div style={{ color: phaseStyles.accentColor, display: 'flex', alignItems: 'center' }}>
          {phaseStyles.icon(16)}
        </div>
        <span
          style={{
            fontFamily: "'Outfit', monospace, system-ui",
            fontSize: '1.6rem',
            fontWeight: 800,
            color: phaseStyles.numeralColor,
            textShadow: phaseStyles.textShadow,
            letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
            display: 'inline-block',
            minWidth: isFinished ? 'auto' : '2.4ch',
            textAlign: 'center',
            lineHeight: 1,
            transition: 'color 0.3s ease, text-shadow 0.3s ease'
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
      className={`stage-timer-hud animate-timer-float-in timer-phase-${phase} ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isFinished ? '0.65rem 1.5rem' : '0.75rem 1.6rem',
        background: phaseStyles.bg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `2px solid ${phaseStyles.border}`,
        borderRadius: '24px',
        boxShadow: phaseStyles.glow,
        transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, padding 0.3s ease',
        userSelect: 'none',
        position: 'relative'
      }}
    >
      {/* Main Large Countdown Digits */}
      <div
        className="timer-digit-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"'
        }}
      >
        <span
          className="stage-timer-digits"
          style={{
            fontFamily: "'Outfit', monospace, system-ui",
            fontSize: isFinished ? '2.4rem' : 'clamp(2.75rem, 5.5vw, 4.5rem)',
            fontWeight: 800,
            letterSpacing: '0.06em',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
            display: 'inline-block',
            minWidth: isFinished ? 'auto' : '2.6ch',
            textAlign: 'center',
            color: phaseStyles.numeralColor,
            textShadow: phaseStyles.textShadow,
            lineHeight: 1,
            transition: 'color 0.3s ease, text-shadow 0.3s ease'
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
              background: phaseStyles.progressGrad,
              boxShadow: `0 0 12px ${phaseStyles.accentColor}`,
              transition: 'width 0.1s linear, background 0.4s ease, box-shadow 0.4s ease'
            }}
          />
        </div>
      )}
    </div>
  );
};
