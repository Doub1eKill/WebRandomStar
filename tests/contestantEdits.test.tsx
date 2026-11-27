import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { parseNumbersFile, buildPhotoContestants } from '@/data/contestantPhotos.ts';
import { addContestant, editContestant, fieldsOf, nextNumber, numberTakenBy } from '@/features/contestants/contestantEdits.ts';
import { ContestantManagerModal } from '@/features/contestants/ContestantManagerModal.tsx';
import { Contestant } from '@/types/question.ts';

// Made-up names only: the real ones stay in the git-ignored Photo/ folder.
describe('Photo/numbers.txt', () => {
  it('reads "nickname number" lines, with or without a space or ST', () => {
    const text = '# comment\n\nเอ 01\nบี02\nซี ST05\r\nดี: 7\nnot a line\n';
    expect(parseNumbersFile(text)).toEqual({ เอ: 1, บี: 2, ซี: 5, ดี: 7 });
  });

  it('numbers contestants from the file, skips gaps, and puts unlisted people last', () => {
    const files = {
      '/Photo/เอ_สมชาย_ใจดี.jpg': '/a.jpg',
      '/Photo/บี_สมหญิง_รักดี.jpg': '/b.jpg',
      '/Photo/ซี_สมศักดิ์_มีสุข.jpg': '/c.jpg',
      '/Photo/ดี_ดวงใจ_งามดี.jpg': '/d.jpg'
    };
    const { contestants } = buildPhotoContestants(files, { บี: 1, เอ: 2, ดี: 5 });
    expect(contestants.map(c => [c.number, c.nickname])).toEqual([[1, 'บี'], [2, 'เอ'], [5, 'ดี'], [6, 'ซี']]);
  });

  it('a number can be given by first name when the nickname is the first name', () => {
    const { contestants } = buildPhotoContestants({ '/Photo/ต้น_รักไทย.jpg': '/t.jpg' }, { ต้น: 9 });
    expect(contestants[0].number).toBe(9);
  });
});

const list: Contestant[] = [
  { id: 'photo:เอ', number: 1, name: 'สมชาย ใจดี', nickname: 'เอ', faculty: '', photoKey: 'เอ' },
  { id: 'photo:บี', number: 2, name: 'สมหญิง รักดี', nickname: 'บี', faculty: '', photoKey: 'บี' }
];

describe('editing contestants', () => {
  it('edits number and names in place, keeps the photo, and re-sorts by number', () => {
    const out = editContestant(list, 'photo:เอ', { ...fieldsOf(list[0]), number: 3, nickname: ' เอเอ ', name: 'สมชาย ใจงาม ' });
    expect(out.map(c => c.id)).toEqual(['photo:บี', 'photo:เอ']);
    expect(out[1]).toEqual({ id: 'photo:เอ', number: 3, name: 'สมชาย ใจงาม', nickname: 'เอเอ', faculty: '', photoKey: 'เอ' });
    expect(list[0].number).toBe(1); // the input list is not changed
  });

  it('clearing the nickname or title removes it', () => {
    const withTitle = [{ ...list[0], title: 'ดาว' }];
    const out = editContestant(withTitle, 'photo:เอ', { ...fieldsOf(withTitle[0]), nickname: '', title: '' });
    expect(out[0]).not.toHaveProperty('nickname');
    expect(out[0]).not.toHaveProperty('title');
  });

  it('adds a contestant in number order', () => {
    const out = addContestant(list, { number: 0, name: 'ใหม่ ทดสอบ', nickname: '', faculty: 'คณะ', title: 'เดือน' }, 'C_x');
    expect(out[0]).toEqual({ id: 'C_x', number: 0, name: 'ใหม่ ทดสอบ', faculty: 'คณะ', title: 'เดือน' });
  });

  it('finds a number clash and the next free number', () => {
    expect(numberTakenBy(list, 2, 'photo:เอ')?.id).toBe('photo:บี');
    expect(numberTakenBy(list, 1, 'photo:เอ')).toBeUndefined();
    expect(nextNumber(list)).toBe(3);
    expect(nextNumber([])).toBe(1);
  });
});

describe('contestant manager', () => {
  const render = (initialEditId?: string) => renderToString(
    <ContestantManagerModal isOpen contestants={list} onClose={vi.fn()} onSaveContestants={vi.fn()} initialEditId={initialEditId} />
  );

  it('every row has an edit and a delete button', () => {
    const html = render();
    expect(html.match(/btn-table-edit/g)).toHaveLength(2);
    expect(html.match(/btn-table-delete/g)).toHaveLength(2);
    expect(html).not.toContain('contestant-form');
  });

  it('opens straight into editing the contestant asked for, filled in', () => {
    const html = render('photo:บี');
    expect(html).toContain('แก้ไขข้อมูล บี');
    expect(html).toMatch(/id="cm-number"[^>]*value="2"/);
    expect(html).toMatch(/id="cm-nickname"[^>]*value="บี"/);
    expect(html).toMatch(/id="cm-name"[^>]*value="สมหญิง รักดี"/);
    expect(html).toContain('บันทึกการแก้ไข');
  });

  it('an unknown id just shows the list', () => {
    expect(render('nobody')).not.toContain('contestant-form');
  });
});
