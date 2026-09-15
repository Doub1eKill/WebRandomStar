import React, { useState } from 'react';
import { useStageSync } from './hooks/useStageSync.ts';
import {
  loadQuestions,
  saveQuestions,
  loadContestants,
  saveContestants,
  loadWords
} from './utils/storage.ts';
import { Question, Contestant, QuestionCategory } from './types/question.ts';
import { KeywordItem } from './types/word.ts';
import { StageBackground } from './components/Stage/StageBackground.tsx';
import { StageOverlay } from './components/Stage/StageOverlay.tsx';
import { ControlDrawer } from './components/Control/ControlDrawer.tsx';
import { RemoteController } from './components/Control/RemoteController.tsx';
import { KeyboardController } from './components/Control/KeyboardController.tsx';
import { QuestionManagerModal } from './components/Control/QuestionManagerModal.tsx';
import { ContestantManagerModal } from './components/Control/ContestantManagerModal.tsx';

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
    toggleMute,
    startTimer,
    pauseTimer,
    resumeTimer,
    adjustTimer,
    setTimerSoundSettings,
    setStageDisplaySettings
  } = useStageSync(isControllerMode ? 'controller' : 'stage');

  const [questions, setQuestions] = useState<Question[]>(() => loadQuestions());
  const [contestants, setContestants] = useState<Contestant[]>(() => loadContestants());
  const [words] = useState<KeywordItem[]>(() => loadWords());

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isContestantModalOpen, setIsContestantModalOpen] = useState(false);

  const handleSaveQuestions = (updated: Question[]) => {
    setQuestions(updated);
    saveQuestions(updated);
  };

  const handleSaveContestants = (updated: Contestant[]) => {
    setContestants(updated);
    saveContestants(updated);
  };

  // If in Remote Controller window, render dedicated operator view
  if (isControllerMode) {
    return <RemoteController />;
  }

  const activeContestant = contestants.find(c => c.id === session.selectedContestantId);

  const handleStart = (forceCategory?: QuestionCategory, forceWord?: KeywordItem) => {
    startJourney({ width: window.innerWidth, height: window.innerHeight }, forceCategory, forceWord);
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

  const handleToggleTimer = () => {
    if (session.timerState.status === 'running') {
      pauseTimer();
    } else if (session.timerState.status === 'paused') {
      resumeTimer();
    } else {
      startTimer();
    }
  };

  return (
    <div className="stage-app-viewport" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 1. Dynamic Stage Background (Cosmic Canvas or AeroShards) */}
      <StageBackground session={session} />

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
        words={words}
        onStart={handleStart}
        onPause={pauseJourney}
        onSkip={skipToQuestion}
        onMarkAnswered={markAnswered}
        onReset={resetStage}
        onSelectContestant={setContestant}
        onSelectRound={setRound}
        onSetVolume={setVolume}
        onToggleMute={toggleMute}
        onOpenQuestionManager={() => setIsQuestionModalOpen(true)}
        onOpenContestantManager={() => setIsContestantModalOpen(true)}
        onSetTimerSoundSettings={setTimerSoundSettings}
        onSetStageDisplaySettings={setStageDisplaySettings}
        onAdjustTimer={adjustTimer}
      />

      {/* 4. Global Keyboard Navigation */}
      <KeyboardController
        onStartOrPause={handleStartOrPause}
        onProceed={handleProceed}
        onToggleDrawer={() => setIsDrawerOpen(prev => !prev)}
        onToggleMute={toggleMute}
        onToggleTimer={handleToggleTimer}
      />

      {/* 5. Question Manager Modal */}
      <QuestionManagerModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        questions={questions}
        onSaveQuestions={handleSaveQuestions}
      />

      {/* 6. Contestant Manager Modal */}
      <ContestantManagerModal
        isOpen={isContestantModalOpen}
        onClose={() => setIsContestantModalOpen(false)}
        contestants={contestants}
        onSaveContestants={handleSaveContestants}
      />
    </div>
  );
};

export default App;
