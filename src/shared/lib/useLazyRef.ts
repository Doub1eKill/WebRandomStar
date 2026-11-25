import { useRef, MutableRefObject } from 'react';

/**
 * Like useRef(init()) but runs `init` only once (PF2).
 * `useRef(new Thing())` evaluates `new Thing()` on every render and throws the result away.
 */
export function useLazyRef<T>(init: () => T): MutableRefObject<T> {
  const ref = useRef<T | null>(null);
  if (ref.current === null) {
    ref.current = init();
  }
  return ref as MutableRefObject<T>;
}
