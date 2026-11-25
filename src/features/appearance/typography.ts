import { AppearanceSettings, FontPresetId, CustomFontConfig } from '@/types/appearance.ts';

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
  // B12/Q4: the ids 'amoria' and 'verve' stay (they are stored in saved settings), but the fonts
  // are now OFL look-alikes bundled with the app. The original Amoria (personal-use demo) and
  // Verve (no verifiable commercial license) were never shipped, so these presets used to fall
  // back to Cinzel.
  amoria: {
    id: 'amoria',
    name: 'Playfair Display',
    subtitle: 'Modern Luxury Serif',
    author: 'Claus Eggers Sørensen / Google Fonts',
    styleTag: 'Modern Luxury',
    fontFamily: "'Playfair Display', 'Cinzel', 'Prompt', serif",
    previewText: 'CHARM OF TRANSITION 2026',
    description: 'ฟอนต์สไตล์ High-Fashion โมเดิร์นหรูหรา ลายเส้นคมชัด สง่างามเหนือระดับ'
  },
  verve: {
    id: 'verve',
    name: 'Cinzel Decorative',
    subtitle: 'Ornate Heritage Display',
    author: 'Natanael Gama / Google Fonts',
    styleTag: 'Classic Heritage',
    fontFamily: "'Cinzel Decorative', 'Cinzel', 'Prompt', serif",
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

/**
 * S6: a custom font name ends up in a CSS custom property. Keep only characters that belong in
 * a font-family list (letters incl. Thai, digits, spaces, quotes, comma, hyphen) so it cannot
 * close the value or inject url(), braces or semicolons.
 */
export function sanitizeFontFamily(input: string): string {
  return input.replace(/[^\p{L}\p{M}\p{N}\s,'"-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 200);
}

export function resolveFontFamily(preset?: FontPresetId, custom?: CustomFontConfig): string {
  const customFamily = custom?.fontFamily ? sanitizeFontFamily(custom.fontFamily) : '';
  if (preset === 'custom' && customFamily) {
    return `${customFamily}, 'Prompt', sans-serif`;
  }
  if (preset && preset in FONT_PRESETS) {
    return FONT_PRESETS[preset as Exclude<FontPresetId, 'custom'>].fontFamily;
  }
  return FONT_PRESETS.cinzel.fontFamily;
}

/**
 * Strict validation for Google Font stylesheet URLs
 * Whitelists https://fonts.googleapis.com/css and https://fonts.googleapis.com/css2
 */
export function isValidGoogleFontUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return false;
    if (parsed.hostname !== 'fonts.googleapis.com') return false;
    if (parsed.pathname !== '/css' && parsed.pathname !== '/css2') return false;
    return true;
  } catch {
    return false;
  }
}

export function applyTypography(settings?: Partial<AppearanceSettings>): void {
  if (typeof document === 'undefined') return;

  const preset = settings?.fontPreset || 'cinzel';
  const custom = settings?.customFont;
  const resolvedFont = resolveFontFamily(preset, custom);

  document.documentElement.style.setProperty('--font-display', resolvedFont);
  document.documentElement.style.setProperty('--font-serif', resolvedFont);

  // Dynamic Google Font Injection with strict URL validation
  const existingLink = document.getElementById('dynamic-google-font') as HTMLLinkElement | null;
  const customUrl = custom?.googleFontUrl?.trim();
  const isValidUrl = customUrl ? isValidGoogleFontUrl(customUrl) : false;

  if (preset === 'custom' && isValidUrl && customUrl) {
    if (existingLink) {
      if (existingLink.href !== customUrl) {
        existingLink.href = customUrl;
      }
    } else {
      const link = document.createElement('link');
      link.id = 'dynamic-google-font';
      link.rel = 'stylesheet';
      link.href = customUrl;
      document.head.appendChild(link);
    }
  } else if (existingLink) {
    existingLink.remove();
  }
}
