import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { mount, Mounted } from './helpers/render.tsx';
import { AppRoutes } from '@/app/router.tsx';
import { isObsModeSearch } from '@/features/stage/obsMode.ts';
import { notifyOperator } from '@/shared/notices/operatorNotices.ts';

async function settle() {
  await act(async () => {
    for (let i = 0; i < 20; i++) await new Promise(r => setTimeout(r, 0));
  });
}

async function waitFor(check: () => boolean, timeoutMs = 5000) {
  const started = Date.now();
  while (!check() && Date.now() - started < timeoutMs) await settle();
}

let view: Mounted | null = null;
const $ = (selector: string) => view!.container.querySelector(selector);

async function renderStage(path: string) {
  view = mount(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
  await waitFor(() => !!$('.stage-app-viewport'));
}

async function pressEscape() {
  await act(async () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }));
  });
}

beforeEach(() => localStorage.clear());
afterEach(async () => { await settle(); view?.unmount(); view = null; });

describe('isObsModeSearch', () => {
  it.each([
    ['?obs=1', true],
    ['?obs', true],
    ['?obs=true', true],
    ['?foo=1&obs=yes', true],
    ['', false],
    ['?obs=0', false],
    ['?obs=false', false],
    ['?obs=no', false],
    ['?observer=1', false]
  ])('%s → %s', (search, expected) => {
    expect(isObsModeSearch(search)).toBe(expected);
  });
});

describe('OBS / stage-only mode (#/?obs=1)', () => {
  it('marks the stage as display-only', async () => {
    await renderStage('/?obs=1');
    expect($('.stage-app-viewport')!.classList.contains('is-obs-mode')).toBe(true);
    expect(view!.container.textContent).toContain('SPIN');
  });

  it('Esc does not open the operator drawer', async () => {
    await renderStage('/?obs=1');
    await pressEscape();
    await settle();
    expect($('.control-drawer-panel')).toBeNull();
  });

  it('operator notices never show on the stage', async () => {
    await renderStage('/?obs=1');
    act(() => { notifyOperator('error', 'ข้อความทดสอบ OBS'); });
    expect($('.operator-toast')).toBeNull();
  });
});

describe('normal stage (no ?obs) keeps its operator tools', () => {
  it('is not marked display-only', async () => {
    await renderStage('/');
    expect($('.stage-app-viewport')!.classList.contains('is-obs-mode')).toBe(false);
  });

  it('Esc still opens the operator drawer', async () => {
    await renderStage('/');
    await pressEscape();
    await waitFor(() => !!$('.control-drawer-panel'));
    expect($('.control-drawer-panel')).not.toBeNull();
  });

  it('notices still show while no remote is connected', async () => {
    await renderStage('/');
    act(() => { notifyOperator('error', 'ข้อความทดสอบเวที'); });
    expect($('.operator-toast')?.textContent).toContain('ข้อความทดสอบเวที');
  });
});
