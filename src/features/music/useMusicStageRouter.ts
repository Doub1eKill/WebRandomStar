import { useEffect, useRef } from 'react';
import { AppState } from '@/types/session.ts';
import { MusicTrack, PhaseTrackMapping, MusicState } from '@/types/music.ts';
import { MusicPlayerEngine } from './musicPlayerEngine.ts';

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
  const lastTargetTrackIdRef = useRef<string | null>(null);
  const wasAutoSyncRef = useRef<boolean>(musicState.autoSyncWithStage);

  useEffect(() => {
    if (!musicState.autoSyncWithStage) {
      if (wasAutoSyncRef.current) {
        // Auto-sync was toggled off: immediately stop stage soundtrack
        player.stop({ fadeOutDuration: 0.6 });
        lastTargetTrackIdRef.current = null;
      }
      wasAutoSyncRef.current = false;
      return;
    }

    wasAutoSyncRef.current = true;

    const targetTrack = getTargetTrackForStagePhase(
      currentState,
      musicState.phaseTrackMapping,
      tracks
    );

    const targetId = targetTrack?.id || null;

    if (targetId !== lastTargetTrackIdRef.current) {
      lastTargetTrackIdRef.current = targetId;

      if (targetTrack) {
        player.playTrack(targetTrack, {
          fadeInDuration: 1.0,
          loop: targetTrack.loop
        });
      } else {
        player.stop({ fadeOutDuration: 0.8 });
      }
    }
  }, [currentState, musicState.autoSyncWithStage, musicState.phaseTrackMapping, tracks, player]);
}
