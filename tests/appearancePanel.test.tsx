import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AppearanceSettingsPanel } from '../src/components/Control/AppearanceSettings.tsx';
import { DEFAULT_APPEARANCE_SETTINGS } from '../src/types/appearance.ts';

describe('AppearanceSettingsPanel Font Selector', () => {
  it('renders all font preset cards with authors and style badges', () => {
    const html = renderToString(
      React.createElement(AppearanceSettingsPanel, {
        settings: DEFAULT_APPEARANCE_SETTINGS,
        onChange: () => {}
      })
    );

    expect(html).toContain('Cinzel');
    expect(html).toContain('Amoria');
    expect(html).toContain('Verve');
    expect(html).toContain('Outfit');
    expect(html).toContain('Custom WebFont');

    expect(html).toContain('Fandi Kurniawan');
    expect(html).toContain('Dieter Steffmann');
    expect(html).toContain('Modern Luxury');
    expect(html).toContain('Classic Heritage');
  });

  it('renders custom font drawer when fontPreset is custom', () => {
    const html = renderToString(
      React.createElement(AppearanceSettingsPanel, {
        settings: {
          ...DEFAULT_APPEARANCE_SETTINGS,
          fontPreset: 'custom',
          customFont: {
            name: 'Playfair Display',
            fontFamily: "'Playfair Display', serif",
            googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display'
          }
        },
        onChange: () => {}
      })
    );

    expect(html).toContain('ตั้งค่าฟอนต์กำหนดเอง');
    expect(html).toContain('Playfair Display');
    expect(html).toContain('Google Fonts CSS URL');
  });
});
