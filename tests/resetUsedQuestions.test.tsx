/** The question bank's "reset used questions" button (added 2026-11-26). */
import { act } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from './helpers/render.tsx';
import { QuestionBankDashboard } from '@/features/questions/bank/QuestionBankDashboard.tsx';
import { Question } from '@/types/question.ts';

const q = (id: string, used = false): Question => ({ id, text: id, difficulty: 'medium', round: 'intro', enabled: true, used });
const resetButton = (container: HTMLElement) =>
  [...container.querySelectorAll('button')].find(b => b.textContent?.includes('รีเซ็ตคำถามที่ใช้แล้ว')) as HTMLButtonElement;

describe('reset used questions', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('is disabled while no question is used', () => {
    const view = mount(<QuestionBankDashboard questions={[q('a'), q('b')]} usedQuestionIds={[]} onSaveQuestions={() => {}} />);
    expect(resetButton(view.container).disabled).toBe(true);
    expect(resetButton(view.container).textContent).toContain('(0)');
    view.unmount();
  });

  it('after confirming, clears the session list and any saved `used` flag', () => {
    vi.stubGlobal('confirm', () => true);
    const onSaveQuestions = vi.fn();
    const onResetUsedQuestions = vi.fn();
    const view = mount(
      <QuestionBankDashboard
        questions={[q('a'), q('b', true), q('c')]}
        usedQuestionIds={['a']}
        onSaveQuestions={onSaveQuestions}
        onResetUsedQuestions={onResetUsedQuestions}
      />
    );
    const button = resetButton(view.container);
    expect(button.textContent).toContain('(2)');
    act(() => button.click());

    expect(onResetUsedQuestions).toHaveBeenCalledTimes(1);
    expect(onSaveQuestions).toHaveBeenCalledTimes(1);
    const saved: Question[] = onSaveQuestions.mock.calls[0][0];
    expect(saved.map(x => x.id)).toEqual(['a', 'b', 'c']);
    expect(saved.every(x => !x.used)).toBe(true);
    view.unmount();
  });

  it('does nothing when the operator cancels', () => {
    vi.stubGlobal('confirm', () => false);
    const onResetUsedQuestions = vi.fn();
    const view = mount(
      <QuestionBankDashboard questions={[q('a')]} usedQuestionIds={['a']} onSaveQuestions={() => {}} onResetUsedQuestions={onResetUsedQuestions} />
    );
    act(() => resetButton(view.container).click());
    expect(onResetUsedQuestions).not.toHaveBeenCalled();
    view.unmount();
  });
});
