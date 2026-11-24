import { useSyncExternalStore } from 'react';
import { Repository } from '../shared/lib/createRepository.ts';
import {
  questionsRepository,
  wordsRepository,
  contestantsRepository,
  historyRepository
} from '../storage/repositories.ts';

/**
 * B8: live view of a repository. Re-renders when this window saves it or another window
 * (stage / remote) changes it, so both windows always show the same data.
 */
export function useRepository<T>(repository: Repository<T>): T {
  // The third argument serves server/static rendering (renderToString) with the same data.
  return useSyncExternalStore(repository.subscribe, repository.load, repository.load);
}

export const useQuestions = () => useRepository(questionsRepository);
export const useWords = () => useRepository(wordsRepository);
export const useContestants = () => useRepository(contestantsRepository);
export const useHistory = () => useRepository(historyRepository);
