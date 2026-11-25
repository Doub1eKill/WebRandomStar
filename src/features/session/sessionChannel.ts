/**
 * Typed BroadcastChannel protocol between the stage (host) and controller windows (Phase 3).
 * Replaces the old `SyncMessage { payload?: any }` (D5) and validates everything it receives (S7).
 */
import { SessionState } from '@/types/session.ts';
import { SessionCommand, REMOTE_COMMAND_TYPES } from './commands.ts';

// Bumped from v2: the message format changed, old tabs must not talk to new ones.
export const SESSION_CHANNEL_NAME = 'season_transition_quiz_sync_v3';

export type PeerRole = 'stage' | 'controller';

export type ChannelMessage =
  | { kind: 'COMMAND'; from: string; command: SessionCommand }
  | { kind: 'SNAPSHOT'; from: string; state: SessionState }
  | { kind: 'HELLO'; from: string; role: PeerRole }
  | { kind: 'HEARTBEAT'; from: string; role: PeerRole };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function isSessionState(v: unknown): v is SessionState {
  return isObject(v) &&
    typeof v.currentState === 'string' &&
    typeof v.sessionId === 'string' &&
    Array.isArray(v.usedQuestionIds) &&
    isObject(v.timerState) &&
    typeof (v.timerState as Record<string, unknown>).status === 'string';
}

function isRemoteCommand(v: unknown): v is SessionCommand {
  return isObject(v) && typeof v.type === 'string' && REMOTE_COMMAND_TYPES.has(v.type as SessionCommand['type']);
}

const isRole = (v: unknown): v is PeerRole => v === 'stage' || v === 'controller';

/** Returns a well-formed message or null. Internal scheduler commands are rejected. */
export function parseChannelMessage(data: unknown): ChannelMessage | null {
  if (!isObject(data) || typeof data.from !== 'string') return null;
  switch (data.kind) {
    case 'COMMAND':
      return isRemoteCommand(data.command) ? (data as ChannelMessage) : null;
    case 'SNAPSHOT':
      return isSessionState(data.state) ? (data as ChannelMessage) : null;
    case 'HELLO':
    case 'HEARTBEAT':
      return isRole(data.role) ? (data as ChannelMessage) : null;
    default:
      return null;
  }
}

export interface ChannelEndpoint {
  post: (message: ChannelMessage) => void;
  close: () => void;
}

/** Open the channel; `onMessage` only ever sees validated messages from other endpoints. */
export function openSessionChannel(selfId: string, onMessage: (message: ChannelMessage) => void): ChannelEndpoint {
  if (typeof BroadcastChannel === 'undefined') {
    return { post: () => {}, close: () => {} };
  }
  const channel = new BroadcastChannel(SESSION_CHANNEL_NAME);
  channel.onmessage = (event: MessageEvent) => {
    const message = parseChannelMessage(event.data);
    if (message && message.from !== selfId) onMessage(message);
  };
  return {
    post: (message) => {
      try { channel.postMessage(message); } catch { /* window closing */ }
    },
    close: () => channel.close()
  };
}

export const HEARTBEAT_MS = 1000;
export const PEER_TIMEOUT_MS = 2500;
