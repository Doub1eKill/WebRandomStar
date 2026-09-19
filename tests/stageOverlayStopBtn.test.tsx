import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StageOverlay } from '../src/components/Stage/StageOverlay.tsx';
import { StageSession } from '../src/types/session.ts';
import { DEFAULT_APPEARANCE_SETTINGS } from '../src/types/appearance.ts';

describe('StageOverlay Stop Button in Manual Mode', () => {
  it('renders STOP SPIN button when in word-spin with manual stop mode', () => {
    const session: StageSession = {
      sessionId: 'test',
      currentState: 'word-spin',
      timerState: { status: 'idle', durationMs: 60000 },
      appearanceSettings: {
        ...DEFAULT_APPEARANCE_SETTINGS,
        spinStopMode: 'manual'
      }
    };

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
    const session: StageSession = {
      sessionId: 'test',
      currentState: 'word-spin',
      timerState: { status: 'idle', durationMs: 60000 },
      appearanceSettings: {
        ...DEFAULT_APPEARANCE_SETTINGS,
        spinStopMode: 'auto'
      }
    };

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
