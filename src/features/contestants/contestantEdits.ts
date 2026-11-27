/** Pure list edits for the contestant manager (add / edit), kept apart so they are easy to test. */
import { Contestant } from '@/types/question.ts';

/** The fields the manager form edits. */
export interface ContestantFields {
  number: number;
  name: string;
  nickname: string;
  faculty: string;
  title: string;
}

export function fieldsOf(c: Contestant): ContestantFields {
  return {
    number: Number(c.number) || 0,
    name: c.name,
    nickname: c.nickname ?? '',
    faculty: c.faculty ?? '',
    title: c.title ?? ''
  };
}

export function sortByNumber(list: Contestant[]): Contestant[] {
  return [...list].sort((a, b) => Number(a.number) - Number(b.number));
}

/** Copy the form fields onto a contestant: trims text, and leaves out an empty nickname / title. */
function withFields(c: Contestant, f: ContestantFields): Contestant {
  const { nickname: _n, title: _t, ...rest } = c;
  return {
    ...rest,
    number: f.number,
    name: f.name.trim(),
    faculty: f.faculty.trim(),
    ...(f.nickname.trim() ? { nickname: f.nickname.trim() } : {}),
    ...(f.title.trim() ? { title: f.title.trim() } : {})
  };
}

/** Edit one contestant in place; everything else about them (id, photo) stays. */
export function editContestant(list: Contestant[], id: string, f: ContestantFields): Contestant[] {
  return sortByNumber(list.map(c => (c.id === id ? withFields(c, f) : c)));
}

export function addContestant(list: Contestant[], f: ContestantFields, id: string): Contestant[] {
  return sortByNumber([...list, withFields({ id, number: f.number, name: '', faculty: '' }, f)]);
}

/** Another contestant who already has this number, if any. */
export function numberTakenBy(list: Contestant[], number: number, exceptId?: string): Contestant | undefined {
  return list.find(c => c.id !== exceptId && Number(c.number) === number);
}

/** The next free number after the highest one. */
export function nextNumber(list: Contestant[]): number {
  return Math.max(0, ...list.map(c => Number(c.number) || 0)) + 1;
}
