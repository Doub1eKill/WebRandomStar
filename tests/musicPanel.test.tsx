import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MusicPanel } from '@/features/music/panel/MusicPanel.tsx';
import { DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS } from '@/types/music.ts';

describe('MusicPanel Backstage Component', () => {
  it('renders master control banner, now playing deck, and track library', () => {
    const html = renderToString(
      React.createElement(MusicPanel, {
        musicState: DEFAULT_MUSIC_STATE,
        tracks: PRESET_MUSIC_TRACKS,
        onPlayTrack: vi.fn(),
        onPauseTrack: vi.fn(),
        onResumeTrack: vi.fn(),
        onStopMusic: vi.fn(),
        onSeekMusic: vi.fn(),
        onSetVolume: vi.fn(),
        onToggleMute: vi.fn(),
        onToggleAutoSync: vi.fn(),
        onAssignPhaseTrack: vi.fn(),
        onAddTrack: vi.fn(),
        onDeleteTrack: vi.fn(),
        onResetPresets: vi.fn()
      })
    );

    expect(html).toContain('ระบบควบคุมเพลง');
    expect(html).toContain('เล่นเพลงตามสถานะเวทีอัตโนมัติ');
    expect(html).toContain('คลังเพลงทั้งหมด');
    expect(html).toContain('Royalty Ambient Pad');
  });
});
