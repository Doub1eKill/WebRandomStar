import React, { Profiler, act } from 'react';
import { createRoot, Root } from 'react-dom/client';

// Tell React this environment supports act() so state updates flush synchronously.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

export interface Mounted {
  /** Number of React commits inside the mounted tree since mount. */
  commits: () => number;
  unmount: () => void;
}

/** Mount an element inside a <Profiler> so tests can count commits. */
export function mount(element: React.ReactElement): Mounted {
  let commits = 0;
  const container = document.createElement('div');
  let root!: Root;
  act(() => {
    root = createRoot(container);
    root.render(
      <Profiler id="probe" onRender={() => { commits++; }}>
        {element}
      </Profiler>
    );
  });
  return {
    commits: () => commits,
    unmount: () => act(() => root.unmount())
  };
}

export interface HookResult<T> extends Mounted {
  result: { current: T };
}

/** Minimal renderHook: re-renders expose the latest hook return value via result.current. */
export function renderHook<T>(useHook: () => T): HookResult<T> {
  const result = { current: undefined as unknown as T };
  function Probe() {
    result.current = useHook();
    return null;
  }
  return { result, ...mount(<Probe />) };
}
