import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadQuestions,
  saveQuestions,
  loadContestants,
  saveContestants,
  exportQuestionsAsJSON,
  parseImportedQuestions
} from '../src/utils/storage.ts';
import { DEFAULT_QUESTIONS } from '../src/data/defaultQuestions.ts';
import { DEFAULT_CONTESTANTS } from '../src/data/defaultContestants.ts';
import { Question } from '../src/types/question.ts';

describe('Storage Utilities & JSON Import/Export', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return default questions when storage is empty', () => {
    const questions = loadQuestions();
    expect(questions.length).toBe(DEFAULT_QUESTIONS.length);
  });

  it('should save and load modified questions to/from localStorage', () => {
    const custom: Question[] = [
      {
        id: 'CUSTOM_01',
        text: 'คำถามทดสอบระบบ',
        category: 'wind',
        difficulty: 'easy',
        round: 'attitude',
        enabled: true,
        tags: ['test']
      }
    ];
    saveQuestions(custom);
    const loaded = loadQuestions();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('CUSTOM_01');
  });

  it('should export questions as valid JSON string', () => {
    const jsonStr = exportQuestionsAsJSON(DEFAULT_QUESTIONS.slice(0, 3));
    const parsed = JSON.parse(jsonStr);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(3);
  });

  it('should parse and validate imported questions JSON correctly', () => {
    const validJson = JSON.stringify([
      {
        id: 'IMP_01',
        text: 'คำถามนำเข้า',
        category: 'rain',
        difficulty: 'medium',
        round: 'intro',
        enabled: true,
        tags: ['imported']
      }
    ]);

    const result = parseImportedQuestions(validJson);
    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
    expect(result.data?.[0].id).toBe('IMP_01');
  });

  it('should reject malformed or invalid imported JSON', () => {
    const malformed = '{ invalid json';
    const result1 = parseImportedQuestions(malformed);
    expect(result1.success).toBe(false);

    const missingFields = JSON.stringify([{ id: '1' }]); // missing text and category
    const result2 = parseImportedQuestions(missingFields);
    expect(result2.success).toBe(false);
  });

  it('should load and save contestants correctly', () => {
    expect(loadContestants().length).toBe(DEFAULT_CONTESTANTS.length);
    saveContestants(DEFAULT_CONTESTANTS.slice(0, 2));
    expect(loadContestants().length).toBe(2);
  });
});
