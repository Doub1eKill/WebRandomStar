import { describe, it, expect } from 'vitest';
import { DEFAULT_QUESTIONS } from '../src/data/defaultQuestions.ts';
import { selectQuestionFlow } from '../src/engine/questionSelector.ts';
import { STAGE_SEQUENCE, getNextState } from '../src/engine/stateMachine.ts';

describe('End-to-End Season Transition Journey Simulation', () => {
  it('should successfully simulate the full 8-state natural transition journey', () => {
    let currentState = STAGE_SEQUENCE[0]; // idle
    const statesVisited: string[] = [currentState];

    while (currentState !== 'answered') {
      currentState = getNextState(currentState);
      statesVisited.push(currentState);
    }

    expect(statesVisited).toEqual(STAGE_SEQUENCE);
  });

  it('should guarantee reproducible question and meteor trajectories with identical seeds', () => {
    const seed = 'pageant-final-2026-round1';
    const viewport = { width: 1920, height: 1080 };

    const run1 = selectQuestionFlow(DEFAULT_QUESTIONS, [], seed, viewport);
    const run2 = selectQuestionFlow(DEFAULT_QUESTIONS, [], seed, viewport);

    expect(run1.selectedCategory).toBe(run2.selectedCategory);
    expect(run1.selectedQuestion.id).toBe(run2.selectedQuestion.id);
    expect(run1.selectedQuestion.text).toBe(run2.selectedQuestion.text);
    expect(run1.targetNode.x).toBe(run2.targetNode.x);
    expect(run1.targetNode.y).toBe(run2.targetNode.y);
    expect(run1.meteorTrajectory.startX).toBe(run2.meteorTrajectory.startX);
    expect(run1.meteorTrajectory.targetX).toBe(run2.targetNode.x);
    expect(run1.meteorTrajectory.targetY).toBe(run2.targetNode.y);
  });

  it('should prevent duplicate questions across continuous consecutive rounds', () => {
    const usedQuestionIds: string[] = [];
    const viewport = { width: 1920, height: 1080 };

    for (let round = 1; round <= 20; round++) {
      const seed = `contestant-round-${round}-${Date.now()}`;
      const result = selectQuestionFlow(DEFAULT_QUESTIONS, usedQuestionIds, seed, viewport);

      // Question selected must not have been used previously
      expect(usedQuestionIds.includes(result.selectedQuestion.id)).toBe(false);

      usedQuestionIds.push(result.selectedQuestion.id);
    }

    expect(usedQuestionIds.length).toBe(20);
    const uniqueIds = new Set(usedQuestionIds);
    expect(uniqueIds.size).toBe(20);
  });
});
