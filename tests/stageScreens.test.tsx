import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { mount, Mounted } from './helpers/render.tsx';
import { AppRoutes } from '@/app/router.tsx';
import { sessionReducer, ReducerContext } from '@/features/session/sessionReducer.ts';
import { parseChannelMessage } from '@/features/session/sessionChannel.ts';
import { createInitialSession, loadPersistedSession, openOnStartupScreen } from '@/features/session/persistence.ts';
import { SessionProvider } from '@/features/session/SessionProvider.tsx';
import { STORAGE_KEYS, contestantsRepository } from '@/storage/repositories.ts';
import { DEFAULT_TIMER_SOUND_SETTINGS, DEFAULT_STAGE_DISPLAY_SETTINGS } from '@/types/timer.ts';
import { Contestant, Question } from '@/types/question.ts';
import { KeywordItem } from '@/types/word.ts';
import {
  MAX_WINNERS,
  MAX_WINNER_TEXT,
  SessionState,
  WinnerAnnouncement,
  WinnerEntry,
  sanitizeAnnouncement,
  sanitizeWinners,
  stageScreenOf
} from '@/types/session.ts';
import { buildPosterIndex, winnerImage, winnerPosterUrl } from '@/data/winnerPhotos.ts';
import { pickStandbyImage, STANDBY_IMAGE_URL } from '@/data/standbyImage.ts';
import { isSameAsAnnounced, knownWinners, moveWinner, removeWinner, setWinnerAward, toggleWinner } from '@/features/winners/winnerEdits.ts';
import { StandbyScreen } from '@/features/stage/screens/StandbyScreen.tsx';
import { WinnerScreen, headlinePieces, winnerPosterHeightVh, winnersPerRow } from '@/features/stage/screens/WinnerScreen.tsx';
import { WinnersPage } from '@/pages/control/WinnersPage.tsx';

// Made-up people: the real ones live only in the (git-ignored) Photo/ and Winner/ folders.
const PEOPLE: Contestant[] = [
  { id: 'c1', number: 1, name: 'สมชาย ใจดี', nickname: 'เอ', faculty: '', photoKey: 'เอ_สมชาย_ใจดี' },
  { id: 'c2', number: 2, name: 'สมหญิง รักเรียน', nickname: 'บี', faculty: '' },
  { id: 'c3', number: 5, name: 'มานะ ขยัน', faculty: '' }
];

const question: Question = { id: 'q1', text: 'Q', round: 'intro', difficulty: 'medium', enabled: true };
const word: KeywordItem = { id: 'w1', word: 'ฝน', enabled: true } as KeywordItem;
const ctx = (): ReducerContext => ({
  now: 1_000_000,
  loadQuestions: () => [question],
  loadWords: () => [word],
  loadContestants: () => PEOPLE,
  loadTimerSoundSettings: () => DEFAULT_TIMER_SOUND_SETTINGS,
  loadStageDisplaySettings: () => DEFAULT_STAGE_DISPLAY_SETTINGS
});

const reduce = (s: SessionState, command: Parameters<typeof sessionReducer>[1]) => sessionReducer(s, command, ctx()).state;
/** A session on the spin screen (a new session opens on the standby screen). */
const quizSession = (patch: Partial<SessionState> = {}): SessionState => ({ ...createInitialSession(), stageScreen: 'quiz', ...patch });

