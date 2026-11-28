import { useEffect } from 'react';

// Kept for the life of the page so the browser holds on to the decoded pictures.
const preloaded = new Map<string, HTMLImageElement>();

/** Fetch and decode images ahead of time (each URL once per page). Missing URLs are skipped. */
export function preloadImage(url: string | undefined): void {
  if (!url || preloaded.has(url) || typeof Image === 'undefined') return;
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  preloaded.set(url, img);
  img.decode?.().catch(() => {});
}

export function usePreloadImages(urls: (string | undefined)[]): void {
  const key = urls.filter(Boolean).join('\n');
  useEffect(() => {
    key.split('\n').forEach(url => preloadImage(url || undefined));
  }, [key]);
}
