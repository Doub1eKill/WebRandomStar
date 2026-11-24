import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router';
import { mount, Mounted } from './helpers/render.tsx';
import { AppRoutes, redirectLegacyControllerUrl, CONTROL_PAGES } from '@/app/router.tsx';

async function settle() {
  await act(async () => {
    for (let i = 0; i < 20; i++) await new Promise(r => setTimeout(r, 0));
  });
}

/** Lazy routes load asynchronously (the first import is slow); wait until `check` holds. */
async function waitFor(check: () => boolean, timeoutMs = 5000) {
  const started = Date.now();
  while (!check() && Date.now() - started < timeoutMs) await settle();
}

let view: Mounted | null = null;
const location = { pathname: '' };

function LocationProbe() {
  location.pathname = useLocation().pathname;
  return null;
}

function renderAt(path: string) {
  view = mount(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <LocationProbe />
    </MemoryRouter>
  );
}

const text = () => view!.container.textContent || '';

beforeEach(() => localStorage.clear());
afterEach(() => { view?.unmount(); view = null; });

describe('Phase 5 routing', () => {
  it('#/control redirects to the live page and shows the tab bar', async () => {
    renderAt('/control');
    await waitFor(() => text().includes('SPIN WORD'));
    expect(location.pathname).toBe('/control/live');
    expect(text()).toContain('ควบคุมเวที (Stage)');
  });

  it.each(CONTROL_PAGES.map(p => [p]))('the %s page loads as its own route', async page => {
    renderAt(`/control/${page}`);
    await waitFor(() => !!view!.container.querySelector('nav a.active'));
    expect(location.pathname).toBe(`/control/${page}`);
    expect(view!.container.querySelector('nav a.active')?.getAttribute('href')).toBe(`/control/${page}`);
  });

  it('unknown control pages fall back to live, unknown routes to the stage', async () => {
    renderAt('/control/nope');
    await waitFor(() => location.pathname === '/control/live');
    expect(location.pathname).toBe('/control/live');
    view!.unmount();
    renderAt('/whatever');
    await waitFor(() => location.pathname === '/');
    expect(location.pathname).toBe('/');
  });

  it('a tab link switches pages without leaving the control window', async () => {
    renderAt('/control/live');
    await waitFor(() => !!view!.container.querySelector('nav a[href="/control/timer"]'));
    const timerLink = view!.container.querySelector('nav a[href="/control/timer"]') as HTMLAnchorElement;
    await act(async () => { timerLink.click(); });
    await waitFor(() => location.pathname === '/control/timer');
    expect(location.pathname).toBe('/control/timer');
  });
});

describe('legacy ?mode=controller links', () => {
  it('are rewritten to #/control/live and keep other query params', () => {
    const calls: string[] = [];
    const fakeHistory = { replaceState: (_s: unknown, _t: string, url: string) => calls.push(url) } as unknown as History;
    expect(redirectLegacyControllerUrl({ search: '?mode=controller&x=1', pathname: '/app/' } as Location, fakeHistory)).toBe(true);
    expect(calls).toEqual(['/app/?x=1#/control/live']);
    expect(redirectLegacyControllerUrl({ search: '', pathname: '/' } as Location, fakeHistory)).toBe(false);
  });
});
