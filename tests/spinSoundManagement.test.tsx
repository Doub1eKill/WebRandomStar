import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AppearanceSettingsPanel } from '@/features/appearance/panel/AppearanceSettings.tsx';
import { DEFAULT_APPEARANCE_SETTINGS } from '@/types/appearance.ts';
import { DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS } from '@/types/music.ts';

import { ControlDrawer } from '@/features/control/ControlDrawer.tsx';

describe('Spin Sound Management in AppearanceSettingsPanel', () => {
  it('renders spin audio selector and upload button', () => {
    const html = renderToString(
      React.createElement(AppearanceSettingsPanel, {
        settings: DEFAULT_APPEARANCE_SETTINGS,
        onChange: () => {},
        tracks: PRESET_MUSIC_TRACKS,
        musicState: DEFAULT_MUSIC_STATE
      })
    );

    expect(html).toContain('เพลง/เสียงประกอบช่วงสุ่มคำ');
    expect(html).toContain('อัปโหลดเสียงสุ่ม');
    expect(html).toContain('Suspense Pulse');
  });

  it('renders spin audio selector inside ControlDrawer when open', () => {
    const mockSession = {
      sessionId: 'test-session',
      seed: 'seed-123',
      currentState: 'idle' as const,
      selectedRound: 'intro',
      usedQuestionIds: [],
      isMuted: false,
      volume: 0.8,
      isPaused: false,
      timerState: {
        status: 'idle' as const,
        durationMs: 60000,
        remainingMs: 60000
      }
    };

    const html = renderToString(
      React.createElement(ControlDrawer, {
        isOpen: true,
        onClose: () => {},
        session: mockSession,
        contestants: [],
        tracks: PRESET_MUSIC_TRACKS,
        musicState: DEFAULT_MUSIC_STATE,
        onStart: () => {},
        onPause: () => {},
        onSkip: () => {},
        onMarkAnswered: () => {},
        onReturnAllDrawn: () => {},
        onSelectContestant: () => {},
        onSelectRound: () => {},
        onSetVolume: () => {},
        onToggleMute: () => {},
        onOpenQuestionManager: () => {},
        onOpenContestantManager: () => {}
      })
    );

    expect(html).toContain('เสียงเพลงช่วงสุ่มคำ');
    expect(html).toContain('Suspense Pulse');
  });
});
