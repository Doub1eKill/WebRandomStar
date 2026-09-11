import { useState, useEffect, useCallback, useRef } from 'react';
import { SessionState } from '../types/session.ts';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions.ts';
import { selectQuestionFlow } from '../engine/questionSelector.ts';
import { STAGE_DURATION, getNextState } from '../engine/stateMachine.ts';
import { QuestionCategory } from '../types/question.ts';

const CHANNEL_NAME = 'season_quiz_stage_sync';
const STORAGE_KEY = 'season_quiz_session_state';

const initialSessionState: SessionState = {
  sessionId: 'session-' + Date.now(),
  seed: 'seed-' + Math.floor(Math.random() * 100000),
  currentState: 'idle',
  selectedRound: 'attitude',
  usedQuestionIds: [],
  isMuted: false,
  volume: 0.8,
  isPaused: false,
  candidateNodes: []
};

export function useStageSync(role: 'stage' | 'controller') {
  const [session, setSession] = useState<SessionState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reset animated state to idle if reloaded during animation
        if (parsed.currentState !== 'question' && parsed.currentState !== 'answered') {
          return { ...parsed, currentState: 'idle', isPaused: false };
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return initialSessionState;
  });

  const channelRef = useRef<BroadcastChannel | null>(null);

  // Broadcast state changes
  const broadcastState = useCallback((nextState: SessionState) => {
    setSession(nextState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      channelRef.current?.postMessage({ type: 'SYNC_STATE', payload: nextState });
    } catch {
      // ignore
    }
  }, []);

  // Listen to external broadcast messages
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE' && event.data.payload) {
          setSession(event.data.payload);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  // Automated sequence progression when on Stage
  useEffect(() => {
    if (session.isPaused || session.currentState === 'idle' || session.currentState === 'question' || session.currentState === 'answered') {
      return;
    }

    // For 'leaf' state, the transition to 'question' is driven by the onLeafLanded event
    // after the leaf glide, 1.2s suspense beat, and supernova explosion finish playing.
    // We use a 12s safety timeout fallback so it never hangs if canvas is unmounted.
    const duration = session.currentState === 'leaf' ? 12000 : STAGE_DURATION[session.currentState];
    if (!duration || duration <= 0) return;

    const timer = setTimeout(() => {
      const next = getNextState(session.currentState);
      broadcastState({
        ...session,
        currentState: next
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [session, broadcastState]);

  // Actions
  const startJourney = useCallback((viewport: { width: number; height: number }, forceCategory?: QuestionCategory) => {
    const newSeed = 'seed-' + Date.now();
    const selection = selectQuestionFlow(
      DEFAULT_QUESTIONS,
      session.usedQuestionIds,
      newSeed,
      viewport,
      forceCategory
    );

    const nextState: SessionState = {
      ...session,
      seed: newSeed,
      currentState: 'rain',
      selectedCategory: selection.selectedCategory,
      selectedQuestion: selection.selectedQuestion,
      candidateNodes: selection.candidateNodes,
      meteorTrajectory: selection.meteorTrajectory,
      isPaused: false
    };

    broadcastState(nextState);
  }, [session, broadcastState]);

  const pauseJourney = useCallback(() => {
    broadcastState({
      ...session,
      isPaused: !session.isPaused
    });
  }, [session, broadcastState]);

  const skipToQuestion = useCallback(() => {
    if (!session.selectedQuestion) return;
    broadcastState({
      ...session,
      currentState: 'question',
      isPaused: false
    });
  }, [session, broadcastState]);

  const markAnswered = useCallback(() => {
    if (!session.selectedQuestion) return;
    const updatedUsed = Array.from(new Set([...session.usedQuestionIds, session.selectedQuestion.id]));
    broadcastState({
      ...session,
      currentState: 'answered',
      usedQuestionIds: updatedUsed
    });
  }, [session, broadcastState]);

  const resetStage = useCallback(() => {
    broadcastState({
      ...session,
      currentState: 'idle',
      isPaused: false,
      selectedQuestion: undefined,
      selectedCategory: undefined,
      candidateNodes: [],
      meteorTrajectory: undefined
    });
  }, [session, broadcastState]);

  const setContestant = useCallback((contestantId: string) => {
    broadcastState({
      ...session,
      selectedContestantId: contestantId
    });
  }, [session, broadcastState]);

  const setRound = useCallback((round: string) => {
    broadcastState({
      ...session,
      selectedRound: round
    });
  }, [session, broadcastState]);

  const setVolume = useCallback((volume: number) => {
    broadcastState({
      ...session,
      volume
    });
  }, [session, broadcastState]);

  const toggleMute = useCallback(() => {
    broadcastState({
      ...session,
      isMuted: !session.isMuted
    });
  }, [session, broadcastState]);

  return {
    session,
    role,
    startJourney,
    pauseJourney,
    skipToQuestion,
    markAnswered,
    resetStage,
    setContestant,
    setRound,
    setVolume,
    toggleMute
  };
}
