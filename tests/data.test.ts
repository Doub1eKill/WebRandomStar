import { describe, it, expect } from 'vitest';
import { DEFAULT_QUESTIONS } from '../src/data/defaultQuestions.ts';
import { DEFAULT_CONTESTANTS } from '../src/data/defaultContestants.ts';
import { QuestionCategory } from '../src/types/question.ts';

describe('Question and Contestant Data Integrity', () => {
  it('should have at least 35 default questions', () => {
    expect(DEFAULT_QUESTIONS.length).toBeGreaterThanOrEqual(35);
  });

  it('should cover all 7 natural categories', () => {
    const requiredCategories: QuestionCategory[] = ['rain', 'mist', 'wind', 'leaf', 'moon', 'star', 'final'];
    const presentCategories = new Set(DEFAULT_QUESTIONS.map(q => q.category));
    
    for (const cat of requiredCategories) {
      expect(presentCategories.has(cat)).toBe(true);
      // Each category must have at least 3 questions
      const count = DEFAULT_QUESTIONS.filter(q => q.category === cat).length;
      expect(count).toBeGreaterThanOrEqual(3);
    }
  });

  it('should not contain duplicate question IDs', () => {
    const ids = DEFAULT_QUESTIONS.map(q => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid contestant data', () => {
    expect(DEFAULT_CONTESTANTS.length).toBeGreaterThanOrEqual(5);
    const ids = DEFAULT_CONTESTANTS.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