describe('stage screen in the session', () => {
  it('a new session opens on the standby screen; anything unknown reads as the spin screen', () => {
    expect(stageScreenOf(createInitialSession())).toBe('standby');
    expect(stageScreenOf({})).toBe('quiz');
    expect(stageScreenOf({ stageScreen: 'nonsense' as never })).toBe('quiz');
    expect(openOnStartupScreen(quizSession()).stageScreen).toBe('standby');
  });

  it('SET_STAGE_SCREEN switches screens and ignores unknown ones', () => {
    const s = quizSession();
    expect(reduce(s, { type: 'SET_STAGE_SCREEN', screen: 'standby' }).stageScreen).toBe('standby');
    expect(reduce(s, { type: 'SET_STAGE_SCREEN', screen: 'winner' }).stageScreen).toBe('winner');
    expect(reduce(s, { type: 'SET_STAGE_SCREEN', screen: 'bogus' as never })).toBe(s);
    expect(reduce(s, { type: 'SET_STAGE_SCREEN', screen: 'quiz' })).toBe(s);
  });

  it('leaving the spin screen mid-spin returns the stage to idle; a question on screen is kept', () => {
    const spinning = quizSession({ currentState: 'word-spin', selectedWordItem: word, selectedKeyword: word.word });
    const away = reduce(spinning, { type: 'SET_STAGE_SCREEN', screen: 'standby' });
    expect(away.currentState).toBe('idle');
    expect(away.selectedWordItem).toBeUndefined();

    const asking = quizSession({ currentState: 'question', selectedQuestion: question });
    const paused = reduce(asking, { type: 'SET_STAGE_SCREEN', screen: 'standby' });
    expect(paused.currentState).toBe('question');
    expect(paused.selectedQuestion?.id).toBe('q1');
    expect(reduce(paused, { type: 'SET_STAGE_SCREEN', screen: 'quiz' }).currentState).toBe('question');
  });

  it('spinning from the standby or winner screen brings the spin screen back', () => {
    const standby = reduce(quizSession(), { type: 'SET_STAGE_SCREEN', screen: 'standby' });
    const spun = reduce(standby, { type: 'START_JOURNEY' });
    expect(spun.stageScreen).toBe('quiz');
    expect(spun.currentState).toBe('pre-spin');
  });

  it('SET_WINNERS cleans the list and keeps the heading when none is sent', () => {
    const s = reduce(createInitialSession(), { type: 'SET_WINNERS', winners: [], headline: 'AMBASSADOR 2026' });
    const messy = [
      { contestantId: 'c1', award: 'ดาว' },
      { contestantId: 'c1', award: 'again' },
      { contestantId: '', award: 'x' },
      { contestantId: 'c2', award: 42 },
      'junk',
      { contestantId: 'c3', award: 'ย'.repeat(200) }
    ] as unknown as WinnerEntry[];
    const next = reduce(s, { type: 'SET_WINNERS', winners: messy });
    expect(next.winners).toEqual([
      { contestantId: 'c1', award: 'ดาว' },
      { contestantId: 'c2', award: '' },
      { contestantId: 'c3', award: 'ย'.repeat(MAX_WINNER_TEXT) }
    ]);
    expect(next.winnerHeadline).toBe('AMBASSADOR 2026');
    expect(reduce(next, { type: 'SET_WINNERS', winners: [], headline: '' }).winnerHeadline).toBe('');
  });

  it('caps the winner list', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ contestantId: `p${i}`, award: '' }));
    expect(sanitizeWinners(many)).toHaveLength(MAX_WINNERS);
    expect(sanitizeWinners('nope')).toEqual([]);
  });

  it('ANNOUNCE_WINNERS puts the prepared heading and winners on the winner screen', () => {
    const spinning = quizSession({ currentState: 'word-spin' });
    const prepared = reduce(spinning, {
      type: 'SET_WINNERS',
      winners: [{ contestantId: 'c2', award: '' }, { contestantId: 'gone', award: '' }, { contestantId: 'c1', award: 'ดาว' }],
      headline: 'เดือน SCI TECH 2026'
    });
    expect(prepared.winnerAnnouncement).toBeUndefined();
    const announced = reduce(prepared, { type: 'ANNOUNCE_WINNERS', sound: false });
    expect(announced.stageScreen).toBe('winner');
    expect(announced.currentState).toBe('idle');
    expect(announced.winnerAnnouncement).toEqual({
      id: 'ann-1000000',
      at: 1_000_000,
      headline: 'เดือน SCI TECH 2026',
      winners: [{ contestantId: 'c2', award: '' }, { contestantId: 'c1', award: 'ดาว' }],
      sound: false
    });

    // Editing the prepared list afterwards leaves the screen alone.
    const edited = reduce(announced, { type: 'SET_WINNERS', winners: [], headline: 'รองอันดับ 1' });
    expect(edited.winnerAnnouncement).toEqual(announced.winnerAnnouncement);

    expect(reduce(announced, { type: 'CLEAR_ANNOUNCEMENT' }).winnerAnnouncement).toBeUndefined();
  });

  it('announcing with nobody chosen only warns the operator', () => {
    const s = createInitialSession();
    const r = sessionReducer(s, { type: 'ANNOUNCE_WINNERS' }, ctx());
    expect(r.state).toBe(s);
    expect(r.effects).toEqual([{ type: 'NOTIFY', level: 'warning', message: expect.any(String) }]);
  });

  it('the controller may send the new commands over the channel', () => {
    for (const command of [
      { type: 'SET_STAGE_SCREEN', screen: 'winner' },
      { type: 'SET_WINNERS', winners: [{ contestantId: 'c1', award: '' }], headline: 'X' },
      { type: 'ANNOUNCE_WINNERS', sound: true },
      { type: 'CLEAR_ANNOUNCEMENT' }
    ]) {
      expect(parseChannelMessage({ kind: 'COMMAND', from: 'controller-1', command })).not.toBeNull();
    }
  });

  it('the screen and winners survive a reload of the stage; bad saved values are dropped', () => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
      ...createInitialSession(),
      stageScreen: 'winner',
      winners: [{ contestantId: 'c2', award: 'เดือน' }, { contestantId: 'c2', award: 'dup' }],
      winnerHeadline: 'THE WINNERS',
      winnerAnnouncement: { id: 'ann-1', at: 5, headline: 'ดาว', winners: [{ contestantId: 'c1', award: '' }], sound: true }
    }));
    const restored = loadPersistedSession();
    expect(restored.stageScreen).toBe('winner');
    expect(restored.winners).toEqual([{ contestantId: 'c2', award: 'เดือน' }]);
    expect(restored.winnerHeadline).toBe('THE WINNERS');
    expect(restored.winnerAnnouncement?.headline).toBe('ดาว');
    expect(sanitizeAnnouncement({ id: 'x', winners: [] })).toBeUndefined();
    expect(sanitizeAnnouncement({ winners: [{ contestantId: 'c1', award: '' }] })).toBeUndefined();

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ ...createInitialSession(), stageScreen: 'disco', winners: 'x', winnerHeadline: 7 }));
    const bad = loadPersistedSession();
    expect(stageScreenOf(bad)).toBe('quiz');
    expect(bad.winners).toEqual([]);
    expect(bad.winnerHeadline).toBe('');
    localStorage.clear();
  });
});

