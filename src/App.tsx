import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useStageSync } from './hooks/useStageSync.ts';
import { useMusicStageRouter } from './hooks/useMusicStageRouter.ts';
import { applyTypography } from './utils/typography.ts';
import {
  loadQuestions,
  saveQuestions,
  loadContestants,
  saveContestants,
  loadWords
} from './utils/storage.ts';
import { Question, Contestant, QuestionCategory } from './types/question.ts';
import { KeywordItem } from './types/word.ts';
import { MusicTrack, PRESET_MUSIC_TRACKS } from './types/music.ts';
import { musicPlayer } from './engine/musicPlayerEngine.ts';
import { useMusicPlayerState } from './hooks/useMusicPlayerState.ts';
import { getAllTracksFromStorage, saveTrackToStorage, deleteTrackFromStorage } from './storage/musicStorage.ts';
import { hydratePlayerFromStorage, startMusicHost } from './features/music/musicRemote.ts';
import { StageBackground } from './components/Stage/StageBackground.tsx';
import { StageOverlay } from './components/Stage/StageOverlay.tsx';
import { KeyboardController } from './components/Control/KeyboardController.tsx';
import { OperatorToasts } from './components/Control/OperatorToasts.tsx';
import { useHasBeenTrue } from './hooks/useHasBeenTrue.ts';

// PF3: operator-only UI is split into separate chunks. The stage never downloads the remote
// controller, and the drawer/modals load the first time they are opened.
const RemoteController = lazy(() => import('./components/Control/RemoteController.tsx').then(m => ({ default: m.RemoteController })));
const ControlDrawer = lazy(() => import('./components/Control/ControlDrawer.tsx').then(m => ({ default: m.ControlDrawer })));
const QuestionManagerModal = lazy(() => import('./components/Control/QuestionManagerModal.tsx').then(m => ({ default: m.QuestionManagerModal })));
const ContestantManagerModal = lazy(() => import('./components/Control/ContestantManagerModal.tsx').then(m => ({ default: m.ContestantManagerModal })));

export const App: React.FC = () => {
  // Check if opened as secondary remote controller window
  const isControllerMode = typeof window !== 'undefined' && window.location.search.includes('mode=controller');

  // Phase 3: the remote window gets only the operator view (one session mirror, no stage
  // music router); the stage window is the session host.
  if (isControllerMode) {
    return (
      <Suspense fallback={null}>
        <RemoteController />
      </Suspense>
    );
  }
  return <StageApp />;
};

const StageApp: React.FC = () => {
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

  // Music State & Tracks for Stage Auto-Sync
  const [tracks, setTracks] = useState<MusicTrack[]>(() => PRESET_MUSIC_TRACKS);
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  // PF5: the stage never shows playback progress, so ignore progress-only updates.
  const musicState = useMusicPlayerState();

  useEffect(() => {
    getAllTracksFromStorage().then(setTracks);
    // B14: the remote window's music tab sends its commands here; the stage plays and persists.
    return startMusicHost(musicPlayer, {
      getTracks: () => tracksRef.current,
      reloadTracks: () => getAllTracksFromStorage().then(list => {
        setTracks(list);
        return list;
      })
    });
  }, []);

  // Hook to automatically play stage soundtrack per phase
  useMusicStageRouter(session.currentState, musicState, tracks, musicPlayer);

  // Apply typography (Cinzel, Amoria, Verve, Outfit, Custom) dynamically
  useEffect(() => {
    applyTypography(session.appearanceSettings);
  }, [session.appearanceSettings?.fontPreset, session.appearanceSettings?.customFont]);

  const [questions, setQuestions] = useState<Question[]>(() => loadQuestions());
  const [contestants, setContestants] = useState<Contestant[]>(() => loadContestants());
  const [words] = useState<KeywordItem[]>(() => loadWords());


  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isContestantModalOpen, setIsContestantModalOpen] = useState(false);
  const drawerLoaded = useHasBeenTrue(isDrawerOpen);
  const questionModalLoaded = useHasBeenTrue(isQuestionModalOpen);
  const contestantModalLoaded = useHasBeenTrue(isContestantModalOpen);

  const handleSaveQuestions = (updated: Question[]) => {
    setQuestions(updated);
    saveQuestions(updated);
  };

  const handleSaveContestants = (updated: Contestant[]) => {
    setContestants(updated);
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
        onNext={handleProceed}
        onStopSpin={stopWordSpin}
        onOpenControlDrawer={() => setIsDrawerOpen(true)}
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
            tracks={tracks}
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
              musicPlayer.setPhaseTrackMapping({ [phase]: trackId });
            }}
            onAddTrack={async (newTrack, fileBlob) => {
              const saved = await saveTrackToStorage(newTrack, fileBlob);
              setTracks(prev => [...prev.filter(t => t.id !== saved.id), saved]);
            }}
            onDeleteTrack={async (id) => {
              await deleteTrackFromStorage(id);
              setTracks(prev => prev.filter(t => t.id !== id));
              if (musicState.currentTrackId === id) {
                musicPlayer.stop();
              }
            }}
            onPlayTrack={(track) => {
              musicPlayer.play(track);
            }}
            onStopMusic={() => {
              musicPlayer.stop();
            }}
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

export default App;
