import { WordSpinMode } from './word.ts';

export type BackgroundMode = 'cosmic-canvas' | 'aero-shards';

export interface ThemeColors {
  deepNavy: string;
  royalBlue: string;
  violetGlow: string;
  silverLight: string;
  softGold: string;
}

export const DEFAULT_THEME_COLORS: ThemeColors = {
  deepNavy: '#071126',
  royalBlue: '#0D2854',
  violetGlow: '#5B4BDB',
  silverLight: '#DDE7FF',
  softGold: '#F5D98A'
};

export type FontPresetId = 'cinzel' | 'amoria' | 'verve' | 'outfit' | 'custom';

export type WordSpinStopMode = 'auto' | 'manual';

export interface CustomFontConfig {
  name: string;
  fontFamily: string;
  googleFontUrl?: string;
}

export interface AppearanceSettings {
  backgroundMode?: BackgroundMode; // 'cosmic-canvas' | 'aero-shards'
  themeName: 'luxury-winter-pageant' | 'ethereal-gold' | 'custom';
  spinMode: WordSpinMode;
  spinStopMode: WordSpinStopMode;
  spinDurationMs: number;
  particleDensity: number; // 0.1 to 2.0 (default 1.0)
  glowIntensity: number;   // 0.1 to 2.0 (default 1.0)
  showCrownSilhouette: boolean;
  showWaterReflection: boolean;
  showLightRays: boolean;
  showAurora: boolean;
  showCrystals: boolean;
  showWordLockPhase?: boolean;
  fontPreset: FontPresetId;
  customFont?: CustomFontConfig;
  customColors?: Partial<ThemeColors>;
}

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  backgroundMode: 'cosmic-canvas',
  themeName: 'luxury-winter-pageant',
  spinMode: 'vertical',
  spinStopMode: 'auto',
  spinDurationMs: 4500,
  particleDensity: 1.0,
  glowIntensity: 1.0,
  showCrownSilhouette: true,
  showWaterReflection: true,
  showLightRays: true,
  showAurora: true,
  showCrystals: true,
  showWordLockPhase: true,
  fontPreset: 'cinzel'
};