describe('editing the winner list', () => {
  const list: WinnerEntry[] = [{ contestantId: 'c1', award: 'ดาว' }, { contestantId: 'c2', award: '' }];

  it('toggles a contestant on and off, and stops at the limit', () => {
    expect(toggleWinner(list, 'c3')).toEqual([...list, { contestantId: 'c3', award: '' }]);
    expect(toggleWinner(list, 'c1')).toEqual([{ contestantId: 'c2', award: '' }]);
    const full = Array.from({ length: MAX_WINNERS }, (_, i) => ({ contestantId: `p${i}`, award: '' }));
    expect(toggleWinner(full, 'new')).toBe(full);
  });

  it('moves, removes, sets awards and drops deleted contestants', () => {
    expect(moveWinner(list, 'c2', -1).map(w => w.contestantId)).toEqual(['c2', 'c1']);
    expect(moveWinner(list, 'c1', -1)).toBe(list);
    expect(moveWinner(list, 'c2', 1)).toBe(list);
    expect(removeWinner(list, 'c1')).toEqual([{ contestantId: 'c2', award: '' }]);
    expect(setWinnerAward(list, 'c2', 'เดือน')[1]).toEqual({ contestantId: 'c2', award: 'เดือน' });
    expect(knownWinners(list, new Set(['c2']))).toEqual([{ contestantId: 'c2', award: '' }]);
  });

  it('knows when the prepared result is already the one on screen', () => {
    const on: WinnerAnnouncement = { id: 'a', at: 0, headline: 'ดาว', winners: list, sound: true };
    expect(isSameAsAnnounced('ดาว', list, on)).toBe(true);
    expect(isSameAsAnnounced('เดือน', list, on)).toBe(false);
    expect(isSameAsAnnounced('ดาว', setWinnerAward(list, 'c2', 'x'), on)).toBe(false);
    expect(isSameAsAnnounced('ดาว', list, undefined)).toBe(false);
  });
});

