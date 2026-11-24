/**
 * Stage page (route "#/"): the projector screen and session host. Moved from App.tsx in Phase 5.
 */
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useStageSync } from '@/features/session/useStageSync.ts';
import { useMusicStageRouter } from '@/features/music/useMusicStageRouter.ts';
import { applyTypography } from '@/features/appearance/typography.ts';
import { saveQuestions, saveContestants } from '@/storage/storageApi.ts';
import { useQuestions, useContestants, useWords } from '@/storage/useRepository.ts';
import { Question, Contestant, QuestionCategory } from '@/types/question.ts';
import { KeywordItem } from '@/types/word.ts';
import { musicPlayer } from '@/features/music/musicPlayerEngine.ts';
import { useMusicPlayerState } from '@/features/music/useMusicPlayerState.ts';
import { hydratePlayerFromStorage, startMusicHost } from '@/features/music/musicRemote.ts';
import { localMusicControls, useMusicLibrary } from '@/features/music/useMusicLibrary.ts';
import { StageBackground } from '@/features/stage/background/StageBackground.tsx';
import { StageOverlay } from '@/features/stage/overlay/StageOverlay.tsx';
import { KeyboardController } from '@/features/stage/KeyboardController.tsx';
import { OperatorToasts } from '@/shared/notices/OperatorToasts.tsx';
import { useHasBeenTrue } from '@/shared/lib/useHasBeenTrue.ts';

// PF3: operator-only UI is split into separate chunks; the drawer/modals load on first open.
const ControlDrawer = lazy(() => import('@/features/control/ControlDrawer.tsx').then(m => ({ default: m.ControlDrawer })));
const QuestionManagerModal = lazy(() => import('@/features/questions/QuestionManagerModal.tsx').then(m => ({ default: m.QuestionManagerModal })));
const ContestantManagerModal = lazy(() => import('@/features/contestants/ContestantManagerModal.tsx').then(m => ({ default: m.ContestantManagerModal })));

const stageMusicControls = localMusicControls(musicPlayer);

export const StagePage: React.FC = () => {
  const {
    session,
    isPeerConnected: isRemoteConnected,
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
    startTimer,
    pauseTimer,
    resumeTimer,
    adjustTimer,
    setTimerSoundSettings,
    setStageDisplaySettings
  } = useStageSync('stage');

  // B15: restore the saved phase mapping / auto-sync into the player once, before anything plays.
  useState(() => {
    hydratePlayerFromStorage(musicPlayer);
    return true;
  });

  // PF5: the stage never shows playback progress, so ignore progress-only updates.
  const musicState = useMusicPlayerState();
  // A3/S8: one library implementation for both windows; reloads when the remote changes it.
  const library = useMusicLibrary(stageMusicControls, musicState.currentTrackId);
  const tracksRef = useRef(library.tracks);
  tracksRef.current = library.tracks;
  const reloadRef = useRef(library.reload);
  reloadRef.current = library.reload;

  useEffect(() => {
    // B14: the remote window's music page sends its commands here; the stage plays and persists.
    return startMusicHost(musicPlayer, {
      getTracks: () => tracksRef.current,
      reloadTracks: () => reloadRef.current()
    });
  }, []);

  // Hook to automatically play stage soundtrack per phase
  useMusicStageRouter(session.currentState, musicState, library.tracks, musicPlayer);

  // Apply typography (Cinzel, Amoria, Verve, Outfit, Custom) dynamically.
  // applyTypography only reads these two fields, so they are the effect's exact inputs.
  const fontPreset = session.appearanceSettings?.fontPreset;
  const customFont = session.appearanceSettings?.customFont;
  useEffect(() => {
    applyTypography({ fontPreset, customFont });
  }, [fontPreset, customFont]);

  // B8: live data, updated when the remote window edits it.
  const questions = useQuestions();
  const contestants = useContestants();
  const words = useWords();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isContestantModalOpen, setIsContestantModalOpen] = useState(false);
  const drawerLoaded = useHasBeenTrue(isDrawerOpen);
  const questionModalLoaded = useHasBeenTrue(isQuestionModalOpen);
  const contestantModalLoaded = useHasBeenTrue(isContestantModalOpen);

  // Saving notifies the hooks above (and the other window), so no local copy is needed.
  const handleSaveQuestions = (updated: Question[]) => {
    saveQuestions(updated);
  };

  const handleSaveContestants = (updated: Contestant[]) => {
    saveContestants(updated);
  };

  const activeContestant = contestants.find(c => c.id === session.selectedContestantId);

  const handleStart = (forceCategory?: QuestionCategory, forceWord?: KeywordItem) => {
    startJourney({ width: window.innerWidth, height: window.innerHeight }, forceCategory, forceWord);
  };

  const handleStartOrPause = () => {
    if (session.currentState === 'idle') {
      handleStart();
    } else if (session.currentState === 'word-spin') {
      stopWordSpin();
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
    } else if (session.currentState === 'word-spin') {
      stopWordSpin();
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
      />

      {/* 3. Operator Slide-over Control Drawer (loaded on first open, then kept mounted) */}
      {drawerLoaded && (
        <Suspense fallback={null}>
          <ControlDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            session={session}
            contestants={contestants}
            words={words}
            tracks={library.tracks}
            musicState={musicState}
            onStart={handleStart}
            onStopSpin={stopWordSpin}
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
            onSetAppearanceSettings={setAppearanceSettings}
            onAssignPhaseTrack={(phase, trackId) => {
              stageMusicControls.setPhaseTrackMapping({ [phase]: trackId });
            }}
            onAddTrack={library.addTrack}
            onDeleteTrack={library.deleteTrack}
            onPlayTrack={(track) => stageMusicControls.playTrack(track)}
            onStopMusic={() => stageMusicControls.stop()}
            onAdjustTimer={adjustTimer}
          />
        </Suspense>
      )}

      {/* Operator notices (replaces alert(), B10/B11). Hidden on the projector while a remote
          controller window is connected; the operator sees them there instead. */}
      <OperatorToasts hidden={isRemoteConnected} />

      {/* 4. Global Keyboard Navigation */}
      <KeyboardController
        onStartOrPause={handleStartOrPause}
        onProceed={handleProceed}
        onToggleDrawer={() => setIsDrawerOpen(prev => !prev)}
        onToggleMute={toggleMute}
        onToggleTimer={handleToggleTimer}
      />

      {/* 5. Question Manager Modal (loaded on first open) */}
      {questionModalLoaded && (
        <Suspense fallback={null}>
          <QuestionManagerModal
            isOpen={isQuestionModalOpen}
            onClose={() => setIsQuestionModalOpen(false)}
            questions={questions}
            onSaveQuestions={handleSaveQuestions}
          />
        </Suspense>
      )}

      {/* 6. Contestant Manager Modal (loaded on first open) */}
      {contestantModalLoaded && (
        <Suspense fallback={null}>
          <ContestantManagerModal
            isOpen={isContestantModalOpen}
            onClose={() => setIsContestantModalOpen(false)}
            contestants={contestants}
            onSaveContestants={handleSaveContestants}
          />
        </Suspense>
      )}
    </div>
  );
};

export default StagePage;
