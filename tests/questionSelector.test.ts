import { describe, it, expect } from 'vitest';
import { selectNextQuestion } from '@/features/questions/questionSelector.ts';
import { Question } from '@/types/question.ts';
import { DEFAULT_QUESTIONS } from '@/data/defaultQuestions.ts';

const mockQuestions: Question[] = [
  { id: 'q1', text: 'Q1', difficulty: 'easy', round: 'intro', enabled: true, used: false },
  { id: 'q2', text: 'Q2', difficulty: 'medium', round: 'intro', enabled: true, used: true },
  { id: 'q3', text: 'Q3', difficulty: 'hard', round: 'final', enabled: true, used: false },
  { id: 'q4', text: 'Q4', difficulty: 'easy', round: 'intro', enabled: false, used: false }
];

describe('Decoupled Question Selector Engine (V2 - No Constellation/Meteor)', () => {
  it('should filter out disabled and used questions', () => {
    const result = selectNextQuestion({
      questions: mockQuestions,
      usedQuestionIds: ['q2'],
      round: 'intro'
    });
    expect(result).not.toBeNull();
    expect(result?.selectedQuestion.id).toBe('q1');
    expect(result?.remainingCount).toBe(0);
  });

  it('should produce 100% deterministic results with the same seed', () => {
    const res1 = selectNextQuestion({
      questions: DEFAULT_QUESTIONS,
      usedQuestionIds: [],
      seed: 'season-seed-123'
    });
    const res2 = selectNextQuestion({
      questions: DEFAULT_QUESTIONS,
      usedQuestionIds: [],
      seed: 'season-seed-123'
    });

    expect(res1?.selectedQuestion.id).toBe(res2?.selectedQuestion.id);
  });

  it('draws from the requested round only (categories were removed)', () => {
    for (let i = 0; i < 20; i++) {
      const result = selectNextQuestion({ questions: DEFAULT_QUESTIONS, round: 'final', seed: `round-test-${i}` });
      expect(result?.selectedQuestion.round).toBe('final');
      expect(result?.fallbackReasons).toEqual([]);
    }
  });

  it('should return null when question pool is empty or all disabled', () => {
    const emptyResult = selectNextQuestion({
      questions: [{ id: 'q0', text: 'disabled', difficulty: 'easy', round: 'intro', enabled: false }]
    });
    expect(emptyResult).toBeNull();
  });
});
