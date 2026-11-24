import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Phase 5: ControlCenter's music tab became its own route (#/control/music).
describe('Remote control Music page integration', () => {
  it('has a music tab in the control layout', () => {
    const file = fs.readFileSync(path.resolve(__dirname, '../src/pages/control/ControlLayout.tsx'), 'utf-8');
    expect(file).toContain("to: 'music'");
    expect(file).toContain('เพลงประกอบ');
  });

  it('renders MusicPanel on the music page', () => {
    const file = fs.readFileSync(path.resolve(__dirname, '../src/pages/control/MusicPage.tsx'), 'utf-8');
    expect(file).toContain('MusicPanel');
  });
});
