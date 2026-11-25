import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AppearanceSettingsPanel } from '@/features/appearance/panel/AppearanceSettings.tsx';
import { DEFAULT_APPEARANCE_SETTINGS } from '@/types/appearance.ts';

describe('AppearanceSettingsPanel Font Selector', () => {
  it('renders all font preset cards with authors and style badges', () => {
    const html = renderToString(
      React.createElement(AppearanceSettingsPanel, {
        settings: DEFAULT_APPEARANCE_SETTINGS,
        onChange: () => {}
      })
    );

    expect(html).toContain('Cinzel');
    expect(html).toContain('Playfair Display');
    expect(html).toContain('Cinzel Decorative');
    expect(html).toContain('Outfit');
    expect(html).toContain('Custom WebFont');

    expect(html).toContain('Claus Eggers Sørensen');
    expect(html).toContain('Natanael Gama');
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

  it('renders word lock showcase toggle controls', () => {
    const html = renderToString(
      React.createElement(AppearanceSettingsPanel, {
        settings: DEFAULT_APPEARANCE_SETTINGS,
        onChange: () => {}
      })
    );

    expect(html).toContain('ช่วงแสดงการ์ดคำที่สุ่มได้');
    expect(html).toContain('Selected Keyword Showcase');
    expect(html).toContain('เปิดใช้งาน (ON)');
    expect(html).toContain('ข้ามช่วงนี้ (OFF)');
  });

  it('renders competition flow mode selector cards in AppearanceSettingsPanel', () => {
    const html = renderToString(
      React.createElement(AppearanceSettingsPanel, {
        settings: {
          ...DEFAULT_APPEARANCE_SETTINGS,
          quizMode: 'keyword'
        },
        onChange: () => {}
      })
    );

    expect(html).toContain('รูปแบบการแข่งขันบนเวที (Competition Flow Mode)');
    expect(html).toContain('โหมดสุ่มคลังคำถาม');
    expect(html).toContain('โหมดสุ่มคำสำคัญ');
    expect(html).toContain('data-testid="quiz-mode-keyword"');
    expect(html).toContain('data-testid="quiz-mode-question"');
    expect(html).toContain('สุนทรพจน์ / คีย์เวิร์ด');
  });
});
