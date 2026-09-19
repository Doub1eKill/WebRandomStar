import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_APPEARANCE_SETTINGS, FontPresetId } from '../src/types/appearance.ts';
import { loadAppearanceSettings, saveAppearanceSettings } from '../src/utils/storage.ts';

describe('Appearance Typography Data Model', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have cinzel as default fontPreset in DEFAULT_APPEARANCE_SETTINGS', () => {
    expect(DEFAULT_APPEARANCE_SETTINGS.fontPreset).toBe('cinzel');
  });

  it('should save and load fontPreset in storage', () => {
    saveAppearanceSettings({ fontPreset: 'amoria' as FontPresetId });
    const loaded = loadAppearanceSettings();
    expect(loaded.fontPreset).toBe('amoria');
  });

  it('should save and load customFont in storage', () => {
    saveAppearanceSettings({
      fontPreset: 'custom',
      customFont: {
        name: 'Playfair Display',
        fontFamily: "'Playfair Display', serif",
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap'
      }
    });
    const loaded = loadAppearanceSettings();
    expect(loaded.fontPreset).toBe('custom');
    expect(loaded.customFont?.name).toBe('Playfair Display');
    expect(loaded.customFont?.fontFamily).toBe("'Playfair Display', serif");
    expect(loaded.customFont?.googleFontUrl).toContain('Playfair+Display');
  });
});
