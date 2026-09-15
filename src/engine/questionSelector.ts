import { Question, QuestionCategory } from '../types/question.ts';
import { createPRNG, randomChoice } from './prng.ts';

export interface SelectQuestionOptions {
  questions: Question[];
  usedQuestionIds?: string[];
  round?: string;
  category?: QuestionCategory;
  difficulty?: string;
  seed?: number | string;
  allowRepeat?: boolean;
}

export interface QuestionSelectionResult {
  selectedCategory: QuestionCategory;
  selectedQuestion: Question;
  remainingCount: number;
  seed: string;
}

/**
 * Pure Question Selector decoupled from Canvas rendering.
 * Filters questions by status, round, category, and used status with PRNG selection.
 */
export function selectNextQuestion(options: SelectQuestionOptions): QuestionSelectionResult | null {
  const {
    questions,
    usedQuestionIds = [],
    round,
    category,
    difficulty,
    seed = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    allowRepeat = false
  } = options;

  const prng = createPRNG(seed);

  // 1. Initial pool of active enabled questions
  const enabledPool = questions.filter(q => q.enabled);
  if (enabledPool.length === 0) {
    return null;
  }

  // 2. Filter by Round if specified
  let roundPool = round ? enabledPool.filter(q => q.round.toLowerCase() === round.toLowerCase()) : enabledPool;
  if (roundPool.length === 0) {
    roundPool = enabledPool; // Fallback if no questions in round
  }

  // 3. Filter by Category if specified
  let categoryPool = category ? roundPool.filter(q => q.category.toLowerCase() === category.toLowerCase()) : roundPool;
  if (categoryPool.length === 0) {
    categoryPool = roundPool; // Fallback to round pool if category exhausted
  }

  // 4. Filter by Difficulty if specified
  let difficultyPool = difficulty ? categoryPool.filter(q => q.difficulty === difficulty) : categoryPool;
  if (difficultyPool.length === 0) {
    difficultyPool = categoryPool;
  }

  // 5. Exclude used questions unless allowRepeat is true
  let availablePool = allowRepeat ? difficultyPool : difficultyPool.filter(q => !usedQuestionIds.includes(q.id));

  // If exhausted in this subset, try global unused questions
  if (availablePool.length === 0 && !allowRepeat) {
    const globalUnused = enabledPool.filter(q => !usedQuestionIds.includes(q.id));
    if (globalUnused.length > 0) {
      availablePool = globalUnused;
    } else {
      // If entire question bank is exhausted, reset pool to enabled questions
      availablePool = enabledPool;
    }
  }

  if (availablePool.length === 0) {
    return null;
  }

  // 6. Deterministic PRNG choice
  const selectedQuestion = randomChoice(availablePool, prng);
  const remainingCount = availablePool.length - 1;

  return {
    selectedCategory: selectedQuestion.category,
    selectedQuestion,
    remainingCount,
    seed: String(seed)
  };
}

/**
 * Backward-compatible wrapper for legacy orchestrator calls
 */
export function selectQuestionFlow(
  allQuestions: Question[],
  usedIds: string[],
  seed: string,
  _viewport?: { width: number; height: number },
  forceCategory?: QuestionCategory
): QuestionSelectionResult | null {
  return selectNextQuestion({
    questions: allQuestions,
    usedQuestionIds: usedIds,
    category: forceCategory,
    seed
  });
}
