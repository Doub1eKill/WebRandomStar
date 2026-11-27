import { Contestant } from '@/types/question.ts';
import { PHOTO_CONTESTANTS } from './contestantPhotos.ts';

/** The sample list used before the real contestants' photos were added (and when Photo/ is missing). */
export const PLACEHOLDER_CONTESTANTS: Contestant[] = [
  {
    id: 'C01',
    number: 1,
    name: 'นายกิตติกร อนันตโชติ',
    faculty: 'คณะวิศวกรรมศาสตร์',
    title: 'เดือน'
  },
  {
    id: 'C02',
    number: 2,
    name: 'นางสาวณิชากร พรรณราย',
    faculty: 'คณะแพทยศาสตร์',
    title: 'ดาว'
  },
  {
    id: 'C03',
    number: 3,
    name: 'นายภานุวัฒน์ เดชะกุล',
    faculty: 'คณะบริหารธุรกิจ',
    title: 'เดือน'
  },
  {
    id: 'C04',
    number: 4,
    name: 'นางสาวพิมพ์ชนก รัตนสุวรรณ',
    faculty: 'คณะสถาปัตยกรรมศาสตร์',
    title: 'ดาว'
  },
  {
    id: 'C05',
    number: 5,
    name: 'นายธนกฤต วงศ์สว่าง',
    faculty: 'คณะนิติศาสตร์',
    title: 'เดือน'
  },
  {
    id: 'C06',
    number: 6,
    name: 'นางสาวอภิชญา สิริวัฒนากุล',
    faculty: 'คณะศิลปศาสตร์',
    title: 'ดาว'
  },
  {
    id: 'C07',
    number: 7,
    name: 'นายวรเมธ เกียรติไพศาล',
    faculty: 'คณะวิทยาศาสตร์',
    title: 'เดือน'
  },
  {
    id: 'C08',
    number: 8,
    name: 'นางสาวกัญญารัตน์ โสภณพานิช',
    faculty: 'คณะนิเทศศาสตร์',
    title: 'ดาว'
  },
  {
    id: 'C09',
    number: 9,
    name: 'นายสิทธิชัย วัฒนากูล',
    faculty: 'คณะรัฐศาสตร์',
    title: 'เดือน'
  },
  {
    id: 'C10',
    number: 10,
    name: 'นางสาวชลธิชา บุญประเสริฐ',
    faculty: 'คณะเภสัชศาสตร์',
    title: 'ดาว'
  }
];

/** The contestants from Photo/ when there are any, else the sample list. */
export const DEFAULT_CONTESTANTS: Contestant[] = PHOTO_CONTESTANTS.length > 0 ? PHOTO_CONTESTANTS : PLACEHOLDER_CONTESTANTS;

/**
 * A saved list that is still exactly the sample list was never edited by the operator, so it is
 * swapped for the real contestants once their photos exist.
 */
export function upgradePlaceholderList(list: Contestant[] | null): Contestant[] | null {
  if (!list || PHOTO_CONTESTANTS.length === 0 || list.length !== PLACEHOLDER_CONTESTANTS.length) return list;
  const unchanged = list.every((c, i) => c.id === PLACEHOLDER_CONTESTANTS[i].id && c.name === PLACEHOLDER_CONTESTANTS[i].name);
  return unchanged ? PHOTO_CONTESTANTS : list;
}
