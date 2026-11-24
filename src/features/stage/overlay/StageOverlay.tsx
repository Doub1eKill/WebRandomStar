import React from 'react';
import { SessionState } from '@/types/session.ts';
import { Contestant } from '@/types/question.ts';
import { DEFAULT_STAGE_DISPLAY_SETTINGS } from '@/types/timer.ts';
import { StageHeader } from './StageHeader.tsx';
import { ContestantBadge } from './ContestantBadge.tsx';
import { QuestionCard } from './QuestionCard.tsx';
import { KeywordShowcaseCard } from './KeywordShowcaseCard.tsx';
import { WordCarousel } from '@/features/stage/word-spin/WordCarousel.tsx';
import { WordLockEffect } from '@/features/stage/word-spin/WordLockEffect.tsx';
import { TimerDisplay } from '@/features/timer/TimerDisplay.tsx';

import { useQuestions, useWords } from '@/storage/useRepository.ts';

interface StageOverlayProps {
  session: SessionState;
  contestant?: Contestant;
  onStart: () => void;
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
  const isKeywordMode = session.appearanceSettings?.quizMode === 'keyword';

  // B8/PF12: live, cached data (was parsed from storage once and never refreshed).
  const questionBank = useQuestions();
  const wordBank = useWords();

  const allQuestions = React.useMemo(() => {
    const questions = questionBank.filter(q => q.enabled !== false);
    const roundQuestions = questions.filter(q => q.round === session.selectedRound);
    return roundQuestions.length > 0 ? roundQuestions : questions;
  }, [questionBank, session.selectedRound]);

  const allWords = React.useMemo(() => {
    return wordBank.filter(w => w.enabled !== false);
  }, [wordBank]);

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
              {isKeywordMode
                ? '“ประกายแสงแห่งค่ำคืน... สู่การคัดสรรคำสำคัญแห่งเวทีประกวด”'
                : '“เสียงสะท้อนแห่งปัญญา... สู่การคัดเลือกคำถามแห่งเวทีประกวด”'}
            </div>

            <button className="btn-primary btn-royal-spin" onClick={onStart}>
              <span className="btn-spin-text">
                {isKeywordMode ? 'SPIN WORD' : 'SPIN QUESTION'}
              </span>
            </button>
          </div>
        )}

        {/* Royal Word/Question Spin Carousel Phase */}
        {isSpinning && (
          <div className="stage-spin-center-wrap animate-carousel-entrance">
            <WordCarousel
              items={isKeywordMode ? allWords : allQuestions}
              targetItem={isKeywordMode ? session.selectedWordItem : session.selectedQuestion}
              targetWord={session.selectedWordItem}
              displayType={isKeywordMode ? 'keyword' : 'question'}
              phase={session.currentState as 'pre-spin' | 'word-spin' | 'word-decelerate'}
              mode={session.appearanceSettings?.spinMode || 'vertical'}
            />
          </div>
        )}

        {/* Climax Word/Question Lock Aura */}
        {isWordLocked && (
          <div className="stage-lock-center-wrap">
            <WordLockEffect
              wordItem={session.selectedWordItem}
              question={session.selectedQuestion}
              quizMode={session.appearanceSettings?.quizMode || 'question'}
            />
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

            {/* Pure Minimalist Question Card or Royal Keyword Showcase Card */}
            {session.appearanceSettings?.quizMode === 'keyword' ? (
              <KeywordShowcaseCard
                keyword={session.selectedKeyword || session.selectedWordItem?.word}
                category={session.selectedCategory || session.selectedWordItem?.category}
                isAnswered={session.currentState === 'answered'}
                compact={isCenterTimer}
              />
            ) : (
              <QuestionCard
                question={session.selectedQuestion}
                isAnswered={session.currentState === 'answered'}
                fontSizeScale={displaySettings.questionFontSize}
                compact={isCenterTimer}
              />
            )}
          </div>

        )}
      </div>
    </div>
  );
};
