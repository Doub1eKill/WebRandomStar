import { describe, it, expect, beforeEach } from 'vitest';
import { FONT_PRESETS, resolveFontFamily, applyTypography } from '../src/utils/typography.ts';

describe('Typography Engine', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--font-display');
    document.documentElement.style.removeProperty('--font-serif');
    const existing = document.getElementById('dynamic-google-font');
    if (existing) {
      existing.remove();
    }
  });

  it('should define presets for cinzel, amoria, verve, outfit', () => {
    expect(FONT_PRESETS.cinzel.name).toBe('Cinzel');
    expect(FONT_PRESETS.amoria.name).toBe('Amoria');
    expect(FONT_PRESETS.amoria.author).toContain('Fandi Kurniawan');
    expect(FONT_PRESETS.verve.name).toBe('Verve');
    expect(FONT_PRESETS.verve.author).toContain('Dieter Steffmann');
    expect(FONT_PRESETS.outfit.name).toBe('Outfit');
  });

  it('should resolve font-family including Thai fallback Prompt', () => {
    const amoriaFont = resolveFontFamily('amoria');
    expect(amoriaFont).toContain('Amoria');
    expect(amoriaFont).toContain('Prompt');

    const verveFont = resolveFontFamily('verve');
    expect(verveFont).toContain('Verve');
    expect(verveFont).toContain('Prompt');

    const cinzelFont = resolveFontFamily('cinzel');
    expect(cinzelFont).toContain('Cinzel');
    expect(cinzelFont).toContain('Prompt');
  });

  it('should resolve custom font when custom preset is selected', () => {
    const customFont = resolveFontFamily('custom', {
      name: 'Playfair',
      fontFamily: "'Playfair Display', serif"
    });
    expect(customFont).toContain('Playfair Display');
    expect(customFont).toContain('Prompt');
  });

  it('should apply CSS custom variables on root element', () => {
    applyTypography({ fontPreset: 'amoria' });
    const appliedDisplay = document.documentElement.style.getPropertyValue('--font-display');
    expect(appliedDisplay).toContain('Amoria');
    const appliedSerif = document.documentElement.style.getPropertyValue('--font-serif');
    expect(appliedSerif).toContain('Amoria');
  });

  it('should inject Google Fonts link tag when custom font has URL', () => {
    applyTypography({
      fontPreset: 'custom',
      customFont: {
        name: 'Great Vibes',
        fontFamily: "'Great Vibes', cursive",
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap'
      }
    });

    const link = document.getElementById('dynamic-google-font') as HTMLLinkElement;
    expect(link).not.toBeNull();
    expect(link?.href).toContain('Great+Vibes');
  });

  it('should remove custom Google Fonts link tag when switching to preset', () => {
    applyTypography({
      fontPreset: 'custom',
      customFont: {
        name: 'Great Vibes',
        fontFamily: "'Great Vibes', cursive",
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap'
      }
    });
    expect(document.getElementById('dynamic-google-font')).not.toBeNull();

    applyTypography({ fontPreset: 'cinzel' });
    expect(document.getElementById('dynamic-google-font')).toBeNull();
  });

  it('should validate Google Fonts URLs correctly', async () => {
    const { isValidGoogleFontUrl } = await import('../src/utils/typography.ts');
    expect(isValidGoogleFontUrl('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap')).toBe(true);
    expect(isValidGoogleFontUrl('https://fonts.googleapis.com/css?family=Open+Sans')).toBe(true);
    
    // Malicious or invalid URLs
    expect(isValidGoogleFontUrl('http://fonts.googleapis.com/css2?family=Test')).toBe(false); // must be https
    expect(isValidGoogleFontUrl('http://evil.com/malicious.css')).toBe(false);
    expect(isValidGoogleFontUrl('https://evil.com/fonts.googleapis.com/css')).toBe(false);
    expect(isValidGoogleFontUrl('javascript:alert(1)')).toBe(false);
    expect(isValidGoogleFontUrl('data:text/css,body{background:red}')).toBe(false);
    expect(isValidGoogleFontUrl('')).toBe(false);
  });

  it('should reject invalid or malicious custom font URLs in applyTypography', () => {
    applyTypography({
      fontPreset: 'custom',
      customFont: {
        name: 'Hacked',
        fontFamily: "'Hacked', cursive",
        googleFontUrl: 'http://malicious-domain.com/evil.css'
      }
    });

    const link = document.getElementById('dynamic-google-font');
    expect(link).toBeNull();
  });
});
