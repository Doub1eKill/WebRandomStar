import React, { useState } from 'react';
import { SessionState } from '../../types/session.ts';
import { Question, Contestant, QuestionCategory, CATEGORY_CONFIGS } from '../../types/question.ts';
import { KeywordItem } from '../../types/word.ts';
import { HistoryRecord } from '../../types/history.ts';
import { TimerSoundSettings, StageDisplaySettings } from '../../types/timer.ts';
import { AppearanceSettings, DEFAULT_APPEARANCE_SETTINGS } from '../../types/appearance.ts';
import { QuestionBankDashboard } from './QuestionBankDashboard.tsx';
import { WordBankDashboard } from './WordBankDashboard.tsx';
import { AppearanceSettingsPanel } from './AppearanceSettings.tsx';
import { TimerPanel } from './TimerPanel.tsx';
import { HistoryPanel } from './HistoryPanel.tsx';
import { ContestantManagerModal } from './ContestantManagerModal.tsx';
import { DEFAULT_WORDS } from '../../data/defaultWords.ts';
import {
  Play,
  Pause,
  FastForward,
  CheckCircle,
  RotateCcw,
  Layers,
  Clock,
  Users,
  BookOpen,
  History,
  Sparkles,
  ExternalLink,
  Crown,
  Palette,
  Key
} from 'lucide-react';

interface ControlCenterProps {
  session: SessionState;
  questions: Question[];
  contestants: Contestant[];
  history: HistoryRecord[];
  words?: KeywordItem[];
  onStartRandomization: (forceCategory?: QuestionCategory, forceWord?: KeywordItem) => void;
  onStopSpin?: () => void;
  onPauseRandomization: () => void;
  onSkipToQuestion: () => void;
  onMarkAnswered: () => void;
  onResetStage: () => void;
  onSelectContestant: (id: string) => void;
  onSelectRound: (round: string) => void;
  onSetVolume: (volume: number) => void;
  onToggleMute: () => void;
  onSaveQuestions: (updated: Question[]) => void;
  onSaveContestants: (updated: Contestant[]) => void;
  onClearHistory: () => void;
  // Word Bank operations
  onSaveWord?: (word: KeywordItem) => void;
  onDeleteWord?: (id: string) => void;
  onToggleWord?: (id: string) => void;
  onResetWords?: (words: KeywordItem[]) => void;
  // Appearance operations
  onSetAppearanceSettings?: (settings: AppearanceSettings) => void;
  // Timer operations
  onSetTimerDuration: (durationMs: number) => void;
  onStartTimer: (durationMs?: number) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
  onFinishTimer: () => void;
  onAdjustTimer?: (deltaMs: number) => void;
  onSetTimerSoundSettings?: (settings: Partial<TimerSoundSettings>) => void;
  onSetStageDisplaySettings?: (settings: Partial<StageDisplaySettings>) => void;
  onOpenPopoutController?: () => void;
}

export type ControlTab = 'stage' | 'words' | 'questions' | 'timer' | 'contestants' | 'history' | 'appearance';

