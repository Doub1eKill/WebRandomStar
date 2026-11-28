/// <reference types="vite/client" />
/**
 * Winner posters read from the `Winner/` folder at the project root when the app is built.
 *
 * Like `Photo/`, the folder is NOT in Git (real people, public repository). Its files use the
 * same names as the photos in `Photo/` (`ชื่อเล่น_ชื่อจริง_นามสกุล.jpg`), so a contestant's poster
 * is found by their photo key, or else by nickname. A contestant without a poster falls back to
 * their photo from `Photo/`, and the winner screen shows their number when there is neither.
 */
import type { Contestant } from '@/types/question.ts';
import { contestantPhotoUrl, parsePhotoFileName, photoKeyOf } from './contestantPhotos.ts';

export interface PosterIndex {
  /** photo key (file name without extension, NFC) -> URL */
  byKey: Record<string, string>;
  /** nickname (NFC) -> URL, for contestants that were added or renamed in the app */
  byNickname: Record<string, string>;
}

/** Index poster files (path -> served URL) by file name and by the nickname in the file name. */
export function buildPosterIndex(files: Record<string, string>): PosterIndex {
  const byKey: Record<string, string> = {};
  const byNickname: Record<string, string> = {};
  for (const path of Object.keys(files).sort((a, b) => a.localeCompare(b, 'th'))) {
    const key = photoKeyOf(path);
    if (!key || byKey[key]) continue;
    byKey[key] = files[path];
    const nickname = parsePhotoFileName(path)?.nickname.normalize('NFC');
    if (nickname && !byNickname[nickname]) byNickname[nickname] = files[path];
  }
  return { byKey, byNickname };
}

// Tests never read the real folder, so they behave the same with or without the posters.
const POSTER_FILES: Record<string, string> = import.meta.env.MODE === 'test'
  ? {}
  : import.meta.glob<string>('/Winner/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url', import: 'default' });

const POSTERS = buildPosterIndex(POSTER_FILES);

/** The contestant's poster from `Winner/`, or undefined when there is none. */
export function winnerPosterUrl(c: Pick<Contestant, 'photoKey' | 'nickname'>, posters: PosterIndex = POSTERS): string | undefined {
  const key = c.photoKey?.normalize('NFC');
  if (key && posters.byKey[key]) return posters.byKey[key];
  const nickname = c.nickname?.trim().normalize('NFC');
  return nickname ? posters.byNickname[nickname] : undefined;
}

/** What the winner screen shows for a contestant: poster, else photo, else nothing (number). */
export function winnerImage(
  c: Pick<Contestant, 'photoKey' | 'nickname' | 'avatarUrl'>,
  posters: PosterIndex = POSTERS
): { url: string; kind: 'poster' | 'photo' } | undefined {
  const poster = winnerPosterUrl(c, posters);
  if (poster) return { url: poster, kind: 'poster' };
  const photo = contestantPhotoUrl(c);
  return photo ? { url: photo, kind: 'photo' } : undefined;
}
