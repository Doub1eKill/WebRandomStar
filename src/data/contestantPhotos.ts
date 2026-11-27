/// <reference types="vite/client" />
/**
 * Contestant photos read from the `Photo/` folder at the project root when the app is built.
 *
 * The folder is NOT in Git (the repository is public and these are real people), so a build
 * without it simply has no photos: the contestant list falls back to the placeholders and the
 * cards show the contestant number instead of a picture.
 *
 * File name format: `ชื่อเล่น_ชื่อจริง_นามสกุล.jpg`. Someone whose nickname is their first name
 * may leave it out (`ชื่อจริง_นามสกุล.jpg`); the nickname is then the first name.
 */
import type { Contestant } from '@/types/question.ts';

export interface PhotoName {
  nickname: string;
  firstName: string;
  lastName: string;
}

/** The file name without folder or extension, in NFC so Thai names compare the same everywhere. */
export function photoKeyOf(path: string): string {
  return path.replace(/^.*[\\/]/, '').replace(/\.[^.]+$/, '').normalize('NFC').trim();
}

/** Read `ชื่อเล่น_ชื่อจริง_นามสกุล` (or `ชื่อจริง_นามสกุล`) from a photo's file name. */
export function parsePhotoFileName(path: string): PhotoName | null {
  const parts = photoKeyOf(path).split('_').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return { nickname: parts[0], firstName: parts[0], lastName: '' };
  if (parts.length === 2) return { nickname: parts[0], firstName: parts[0], lastName: parts[1] };
  const [nickname, firstName, ...rest] = parts;
  return { nickname, firstName, lastName: rest.join(' ') };
}

/**
 * Turn photo files (path -> served URL) into a numbered contestant list, in Thai name order of
 * the file names, plus the photo URL for each photo key.
 */
export function buildPhotoContestants(files: Record<string, string>): { contestants: Contestant[]; urls: Record<string, string> } {
  const urls: Record<string, string> = {};
  const entries: { key: string; name: PhotoName }[] = [];
  for (const [path, url] of Object.entries(files)) {
    const name = parsePhotoFileName(path);
    if (!name) continue;
    const key = photoKeyOf(path);
    if (urls[key]) continue; // same name in two formats (.jpg and .png): keep the first
    urls[key] = url;
    entries.push({ key, name });
  }
  entries.sort((a, b) => a.key.localeCompare(b.key, 'th'));
  const contestants = entries.map(({ key, name }, i): Contestant => ({
    id: `photo:${key}`,
    number: i + 1,
    name: `${name.firstName} ${name.lastName}`.trim(),
    nickname: name.nickname,
    faculty: '',
    photoKey: key
  }));
  return { contestants, urls };
}

// Tests never read the real folder, so they behave the same with or without the photos.
const PHOTO_FILES: Record<string, string> = import.meta.env.MODE === 'test'
  ? {}
  : import.meta.glob<string>('/Photo/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url', import: 'default' });

const built = buildPhotoContestants(PHOTO_FILES);

/** The contestants found in `Photo/` (empty when the folder is missing). */
export const PHOTO_CONTESTANTS: Contestant[] = built.contestants;

/** The picture for a contestant: an explicit avatarUrl, else its photo from `Photo/`. */
export function contestantPhotoUrl(c: Pick<Contestant, 'avatarUrl' | 'photoKey'>, urls: Record<string, string> = built.urls): string | undefined {
  if (c.avatarUrl) return c.avatarUrl;
  return c.photoKey ? urls[c.photoKey.normalize('NFC')] : undefined;
}

/** How a contestant is listed in a dropdown: number, nickname (full name), faculty. */
export function contestantOptionLabel(c: Contestant): string {
  const nickname = c.nickname?.trim();
  const who = nickname && nickname !== c.name ? `${nickname} (${c.name})` : c.name;
  return `No. ${c.number} - ${who}${c.faculty ? ` · ${c.faculty}` : ''}`;
}
