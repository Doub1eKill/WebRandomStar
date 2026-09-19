import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AppearanceSettingsPanel } from '../src/components/Control/AppearanceSettings.tsx';
import { DEFAULT_APPEARANCE_SETTINGS } from '../src/types/appearance.ts';
import { DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS } from '../src/types/music.ts';

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
});
