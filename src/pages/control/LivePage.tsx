/**
 * Remote "Live" page (Phase 5): the former ControlCenter "stage" tab.
 * Contest flow, contestant/round selection, stage actions and the live question monitor.
 * Phase 7: shares ControlCard and QuizModeToggle with the stage drawer (each keeps its own look)
 * and its inline styles became classes in livePage.css.
 */
import React, { useState } from 'react';
import { CATEGORY_CONFIGS } from '@/types/question.ts';
import { useSession, useSessionActions } from '@/features/session/SessionProvider.tsx';
import { stageControls, ROUND_OPTIONS } from '@/features/control/useStageControls.ts';
import { ControlCard } from '@/features/control/ControlCard.tsx';
import { QuizModeToggle } from '@/features/control/QuizModeToggle.tsx';
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
import './livePage.css';

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

  return (
    <>
      <div className="live-grid">
        <ControlCard variant="live" title="👤 ข้อมูลผู้เข้าแข่งขันและการแข่งขัน">
          <div className="live-field">
            <label className="live-label">🏆 รูปแบบขั้นตอนการแข่งขัน (Competition Mode)</label>
            <QuizModeToggle variant="live" quizMode={session.appearanceSettings?.quizMode} onChange={controls.setQuizMode} />
          </div>

          <div className="live-field">
            <label className="live-label">เลือกผู้เข้าแข่งขัน</label>
            <div className="live-select-row">
              <select
                className="live-select live-select--grow"
                value={session.selectedContestantId || ''}
                onChange={e => actions.setContestant(e.target.value)}
              >
                <option value="">-- ยังไม่ได้เลือกผู้เข้าแข่งขัน --</option>
                {contestants.map(c => (
                  <option key={c.id} value={c.id}>
                    No. {c.number} - {c.name} ({c.faculty})
                  </option>
                ))}
              </select>
              <button className="live-icon-btn" onClick={() => setIsContestantModalOpen(true)} title="จัดการรายชื่อผู้เข้าแข่งขัน">
                <Users size={16} />
              </button>
            </div>
          </div>

          <div className="live-field">
            <label className="live-label">รอบการประกวด (Round)</label>
            <select
              className="live-select live-select--full"
              value={session.selectedRound}
              onChange={e => actions.setRound(e.target.value)}
            >
              {ROUND_OPTIONS.map(r => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {activeContestant && (
            <div className="live-contestant">
              <div className="live-contestant-number">{activeContestant.number}</div>
              <div>
                <div className="live-contestant-name">{activeContestant.name}</div>
                <div className="live-contestant-meta">{activeContestant.faculty} | {activeContestant.title || 'ผู้เข้าประกวด'}</div>
              </div>
            </div>
          )}
        </ControlCard>

        <ControlCard variant="live" title="🕹️ ควบคุมการหมุนคำและการแสดงผล">
          <div className="live-actions">
            {controls.isWordSpinning ? (
              <button className="live-spin-btn live-spin-btn--stop" onClick={controls.stopSpin}>
                🛑 STOP SPIN (หยุดการหมุนคำ)
              </button>
            ) : (
              <button className="live-spin-btn live-spin-btn--start" onClick={() => actions.startJourney()} disabled={!isIdle}>
                <Crown size={18} color="#F5D98A" />
                SPIN WORD (หมุนคำสำคัญ)
              </button>
            )}

            <button className={session.isPaused ? 'live-btn live-btn--paused' : 'live-btn'} onClick={actions.pauseJourney}>
              {session.isPaused ? <Play size={15} /> : <Pause size={15} />}
              {session.isPaused ? 'เล่นต่อ (Resume)' : 'พักชั่วคราว (Pause)'}
            </button>

            <button className="live-btn" onClick={actions.skipToQuestion}>
              <FastForward size={15} />
              ข้ามไปคำถาม (Skip)
            </button>

            <button className="live-btn live-btn--done" onClick={actions.markAnswered}>
              <CheckCircle size={15} />
              ตอบเสร็จสิ้น (Done)
            </button>

            <button className="live-btn live-btn--reset" onClick={actions.resetStage}>
              <RotateCcw size={15} />
              รีเซ็ตเวที (Reset)
            </button>
          </div>

          {/* Direct Word Launch Chips */}
          <div className="live-chips">
            <div className="live-chips-label">🎯 หมุนเจาะจงคำสำคัญ (Direct Word Spin):</div>
            <div className="live-chips-row">
              {controls.enabledWords.map(w => {
                const color = w.color || CATEGORY_CONFIGS[w.category.toLowerCase()]?.color;
                return (
                  <button
                    key={w.id}
                    className="live-chip"
                    onClick={() => controls.startWithWord(w)}
                    style={{ border: `1px solid ${color || 'rgba(255,255,255,0.15)'}50`, color: color || '#fff' }}
                  >
                    ✦ {w.word}
                  </button>
                );
              })}
            </div>
          </div>
        </ControlCard>

        <ControlCard variant="live" wide title="📺 มอนิเตอร์ข้อความที่กำลังปรากฏบนจอเวที (Live Stage Monitor)">
          {session.selectedQuestion ? (
            <div className="live-monitor-question">
              <div className="live-monitor-tags">
                <span className="live-tag live-tag--category">{session.selectedQuestion.category.toUpperCase()}</span>
                {session.selectedWordItem && <span className="live-tag live-tag--word">✦ {session.selectedWordItem.word}</span>}
                <span className="live-monitor-id">ID: {session.selectedQuestion.id}</span>
              </div>
              <div className="live-monitor-text">"{session.selectedQuestion.text}"</div>
            </div>
          ) : (
            <div className="live-monitor-empty">ยังไม่มีคำถามบนเวที (กดปุ่ม SPIN WORD เพื่อเริ่มสุ่ม)</div>
          )}
        </ControlCard>
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
