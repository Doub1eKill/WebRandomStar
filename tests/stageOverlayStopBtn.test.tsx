import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StageOverlay } from '@/features/stage/overlay/StageOverlay.tsx';
import { SessionState } from '@/types/session.ts';
import { DEFAULT_APPEARANCE_SETTINGS } from '@/types/appearance.ts';

const createMockSession = (overrides: Partial<SessionState>): SessionState => ({
  sessionId: 'test-session',
  seed: 'test-seed',
  currentState: 'word-spin',
  selectedRound: 'intro',
  usedQuestionIds: [],
  isMuted: false,
  volume: 1,
  isPaused: false,
  timerState: { status: 'idle', durationMs: 60000, remainingMs: 60000 },
  appearanceSettings: DEFAULT_APPEARANCE_SETTINGS,
  ...overrides
});

describe('StageOverlay Clean Screen in Word Spin', () => {
  it('keeps stage clean without on-screen STOP button (controlled via backstage only)', () => {
    const session = createMockSession({
      currentState: 'word-spin',
      appearanceSettings: {
        ...DEFAULT_APPEARANCE_SETTINGS,
        spinStopMode: 'manual'
      }
    });

    const html = renderToString(
      React.createElement(StageOverlay, {
        session,
        onStart: () => {}
      })
    );

    expect(html).not.toContain('btn-royal-stop-spin');
    expect(html).not.toContain('spin-speed-indicator');
  });
});
