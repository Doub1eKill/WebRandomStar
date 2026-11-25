/** Tiny external store compatible with React's useSyncExternalStore. */
export interface Store<T> {
  getState: () => T;
  setState: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    setState: (next: T) => {
      if (Object.is(next, state)) return;
      state = next;
      listeners.forEach(fn => fn());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    }
  };
}
