import { useEffect, useRef } from 'react';
import { AppState } from '../types/session.ts';
import { MusicTrack, PhaseTrackMapping, MusicState } from '../types/music.ts';
import { MusicPlayerEngine } from '../engine/musicPlayerEngine.ts';

/**
 * Pure function to map AppState to the configured target MusicTrack
 */
export function getTargetTrackForStagePhase(
  currentState: AppState,
  mapping: PhaseTrackMapping,
  tracks: MusicTrack[]
): MusicTrack | null {
  let targetTrackId: string | null = null;

  if (currentState === 'idle') {
    targetTrackId = mapping.ambient;
  } else if (['pre-spin', 'word-spin', 'word-decelerate', 'word-lock'].includes(currentState)) {
    targetTrackId = mapping.spin;
  } else if (['question-reveal', 'question'].includes(currentState)) {
    targetTrackId = mapping.question;
  } else if (currentState === 'answered') {
    targetTrackId = mapping.answered;
  }

  if (!targetTrackId) return null;
  return tracks.find(t => t.id === targetTrackId) || null;
}

/**
 * Hook to automatically route BGM music based on Stage State changes
 */
export function useMusicStageRouter(
  currentState: AppState,
  musicState: MusicState,
  tracks: MusicTrack[],
  player: MusicPlayerEngine
): void {
  const lastStateRef = useRef<AppState | null>(null);

  useEffect(() => {
    if (!musicState.autoSyncWithStage) return;
    if (lastStateRef.current === currentState) return;

    lastStateRef.current = currentState;

    const targetTrack = getTargetTrackForStagePhase(
      currentState,
      musicState.phaseTrackMapping,
      tracks
    );

    if (targetTrack) {
      const isOneShot = currentState === 'answered';
      player.playTrack(targetTrack, {
        fadeInDuration: 1.2,
        loop: !isOneShot && targetTrack.loop
      });
    } else {
      player.stop({ fadeOutDuration: 1.0 });
    }
  }, [currentState, musicState.autoSyncWithStage, musicState.phaseTrackMapping, tracks, player]);
}
