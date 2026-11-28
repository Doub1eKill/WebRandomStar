/**
 * OBS / stage-only mode: open the stage as `#/?obs=1` (or `/?obs=1#/`) for a window that is
 * captured into OBS. The page then shows the stage only — no operator drawer or modals, no
 * keyboard shortcuts, no operator notices, no clicks and no cursor — so nothing backstage can
 * appear in the capture by accident. The stage is driven from the control window as usual.
 */
import { useLocation } from 'react-router';

/** `obs`, `obs=1`, `obs=true`, `obs=yes` turn it on; `obs=0` / `obs=false` / `obs=no` keep it off. */
export function isObsModeSearch(search: string): boolean {
  const params = new URLSearchParams(search);
  if (!params.has('obs')) return false;
  const value = (params.get('obs') || '').trim().toLowerCase();
  return !['0', 'false', 'no', 'off'].includes(value);
}

/** Reads the query inside the hash route (`#/?obs=1`) and the page URL's own query (`/?obs=1#/`). */
export function useObsMode(): boolean {
  const { search } = useLocation();
  const pageSearch = typeof window === 'undefined' ? '' : window.location.search;
  return isObsModeSearch(search) || isObsModeSearch(pageSearch);
}
