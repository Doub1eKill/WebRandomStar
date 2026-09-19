import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AppearanceSettingsPanel } from '../src/components/Control/AppearanceSettings.tsx';
import { DEFAULT_APPEARANCE_SETTINGS } from '../src/types/appearance.ts';

describe('AppearanceSettingsPanel Spin Stop Mode', () => {
  it('renders Auto-Stop and Manual-Stop options with descriptions', () => {
    const html = renderToString(
      React.createElement(AppearanceSettingsPanel, {
        settings: DEFAULT_APPEARANCE_SETTINGS,
        onChange: () => {}
      })
    );

    expect(html).toContain('หยุดอัตโนมัติ (Auto-Stop)');
    expect(html).toContain('หยุดด้วยตนเอง (Manual Stop)');
    expect(html).toContain('รูปแบบการหยุดสุ่มคำ');
  });
});
