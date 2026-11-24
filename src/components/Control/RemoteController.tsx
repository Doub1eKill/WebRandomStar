import React, { useEffect } from 'react';
import { useStageSync } from '../../hooks/useStageSync.ts';
import { ControlCenter } from './ControlCenter.tsx';
import { OperatorToasts } from './OperatorToasts.tsx';
import { applyTypography } from '../../utils/typography.ts';
import { saveQuestions, saveContestants, saveWords, clearHistory } from '../../utils/storage.ts';
import { useQuestions, useContestants, useWords, useHistory } from '../../hooks/useRepository.ts';
import { Question, Contestant, QuestionCategory } from '../../types/question.ts';
import { KeywordItem } from '../../types/word.ts';

export const RemoteController: React.FC = () => {
  const {
    session,
    isPeerConnected: isStageConnected,
    startJourney,
    stopWordSpin,
    pauseJourney,
    skipToQuestion,
    markAnswered,
    resetStage,
    setContestant,
    setRound,
    setVolume,
    toggleMute,
    setAppearanceSettings,
    setTimerDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    finishTimer,
    adjustTimer,
    setTimerSoundSettings,
    setStageDisplaySettings
  } = useStageSync('controller');

  // Apply typography in remote controller as well
  useEffect(() => {
    applyTypography(session.appearanceSettings);
  }, [session.appearanceSettings?.fontPreset, session.appearanceSettings?.customFont]);

  // B8: live data. History in particular is written by the stage window, so it now appears
  // here as soon as an answer is recorded instead of only after a reload.
  const questions = useQuestions();
  const contestants = useContestants();
  const words = useWords();
  const history = useHistory();

  const handleSaveQuestions = (updated: Question[]) => {
    saveQuestions(updated);
  };

  const handleSaveContestants = (updated: Contestant[]) => {
    saveContestants(updated);
  };

  const handleSaveWord = (word: KeywordItem) => {
    const exists = words.some(w => w.id === word.id);
    saveWords(exists ? words.map(w => (w.id === word.id ? word : w)) : [...words, word]);
  };

  const handleDeleteWord = (id: string) => {
    saveWords(words.filter(w => w.id !== id));
  };

  const handleToggleWord = (id: string) => {
    saveWords(words.map(w => (w.id === id ? { ...w, enabled: !w.enabled } : w)));
  };

  const handleResetWords = (defaultWords: KeywordItem[]) => {
    saveWords(defaultWords);
  };

  const handleClearHistory = () => {
    clearHistory();
  };

  const handleStart = (cat?: QuestionCategory, forceWord?: KeywordItem) => {
    startJourney({ width: 1920, height: 1080 }, cat, forceWord);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <OperatorToasts />
      {/* Q2: the stage window is the only host; without it commands have no effect. */}
      {!isStageConnected && (
        <div className="stage-disconnected-banner" role="alert">
          ⚠ ไม่พบหน้าจอเวทีที่เปิดอยู่ — คำสั่งจะไม่มีผลจนกว่าจะเปิดหน้าเวที (หน้าเว็บหลักแบบไม่มี ?mode=controller) ในเบราว์เซอร์เดียวกัน
        </div>
      )}
      <ControlCenter
        session={session}
        questions={questions}
        contestants={contestants}
        words={words}
        history={history}
        onStartRandomization={handleStart}
        onStopSpin={stopWordSpin}
        onPauseRandomization={pauseJourney}
        onSkipToQuestion={skipToQuestion}
        onMarkAnswered={markAnswered}
        onResetStage={resetStage}
        onSelectContestant={setContestant}
        onSelectRound={setRound}
        onSetVolume={setVolume}
        onToggleMute={toggleMute}
        onSaveQuestions={handleSaveQuestions}
        onSaveContestants={handleSaveContestants}
        onSaveWord={handleSaveWord}
        onDeleteWord={handleDeleteWord}
        onToggleWord={handleToggleWord}
        onResetWords={handleResetWords}
        onSetAppearanceSettings={setAppearanceSettings}
        onClearHistory={handleClearHistory}
        onSetTimerDuration={setTimerDuration}
        onStartTimer={startTimer}
        onPauseTimer={pauseTimer}
        onResumeTimer={resumeTimer}
        onResetTimer={resetTimer}
        onFinishTimer={finishTimer}
        onAdjustTimer={adjustTimer}
        onSetTimerSoundSettings={setTimerSoundSettings}
        onSetStageDisplaySettings={setStageDisplaySettings}
      />
    </div>
  );
};
