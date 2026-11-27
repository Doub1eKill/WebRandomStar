import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Contestant } from '@/types/question.ts';

// Pretend the Photo/ folder has two (made-up) contestants.
vi.mock('@/data/contestantPhotos.ts', () => ({
  PHOTO_CONTESTANTS: [
    { id: 'photo:ต้น_รักไทย', number: 1, name: 'ต้น รักไทย', nickname: 'ต้น', faculty: '', photoKey: 'ต้น_รักไทย' },
    { id: 'photo:เอ_สมชาย_ใจดี', number: 2, name: 'สมชาย ใจดี', nickname: 'เอ', faculty: '', photoKey: 'เอ_สมชาย_ใจดี' }
  ]
}));

const { DEFAULT_CONTESTANTS, PLACEHOLDER_CONTESTANTS, upgradePlaceholderList } = await import('@/data/defaultContestants.ts');
const { contestantsRepository, STORAGE_KEYS } = await import('@/storage/repositories.ts');

describe('with contestant photos', () => {
  beforeEach(() => localStorage.clear());

  it('the photo contestants are the defaults', () => {
    expect(DEFAULT_CONTESTANTS.map((c: Contestant) => c.nickname)).toEqual(['ต้น', 'เอ']);
    expect(contestantsRepository.load().map((c: Contestant) => c.nickname)).toEqual(['ต้น', 'เอ']);
  });

  it('a saved list that is still the untouched sample list is replaced', () => {
    expect(upgradePlaceholderList(PLACEHOLDER_CONTESTANTS)).toBe(DEFAULT_CONTESTANTS);
    localStorage.setItem(STORAGE_KEYS.CONTESTANTS, JSON.stringify(PLACEHOLDER_CONTESTANTS));
    expect(contestantsRepository.load().map((c: Contestant) => c.nickname)).toEqual(['ต้น', 'เอ']);
  });

  it('a list the operator edited is kept', () => {
    const edited = PLACEHOLDER_CONTESTANTS.slice(0, 3);
    expect(upgradePlaceholderList(edited)).toBe(edited);
    const renamed = PLACEHOLDER_CONTESTANTS.map((c: Contestant, i: number) => (i === 0 ? { ...c, name: 'ชื่อใหม่' } : c));
    expect(upgradePlaceholderList(renamed)).toBe(renamed);
  });
});
