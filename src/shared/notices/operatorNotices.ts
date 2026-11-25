/**
 * B10/B11: non-blocking notices for the operator (replaces window.alert, which froze the
 * projector screen). A notice raised in one window is shown in every open window of the app.
 */
export type NoticeLevel = 'info' | 'warning' | 'error';

export interface OperatorNotice {
  id: string;
  level: NoticeLevel;
  message: string;
  createdAt: number;
}

type Listener = (notice: OperatorNotice) => void;

const CHANNEL_NAME = 'season_transition_operator_notices_v1';
const listeners = new Set<Listener>();
let channel: BroadcastChannel | null = null;

function deliver(notice: OperatorNotice): void {
  listeners.forEach(fn => fn(notice));
}

function isNotice(value: unknown): value is OperatorNotice {
  const n = value as OperatorNotice;
  return !!n && typeof n.id === 'string' && typeof n.message === 'string' &&
    (n.level === 'info' || n.level === 'warning' || n.level === 'error');
}

function openChannel(): void {
  if (channel || typeof BroadcastChannel === 'undefined') return;
  channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event: MessageEvent) => {
    if (isNotice(event.data)) deliver(event.data);
  };
}

function closeChannelIfUnused(): void {
  if (listeners.size === 0 && channel) {
    channel.close();
    channel = null;
  }
}

export function notifyOperator(level: NoticeLevel, message: string): OperatorNotice {
  const notice: OperatorNotice = {
    id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    level,
    message,
    createdAt: Date.now()
  };
  deliver(notice);
  try {
    if (channel) {
      channel.postMessage(notice);
    } else if (typeof BroadcastChannel !== 'undefined') {
      const once = new BroadcastChannel(CHANNEL_NAME);
      once.postMessage(notice);
      once.close();
    }
  } catch {
    // Cross-window delivery is best effort; the local window already has it.
  }
  return notice;
}

export function subscribeOperatorNotices(listener: Listener): () => void {
  listeners.add(listener);
  openChannel();
  return () => {
    listeners.delete(listener);
    closeChannelIfUnused();
  };
}
