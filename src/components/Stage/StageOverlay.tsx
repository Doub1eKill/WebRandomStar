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
  onNext?: () => void;
  onOpenControlDrawer?: () => void;
}

export const StageOverlay: React.FC<StageOverlayProps> = ({
  session,
  contestant,
  onStart
}) => {
  const isIdle = session.currentState === 'idle';
  const isSpinning = ['pre-spin', 'word-spin', 'word-decelerate'].includes(session.currentState);
  const isWordLocked = session.currentState === 'word-lock';
  const showQuestion = ['question-reveal', 'question', 'answered'].includes(session.currentState);
  const isAnySoundEnabled = Boolean(
    session.timerSoundSettings?.tickSoundEnabled ||
    session.timerSoundSettings?.warningSoundEnabled ||
    session.timerSoundSettings?.finishSoundEnabled
  );
  const displaySettings = session.stageDisplaySettings || DEFAULT_STAGE_DISPLAY_SETTINGS;

  const isCornerTimer = displaySettings.timerDisplayMode === 'corner';
  const isCenterTimer = displaySettings.timerDisplayMode === 'center';

  return (
    <div className="stage-overlay">
      {/* Top Bar / Clean Centered Header */}
      <StageHeader
        round={session.selectedRound}
        currentState={session.currentState}
      />

      {/* Main Content Area */}
      <div className="stage-main-content">
        {/* Contestant Badge */}
        {contestant && (
          <div className="stage-contestant-anchor animate-fade-in">
            <ContestantBadge contestant={contestant} />
          </div>
        )}

        {/* Corner Timer Widget (Only in Corner Mode during Question Phase) */}
        {showQuestion && isCornerTimer && (
          <div
            className="stage-corner-timer animate-fade-in"
            style={{
              position: 'absolute',
              top: '5.5rem',
              right: '2.5rem',
              zIndex: 30
            }}
          >
            <TimerDisplay
              timerState={session.timerState}
              soundEnabled={isAnySoundEnabled}
              variant="corner"
              stageDisplaySettings={displaySettings}
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
              <span className="btn-sparkle-star">✦</span>
              <span className="btn-spin-text">SPIN WORD</span>
              <span className="btn-sparkle-star">✦</span>
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
                  stageDisplaySettings={displaySettings}
                />
              </div>
            )}

            {/* Pure Minimalist Question Card */}
            <QuestionCard
              question={session.selectedQuestion}
              isAnswered={session.currentState === 'answered'}
              fontSizeScale={displaySettings.questionFontSize}
              compact={isCenterTimer}
            />
          </div>
        )}
      </div>
    </div>
  );
};