describe('winner posters and the standby image', () => {
  const posters = buildPosterIndex({
    '/Winner/เอ_สมชาย_ใจดี.jpg': '/assets/a.jpg',
    '/Winner/บี_สมหญิง_รักเรียน.jpg': '/assets/b.jpg'
  });

  it('finds a poster by photo key, else by nickname', () => {
    expect(winnerPosterUrl(PEOPLE[0], posters)).toBe('/assets/a.jpg');
    expect(winnerPosterUrl(PEOPLE[1], posters)).toBe('/assets/b.jpg');
    expect(winnerPosterUrl(PEOPLE[2], posters)).toBeUndefined();
    // Decomposed Thai in a file name still matches.
    const nfd = buildPosterIndex({ ['/Winner/' + 'น้ำ_น้ำทิพย์_ดีงาม.jpg'.normalize('NFD')]: '/n.jpg' });
    expect(winnerPosterUrl({ nickname: 'น้ำ' }, nfd)).toBe('/n.jpg');
  });

  it('falls back to the contestant photo, then to nothing (the number is shown)', () => {
    expect(winnerImage(PEOPLE[0], posters)).toEqual({ url: '/assets/a.jpg', kind: 'poster' });
    expect(winnerImage({ ...PEOPLE[2], avatarUrl: '/p.png' }, posters)).toEqual({ url: '/p.png', kind: 'photo' });
    expect(winnerImage(PEOPLE[2], posters)).toBeUndefined();
  });

  it('uses the first standby image by file name; tests never read the real folder', () => {
    expect(pickStandbyImage({ '/MainBlackground/b.jpg': '/b', '/MainBlackground/a.png': '/a' })).toBe('/a');
    expect(pickStandbyImage({})).toBeUndefined();
    expect(STANDBY_IMAGE_URL).toBeUndefined();
  });

  it('sizes posters by how many winners share the stage', () => {
    expect(winnerPosterHeightVh(1)).toBeGreaterThan(winnerPosterHeightVh(3));
    expect(winnerPosterHeightVh(3)).toBeGreaterThan(winnerPosterHeightVh(6));
    expect(winnerPosterHeightVh(12)).toBeLessThan(winnerPosterHeightVh(6));
  });

  it('puts up to 6 winners in one row, more in two even rows', () => {
    expect([1, 3, 6, 7, 8, 11, 12].map(winnersPerRow)).toEqual([1, 3, 6, 4, 4, 6, 6]);
  });
});

describe('stage screen components', () => {
  it('standby shows the key visual whole, or the event title without it', () => {
    const withImage = renderToString(<StandbyScreen active imageUrl="/key.jpg" />);
    expect(withImage).toContain('class="standby-image"');
    expect(withImage).toContain('src="/key.jpg"');
    const without = renderToString(<StandbyScreen active />);
    expect(without).toContain('standby-fallback');
    expect(renderToString(<StandbyScreen active={false} />)).toBe('');
  });

  const announcement = (patch: Partial<WinnerAnnouncement> = {}): WinnerAnnouncement => ({
    id: 'ann-1',
    at: Date.now(),
    headline: 'AMBASSADOR 2026',
    winners: [{ contestantId: 'c3', award: 'รองอันดับ 1' }, { contestantId: 'c1', award: 'ดาว' }, { contestantId: 'gone', award: 'x' }],
    sound: false,
    ...patch
  });

  it('winner screen shows each announced winner with award, name and number, in order', () => {
    const html = renderToString(<WinnerScreen active contestants={PEOPLE} announcement={announcement()} />);
    expect(html).toContain('aria-label="AMBASSADOR 2026"');
    expect(html).toContain('data-count="2"');
    expect(html.indexOf('มานะ ขยัน')).toBeLessThan(html.indexOf('เอ'));
    expect(html).toContain('รองอันดับ 1');
    expect(html).toContain('No. 05');
    expect(html).toContain('winner-number'); // no poster or photo in tests: the number is shown
  });

  it('a fresh announcement plays the reveal; an old one (stage reloaded) just shows the result', () => {
    const fresh = renderToString(<WinnerScreen active contestants={PEOPLE} announcement={announcement()} />);
    expect(fresh).toContain('is-fresh');
    expect(fresh).toContain('reveal-flash');
    expect(fresh).toContain('reveal-confetti');
    const old = renderToString(<WinnerScreen active contestants={PEOPLE} announcement={announcement({ at: Date.now() - 60_000 })} />);
    expect(old).toContain('is-settled');
    expect(old).not.toContain('reveal-flash');
  });

  it('before an announcement the winner screen waits with "and the winner is…"', () => {
    const html = renderToString(<WinnerScreen active contestants={PEOPLE} />);
    expect(html).toContain('winner-waiting');
    expect(html).toContain('And the winner is…');
    expect(html).not.toContain('winner-card');
  });

  it('splits a heading into letters, or into words when it has Thai (marks stay with their letter)', () => {
    expect(headlinePieces('THE WIN')).toEqual(['T', 'H', 'E', ' ', 'W', 'I', 'N']);
    expect(headlinePieces('ดาว  SCI TECH')).toEqual(['ดาว', ' ', 'SCI', ' ', 'TECH']);
    expect(headlinePieces('รองอันดับ 1')).toEqual(['รองอันดับ', ' ', '1']);
  });

  it('a Thai heading gets the Thai type style', () => {
    const html = renderToString(<WinnerScreen active contestants={PEOPLE} announcement={announcement({ headline: 'เดือน SCI TECH 2026' })} />);
    expect(html).toMatch(/class="winner-headline is-thai[^"]*"/);
  });
});

