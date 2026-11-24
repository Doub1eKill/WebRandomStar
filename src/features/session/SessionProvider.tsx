/**
 * Phase 5: one session runtime per window, shared by every page through context.
 * Pages read only the slice they need with useSession(selector), so a timer change
 * does not re-render the word bank, and so on.
 */
import React, { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { SessionState } from '../../types/session.ts';
import { createStageHost, createControllerMirror, SessionRuntime } from './runtime.ts';
import { createSessionActions, SessionActions } from './actions.ts';

interface SessionContextValue {
  runtime: SessionRuntime;
  actions: SessionActions;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider: React.FC<{ role: 'stage' | 'controller'; children: React.ReactNode }> = ({ role, children }) => {
  const [runtime] = useState<SessionRuntime>(() => (role === 'stage' ? createStageHost() : createControllerMirror()));

  useEffect(() => {
    runtime.start();
    return () => runtime.stop();
  }, [runtime]);

  const value = useMemo(() => ({ runtime, actions: createSessionActions(runtime.dispatch) }), [runtime]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

function useSessionContext(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession* must be used inside <SessionProvider>');
  return ctx;
}

/**
 * Subscribe to part of the session. The selector must return a value that is stable while
 * the session does not change (a field, a primitive, or an object taken from the state).
 */
export function useSession<T>(selector: (state: SessionState) => T): T {
  const { store } = useSessionContext().runtime;
  const get = () => selector(store.getState());
  return useSyncExternalStore(store.subscribe, get, get);
}

export function useSessionActions(): SessionActions {
  return useSessionContext().actions;
}

/** Stage: is a remote connected? Controller: is the stage connected? */
export function usePeerConnected(): boolean {
  const { peerConnected } = useSessionContext().runtime;
  return useSyncExternalStore(peerConnected.subscribe, peerConnected.getState, peerConnected.getState);
}
