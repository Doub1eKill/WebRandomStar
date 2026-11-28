/**
 * Stage page (route "#/"): the projector screen and session host. Moved from App.tsx in Phase 5.
 */
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { SessionProvider, useSession, useSessionActions, usePeerConnected } from '@/features/session/SessionProvider.tsx';
import { useMusicStageRouter } from '@/features/music/useMusicStageRouter.ts';
import { applyTypography } from '@/features/appearance/typography.ts';
import { questionsRepository, contestantsRepository } from '@/storage/repositories.ts';
import { useQuestions, useContestants, useWords } from '@/storage/useRepository.ts';
import { Question, Contestant } from '@/types/question.ts';
import { KeywordItem } from '@/types/word.ts';
import { musicPlayer } from '@/features/music/musicPlayerEngine.ts';
import { useMusicPlayerState } from '@/features/music/useMusicPlayerState.ts';
import { hydratePlayerFromStorage, startMusicHost } from '@/features/music/musicRemote.ts';
import { localMusicControls, useMusicLibrary } from '@/features/music/useMusicLibrary.ts';
import { StageBackground } from '@/features/stage/background/StageBackground.tsx';
import { StageOverlay } from '@/features/stage/overlay/StageOverlay.tsx';
import { KeyboardController } from '@/features/stage/KeyboardController.tsx';
import { useObsMode } from '@/features/stage/obsMode.ts';
import { StandbyScreen } from '@/features/stage/screens/StandbyScreen.tsx';
import { WinnerScreen } from '@/features/stage/screens/WinnerScreen.tsx';
import { usePreloadImages } from '@/features/stage/screens/usePreloadImages.ts';
import { prepareDownscaledImage, screenImageWidth } from '@/features/stage/screens/downscaledImage.ts';
import { STANDBY_FILL_WIDTH } from '@/features/stage/screens/StandbyScreen.tsx';
import { STANDBY_IMAGE_URL } from '@/data/standbyImage.ts';
import { winnerImage } from '@/data/winnerPhotos.ts';
import { stageScreenOf } from '@/types/session.ts';
import { OperatorToasts } from '@/shared/notices/OperatorToasts.tsx';
import { useHasBeenTrue } from '@/shared/lib/useHasBeenTrue.ts';

// PF3: operator-only UI is split into separate chunks; the drawer/modals load on first open.
const ControlDrawer = lazy(() => import('@/features/control/ControlDrawer.tsx').then(m => ({ default: m.ControlDrawer })));
const QuestionManagerModal = lazy(() => import('@/features/questions/QuestionManagerModal.tsx').then(m => ({ default: m.QuestionManagerModal })));
const ContestantManagerModal = lazy(() => import('@/features/contestants/ContestantManagerModal.tsx').then(m => ({ default: m.ContestantManagerModal })));

const stageMusicControls = localMusicControls(musicPlayer);

/** The stage window hosts the session (Q2); everything below reads it through the provider. */
export const StagePage: React.FC = () => (
  <SessionProvider role="stage">
    <StageScreen />
  </SessionProvider>
);

