/** The keyword bank's used badge, count and "reset used keywords" button (added 2026-11-26). */
import { act } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from './helpers/render.tsx';
import { WordBankDashboard } from '@/features/words/WordBankDashboard.tsx';
import { KeywordItem } from '@/types/word.ts';

const words: KeywordItem[] = [
  { id: 'w1', word: 'หนึ่ง', enabled: true },
  { id: 'w2', word: 'สอง', enabled: true },
  { id: 'w3', word: 'สาม', enabled: true }
];
const noop = () => {};
const render = (usedWordIds: string[], onResetUsedWords = vi.fn()) =>
  mount(
    <WordBankDashboard
      words={words}
      usedWordIds={usedWordIds}
      onResetUsedWords={onResetUsedWords}
      onSaveWord={noop}
      onDeleteWord={noop}
      onToggleWord={noop}
      onResetWords={noop}
    />
  );
const resetButton = (container: HTMLElement) =>
  [...container.querySelectorAll('button')].find(b => b.textContent?.includes('รีเซ็ตคำที่ใช้แล้ว')) as HTMLButtonElement;

describe('keyword bank: used keywords', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('marks used keywords and counts them', () => {
    const view = render(['w2']);
    const rows = [...view.container.querySelectorAll('tbody tr')];
    expect(rows.map(r => Boolean(r.querySelector('.word-used-badge')))).toEqual([false, true, false]);
    expect(resetButton(view.container).textContent).toContain('(1)');
    expect(resetButton(view.container).disabled).toBe(false);
    view.unmount();
  });

  it('the reset button is disabled while nothing is used', () => {
    const view = render([]);
    expect(resetButton(view.container).disabled).toBe(true);
    view.unmount();
  });

  it('resets after confirming, and not when cancelled', () => {
    const onReset = vi.fn();
    vi.stubGlobal('confirm', () => false);
    const view = render(['w1', 'w3'], onReset);
    act(() => resetButton(view.container).click());
    expect(onReset).not.toHaveBeenCalled();

    vi.stubGlobal('confirm', () => true);
    act(() => resetButton(view.container).click());
    expect(onReset).toHaveBeenCalledTimes(1);
    view.unmount();
  });
});
