import { describe, it, expect } from 'vitest';
import { DEFAULT_QUESTIONS } from '../src/data/defaultQuestions.ts';
import { DEFAULT_WORDS } from '../src/data/defaultWords.ts';
import { DEFAULT_CONTESTANTS } from '../src/data/defaultContestants.ts';
import { selectTargetWord } from '../src/engine/wordSelector.ts';
import { generateSpinReel, calculateDecelerationEasing } from '../src/engine/wordSpinEngine.ts';
import { selectNextQuestion } from '../src/engine/questionSelector.ts';
import { STAGE_SEQUENCE, getNextState } from '../src/engine/stateMachine.ts';
import { calculateRemainingMs, calculateTimeUsedMs } from '../src/engine/timerEngine.ts';
import { createHistoryRecord } from '../src/engine/historyManager.ts';

describe('End-to-End Royal Word Spin V3 Journey Simulation', () => {
  it('should successfully simulate the full 8-state Royal Word Spin journey', () => {
    let currentState = STAGE_SEQUENCE[0]; // idle
    const statesVisited: string[] = [currentState];

    while (currentState !== 'answered') {
      currentState = getNextState(currentState);
      statesVisited.push(currentState);
    }

    expect(statesVisited).toEqual(STAGE_SEQUENCE);
  });

  it('should guarantee reproducible word selection and question results with identical seeds', () => {
    const seed = 'pageant-final-2026-royal-spin';

    const word1 = selectTargetWord(DEFAULT_WORDS, undefined, seed);
    const word2 = selectTargetWord(DEFAULT_WORDS, undefined, seed);
    expect(word1).toEqual(word2);

    const run1 = selectNextQuestion({ questions: DEFAULT_QUESTIONS, category: word1?.category, seed });
    const run2 = selectNextQuestion({ questions: DEFAULT_QUESTIONS, category: word2?.category, seed });

    expect(run1?.selectedCategory).toBe(run2?.selectedCategory);
    expect(run1?.selectedQuestion.id).toBe(run2?.selectedQuestion.id);
    expect(run1?.selectedQuestion.text).toBe(run2?.selectedQuestion.text);
  });

  it('should simulate word reel generation with target word landing and deceleration easing', () => {
    const targetWord = DEFAULT_WORDS[0];
    const reel = generateSpinReel(DEFAULT_WORDS, targetWord, 30, 'seed_reel_sim');

    expect(reel.length).toBe(30);
    expect(reel[29]).toEqual(targetWord);

    // Test deceleration physics curve
    const easingHalf = calculateDecelerationEasing(0.5);
    const easingFull = calculateDecelerationEasing(1.0);
    expect(easingHalf).toBeGreaterThan(0.7);
    expect(easingFull).toBe(1.0);
  });

  it('should prevent duplicate questions across continuous consecutive rounds', () => {
    const usedQuestionIds: string[] = [];

    for (let round = 1; round <= 20; round++) {
      const seed = `contestant-round-${round}-${Date.now()}`;
      const result = selectNextQuestion({
        questions: DEFAULT_QUESTIONS,
        usedQuestionIds,
        seed
      });

      expect(result).not.toBeNull();
      if (result) {
        expect(usedQuestionIds.includes(result.selectedQuestion.id)).toBe(false);
        usedQuestionIds.push(result.selectedQuestion.id);
      }
    }

    expect(usedQuestionIds.length).toBe(20);
    const uniqueIds = new Set(usedQuestionIds);
    expect(uniqueIds.size).toBe(20);
  });

  it('should simulate full question lifecycle: word spin -> word lock -> reveal -> timer -> audit log', () => {
    // 1. Select Word
    const word = selectTargetWord(DEFAULT_WORDS, 'moon', 'seed_e2e_full');
    expect(word).not.toBeNull();
    expect(word?.category).toBe('moon');

    // 2. Select Question
    const selection = selectNextQuestion({
      questions: DEFAULT_QUESTIONS,
      category: word?.category,
      round: 'attitude',
      seed: 'seed_e2e_full'
    });
    expect(selection).not.toBeNull();
    const q = selection!.selectedQuestion;

    // 3. Timer Countdown simulation
    const durationMs = 90000;
    const startTimestamp = 100000;
    const now = startTimestamp + 42000; // 42 seconds elapsed
    const remainingMs = calculateRemainingMs(startTimestamp, durationMs, now);
    const timeUsedMs = calculateTimeUsedMs(durationMs, remainingMs);
    expect(remainingMs).toBe(48000);
    expect(timeUsedMs).toBe(42000);

    // 4. Create and audit History Record
    const contestant = DEFAULT_CONTESTANTS[0];
    const record = createHistoryRecord({
      sessionId: 'sess_e2e_v3_01',
      round: 'attitude',
      contestant,
      question: q,
      seed: selection!.seed,
      timerConfiguredMs: durationMs,
      timerUsedMs: timeUsedMs,
      isTimeout: false
    });

    expect(record.contestantName).toBe(contestant.name);
    expect(record.questionId).toBe(q.id);
    expect(record.timerUsedMs).toBe(42000);
    expect(record.result).toBe('completed');
  });
});