const StageScreen: React.FC = () => {
  // The stage re-renders on every session change, as it did with the old useStageSync hook.
  const session = useSession(s => s);
  const isRemoteConnected = usePeerConnected();
  // `#/?obs=1`: stage-only output for OBS capture (no operator UI can open on this page).
  const obsMode = useObsMode();
  const {
    startJourney,
    stopWordSpin,
    pauseJourney,
    skipToQuestion,
    markAnswered,
    resetUsedQuestions,
    resetUsedWords,
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
    setStageDisplaySettings,
    setStageScreen
  } = useSessionActions();

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
    questionsRepository.save(updated);
  };

  const handleSaveContestants = (updated: Contestant[]) => {
    contestantsRepository.save(updated);
  };

  const activeContestant = contestants.find(c => c.id === session.selectedContestantId);

  // Standby / winner screens (2026-11-29). Their images are fetched and decoded up front, so a
  // switch shows them at once instead of drawing a 24-megapixel picture in on cue.
  const screen = stageScreenOf(session);
  // Posters of the prepared and the announced winners are decoded ahead of the reveal.
  const winners = [...(session.winners ?? []), ...(session.winnerAnnouncement?.winners ?? [])];
  useEffect(() => {
    if (!STANDBY_IMAGE_URL) return;
    void prepareDownscaledImage(STANDBY_IMAGE_URL, screenImageWidth());
    void prepareDownscaledImage(STANDBY_IMAGE_URL, STANDBY_FILL_WIDTH);
  }, []);
  usePreloadImages([
    ...winners.map(w => {
      const c = contestants.find(x => x.id === w.contestantId);
      return c ? winnerImage(c)?.url : undefined;
    })
  ]);

  const handleStart = (forceWord?: KeywordItem) => {
    startJourney({ width: window.innerWidth, height: window.innerHeight }, forceWord);
  };

  // After Done (answered) Space/Enter spins the next one straight away, with no Reset in between.
  const handleStartOrPause = () => {
    // Space/Enter on the projector only drive the spin screen; the standby and winner screens
    // must not be cut short by a stray key press (the control window can still start a spin).
    if (screen !== 'quiz') return;
    if (session.currentState === 'idle' || session.currentState === 'answered') {
      handleStart();
    } else if (session.currentState === 'word-spin') {
      stopWordSpin();
    } else if (session.currentState === 'question') {
      markAnswered();
    } else {
      pauseJourney();
    }
  };

  const handleProceed = () => {
    if (screen !== 'quiz') return;
    if (session.currentState === 'idle' || session.currentState === 'answered') {
      handleStart();
    } else if (session.currentState === 'word-spin') {
      stopWordSpin();
    } else if (session.currentState === 'question') {
      markAnswered();
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
    <div
      className={`stage-app-viewport${obsMode ? ' is-obs-mode' : ''}`}
      data-obs-mode={obsMode || undefined}
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      {/* 1. Dynamic Stage Background (Cosmic Canvas or AeroShards) */}
      <StageBackground session={session} interactive={!obsMode} />

      {/* 2. React UI Stage Overlay */}
      <StageOverlay
        session={session}
        contestant={activeContestant}
        onStart={() => handleStart()}
        hidden={screen !== 'quiz'}
      />

      {/* 2b. Standby (key visual) and winner screens, over the spin overlay */}
      <StandbyScreen active={screen === 'standby'} />
      <WinnerScreen
        active={screen === 'winner'}
        announcement={session.winnerAnnouncement}
        contestants={contestants}
      />

      {/* 3. Operator Slide-over Control Drawer (loaded on first open, then kept mounted) */}
      {!obsMode && drawerLoaded && (
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
            onReturnAllDrawn={() => { resetUsedQuestions(); resetUsedWords(); }}
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
            onSetStageScreen={setStageScreen}
          />
        </Suspense>
      )}

      {/* Operator notices (replaces alert(), B10/B11). Hidden on the projector while a remote
          controller window is connected; the operator sees them there instead. Never shown in OBS mode. */}
      <OperatorToasts hidden={obsMode || isRemoteConnected} />

      {/* 4. Global Keyboard Navigation (off in OBS mode: Esc would open the drawer in the capture) */}
      {!obsMode && (
        <KeyboardController
          onStartOrPause={handleStartOrPause}
          onProceed={handleProceed}
          onToggleDrawer={() => setIsDrawerOpen(prev => !prev)}
          onToggleMute={toggleMute}
          onToggleTimer={handleToggleTimer}
        />
      )}

      {/* 5. Question Manager Modal (loaded on first open) */}
      {!obsMode && questionModalLoaded && (
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
      {!obsMode && contestantModalLoaded && (
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