export const ControlCenter: React.FC<ControlCenterProps> = ({
  session,
  questions,
  contestants,
  history,
  words = DEFAULT_WORDS,
  onStartRandomization,
  onStopSpin,
  onPauseRandomization,
  onSkipToQuestion,
  onMarkAnswered,
  onResetStage,
  onSelectContestant,
  onSelectRound,
  onSetVolume: _onSetVolume,
  onToggleMute: _onToggleMute,
  onSaveQuestions,
  onSaveContestants,
  onClearHistory,
  onSaveWord,
  onDeleteWord,
  onToggleWord,
  onResetWords,
  onSetAppearanceSettings,
  onSetTimerDuration,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onFinishTimer,
  onAdjustTimer,
  onSetTimerSoundSettings,
  onSetStageDisplaySettings,
  onOpenPopoutController
}) => {
  const [activeTab, setActiveTab] = useState<ControlTab>('stage');
  const [isContestantModalOpen, setIsContestantModalOpen] = useState(false);

  const activeContestant = contestants.find(c => c.id === session.selectedContestantId);
  const isIdle = session.currentState === 'idle';
  const rounds = ['intro', 'general', 'attitude', 'scenario', 'final'];

  return (
    <div
      className="competition-control-center"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#090d16',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              ✦ SCi TECH TINE ✦ CHARM OF TRANSITION (Ambassador 2026)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              สถานะเวที: <strong style={{ color: '#38bdf8', textTransform: 'uppercase' }}>{session.currentState}</strong> | Session: <span style={{ fontFamily: 'monospace' }}>{session.sessionId.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        {onOpenPopoutController && (
          <button
            onClick={onOpenPopoutController}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)'
            }}
          >
            <ExternalLink size={14} />
            เปิดหน้าต่างควบคุมแยก (Popout)
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.5)',
          padding: '0 0.75rem',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setActiveTab('stage')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'stage' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'stage' ? '#fff' : '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'stage' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          <Layers size={16} />
          ควบคุมเวที (Stage)
        </button>

        <button
          onClick={() => setActiveTab('words')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'words' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'words' ? '#fff' : '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'words' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          <Key size={16} />
          คลังคำสำคัญ ({words.length})
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'questions' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'questions' ? '#fff' : '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'questions' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          <BookOpen size={16} />
          คลังคำถาม ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab('timer')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'timer' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'timer' ? '#fff' : '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'timer' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          <Clock size={16} />
          ตัวจับเวลา (Timer)
        </button>

        <button
          onClick={() => setActiveTab('contestants')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'contestants' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'contestants' ? '#fff' : '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'contestants' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          <Users size={16} />
          ผู้เข้าแข่งขัน ({contestants.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'history' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'history' ? '#fff' : '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'history' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          <History size={16} />
          ประวัติ ({history.length})
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'appearance' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'appearance' ? '#fff' : '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'appearance' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          <Palette size={16} />
          ปรับแต่งหน้าตา (Appearance)
        </button>
      </div>

      {/* Tab Contents */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        {/* Tab 1: Stage Controls */}
        {activeTab === 'stage' && (
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
                👤 ข้อมูลผู้เข้าแข่งขันที่อยู่บนเวที
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                  เลือกผู้เข้าแข่งขัน
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={session.selectedContestantId || ''}
                    onChange={e => onSelectContestant(e.target.value)}
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
                  onChange={e => onSelectRound(e.target.value)}
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
                {session.currentState === 'word-spin' ? (
                  <button
                    onClick={() => (onStopSpin ? onStopSpin() : onSkipToQuestion())}
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
                    onClick={() => onStartRandomization()}
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
                  onClick={onPauseRandomization}
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
                  onClick={onSkipToQuestion}
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
                  onClick={onMarkAnswered}
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
                  onClick={onResetStage}
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
                  {words.filter(w => w.enabled).map(w => {
                    const cat = CATEGORY_CONFIGS[w.category.toLowerCase()];
                    return (
                      <button
                        key={w.id}
                        onClick={() => onStartRandomization(w.category as QuestionCategory, w)}
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
        )}

        {/* Tab 2: Word Bank */}
        {activeTab === 'words' && (
          <WordBankDashboard
            words={words}
            questions={questions}
            onSaveWord={onSaveWord || (() => {})}
            onDeleteWord={onDeleteWord || (() => {})}
            onToggleWord={onToggleWord || (() => {})}
            onResetWords={onResetWords || (() => {})}
          />
        )}

        {/* Tab 3: Question Bank */}
        {activeTab === 'questions' && (
          <QuestionBankDashboard
            questions={questions}
            usedQuestionIds={session.usedQuestionIds}
            onSaveQuestions={onSaveQuestions}
          />
        )}

        {/* Tab 4: Timer */}
        {activeTab === 'timer' && (
          <TimerPanel
            timerState={session.timerState}
            timerSoundSettings={session.timerSoundSettings}
            stageDisplaySettings={session.stageDisplaySettings}
            onSetDuration={onSetTimerDuration}
            onStartTimer={onStartTimer}
            onPauseTimer={onPauseTimer}
            onResumeTimer={onResumeTimer}
            onResetTimer={onResetTimer}
            onFinishTimer={onFinishTimer}
            onAdjustTimer={onAdjustTimer}
            onSetTimerSoundSettings={onSetTimerSoundSettings}
            onSetStageDisplaySettings={onSetStageDisplaySettings}
          />
        )}

        {/* Tab 5: Contestants */}
        {activeTab === 'contestants' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>รายชื่อผู้เข้าแข่งขันทั้งหมด ({contestants.length} คน)</div>
              <button
                className="btn-primary"
                onClick={() => setIsContestantModalOpen(true)}
              >
                + จัดการ / เพิ่มรายชื่อผู้เข้าแข่งขัน
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {contestants.map(c => (
                <div
                  key={c.id}
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: c.id === session.selectedContestantId ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}
                  >
                    {c.number}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.faculty}</div>
                  </div>
                  <button
                    onClick={() => onSelectContestant(c.id)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      background: c.id === session.selectedContestantId ? '#4f46e5' : 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {c.id === session.selectedContestantId ? 'กำลังขึ้นเวที' : 'เลือกขึ้นเวที'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: History */}
        {activeTab === 'history' && (
          <HistoryPanel
            history={history}
            onClearHistory={onClearHistory}
          />
        )}

        {/* Tab 7: Appearance */}
        {activeTab === 'appearance' && (
          <AppearanceSettingsPanel
            settings={session.appearanceSettings || DEFAULT_APPEARANCE_SETTINGS}
            onChange={onSetAppearanceSettings || (() => {})}
          />
        )}
      </div>

      {/* Contestant Modal */}
      <ContestantManagerModal
        isOpen={isContestantModalOpen}
        contestants={contestants}
        onClose={() => setIsContestantModalOpen(false)}
        onSaveContestants={onSaveContestants}
      />
    </div>
  );
};
