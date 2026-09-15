import React from 'react';
import { SessionState } from '../../types/session.ts';
import { Contestant, QuestionCategory } from '../../types/question.ts';
import { KeywordItem } from '../../types/word.ts';
import { TimerSoundSettings, StageDisplaySettings, DEFAULT_STAGE_DISPLAY_SETTINGS } from '../../types/timer.ts';

interface ControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionState;
  contestants: Contestant[];
  words?: KeywordItem[];
  onStart: (forceCategory?: QuestionCategory, forceWord?: KeywordItem) => void;
  onPause: () => void;
  onSkip: () => void;
  onMarkAnswered: () => void;
  onReset: () => void;
  onSelectContestant: (id: string) => void;
  onSelectRound: (round: string) => void;
  onSetVolume: (vol: number) => void;
  onToggleMute: () => void;
  onOpenQuestionManager: () => void;
  onOpenContestantManager: () => void;
  onSetTimerSoundSettings?: (settings: Partial<TimerSoundSettings>) => void;
  onSetStageDisplaySettings?: (settings: Partial<StageDisplaySettings>) => void;
  onAdjustTimer?: (deltaMs: number) => void;
}

export const ControlDrawer: React.FC<ControlDrawerProps> = ({
  isOpen,
  onClose,
  session,
  contestants,
  words = [],
  onStart,
  onPause,
  onSkip,
  onMarkAnswered,
  onReset,
  onSelectContestant,
  onSelectRound,
  onSetVolume,
  onToggleMute,
  onOpenQuestionManager,
  onOpenContestantManager,
  onSetTimerSoundSettings,
  onSetStageDisplaySettings,
  onAdjustTimer
}) => {
  if (!isOpen) return null;

  const handleOpenRemoteWindow = () => {
    const url = `${window.location.origin}${window.location.pathname}?mode=controller`;
    window.open(url, 'SeasonQuizController', 'width=960,height=750,menubar=no,toolbar=no');
  };

  const isIdle = session.currentState === 'idle';
  const isQuestionActive = session.currentState === 'question';
  const isAnswered = session.currentState === 'answered';
  const displaySettings = session.stageDisplaySettings || DEFAULT_STAGE_DISPLAY_SETTINGS;

  return (
    <div className="control-drawer-backdrop" onClick={onClose}>
      <div className="control-drawer-panel glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-wrap">
            <span className="drawer-icon">👑</span>
            <div>
              <h2 className="drawer-title">แผงควบคุมผู้ดำเนินรายการ</h2>
              <p className="drawer-subtitle">Stage Controller & Settings</p>
            </div>
          </div>
          <button className="btn-close-drawer" onClick={onClose} title="ปิด (Esc)">✕</button>
        </div>

        <div className="drawer-body">
          {/* Section 1: Contestant & Round */}
          <div className="control-section">
            <label className="section-label">👤 ผู้เข้าแข่งขันปัจจุบัน</label>
            <div className="select-row">
              <select
                className="custom-select"
                value={session.selectedContestantId || ''}
                onChange={(e) => onSelectContestant(e.target.value)}
              >
                <option value="">-- เลือกผู้เข้าแข่งขัน --</option>
                {contestants.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.number} [{c.title}] {c.name} ({c.faculty})
                  </option>
                ))}
              </select>
              <button
                className="btn-secondary btn-icon-only"
                onClick={onOpenContestantManager}
                title="จัดการรายชื่อผู้เข้าแข่งขัน"
              >
                👥
              </button>
            </div>
          </div>

          <div className="control-section">
            <label className="section-label">🎯 รอบการแข่งขัน</label>
            <select
              className="custom-select"
              value={session.selectedRound}
              onChange={(e) => onSelectRound(e.target.value)}
            >
              <option value="intro">รอบแนะนำตัว (Intro)</option>
              <option value="general">รอบทั่วไป (General)</option>
              <option value="attitude">รอบทัศนคติ (Attitude)</option>
              <option value="scenario">รอบสถานการณ์จำลอง (Scenario)</option>
              <option value="final">รอบชิงชนะเลิศ (Final)</option>
            </select>
          </div>

          {/* Section 2: Stage Actions */}
          <div className="control-section">
            <label className="section-label">⚡ ควบคุมการหมุนคำและเวที</label>
            <div className="actions-grid">
              <button
                className="btn-primary"
                onClick={() => onStart()}
                disabled={!isIdle}
              >
                👑 ✦ SPIN WORD ✦ [Space]
              </button>

              <button
                className="btn-secondary"
                onClick={onPause}
                disabled={isIdle || isQuestionActive || isAnswered}
              >
                {session.isPaused ? '▶️ เล่นต่อ' : '⏸️ หยุดชั่วคราว'}
              </button>

              <button
                className="btn-secondary"
                onClick={onSkip}
                disabled={isIdle || isQuestionActive || isAnswered}
              >
                ⏩ ข้ามไปคำถาม
              </button>

              <button
                className="btn-secondary"
                onClick={onMarkAnswered}
                disabled={!isQuestionActive}
              >
                ✓ ตอบแล้ว [Enter]
              </button>

              <button
                className="btn-secondary btn-danger-soft"
                onClick={onReset}
              >
                🔄 รีเซ็ตเวที (Reset)
              </button>
            </div>
          </div>

          {/* Section 3: Direct Word Selection */}
          {words.length > 0 && (
            <div className="control-section">
              <label className="section-label">🎯 สุ่มเจาะจงคำสำคัญ (Direct Word Spin)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {words.filter(w => w.enabled).map(w => (
                  <button
                    key={w.id}
                    className="cat-btn"
                    onClick={() => onStart(w.category as QuestionCategory, w)}
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    ✦ {w.word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Timer Display Settings & Quick Adjust */}
          {onSetStageDisplaySettings && (
            <div className="control-section">
              <label className="section-label">⏱️ รูปแบบการแสดงตัวจับเวลาบนเวที</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                <button
                  className="btn-secondary"
                  style={{
                    padding: '8px',
                    fontSize: '0.8rem',
                    background: displaySettings.timerDisplayMode === 'center' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                    borderColor: displaySettings.timerDisplayMode === 'center' ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    color: displaySettings.timerDisplayMode === 'center' ? '#a5b4fc' : '#cbd5e1'
                  }}
                  onClick={() => onSetStageDisplaySettings({ timerDisplayMode: 'center' })}
                >
                  🌟 จอใหญ่ตรงกลาง
                </button>
                <button
                  className="btn-secondary"
                  style={{
                    padding: '8px',
                    fontSize: '0.8rem',
                    background: displaySettings.timerDisplayMode === 'corner' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.05)',
                    borderColor: displaySettings.timerDisplayMode === 'corner' ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                    color: displaySettings.timerDisplayMode === 'corner' ? '#7dd3fc' : '#cbd5e1'
                  }}
                  onClick={() => onSetStageDisplaySettings({ timerDisplayMode: 'corner' })}
                >
                  📌 มุมขวาบน
                </button>
              </div>

              {onAdjustTimer && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '6px', fontSize: '0.75rem', color: '#7dd3fc' }}
                    onClick={() => onAdjustTimer(30000)}
                  >
                    +30s
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '6px', fontSize: '0.75rem', color: '#86efac' }}
                    onClick={() => onAdjustTimer(10000)}
                  >
                    +10s
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '6px', fontSize: '0.75rem', color: '#fca5a5' }}
                    onClick={() => onAdjustTimer(-10000)}
                  >
                    -10s
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section 5: Audio Controls */}
          <div className="control-section">
            <label className="section-label">🔊 ระบบเสียงบรรยากาศ & ตัวจับเวลา</label>
            <div className="audio-row">
              <button className="btn-secondary" onClick={onToggleMute}>
                {session.isMuted ? '🔇 ปิดเสียงอยู่' : '🔊 เปิดเสียง'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={session.volume}
                onChange={(e) => onSetVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />
              <span className="vol-text">{Math.round(session.volume * 100)}%</span>
            </div>

            {onSetTimerSoundSettings && session.timerSoundSettings && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>⏱️ เสียงติ๊กถอยหลัง:</span>
                  <button
                    className="btn-secondary"
                    style={{
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.75rem',
                      background: session.timerSoundSettings.tickSoundEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: session.timerSoundSettings.tickSoundEnabled ? '#86efac' : '#fca5a5',
                      border: `1px solid ${session.timerSoundSettings.tickSoundEnabled ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                    }}
                    onClick={() => onSetTimerSoundSettings({ tickSoundEnabled: !session.timerSoundSettings?.tickSoundEnabled })}
                  >
                    {session.timerSoundSettings.tickSoundEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#fde68a' }}>⚠️ เสียงเตือนใกล้หมด:</span>
                  <button
                    className="btn-secondary"
                    style={{
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.75rem',
                      background: session.timerSoundSettings.warningSoundEnabled ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: session.timerSoundSettings.warningSoundEnabled ? '#fde68a' : '#fca5a5',
                      border: `1px solid ${session.timerSoundSettings.warningSoundEnabled ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                    }}
                    onClick={() => onSetTimerSoundSettings({ warningSoundEnabled: !session.timerSoundSettings?.warningSoundEnabled })}
                  >
                    {session.timerSoundSettings.warningSoundEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#fca5a5' }}>🔔 เสียงเมื่อหมดเวลา:</span>
                  <button
                    className="btn-secondary"
                    style={{
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.75rem',
                      background: session.timerSoundSettings.finishSoundEnabled ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: session.timerSoundSettings.finishSoundEnabled ? '#fca5a5' : '#94a3b8',
                      border: `1px solid ${session.timerSoundSettings.finishSoundEnabled ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`
                    }}
                    onClick={() => onSetTimerSoundSettings({ finishSoundEnabled: !session.timerSoundSettings?.finishSoundEnabled })}
                  >
                    {session.timerSoundSettings.finishSoundEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Question Bank Manager & Multi-display Window */}
          <div className="control-section">
            <label className="section-label">📂 การจัดการข้อมูลและการต่อจอ</label>
            <div className="drawer-footer-actions">
              <button className="btn-secondary" onClick={onOpenQuestionManager}>
                📝 คลังคำถาม
              </button>
              <button className="btn-primary btn-remote-popup" onClick={handleOpenRemoteWindow}>
                🖥️ เปิดหน้าต่างแยกจอ (Dual Display)
              </button>
            </div>
          </div>

          {/* Debug seed info */}
          <div className="drawer-meta-info">
            <span>Session: <code>{session.sessionId}</code></span>
            <span>Seed: <code>{session.seed}</code></span>
            <span>ใช้ไปแล้ว: {session.usedQuestionIds.length} ข้อ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
