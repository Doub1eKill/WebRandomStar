/**
 * Remote "Live" page (Phase 5): the former ControlCenter "stage" tab, unchanged markup.
 * Contest flow, contestant/round selection, stage actions and the live question monitor.
 */
import React, { useState } from 'react';
import { CATEGORY_CONFIGS } from '@/types/question.ts';
import { useSession, useSessionActions } from '@/features/session/SessionProvider.tsx';
import { stageControls } from '@/features/control/useStageControls.ts';
import { useContestants, useWords } from '@/storage/useRepository.ts';
import { saveContestants } from '@/storage/storageApi.ts';
import { ContestantManagerModal } from '@/features/contestants/ContestantManagerModal.tsx';
import {
  Play,
  Pause,
  FastForward,
  CheckCircle,
  RotateCcw,
  Users,
  Crown
} from 'lucide-react';

export const LivePage: React.FC = () => {
  const session = useSession(s => s);
  const actions = useSessionActions();
  const contestants = useContestants();
  const words = useWords();
  const [isContestantModalOpen, setIsContestantModalOpen] = useState(false);

  // A3: logic shared with the stage drawer
  const controls = stageControls(session, words, {
    onStart: (category, word) => actions.startJourney(undefined, category, word),
    onStopSpin: actions.stopWordSpin,
    onSkip: actions.skipToQuestion,
    onSetAppearanceSettings: actions.setAppearanceSettings
  });

  const activeContestant = contestants.find(c => c.id === session.selectedContestantId);
  const isIdle = controls.isIdle;
  const rounds = ['intro', 'general', 'attitude', 'scenario', 'final'];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Contestant & Round Selector */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#e2e8f0' }}>
            👤 ข้อมูลผู้เข้าแข่งขันและการแข่งขัน
          </div>

          {/* Competition Flow Mode Quick Toggle */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
              🏆 รูปแบบขั้นตอนการแข่งขัน (Competition Mode)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                data-testid="controlcenter-mode-question"
                onClick={() => controls.setQuizMode('question')}
                style={{
                  padding: '0.6rem 0.75rem',
                  background: (session.appearanceSettings?.quizMode !== 'keyword') ? 'rgba(99, 102, 241, 0.3)' : 'rgba(15, 23, 42, 0.6)',
                  border: (session.appearanceSettings?.quizMode !== 'keyword') ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: (session.appearanceSettings?.quizMode !== 'keyword') ? '#a5b4fc' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>📜</span>
                <span>คลังคำถาม</span>
              </button>
              <button
                type="button"
                data-testid="controlcenter-mode-keyword"
                onClick={() => controls.setQuizMode('keyword')}
                style={{
                  padding: '0.6rem 0.75rem',
                  background: session.appearanceSettings?.quizMode === 'keyword' ? 'rgba(192, 132, 252, 0.3)' : 'rgba(15, 23, 42, 0.6)',
                  border: session.appearanceSettings?.quizMode === 'keyword' ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: session.appearanceSettings?.quizMode === 'keyword' ? '#d8b4fe' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>🏷️</span>
                <span>คำสำคัญ</span>
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
              เลือกผู้เข้าแข่งขัน
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={session.selectedContestantId || ''}
                onChange={e => actions.setContestant(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              >
                <option value="">-- ยังไม่ได้เลือกผู้เข้าแข่งขัน --</option>
                {contestants.map(c => (
                  <option key={c.id} value={c.id}>
                    No. {c.number} - {c.name} ({c.faculty})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsContestantModalOpen(true)}
                style={{
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
                title="จัดการรายชื่อผู้เข้าแข่งขัน"
              >
                <Users size={16} />
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
              รอบการประกวด (Round)
            </label>
            <select
              value={session.selectedRound}
              onChange={e => actions.setRound(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            >
              {rounds.map(r => (
                <option key={r} value={r}>
                  {r === 'intro' && 'รอบแนะนำตัว (Intro)'}
                  {r === 'general' && 'รอบคำถามทั่วไป (General)'}
                  {r === 'attitude' && 'รอบทัศนคติ (Attitude)'}
                  {r === 'scenario' && 'รอบสถานการณ์จำลอง (Scenario)'}
                  {r === 'final' && 'รอบชิงชนะเลิศ (Final)'}
                </option>
              ))}
            </select>
          </div>

          {activeContestant && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '8px',
                padding: '0.85rem',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem'
                }}
              >
                {activeContestant.number}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{activeContestant.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{activeContestant.faculty} | {activeContestant.title || 'ผู้เข้าประกวด'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Stage Actions Grid */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#e2e8f0' }}>
            🕹️ ควบคุมการหมุนคำและการแสดงผล
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {controls.isWordSpinning ? (
              <button
                onClick={controls.stopSpin}
                style={{
                  gridColumn: 'span 2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.9rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                  border: '1px solid rgba(254, 202, 202, 0.6)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.5)'
                }}
              >
                🛑 STOP SPIN (หยุดการหมุนคำ)
              </button>
            ) : (
              <button
                onClick={() => actions.startJourney()}
                disabled={!isIdle}
                style={{
                  gridColumn: 'span 2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.9rem',
                  background: isIdle
                    ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #4f46e5 70%, #d97706 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isIdle ? '1px solid rgba(245, 217, 138, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: isIdle ? '#fff' : '#64748b',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  cursor: isIdle ? 'pointer' : 'not-allowed',
                  boxShadow: isIdle ? '0 4px 16px rgba(79, 70, 229, 0.4)' : 'none'
                }}
              >
                <Crown size={18} color="#F5D98A" />
                SPIN WORD (หมุนคำสำคัญ)
              </button>
            )}

            <button
              onClick={actions.pauseJourney}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem',
                background: session.isPaused ? '#d97706' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {session.isPaused ? <Play size={15} /> : <Pause size={15} />}
              {session.isPaused ? 'เล่นต่อ (Resume)' : 'พักชั่วคราว (Pause)'}
            </button>

            <button
              onClick={actions.skipToQuestion}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <FastForward size={15} />
              ข้ามไปคำถาม (Skip)
            </button>

            <button
              onClick={actions.markAnswered}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                color: '#34d399',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <CheckCircle size={15} />
              ตอบเสร็จสิ้น (Done)
            </button>

            <button
              onClick={actions.resetStage}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={15} />
              รีเซ็ตเวที (Reset)
            </button>
          </div>

          {/* Direct Word Launch Chips */}
          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              🎯 หมุนเจาะจงคำสำคัญ (Direct Word Spin):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {controls.enabledWords.map(w => {
                const cat = CATEGORY_CONFIGS[w.category.toLowerCase()];
                return (
                  <button
                    key={w.id}
                    onClick={() => controls.startWithWord(w)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: `1px solid ${w.color || cat?.color || 'rgba(255,255,255,0.15)'}50`,
                      borderRadius: '6px',
                      color: w.color || cat?.color || '#fff',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✦ {w.word}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Question Monitor */}
        <div
          style={{
            gridColumn: '1 / -1',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: '#e2e8f0' }}>
            📺 มอนิเตอร์ข้อความที่กำลังปรากฏบนจอเวที (Live Stage Monitor)
          </div>
          {session.selectedQuestion ? (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '8px',
                padding: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#818cf8',
                    border: '1px solid rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {session.selectedQuestion.category.toUpperCase()}
                </span>
                {session.selectedWordItem && (
                  <span
                    style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: 'rgba(245, 217, 138, 0.15)',
                      color: '#F5D98A',
                      border: '1px solid rgba(245, 217, 138, 0.4)'
                    }}
                  >
                    ✦ {session.selectedWordItem.word}
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {session.selectedQuestion.id}</span>
              </div>
              <div style={{ fontSize: '1.15rem', lineHeight: 1.6, color: '#f8fafc' }}>
                "{session.selectedQuestion.text}"
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              ยังไม่มีคำถามบนเวที (กดปุ่ม SPIN WORD เพื่อเริ่มสุ่ม)
            </div>
          )}
        </div>
      </div>

      <ContestantManagerModal
        isOpen={isContestantModalOpen}
        contestants={contestants}
        onClose={() => setIsContestantModalOpen(false)}
        onSaveContestants={saveContestants}
      />
    </>
  );
};

export default LivePage;
