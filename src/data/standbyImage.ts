/// <reference types="vite/client" />
/**
 * The event's key visual for the standby screen, read from the `MainBlackground/` folder at the
 * project root when the app is built (the folder name is spelled as it is on the show machine).
 *
 * The folder is NOT in Git. Without it the standby screen shows the event title over the
 * animated stage background instead. With several images, the first by file name is used.
 */

/** The first image by file name, or undefined when there is none. */
export function pickStandbyImage(files: Record<string, string>): string | undefined {
  const first = Object.keys(files).sort((a, b) => a.localeCompare(b))[0];
  return first ? files[first] : undefined;
}

// Tests never read the real folder, so they behave the same with or without the image.
const STANDBY_FILES: Record<string, string> = import.meta.env.MODE === 'test'
  ? {}
  : import.meta.glob<string>('/MainBlackground/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url', import: 'default' });

/** URL of the standby image (undefined in a build without `MainBlackground/`). */
export const STANDBY_IMAGE_URL: string | undefined = pickStandbyImage(STANDBY_FILES);
