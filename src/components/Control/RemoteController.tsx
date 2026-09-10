import React, { useState } from 'react';
import { useStageSync } from '../../hooks/useStageSync.ts';
import { DEFAULT_CONTESTANTS } from '../../data/defaultContestants.ts';
import { Contestant, QuestionCategory } from '../../types/question.ts';

export const RemoteController: React.FC = () => {
  const {
    session,
    startJourney,
    pauseJourney,
    skipToQuestion,
    markAnswered,
    resetStage,
    setContestant,
    setRound,
    setVolume,
    toggleMute
  } = useStageSync('controller');

  const [contestants] = useState<Contestant[]>(DEFAULT_CONTESTANTS);

  const isIdle = session.currentState === 'idle';
  const isQuestion = session.currentState === 'question';

  const handleStart = (cat?: QuestionCategory) => {
    // Send 1920x1080 default projection viewport
    startJourney({ width: 1920, height: 1080 }, cat);
  };

  const activeContestant = contestants.find(c => c.id === session.selectedContestantId);

  return (
    <div className="remote-controller-container">
      <header className="remote-header">
        <div className="remote-title-wrap">
          <span className="remote-badge">LIVE SYNC</span>
          <h1>Stage Remote Controller (ผู้ควบคุม)</h1>
        </div>
        <div className="remote-status-chip">
          <span>สถานะเวที: <strong>{session.currentState}</strong></span>
          {session.isPaused && <span className="chip-paused">PAUSED</span>}
        </div>
      </header>

      <main className="remote-grid">
        {/* Left Column: Flow Controls */}
        <section className="remote-card glass-panel">
          <h2 className="card-title">🎮 ควบคุมเวทีหลัก (Stage Control)</h2>

          <div className="remote-action-buttons">
            <button
              className="btn-primary btn-large"
              onClick={() => handleStart()}
              disabled={!isIdle}
            >
              ▶️ เริ่มการเปลี่ยนผ่าน (Start)
            </button>

            <div className="buttons-row">
              <button
                className="btn-secondary"
                onClick={pauseJourney}
                disabled={isIdle || isQuestion}
              >
                {session.isPaused ? '▶️ เล่นต่อ' : '⏸️ หยุดชั่วคราว'}
              </button>

              <button
                className="btn-secondary"
                onClick={skipToQuestion}
                disabled={isIdle || isQuestion}
              >
                ⏩ ข้ามไปคำถาม (Skip)
              </button>
            </div>

            <button
              className={`btn-secondary ${isQuestion ? 'btn-next-ready' : ''}`}
              onClick={markAnswered}
              disabled={!isQuestion}
            >
              ✓ ผู้เข้าแข่งขันตอบเสร็จสิ้น (Done)
            </button>

            <button className="btn-secondary btn-danger-soft" onClick={resetStage}>
              🔄 รีเซ็ตเวทีกลับสู่เริ่มต้น (Reset)
            </button>
          </div>

          <div className="quick-category-pick">
            <span className="sub-label">เลือกหมวดเจาะจง:</span>
            <div className="cat-pills">
              <button onClick={() => handleStart('rain')}>🌧️ Rain</button>
              <button onClick={() => handleStart('mist')}>🌫️ Mist</button>
              <button onClick={() => handleStart('wind')}>🍃 Wind</button>
              <button onClick={() => handleStart('leaf')}>🍂 Leaf</button>
              <button onClick={() => handleStart('moon')}>🌙 Moon</button>
              <button onClick={() => handleStart('star')}>⭐ Star</button>
              <button onClick={() => handleStart('final')}>☄️ Final</button>
            </div>
          </div>
        </section>

        {/* Right Column: Contestant & Current Stage Preview */}
        <section className="remote-card glass-panel">
          <h2 className="card-title">👤 ข้อมูลบนเวที (Stage Info)</h2>

          <div className="info-group">
            <label>ผู้เข้าแข่งขัน:</label>
            <select
              className="custom-select"
              value={session.selectedContestantId || ''}
              onChange={(e) => setContestant(e.target.value)}
            >
              <option value="">-- เลือกผู้เข้าแข่งขัน --</option>
              {contestants.map(c => (
                <option key={c.id} value={c.id}>
                  #{c.number} [{c.title}] {c.name} - {c.faculty}
                </option>
              ))}
            </select>
          </div>

          <div className="info-group">
            <label>รอบการแข่งขัน:</label>
            <select
              className="custom-select"
              value={session.selectedRound}
              onChange={(e) => setRound(e.target.value)}
            >
              <option value="intro">รอบแนะนำตัว (Intro)</option>
              <option value="general">รอบทั่วไป (General)</option>
              <option value="attitude">รอบทัศนคติ (Attitude)</option>
              <option value="scenario">รอบสถานการณ์จำลอง (Scenario)</option>
              <option value="final">รอบชิงชนะเลิศ (Final)</option>
            </select>
          </div>

          {activeContestant && (
            <div className="contestant-preview-card">
              <div className="preview-num">#{activeContestant.number}</div>
              <div>
                <strong>{activeContestant.name}</strong>
                <div className="preview-sub">{activeContestant.title} • {activeContestant.faculty}</div>
              </div>
            </div>
          )}

          {session.selectedQuestion && (
            <div className="question-preview-box">
              <div className="preview-cat">
                หมวดที่ได้: <strong>{session.selectedCategory}</strong> [{session.selectedQuestion.id}]
              </div>
              <p className="preview-text">“{session.selectedQuestion.text}”</p>
            </div>
          )}

          <div className="audio-control-box">
            <label>เสียงบรรยากาศเวที:</label>
            <div className="audio-row">
              <button className="btn-secondary" onClick={toggleMute}>
                {session.isMuted ? '🔇 Muted' : '🔊 Unmuted'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={session.volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />
              <span>{Math.round(session.volume * 100)}%</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
