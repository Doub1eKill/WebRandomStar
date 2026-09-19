import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('ControlCenter Music Tab Integration', () => {
  it('contains music tab in ControlCenter.tsx', () => {
    const file = fs.readFileSync(path.resolve(__dirname, '../src/components/Control/ControlCenter.tsx'), 'utf-8');
    expect(file).toContain("'music'");
    expect(file).toContain('เพลงประกอบ');
  });

  it('imports and integrates MusicPanel in ControlCenter.tsx', () => {
    const file = fs.readFileSync(path.resolve(__dirname, '../src/components/Control/ControlCenter.tsx'), 'utf-8');
    expect(file).toContain('MusicPanel');
  });
});
