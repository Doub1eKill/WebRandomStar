import { AppearanceSettings, FontPresetId, CustomFontConfig } from '../types/appearance.ts';

export interface FontPresetOption {
  id: FontPresetId;
  name: string;
  subtitle: string;
  author: string;
  styleTag: string;
  fontFamily: string;
  previewText: string;
  description: string;
}

export const FONT_PRESETS: Record<Exclude<FontPresetId, 'custom'>, FontPresetOption> = {
  cinzel: {
    id: 'cinzel',
    name: 'Cinzel',
    subtitle: 'Royal Roman Serif',
    author: 'Natanael Gama / Google Fonts',
    styleTag: 'Royal Standard',
    fontFamily: "'Cinzel', Georgia, 'Prompt', serif",
    previewText: 'CHARM OF TRANSITION 2026',
    description: 'ฟอนต์โรมันคลาสสิก ลายเส้นทรงเกียรติยศ มาตรฐานเวทีประกวดระดับสากล'
  },
  amoria: {
    id: 'amoria',
    name: 'Amoria',
    subtitle: 'Modern Luxury Serif',
    author: 'Fandi Kurniawan',
    styleTag: 'Modern Luxury',
    fontFamily: "'Amoria', 'Cinzel', 'Prompt', serif",
    previewText: 'CHARM OF TRANSITION 2026',
    description: 'ฟอนต์สไตล์ High-Fashion โมเดิร์นหรูหรา ลายเส้นคมชัด สง่างามเหนือระดับ'
  },
  verve: {
    id: 'verve',
    name: 'Verve',
    subtitle: 'Ornate Heritage Display',
    author: 'Dieter Steffmann',
    styleTag: 'Classic Heritage',
    fontFamily: "'Verve', 'Cinzel', 'Prompt', serif",
    previewText: 'CHARM OF TRANSITION 2026',
    description: 'ฟอนต์คลาสสิกวิจิตร ศิลปะลวดลายโบราณ เอกลักษณ์โดดเด่นสะกดทุกสายตา'
  },
  outfit: {
    id: 'outfit',
    name: 'Outfit',
    subtitle: 'Clean Geometric Sans',
    author: 'Outfit / Google Fonts',
    styleTag: 'Modern Sans',
    fontFamily: "'Outfit', 'Prompt', sans-serif",
    previewText: 'CHARM OF TRANSITION 2026',
    description: 'ฟอนต์โมเดิร์นคลีน ไร้หัว อ่านง่าย สบายตา ทันสมัยและกระชับ'
  }
};

export function resolveFontFamily(preset?: FontPresetId, custom?: CustomFontConfig): string {
  if (preset === 'custom' && custom?.fontFamily) {
    return `${custom.fontFamily}, 'Prompt', sans-serif`;
  }
  if (preset && preset in FONT_PRESETS) {
    return FONT_PRESETS[preset as Exclude<FontPresetId, 'custom'>].fontFamily;
  }
  return FONT_PRESETS.cinzel.fontFamily;
}

export function applyTypography(settings?: Partial<AppearanceSettings>): void {
  if (typeof document === 'undefined') return;

  const preset = settings?.fontPreset || 'cinzel';
  const custom = settings?.customFont;
  const resolvedFont = resolveFontFamily(preset, custom);

  document.documentElement.style.setProperty('--font-display', resolvedFont);
  document.documentElement.style.setProperty('--font-serif', resolvedFont);

  // Dynamic Google Font Injection
  const existingLink = document.getElementById('dynamic-google-font') as HTMLLinkElement | null;
  if (preset === 'custom' && custom?.googleFontUrl) {
    if (existingLink) {
      if (existingLink.href !== custom.googleFontUrl) {
        existingLink.href = custom.googleFontUrl;
      }
    } else {
      const link = document.createElement('link');
      link.id = 'dynamic-google-font';
      link.rel = 'stylesheet';
      link.href = custom.googleFontUrl;
      document.head.appendChild(link);
    }
  } else if (existingLink && preset !== 'custom') {
    existingLink.remove();
  }
}
