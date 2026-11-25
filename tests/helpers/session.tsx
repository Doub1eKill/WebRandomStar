/**
 * Phase 9: the useStageSync compatibility hook is gone. Tests mount a real <SessionProvider>
 * (the same one the app uses) and read it through this hook, which returns the shape the old
 * hook had: { session, isPeerConnected, ...actions }.
 */
import { SessionProvider, useSession, useSessionActions, usePeerConnected } from '@/features/session/SessionProvider.tsx';
import { renderHook, HookResult } from './render.tsx';

function useSessionHarness() {
  const session = useSession(s => s);
  const isPeerConnected = usePeerConnected();
  const actions = useSessionActions();
  return { session, isPeerConnected, ...actions };
}

export type SessionHarness = ReturnType<typeof useSessionHarness>;

export function renderSession(role: 'stage' | 'controller' = 'stage'): HookResult<SessionHarness> {
  return renderHook(useSessionHarness, probe => <SessionProvider role={role}>{probe}</SessionProvider>);
}
