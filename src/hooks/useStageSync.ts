/**
 * Compatibility wrapper (Phase 3). Returns the same API as the pre-Phase-3 hook on top of a
 * session runtime. New code uses <SessionProvider> + useSession(selector) instead.
 * Removed in Phase 9.
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createStageHost, createControllerMirror, SessionRuntime } from '../features/session/runtime.ts';
import { createSessionActions } from '../features/session/actions.ts';

export function useStageSync(role: 'stage' | 'controller') {
  const [runtime] = useState<SessionRuntime>(() => (role === 'stage' ? createStageHost() : createControllerMirror()));

  useEffect(() => {
    runtime.start();
    return () => runtime.stop();
  }, [runtime]);

  const session = useSyncExternalStore(runtime.store.subscribe, runtime.store.getState, runtime.store.getState);
  const isPeerConnected = useSyncExternalStore(runtime.peerConnected.subscribe, runtime.peerConnected.getState, runtime.peerConnected.getState);
  const actions = useMemo(() => createSessionActions(runtime.dispatch), [runtime]);

  return { session, role, isPeerConnected, ...actions };
}
