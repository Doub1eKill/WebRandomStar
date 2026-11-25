import { describe, it, expect, beforeEach } from 'vitest';
import { applyTypography } from '@/features/appearance/typography.ts';

describe('Stage Typography Integration', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--font-display');
    document.documentElement.style.removeProperty('--font-serif');
  });

  it('should update CSS custom property on document element when appearance updates', () => {
    applyTypography({ fontPreset: 'verve' });
    expect(document.documentElement.style.getPropertyValue('--font-display')).toContain('Cinzel Decorative');
    expect(document.documentElement.style.getPropertyValue('--font-serif')).toContain('Cinzel Decorative');

    applyTypography({ fontPreset: 'amoria' });
    expect(document.documentElement.style.getPropertyValue('--font-display')).toContain('Playfair Display');
    expect(document.documentElement.style.getPropertyValue('--font-serif')).toContain('Playfair Display');

    applyTypography({ fontPreset: 'cinzel' });
    expect(document.documentElement.style.getPropertyValue('--font-display')).toContain('Cinzel');
    expect(document.documentElement.style.getPropertyValue('--font-serif')).toContain('Cinzel');
  });
});
