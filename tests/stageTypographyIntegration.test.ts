import { describe, it, expect, beforeEach } from 'vitest';
import { applyTypography } from '../src/utils/typography.ts';

describe('Stage Typography Integration', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--font-display');
    document.documentElement.style.removeProperty('--font-serif');
  });

  it('should update CSS custom property on document element when appearance updates', () => {
    applyTypography({ fontPreset: 'verve' });
    expect(document.documentElement.style.getPropertyValue('--font-display')).toContain('Verve');
    expect(document.documentElement.style.getPropertyValue('--font-serif')).toContain('Verve');

    applyTypography({ fontPreset: 'amoria' });
    expect(document.documentElement.style.getPropertyValue('--font-display')).toContain('Amoria');
    expect(document.documentElement.style.getPropertyValue('--font-serif')).toContain('Amoria');

    applyTypography({ fontPreset: 'cinzel' });
    expect(document.documentElement.style.getPropertyValue('--font-display')).toContain('Cinzel');
    expect(document.documentElement.style.getPropertyValue('--font-serif')).toContain('Cinzel');
  });
});
