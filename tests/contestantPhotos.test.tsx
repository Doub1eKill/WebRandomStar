import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  parsePhotoFileName,
  buildPhotoContestants,
  contestantPhotoUrl,
  contestantOptionLabel,
  PHOTO_CONTESTANTS
} from '@/data/contestantPhotos.ts';
import { DEFAULT_CONTESTANTS, PLACEHOLDER_CONTESTANTS, upgradePlaceholderList } from '@/data/defaultContestants.ts';
import { ContestantBadge } from '@/features/stage/overlay/ContestantBadge.tsx';
import { Contestant } from '@/types/question.ts';

// Made-up names: the real ones live only in the (git-ignored) Photo/ folder.
describe('reading contestants from photo file names', () => {
  it('reads nickname_first_last', () => {
    expect(parsePhotoFileName('/Photo/เอ_สมชาย_ใจดี.jpg')).toEqual({ nickname: 'เอ', firstName: 'สมชาย', lastName: 'ใจดี' });
  });

  it('a nickname that is the first name may be written twice or left out', () => {
    expect(parsePhotoFileName('ต้น_ต้น_รักไทย.jpg')).toEqual({ nickname: 'ต้น', firstName: 'ต้น', lastName: 'รักไทย' });
    expect(parsePhotoFileName('C:\\Star\\Photo\\ต้น_รักไทย.png')).toEqual({ nickname: 'ต้น', firstName: 'ต้น', lastName: 'รักไทย' });
  });

  it('extra parts stay in the surname, and decomposed Thai is normalised', () => {
    expect(parsePhotoFileName('บี_สมหญิง_ณ_อยุธยา.jpg')).toEqual({ nickname: 'บี', firstName: 'สมหญิง', lastName: 'ณ อยุธยา' });
    const nfd = 'น้ำ_น้ำทิพย์_ดีงาม.jpg'.normalize('NFD');
    expect(parsePhotoFileName(nfd)?.nickname).toBe('น้ำ'.normalize('NFC'));
  });

  it('an empty name gives nothing', () => {
    expect(parsePhotoFileName('/Photo/.jpg')).toBeNull();
    expect(parsePhotoFileName('___.jpg')).toBeNull();
  });

  it('builds a numbered list in Thai order with each photo URL', () => {
    const { contestants, urls } = buildPhotoContestants({
      '/Photo/ต้น_รักไทย.jpg': '/assets/b.jpg',
      '/Photo/เอ_สมชาย_ใจดี.jpg': '/assets/a.jpg',
      '/Photo/เอ_สมชาย_ใจดี.png': '/assets/dup.png',
      '/Photo/.jpg': '/assets/none.jpg'
    });
    expect(contestants.map(c => [c.number, c.nickname, c.name])).toEqual([
      [1, 'ต้น', 'ต้น รักไทย'],
      [2, 'เอ', 'สมชาย ใจดี']
    ]);
    expect(contestants[1]).toMatchObject({ id: 'photo:เอ_สมชาย_ใจดี', faculty: '', photoKey: 'เอ_สมชาย_ใจดี' });
    expect(contestantPhotoUrl(contestants[1], urls)).toBe('/assets/a.jpg');
  });

  it('an explicit avatarUrl wins over the photo folder', () => {
    expect(contestantPhotoUrl({ avatarUrl: 'blob:x', photoKey: 'k' }, { k: '/assets/k.jpg' })).toBe('blob:x');
    expect(contestantPhotoUrl({ photoKey: 'missing' }, {})).toBeUndefined();
  });

  it('dropdown label shows the nickname, then the full name and faculty', () => {
    const c: Contestant = { id: 'x', number: 3, name: 'สมชาย ใจดี', nickname: 'เอ', faculty: '' };
    expect(contestantOptionLabel(c)).toBe('No. 3 - เอ (สมชาย ใจดี)');
    expect(contestantOptionLabel({ ...c, nickname: undefined, faculty: 'วิทย์' })).toBe('No. 3 - สมชาย ใจดี · วิทย์');
  });
});

describe('contestant list without the Photo folder (tests, CI)', () => {
  it('falls back to the placeholders and keeps a saved list as it is', () => {
    expect(PHOTO_CONTESTANTS).toEqual([]);
    expect(DEFAULT_CONTESTANTS).toBe(PLACEHOLDER_CONTESTANTS);
    expect(upgradePlaceholderList(PLACEHOLDER_CONTESTANTS)).toBe(PLACEHOLDER_CONTESTANTS);
  });
});

describe('stage contestant card', () => {
  const base: Contestant = { id: 'x', number: 7, name: 'สมชาย ใจดี', faculty: '' };

  it('shows the photo, number and nickname above the full name', () => {
    const html = renderToString(<ContestantBadge contestant={{ ...base, nickname: 'เอ', avatarUrl: '/assets/a.jpg' }} />);
    expect(html).toContain('class="contestant-photo"');
    expect(html).toContain('src="/assets/a.jpg"');
    expect(html).toContain('contestant-photo-number');
    expect(html).toContain('>07<');
    expect(html).toMatch(/contestant-nickname">เอ</);
    expect(html).toMatch(/contestant-fullname">สมชาย ใจดี</);
    // no title or faculty given: those rows are left out
    expect(html).not.toContain('contestant-title-tag');
    expect(html).not.toContain('contestant-faculty');
  });

  it('without a photo or nickname it keeps the number badge and the name', () => {
    const html = renderToString(<ContestantBadge contestant={{ ...base, faculty: 'คณะวิทย์', title: 'ดาว' }} />);
    expect(html).not.toContain('contestant-photo');
    expect(html).toContain('contestant-number-badge');
    expect(html).toMatch(/contestant-name">สมชาย ใจดี</);
    expect(html).toContain('คณะวิทย์');
  });
});
