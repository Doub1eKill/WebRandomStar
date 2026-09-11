import { Question, QuestionCategory } from '../types/question.ts';
import { StarNode, MeteorTrajectory } from '../types/session.ts';
import { createPRNG, randomChoice, randomRange } from './prng.ts';

export interface QuestionSelectionResult {
  selectedCategory: QuestionCategory;
  selectedQuestion: Question;
  candidateNodes: StarNode[];
  targetNode: StarNode;
  meteorTrajectory: MeteorTrajectory;
  leafCoordinate: { x: number; y: number };
}

/**
 * Determine the question category based on leaf coordinate in normalized viewport space
 */
export function selectCategoryFromLeafPosition(
  x: number,
  y: number,
  width: number,
  height: number
): QuestionCategory {
  const normX = (x / width) * 2 - 1; // -1 to 1
  const normY = (y / height) * 2 - 1; // -1 (top) to 1 (bottom)

  const distFromCenter = Math.sqrt(normX * normX + normY * normY);

  // Center zone represents the enigmatic mist
  if (distFromCenter < 0.35) {
    return 'mist';
  }

  // Determine compass quadrant by angle
  const angle = Math.atan2(normY, normX); // -PI to PI
  const deg = (angle * 180) / Math.PI;

  // North (Top) -> Moon
  if (deg >= -135 && deg < -45) {
    return 'moon';
  }
  // East (Right) -> Star
  if (deg >= -45 && deg < 45) {
    return 'star';
  }
  // South (Bottom) -> Leaf
  if (deg >= 45 && deg < 135) {
    return 'leaf';
  }
  // West (Left) -> Wind
  return 'wind';
}

/**
 * Generate constellation nodes scattered nicely across viewport for candidates
 */
export function generateConstellationNodes(
  candidates: Question[],
  width: number,
  height: number,
  prng: () => number
): StarNode[] {
  const nodes: StarNode[] = [];
  const paddingX = width * 0.15;
  const paddingY = height * 0.18;

  const minDistance = Math.min(width, height) * 0.12;

  for (let i = 0; i < candidates.length; i++) {
    const question = candidates[i];
    let placed = false;
    let attempts = 0;
    let x = 0;
    let y = 0;

    while (!placed && attempts < 50) {
      attempts++;
      x = randomRange(paddingX, width - paddingX, prng);
      y = randomRange(paddingY, height - paddingY, prng);

      let tooClose = false;
      for (const existing of nodes) {
        const dx = existing.x - x;
        const dy = existing.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        placed = true;
      }
    }

    nodes.push({
      id: `star-node-${question.id}-${i}`,
      questionId: question.id,
      question,
      x,
      y,
      brightness: randomRange(0.7, 1.0, prng),
      radius: randomRange(4.5, 7.5, prng)
    });
  }

  return nodes;
}

/**
 * Calculate meteor trajectory entering from outside screen and passing through target node
 */
export function calculateMeteorTrajectory(
  targetNode: StarNode,
  width: number,
  height: number,
  prng: () => number
): MeteorTrajectory {
  // Meteor origins: top-left, top-center, top-right, or upper sides
  const originSide = prng() < 0.6 ? 'top' : (prng() < 0.5 ? 'left' : 'right');

  let startX = 0;
  let startY = 0;

  if (originSide === 'top') {
    startX = randomRange(width * 0.1, width * 0.9, prng);
    startY = -randomRange(40, 100, prng);
  } else if (originSide === 'left') {
    startX = -randomRange(40, 100, prng);
    startY = randomRange(height * 0.05, height * 0.4, prng);
  } else {
    startX = width + randomRange(40, 100, prng);
    startY = randomRange(height * 0.05, height * 0.4, prng);
  }

  // Vector from start to target
  const vx = targetNode.x - startX;
  const vy = targetNode.y - startY;
  const dist = Math.sqrt(vx * vx + vy * vy);
  const dirX = vx / dist;
  const dirY = vy / dist;

  // Extend path beyond target
  const overshoot = Math.max(width, height) * 0.6;
  const endX = targetNode.x + dirX * overshoot;
  const endY = targetNode.y + dirY * overshoot;

  const angle = Math.atan2(vy, vx);

  return {
    startX,
    startY,
    targetX: targetNode.x,
    targetY: targetNode.y,
    endX,
    endY,
    angle,
    speed: 18 + prng() * 6
  };
}

/**
 * High-level orchestration for selecting question, category, and visual nodes
 */
export function selectQuestionFlow(
  allQuestions: Question[],
  usedIds: string[],
  seed: string,
  viewport: { width: number; height: number },
  forceCategory?: QuestionCategory
): QuestionSelectionResult {
  const prng = createPRNG(seed);

  // 1. Calculate simulated leaf landing position
  const leafX = randomRange(viewport.width * 0.15, viewport.width * 0.85, prng);
  const leafY = randomRange(viewport.height * 0.15, viewport.height * 0.85, prng);

  const selectedCategory: QuestionCategory =
    forceCategory || selectCategoryFromLeafPosition(leafX, leafY, viewport.width, viewport.height);

  // 2. Filter available questions
  const categoryPool = allQuestions.filter(q => q.enabled && q.category === selectedCategory);
  let availablePool = categoryPool.filter(q => !usedIds.includes(q.id));

  // If all questions in this category are exhausted, fallback to unused questions from the global pool (Section 25)
  if (availablePool.length === 0) {
    const globalUnused = allQuestions.filter(q => q.enabled && !usedIds.includes(q.id));
    if (globalUnused.length > 0) {
      availablePool = globalUnused;
    } else {
      // If the entire question bank across all categories is exhausted, cycle back
      availablePool = categoryPool.length > 0 ? categoryPool : allQuestions.filter(q => q.enabled);
    }
  }

  // 3. Pick candidate questions (up to 5-7 questions)
  const candidateCount = Math.min(Math.max(4, Math.floor(randomRange(4, 7, prng))), availablePool.length);
  const shuffled = [...availablePool].sort(() => prng() - 0.5);
  const candidates = shuffled.slice(0, candidateCount);

  // 4. Generate Constellation Star Nodes
  const candidateNodes = generateConstellationNodes(candidates, viewport.width, viewport.height, prng);

  // 5. Select target winning node
  const targetNode = randomChoice(candidateNodes, prng);
  const selectedQuestion = targetNode.question;

  // Center target position for natural leaf landing and question bloom
  const centerX = viewport.width * 0.5;
  const centerY = viewport.height * 0.46;
  targetNode.x = centerX;
  targetNode.y = centerY;

  // 6. Calculate Trajectory striking target center
  const meteorTrajectory = calculateMeteorTrajectory(targetNode, viewport.width, viewport.height, prng);
  meteorTrajectory.targetX = centerX;
  meteorTrajectory.targetY = centerY;

  return {
    selectedCategory,
    selectedQuestion,
    candidateNodes,
    targetNode,
    meteorTrajectory,
    leafCoordinate: { x: centerX, y: centerY }
  };
}
