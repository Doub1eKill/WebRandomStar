import { describe, it, expect } from 'vitest';
import { selectNextQuestion } from '../src/engine/questionSelector.ts';
import { Question } from '../src/types/question.ts';
import { DEFAULT_QUESTIONS } from '../src/data/defaultQuestions.ts';

const mockQuestions: Question[] = [
  { id: 'q1', text: 'Q1', category: 'Rain', difficulty: 'easy', round: 'intro', enabled: true, used: false },
  { id: 'q2', text: 'Q2', category: 'Wind', difficulty: 'medium', round: 'intro', enabled: true, used: true },
  { id: 'q3', text: 'Q3', category: 'Wind', difficulty: 'hard', round: 'final', enabled: true, used: false },
  { id: 'q4', text: 'Q4', category: 'Leaf', difficulty: 'easy', round: 'intro', enabled: false, used: false }
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
    expect(res1?.selectedCategory).toBe(res2?.selectedCategory);
  });

  it('should filter by category when requested', () => {
    const result = selectNextQuestion({
      questions: DEFAULT_QUESTIONS,
      category: 'Rain',
      seed: 'category-test'
    });
    expect(result?.selectedQuestion.category.toLowerCase()).toBe('rain');
  });

  it('should return null when question pool is empty or all disabled', () => {
    const emptyResult = selectNextQuestion({
      questions: [{ id: 'q0', text: 'disabled', category: 'Rain', difficulty: 'easy', round: 'intro', enabled: false }]
    });
    expect(emptyResult).toBeNull();
  });
});