// ── Mounted: the stage and the winners page ──────────────────────────────────

async function settle() {
  await act(async () => {
    for (let i = 0; i < 20; i++) await new Promise(r => setTimeout(r, 0));
  });
}

let view: Mounted | null = null;
let host: HTMLElement | null = null;
const $ = (selector: string) => (host ?? view!.container).querySelector(selector);
const $$ = (selector: string) => Array.from((host ?? view!.container).querySelectorAll(selector));

beforeEach(() => {
  localStorage.clear();
  contestantsRepository.save(PEOPLE);
});
afterEach(async () => {
  await settle();
  view?.unmount();
  view = null;
  host?.remove();
  host = null;
  localStorage.clear();
});

function saveSession(patch: Partial<SessionState>) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ ...createInitialSession(), ...patch }));
}

async function renderStage() {
  view = mount(
    <MemoryRouter initialEntries={['/']}>
      <AppRoutes />
    </MemoryRouter>
  );
  for (let i = 0; i < 50 && !$('.stage-app-viewport'); i++) await settle();
}

async function pressKey(code: string, key: string) {
  await act(async () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code, key, bubbles: true }));
  });
}

/** Open the stage drawer (Esc) and pick a screen in it. */
async function switchScreenInDrawer(screen: 'quiz' | 'standby' | 'winner') {
  await pressKey('Escape', 'Escape');
  for (let i = 0; i < 50 && !$('.screen-switch--drawer'); i++) await settle();
  await act(async () => ($(`.screen-switch--drawer .screen-switch-btn--${screen}`) as HTMLButtonElement).click());
  await pressKey('Escape', 'Escape');
  await settle();
}

const pressSpace = () =>
  act(async () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
  });

describe('the stage window', () => {
  it('always opens on the standby screen, even when the saved session was on the spin screen', async () => {
    saveSession({ stageScreen: 'quiz' });
    await renderStage();
    expect($('[data-testid="standby-screen"]')).not.toBeNull();
    expect($('.stage-overlay')!.classList.contains('is-screen-hidden')).toBe(true);
  });

  it('standby covers the spin overlay, which is hidden and cannot be clicked', async () => {
    saveSession({ stageScreen: 'standby' });
    await renderStage();
    expect($('[data-testid="standby-screen"]')).not.toBeNull();
    expect($('.stage-overlay')!.classList.contains('is-screen-hidden')).toBe(true);
    expect($('[data-testid="winner-screen"]')).toBeNull();
  });

  it('Space on the projector does not start a spin behind the standby screen', async () => {
    saveSession({ stageScreen: 'standby' });
    await renderStage();
    await pressSpace();
    await settle();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION)!);
    expect(saved.currentState).toBe('idle');
    expect(saved.stageScreen).toBe('standby');
  });

  it('prepared winners stay hidden until they are announced', async () => {
    saveSession({ winners: [{ contestantId: 'c2', award: 'เดือน SCI TECH 2026' }] });
    await renderStage();
    await switchScreenInDrawer('winner');
    expect($('[data-testid="winner-waiting"]')).not.toBeNull();
    expect($$('.winner-card')).toHaveLength(0);
    expect($('[data-testid="winner-screen"]')!.textContent).not.toContain('บี');
  });

  it('the winner screen shows the announced winners', async () => {
    saveSession({
      winnerAnnouncement: { id: 'ann-9', at: Date.now(), headline: 'เดือน SCI TECH 2026', winners: [{ contestantId: 'c2', award: '' }], sound: false }
    });
    await renderStage();
    await switchScreenInDrawer('winner');
    const screen = $('[data-testid="winner-screen"]')!;
    expect(screen.querySelector('h1')!.getAttribute('aria-label')).toBe('เดือน SCI TECH 2026');
    expect(screen.textContent).toContain('บี');
    expect($$('.winner-card')).toHaveLength(1);
  });

  it('the spin screen has neither layer and the overlay is shown', async () => {
    await renderStage();
    await switchScreenInDrawer('quiz');
    for (let i = 0; i < 50 && $('[data-testid="standby-screen"]'); i++) await settle(); // fade-out
    expect($('[data-testid="standby-screen"]')).toBeNull();
    expect($('[data-testid="winner-screen"]')).toBeNull();
    expect($('.stage-overlay')!.classList.contains('is-screen-hidden')).toBe(false);
  });
});

