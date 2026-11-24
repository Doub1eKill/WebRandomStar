import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_APPEARANCE_SETTINGS, WordSpinStopMode } from '@/types/appearance.ts';
import { loadAppearanceSettings, saveAppearanceSettings } from '@/storage/storageApi.ts';

describe('Appearance Spin Stop Mode Data Model', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have auto as default spinStopMode in DEFAULT_APPEARANCE_SETTINGS', () => {
    expect(DEFAULT_APPEARANCE_SETTINGS.spinStopMode).toBe('auto');
  });

  it('should save and load spinStopMode in storage', () => {
    saveAppearanceSettings({ spinStopMode: 'manual' as WordSpinStopMode });
    const loaded = loadAppearanceSettings();
    expect(loaded.spinStopMode).toBe('manual');
  });
});
