import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StageOverlay } from '../src/components/Stage/StageOverlay.tsx';
import { SessionState } from '../src/types/session.ts';
import { DEFAULT_APPEARANCE_SETTINGS } from '../src/types/appearance.ts';

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

describe('StageOverlay Stop Button in Manual Mode', () => {
  it('renders STOP SPIN button when in word-spin with manual stop mode', () => {
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
        onStart: () => {},
        onNext: () => {},
        onStopSpin: () => {},
        onOpenControlDrawer: () => {}
      })
    );

    expect(html).toContain('STOP SPIN');
  });

  it('does not render STOP SPIN button when in auto mode', () => {
    const session = createMockSession({
      currentState: 'word-spin',
      appearanceSettings: {
        ...DEFAULT_APPEARANCE_SETTINGS,
        spinStopMode: 'auto'
      }
    });

    const html = renderToString(
      React.createElement(StageOverlay, {
        session,
        onStart: () => {},
        onNext: () => {},
        onStopSpin: () => {},
        onOpenControlDrawer: () => {}
      })
    );

    expect(html).not.toContain('STOP SPIN');
  });
});