describe('the winners page', () => {
  async function renderWinnersPage() {
    // Attached to the document so focus and blur work on the award fields.
    host = document.createElement('div');
    document.body.appendChild(host);
    const mounted = mount(
      <SessionProvider role="stage">
        <WinnersPage />
      </SessionProvider>
    );
    host.appendChild(mounted.container);
    view = mounted;
    await settle();
  }

  const savedSession = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION)!) as SessionState;

  const typeInto = async (input: HTMLInputElement, value: string) => {
    await act(async () => {
      input.focus();
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  it('clicking contestants adds them in order; clicking again takes them off', async () => {
    await renderWinnersPage();
    const tiles = $$('.win-pick') as HTMLButtonElement[];
    expect(tiles).toHaveLength(3);
    await act(async () => tiles[2].click());
    await act(async () => tiles[0].click());
    await settle();
    expect(savedSession().winners?.map(w => w.contestantId)).toEqual(['c3', 'c1']);
    expect($$('.win-row')).toHaveLength(2);
    await act(async () => ($$('.win-pick')[2] as HTMLButtonElement).click());
    await settle();
    expect(savedSession().winners?.map(w => w.contestantId)).toEqual(['c1']);
  });

  it('an award is sent when the field loses focus, and Escape drops the draft', async () => {
    saveSession({ winners: [{ contestantId: 'c1', award: '' }] });
    await renderWinnersPage();
    const award = $('.win-row-award') as HTMLInputElement;
    await typeInto(award, 'ดาว SCI TECH 2026');
    expect(savedSession().winners?.[0].award).toBe('');
    await act(async () => award.blur());
    await settle();
    expect(savedSession().winners?.[0].award).toBe('ดาว SCI TECH 2026');

    await typeInto(award, 'oops');
    await act(async () => {
      award.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    await settle();
    expect(savedSession().winners?.[0].award).toBe('ดาว SCI TECH 2026');
    expect(award.value).toBe('ดาว SCI TECH 2026');
  });

  it('pick a round, pick winners, then announce; later edits wait for the next announcement', async () => {
    await renderWinnersPage();
    const spin = $$('.screen-switch-btn').find(b => b.textContent?.includes('หน้าสุ่มคำ')) as HTMLButtonElement;
    await act(async () => spin.click());
    await settle();
    expect(savedSession().stageScreen).toBe('quiz');

    const announce = () => $('.win-announce-btn') as HTMLButtonElement;
    expect(announce().disabled).toBe(true);

    const chip = $$('.win-chip').find(b => b.textContent === 'เดือน SCI TECH 2026') as HTMLButtonElement;
    await act(async () => chip.click());
    await act(async () => ($$('.win-pick')[1] as HTMLButtonElement).click());
    await settle();
    expect(savedSession().winnerAnnouncement).toBeUndefined();
    expect(savedSession().stageScreen).toBe('quiz');

    await act(async () => announce().click());
    await settle();
    const on = savedSession().winnerAnnouncement!;
    expect(savedSession().stageScreen).toBe('winner');
    expect(on.headline).toBe('เดือน SCI TECH 2026');
    expect(on.winners.map(w => w.contestantId)).toEqual(['c2']);
    expect($('.win-onair')!.textContent).toContain('เดือน SCI TECH 2026');
    expect(announce().textContent).toContain('ประกาศซ้ำ');

    // Preparing the next award does not touch the screen.
    await act(async () => ($('.win-link-btn') as HTMLButtonElement).click());
    await settle();
    expect(savedSession().winners).toEqual([]);
    expect(savedSession().winnerAnnouncement).toEqual(on);

    await act(async () => ($('.win-hide-btn') as HTMLButtonElement).click());
    await settle();
    expect(savedSession().winnerAnnouncement).toBeUndefined();
  });
});
