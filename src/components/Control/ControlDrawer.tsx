import React from 'react';
import { SessionState } from '../../types/session.ts';
import { Contestant, QuestionCategory } from '../../types/question.ts';

interface ControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionState;
  contestants: Contestant[];
  onStart: (forceCategory?: QuestionCategory) => void;
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
}

export const ControlDrawer: React.FC<ControlDrawerProps> = ({
  isOpen,
  onClose,
  session,
  contestants,
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
  onOpenContestantManager
}) => {
  if (!isOpen) return null;

  const handleOpenRemoteWindow = () => {
    const url = `${window.location.origin}${window.location.pathname}?mode=controller`;
    window.open(url, 'SeasonQuizController', 'width=960,height=750,menubar=no,toolbar=no');
  };

  const isIdle = session.currentState === 'idle';
  const isQuestionActive = session.currentState === 'question';
  const isAnswered = session.currentState === 'answered';

  return (
    <div className="control-drawer-backdrop" onClick={onClose}>
      <div className="control-drawer-panel glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-wrap">
            <span className="drawer-icon">⚙️</span>
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
            <label className="section-label">⚡ ควบคุมลำดับธรรมชาติ</label>
            <div className="actions-grid">
              <button
                className="btn-primary"
                onClick={() => onStart()}
                disabled={!isIdle}
              >
                ▶️ เริ่มสุ่มคำถาม [Space]
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

          {/* Section 3: Force Category (Test/Director Override) */}
          <div className="control-section">
            <label className="section-label">🍂 กำหนดหมวดธรรมชาติแบบเจาะจง (Optional)</label>
            <div className="cat-buttons-row">
              <button className="cat-btn" onClick={() => onStart('rain')}>🌧️ Rain</button>
              <button className="cat-btn" onClick={() => onStart('mist')}>🌫️ Mist</button>
              <button className="cat-btn" onClick={() => onStart('wind')}>🍃 Wind</button>
              <button className="cat-btn" onClick={() => onStart('leaf')}>🍂 Leaf</button>
              <button className="cat-btn" onClick={() => onStart('moon')}>🌙 Moon</button>
              <button className="cat-btn" onClick={() => onStart('star')}>⭐ Star</button>
              <button className="cat-btn" onClick={() => onStart('final')}>☄️ Final</button>
            </div>
          </div>

          {/* Section 4: Audio Controls */}
          <div className="control-section">
            <label className="section-label">🔊 ระบบเสียงบรรยากาศ (Web Audio API)</label>
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
          </div>

          {/* Section 5: Question Bank Manager & Multi-display Window */}
          <div className="control-section">
            <label className="section-label">📂 การจัดการข้อมูลและการต่อจอ</label>
            <div className="drawer-footer-actions">
              <button className="btn-secondary" onClick={onOpenQuestionManager}>
                📝 คลังคำถาม (42 ข้อ)
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
