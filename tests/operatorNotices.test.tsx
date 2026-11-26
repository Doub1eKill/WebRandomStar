import { act } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from './helpers/render.tsx';
import { selectNextQuestion } from '@/features/questions/questionSelector.ts';
import { notifyOperator, subscribeOperatorNotices, OperatorNotice } from '@/shared/notices/operatorNotices.ts';
import { OperatorToasts } from '@/shared/notices/OperatorToasts.tsx';
import { renderSession } from './helpers/session.tsx';
import { questionsRepository } from '@/storage/repositories.ts';
import { Question } from '@/types/question.ts';

const q = (id: string, round: string, enabled = true): Question => ({
  id, text: id, round, difficulty: 'medium', enabled
});

describe('B11: selectNextQuestion reports fallbacks without changing the pick logic', () => {
  const bank = [q('a', 'intro'), q('b', 'intro'), q('c', 'final')];

  it('no fallback when the requested pool has unused questions', () => {
    expect(selectNextQuestion({ questions: bank, round: 'intro', seed: 's' })?.fallbackReasons).toEqual([]);
  });

  it('round-empty', () => {
    const r = selectNextQuestion({ questions: bank, round: 'scenario', seed: 's' });
    expect(r?.fallbackReasons).toEqual(['round-empty']);
  });

  it('subset-exhausted', () => {
    const r = selectNextQuestion({ questions: bank, round: 'intro', usedQuestionIds: ['a', 'b'], seed: 's' });
    expect(r?.fallbackReasons).toEqual(['subset-exhausted']);
    expect(r?.selectedQuestion.id).toBe('c');
  });

  it('bank-exhausted', () => {
    const r = selectNextQuestion({ questions: bank, usedQuestionIds: ['a', 'b', 'c'], seed: 's' });
    expect(r?.fallbackReasons).toEqual(['bank-exhausted']);
  });
});

describe('B10: operator notices', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('startJourney with no usable questions raises an error notice instead of alert()', () => {
    const alertSpy = vi.fn();
    vi.stubGlobal('alert', alertSpy);
    questionsRepository.save([q('off', 'intro', false)]);
    const received: OperatorNotice[] = [];
    const unsubscribe = subscribeOperatorNotices(n => received.push(n));

    const h = renderSession();
    act(() => h.result.current.startJourney());

    expect(alertSpy).not.toHaveBeenCalled();
    expect(h.result.current.session.currentState).toBe('idle');
    expect(received.map(n => n.level)).toEqual(['error']);
    unsubscribe();
    h.unmount();
    vi.unstubAllGlobals();
  });

  it('startJourney warns when the question comes from outside the requested round', () => {
    questionsRepository.save([q('x', 'final')]);
    const received: OperatorNotice[] = [];
    const unsubscribe = subscribeOperatorNotices(n => received.push(n));

    const h = renderSession();
    act(() => h.result.current.startJourney());

    expect(h.result.current.session.currentState).toBe('pre-spin');
    expect(received.some(n => n.level === 'warning' && n.message.includes('ทุกรอบ'))).toBe(true);
    unsubscribe();
    h.unmount();
  });

  it('OperatorToasts shows a notice and hides it after a while', () => {
    const view = mount(<OperatorToasts />);
    act(() => { notifyOperator('warning', 'ทดสอบข้อความ'); });
    expect(view.container.textContent).toContain('ทดสอบข้อความ');
    act(() => { vi.advanceTimersByTime(7000); });
    expect(view.container.textContent).not.toContain('ทดสอบข้อความ');
    view.unmount();
  });
});
