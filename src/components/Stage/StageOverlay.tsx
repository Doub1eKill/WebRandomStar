import React from 'react';
import { SessionState } from '../../types/session.ts';
import { Contestant } from '../../types/question.ts';
import { DEFAULT_STAGE_DISPLAY_SETTINGS } from '../../types/timer.ts';
import { StageHeader } from './StageHeader.tsx';
import { ContestantBadge } from './ContestantBadge.tsx';
import { QuestionCard } from './QuestionCard.tsx';
import { WordCarousel } from './WordSpin/WordCarousel.tsx';
import { WordLockEffect } from './WordSpin/WordLockEffect.tsx';
import { TimerDisplay } from './TimerDisplay.tsx';

interface StageOverlayProps {
  session: SessionState;
  contestant?: Contestant;
  onStart: () => void;
  onNext: () => void;
  onOpenControlDrawer: () => void;
}

export const StageOverlay: React.FC<StageOverlayProps> = ({
  session,
  contestant,
  onStart,
  onNext,
  onOpenControlDrawer
}) => {
  const isIdle = session.currentState === 'idle';
  const isSpinning =
    session.currentState === 'pre-spin' ||
    session.currentState === 'word-spin' ||
    session.currentState === 'word-decelerate';
  const isWordLocked = session.currentState === 'word-lock';
  const showQuestion = session.currentState === 'question' || session.currentState === 'answered';
  const displaySettings = session.stageDisplaySettings || DEFAULT_STAGE_DISPLAY_SETTINGS;

  // Determine timer visibility according to settings
  const isTimerActive = Boolean(
    session.timerState &&
    (displaySettings.showTimerOnlyWhenRunning
      ? (session.timerState.status === 'running' || session.timerState.status === 'paused' || session.timerState.status === 'finished')
      : (session.timerState.status !== 'idle'))
  );

  const isCenterTimer = isTimerActive && displaySettings.timerDisplayMode === 'center';
  const isAnySoundEnabled = Boolean(
    session.timerSoundSettings?.tickSoundEnabled ||
    session.timerSoundSettings?.warningSoundEnabled ||
    session.timerSoundSettings?.finishSoundEnabled
  );

  return (
    <div className="stage-overlay">
      {/* Header Bar */}
      <StageHeader round={session.selectedRound} currentState={session.currentState} />

      {/* Main Content Area */}
      <div className="stage-main-content">
        {/* Contestant Badge */}
        <div className="stage-contestant-anchor">
          <ContestantBadge contestant={contestant} />
        </div>

        {/* Stage Timer Corner Anchor (when corner/compact mode is selected) */}
        {isTimerActive && !isCenterTimer && (
          <div
            className="stage-timer-anchor animate-float"
            style={{
              position: 'absolute',
              top: '5.25rem',
              right: '2.5rem',
              zIndex: 30
            }}
          >
            <TimerDisplay
              timerState={session.timerState}
              soundEnabled={isAnySoundEnabled}
              variant={displaySettings.timerDisplayMode}
            />
          </div>
        )}

        {/* Start Button when idle */}
        {isIdle && (
          <div className="stage-idle-hero animate-float">
            <div className="idle-nature-quote">
              “ประกายแสงแห่งค่ำคืน... สู่การคัดสรรคำสำคัญแห่งเวทีประกวด”
            </div>

            <button className="btn-primary btn-royal-spin" onClick={onStart}>
              <span className="btn-sparkle">👑</span>
              <span>✦ SPIN WORD ✦</span>
              <span className="btn-key-hint">[Space]</span>
            </button>
          </div>
        )}

        {/* Royal Word Spin Carousel Phase */}
        {isSpinning && (
          <div className="stage-spin-center-wrap">
            <WordCarousel
              targetWord={session.selectedWordItem}
              phase={session.currentState as 'pre-spin' | 'word-spin' | 'word-decelerate'}
              mode={session.appearanceSettings?.spinMode || 'vertical'}
            />
          </div>
        )}

        {/* Climax Word Lock Aura */}
        {isWordLocked && (
          <div className="stage-lock-center-wrap">
            <WordLockEffect wordItem={session.selectedWordItem} />
          </div>
        )}

        {/* Center Stage Content: Question & Grand Central Timer */}
        {showQuestion && (
          <div
            className="stage-question-timer-center-wrap"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isCenterTimer ? '1.25rem' : '0',
              width: '100%',
              maxWidth: '960px',
              margin: '0 auto',
              zIndex: 10
            }}
          >
            {/* Grand Hero Central Timer in Center Focus Mode */}
            {isCenterTimer && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <TimerDisplay
                  timerState={session.timerState}
                  soundEnabled={isAnySoundEnabled}
                  variant="center"
                />
              </div>
            )}

            {/* Question Card */}
            <QuestionCard
              question={session.selectedQuestion}
              isAnswered={session.currentState === 'answered'}
              fontSizeScale={displaySettings.questionFontSize}
              compact={isCenterTimer}
              onNext={onNext}
            />
          </div>
        )}
      </div>

      {/* Footer / Discreet Operator Hint */}
      <footer className="stage-footer">
        <div className="footer-keys-hint">
          <span>กด <code>Space</code> หมุนคำสำคัญ</span>
          <span className="dot-sep">•</span>
          <span>กด <code>Enter</code> ดำเนินการต่อ</span>
          <span className="dot-sep">•</span>
          <span>กด <code>T</code> สลับจับเวลา</span>
          <span className="dot-sep">•</span>
          <span>กด <code>Esc</code> แผงควบคุม</span>
        </div>

        <button
          className="btn-drawer-trigger"
          onClick={onOpenControlDrawer}
          title="เปิดแผงควบคุม (Esc)"
        >
          ⚙️ แผงควบคุม
        </button>
      </footer>
    </div>
  );
};
