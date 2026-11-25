import { Question, QuestionCategory } from '@/types/question.ts';
import { createPRNG, randomChoice } from '@/shared/lib/prng.ts';

export interface SelectQuestionOptions {
  questions: Question[];
  usedQuestionIds?: string[];
  round?: string;
  category?: QuestionCategory;
  difficulty?: string;
  seed?: number | string;
  allowRepeat?: boolean;
}

/**
 * B11: why the selector had to widen its search. Selection logic is unchanged; these only
 * let the operator know the question did not come from the requested round/category.
 */
export type SelectionFallbackReason =
  | 'round-empty'        // no enabled questions in the requested round → all rounds
  | 'category-empty'     // no questions of the requested category in that pool → whole pool
  | 'difficulty-empty'   // no questions of the requested difficulty → ignore difficulty
  | 'subset-exhausted'   // every question in the filtered pool was used → any unused question
  | 'bank-exhausted';    // every enabled question was used → repeats allowed again

export interface QuestionSelectionResult {
  selectedCategory: QuestionCategory;
  selectedQuestion: Question;
  remainingCount: number;
  seed: string;
  fallbackReasons: SelectionFallbackReason[];
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
  const fallbackReasons: SelectionFallbackReason[] = [];

  // 1. Initial pool of active enabled questions
  const enabledPool = questions.filter(q => q.enabled);
  if (enabledPool.length === 0) {
    return null;
  }

  // 2. Filter by Round if specified
  let roundPool = round ? enabledPool.filter(q => q.round.toLowerCase() === round.toLowerCase()) : enabledPool;
  if (roundPool.length === 0) {
    roundPool = enabledPool; // Fallback if no questions in round
    fallbackReasons.push('round-empty');
  }

  // 3. Filter by Category if specified
  let categoryPool = category ? roundPool.filter(q => q.category.toLowerCase() === category.toLowerCase()) : roundPool;
  if (categoryPool.length === 0) {
    categoryPool = roundPool; // Fallback to round pool if category exhausted
    fallbackReasons.push('category-empty');
  }

  // 4. Filter by Difficulty if specified
  let difficultyPool = difficulty ? categoryPool.filter(q => q.difficulty === difficulty) : categoryPool;
  if (difficultyPool.length === 0) {
    difficultyPool = categoryPool;
    fallbackReasons.push('difficulty-empty');
  }

  // 5. Exclude used questions unless allowRepeat is true
  let availablePool = allowRepeat ? difficultyPool : difficultyPool.filter(q => !usedQuestionIds.includes(q.id));

  // If exhausted in this subset, try global unused questions
  if (availablePool.length === 0 && !allowRepeat) {
    const globalUnused = enabledPool.filter(q => !usedQuestionIds.includes(q.id));
    if (globalUnused.length > 0) {
      availablePool = globalUnused;
      fallbackReasons.push('subset-exhausted');
    } else {
      // If entire question bank is exhausted, reset pool to enabled questions
      availablePool = enabledPool;
      fallbackReasons.push('bank-exhausted');
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
    seed: String(seed),
    fallbackReasons
  };
}
