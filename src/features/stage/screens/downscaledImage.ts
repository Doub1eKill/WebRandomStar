import { useEffect, useReducer } from 'react';

/**
 * Screen-sized copies of very large pictures (the standby key visual is ~6600 px wide, about
 * 100 MB once decoded). Painting the original makes the browser decode it again whenever it
 * leaves the decode cache, which can stall the switch to the standby screen on a modest show
 * laptop. The copy is made once, in the background, when the stage starts; until it is ready
 * (or if the browser cannot make one) the original is used, so nothing ever goes missing.
 */

const resolved = new Map<string, string>();
const pending = new Map<string, Promise<string>>();
const keyOf = (url: string, maxWidth: number) => `${maxWidth}|${url}`;

/** Width worth keeping for a full-screen picture on this display (at least 1920, at most 3840). */
export function screenImageWidth(): number {
  if (typeof window === 'undefined') return 1920;
  const physical = Math.round((window.screen?.width || 1920) * (window.devicePixelRatio || 1));
  return Math.min(3840, Math.max(1920, physical));
}

async function makeCopy(url: string, maxWidth: number): Promise<string> {
  const blob = await (await fetch(url)).blob();
  const full = await createImageBitmap(blob);
  if (full.width <= maxWidth) {
    full.close();
    return url;
  }
  const scaled = await createImageBitmap(full, { resizeWidth: maxWidth, resizeQuality: 'high' });
  full.close();
  const canvas = document.createElement('canvas');
  canvas.width = scaled.width;
  canvas.height = scaled.height;
  canvas.getContext('2d')?.drawImage(scaled, 0, 0);
  scaled.close();
  const out = await new Promise<Blob | null>(done => canvas.toBlob(done, 'image/jpeg', 0.92));
  return out ? URL.createObjectURL(out) : url;
}

/** Start making the copy (once per URL and width). Resolves to the copy, or the original. */
export function prepareDownscaledImage(url: string, maxWidth: number): Promise<string> {
  const key = keyOf(url, maxWidth);
  const done = resolved.get(key);
  if (done) return Promise.resolve(done);
  let job = pending.get(key);
  if (!job) {
    job = (typeof createImageBitmap === 'function' ? makeCopy(url, maxWidth) : Promise.resolve(url))
      .catch(() => url)
      .then(result => {
        resolved.set(key, result);
        pending.delete(key);
        return result;
      });
    pending.set(key, job);
  }
  return job;
}

/** The screen-sized copy when it is ready, the original until then. */
export function useDownscaledImage(url: string | undefined, maxWidth: number): string | undefined {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const key = url ? keyOf(url, maxWidth) : '';
  useEffect(() => {
    if (!url || resolved.has(key)) return;
    let live = true;
    prepareDownscaledImage(url, maxWidth).then(() => {
      if (live) rerender();
    });
    return () => {
      live = false;
    };
  }, [url, maxWidth, key]);
  return url ? resolved.get(key) ?? url : undefined;
}
