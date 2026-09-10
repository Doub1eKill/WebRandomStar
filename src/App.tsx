import React, { useState } from 'react';
import { useStageSync } from './hooks/useStageSync.ts';
import { DEFAULT_CONTESTANTS } from './data/defaultContestants.ts';
import { Contestant, QuestionCategory } from './types/question.ts';
import { StageCanvas } from './components/Stage/StageCanvas.tsx';
import { StageOverlay } from './components/Stage/StageOverlay.tsx';
import { ControlDrawer } from './components/Control/ControlDrawer.tsx';
import { RemoteController } from './components/Control/RemoteController.tsx';
import { KeyboardController } from './components/Control/KeyboardController.tsx';

export const App: React.FC = () => {
  // Check if opened as secondary remote controller window
  const isControllerMode = typeof window !== 'undefined' && window.location.search.includes('mode=controller');

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
  } = useStageSync(isControllerMode ? 'controller' : 'stage');

  const [contestants] = useState<Contestant[]>(DEFAULT_CONTESTANTS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // If in Remote Controller window, render dedicated operator view
  if (isControllerMode) {
    return <RemoteController />;
  }

  const activeContestant = contestants.find(c => c.id === session.selectedContestantId);

  const handleStart = (forceCategory?: QuestionCategory) => {
    startJourney({ width: window.innerWidth, height: window.innerHeight }, forceCategory);
  };

  const handleStartOrPause = () => {
    if (session.currentState === 'idle') {
      handleStart();
    } else if (session.currentState === 'question') {
      markAnswered();
    } else if (session.currentState === 'answered') {
      resetStage();
    } else {
      pauseJourney();
    }
  };

  const handleProceed = () => {
    if (session.currentState === 'idle') {
      handleStart();
    } else if (session.currentState === 'question') {
      markAnswered();
    } else if (session.currentState === 'answered') {
      resetStage();
    } else {
      skipToQuestion();
    }
  };

  return (
    <div className="stage-app-viewport" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 1. Canvas 2D Physics & Celestial Environment */}
      <StageCanvas session={session} onMeteorImpact={skipToQuestion} />

      {/* 2. React UI Stage Overlay */}
      <StageOverlay
        session={session}
        contestant={activeContestant}
        onStart={() => handleStart()}
        onNext={handleProceed}
        onOpenControlDrawer={() => setIsDrawerOpen(true)}
      />

      {/* 3. Operator Slide-over Control Drawer */}
      <ControlDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        session={session}
        contestants={contestants}
        onStart={handleStart}
        onPause={pauseJourney}
        onSkip={skipToQuestion}
        onMarkAnswered={markAnswered}
        onReset={resetStage}
        onSelectContestant={setContestant}
        onSelectRound={setRound}
        onSetVolume={setVolume}
        onToggleMute={toggleMute}
        onOpenQuestionManager={() => alert('คลังคำถามจะเปิดในโมดอล (Task 10)')}
        onOpenContestantManager={() => alert('จัดการผู้เข้าแข่งขันจะเปิดในโมดอล (Task 10)')}
      />

      {/* 4. Global Keyboard Navigation */}
      <KeyboardController
        onStartOrPause={handleStartOrPause}
        onProceed={handleProceed}
        onToggleDrawer={() => setIsDrawerOpen(prev => !prev)}
        onToggleMute={toggleMute}
      />
    </div>
  );
};

export default App;
