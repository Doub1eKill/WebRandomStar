import { describe, it, expect } from 'vitest';
import {
  selectCategoryFromLeafPosition,
  generateConstellationNodes,
  calculateMeteorTrajectory,
  selectQuestionFlow
} from '../src/engine/questionSelector.ts';
import { DEFAULT_QUESTIONS } from '../src/data/defaultQuestions.ts';
import { createPRNG } from '../src/engine/prng.ts';

describe('Question Selector & Natural Trajectory Engine', () => {
  it('should correctly map leaf coordinates to categories', () => {
    const width = 1000;
    const height = 1000;

    // Center -> mist
    expect(selectCategoryFromLeafPosition(500, 500, width, height)).toBe('mist');

    // North (Top) -> moon
    expect(selectCategoryFromLeafPosition(500, 100, width, height)).toBe('moon');

    // South (Bottom) -> leaf
    expect(selectCategoryFromLeafPosition(500, 900, width, height)).toBe('leaf');

    // East (Right) -> star
    expect(selectCategoryFromLeafPosition(900, 500, width, height)).toBe('star');

    // West (Left) -> wind
    expect(selectCategoryFromLeafPosition(100, 500, width, height)).toBe('wind');
  });

  it('should generate constellation nodes within screen bounds', () => {
    const prng = createPRNG('constellation-seed');
    const candidates = DEFAULT_QUESTIONS.slice(0, 5);
    const nodes = generateConstellationNodes(candidates, 1920, 1080, prng);

    expect(nodes.length).toBe(5);
    for (const node of nodes) {
      expect(node.x).toBeGreaterThanOrEqual(100);
      expect(node.x).toBeLessThanOrEqual(1820);
      expect(node.y).toBeGreaterThanOrEqual(100);
      expect(node.y).toBeLessThanOrEqual(980);
      expect(node.questionId).toBeDefined();
    }
  });

  it('should calculate a meteor trajectory that passes directly through target node', () => {
    const prng = createPRNG('meteor-seed');
    const targetNode = {
      id: 'node-1',
      questionId: 'Q01',
      question: DEFAULT_QUESTIONS[0],
      x: 600,
      y: 400,
      brightness: 1,
      radius: 6
    };

    const trajectory = calculateMeteorTrajectory(targetNode, 1920, 1080, prng);

    // Target node coordinates must match
    expect(trajectory.targetX).toBe(600);
    expect(trajectory.targetY).toBe(400);

    // Start must be outside or at top/sides of screen
    const isOutsideTopOrSide = trajectory.startY <= 0 || trajectory.startX <= 0 || trajectory.startX >= 1920;
    expect(isOutsideTopOrSide).toBe(true);

    // End must be past the target in the direction of vector
    const dx1 = targetNode.x - trajectory.startX;
    const dy1 = targetNode.y - trajectory.startY;
    const dx2 = trajectory.endX - targetNode.x;
    const dy2 = trajectory.endY - targetNode.y;

    // Dot product between incoming direction and outgoing direction must be positive (same line direction)
    expect(dx1 * dx2 + dy1 * dy2).toBeGreaterThan(0);
  });

  it('should execute full deterministic question selection flow without duplicate questions', () => {
    const usedIds: string[] = ['Q_RAIN_01', 'Q_RAIN_02'];
    const result1 = selectQuestionFlow(DEFAULT_QUESTIONS, usedIds, 'seed-test-101', { width: 1920, height: 1080 });
    const result2 = selectQuestionFlow(DEFAULT_QUESTIONS, usedIds, 'seed-test-101', { width: 1920, height: 1080 });

    // Seeded determinism
    expect(result1.selectedQuestion.id).toBe(result2.selectedQuestion.id);
    expect(result1.selectedCategory).toBe(result2.selectedCategory);
    expect(result1.targetNode.id).toBe(result2.targetNode.id);
    expect(result1.candidateNodes.length).toBeGreaterThan(0);

    // Fairness - never selects already used question
    expect(usedIds.includes(result1.selectedQuestion.id)).toBe(false);
  });
});
