import { describe, it, expect } from 'vitest';
import { DEFAULT_QUESTIONS } from '@/data/defaultQuestions.ts';
import { DEFAULT_CONTESTANTS } from '@/data/defaultContestants.ts';
import { DEFAULT_WORDS } from '@/data/defaultWords.ts';
import { DEFAULT_APPEARANCE_SETTINGS } from '@/types/appearance.ts';
import { QUESTION_ROUNDS } from '@/features/questions/importQuestions.ts';

describe('Question, Contestant and Word Bank Data Integrity', () => {
  it('should have at least 35 default questions', () => {
    expect(DEFAULT_QUESTIONS.length).toBeGreaterThanOrEqual(35);
  });

  it('has questions for every round (questions are drawn by round only)', () => {
    for (const round of QUESTION_ROUNDS) {
      expect(DEFAULT_QUESTIONS.filter(q => q.round === round).length).toBeGreaterThanOrEqual(3);
    }
  });

  it('carries no category: categories were removed', () => {
    for (const item of [...DEFAULT_QUESTIONS, ...DEFAULT_WORDS]) {
      expect(item).not.toHaveProperty('category');
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

  it('should have valid default keywords in Word Bank', () => {
    expect(DEFAULT_WORDS.length).toBeGreaterThanOrEqual(8);
    const wordIds = DEFAULT_WORDS.map(w => w.id);
    const uniqueWordIds = new Set(wordIds);
    expect(uniqueWordIds.size).toBe(wordIds.length);

    // Each word must have a valid word string and its English subtitle
    for (const item of DEFAULT_WORDS) {
      expect(item.word.trim().length).toBeGreaterThan(0);
      expect(item.englishTheme?.trim().length).toBeGreaterThan(0);
      expect(item.enabled).toBe(true);
    }
  });

  it('should have valid appearance default settings', () => {
    expect(DEFAULT_APPEARANCE_SETTINGS.themeName).toBe('luxury-winter-pageant');
    expect(DEFAULT_APPEARANCE_SETTINGS.spinMode).toBe('vertical');
    expect(DEFAULT_APPEARANCE_SETTINGS.spinDurationMs).toBeGreaterThan(1000);
  });
});
