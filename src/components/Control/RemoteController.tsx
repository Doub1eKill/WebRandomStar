import React, { useState, useEffect } from 'react';
import { useStageSync } from '../../hooks/useStageSync.ts';
import { ControlCenter } from './ControlCenter.tsx';
import { applyTypography } from '../../utils/typography.ts';
import {
  loadQuestions,
  saveQuestions,
  loadContestants,
  saveContestants,
  loadWords,
  saveWords,
  loadHistory,
  clearHistory
} from '../../utils/storage.ts';
import { Question, Contestant, QuestionCategory } from '../../types/question.ts';
import { KeywordItem } from '../../types/word.ts';
import { HistoryRecord } from '../../types/history.ts';

export const RemoteController: React.FC = () => {
  const {
    session,
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

  const [questions, setQuestions] = useState<Question[]>(() => loadQuestions());
  const [contestants, setContestants] = useState<Contestant[]>(() => loadContestants());
  const [words, setWords] = useState<KeywordItem[]>(() => loadWords());
  const [history, setHistory] = useState<HistoryRecord[]>(() => loadHistory());

  const handleSaveQuestions = (updated: Question[]) => {
    setQuestions(updated);
    saveQuestions(updated);
  };

  const handleSaveContestants = (updated: Contestant[]) => {
    setContestants(updated);
    saveContestants(updated);
  };

  const handleSaveWord = (word: KeywordItem) => {
    const exists = words.some(w => w.id === word.id);
    const updated = exists ? words.map(w => (w.id === word.id ? word : w)) : [...words, word];
    setWords(updated);
    saveWords(updated);
  };

  const handleDeleteWord = (id: string) => {
    const updated = words.filter(w => w.id !== id);
    setWords(updated);
    saveWords(updated);
  };

  const handleToggleWord = (id: string) => {
    const updated = words.map(w => (w.id === id ? { ...w, enabled: !w.enabled } : w));
    setWords(updated);
    saveWords(updated);
  };

  const handleResetWords = (defaultWords: KeywordItem[]) => {
    setWords(defaultWords);
    saveWords(defaultWords);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleStart = (cat?: QuestionCategory, forceWord?: KeywordItem) => {
    startJourney({ width: 1920, height: 1080 }, cat, forceWord);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
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
