/**
 * Session runtimes (Phase 3, B1).
 *
 *  Controller window                         Stage window (host)
 *  UI → dispatch(cmd) ──COMMAND──▶ validate → sessionReducer → store → render
 *                                            │  host scheduler: phase timeouts, timer, sounds
 *  store ◀────────────SNAPSHOT (on change)───┘
 *
 * Only the stage host runs timers, plays sounds and writes the session to storage, so every
 * event happens exactly once no matter how many controller windows are open.
 */
import { SessionState } from '@/types/session.ts';
import {
  loadQuestions,
  loadWords,
  loadContestants,
  loadTimerSoundSettings,
  loadStageDisplaySettings,
  saveAppearanceSettings,
  saveTimerSoundSettings,
  saveStageDisplaySettings,
  appendHistoryRecord,
  STORAGE_KEYS
} from '@/storage/storageApi.ts';
import { STAGE_DURATION } from './stateMachine.ts';
import { calculateRemainingMs } from '@/features/timer/timerEngine.ts';
import { createHistoryRecord } from '@/features/history/historyManager.ts';
import { notifyOperator } from '@/shared/notices/operatorNotices.ts';
import { audioEngine } from '@/features/audio/audioEngine.ts';
import { musicPlayer } from '@/features/music/musicPlayerEngine.ts';
import { AnyCommand, SessionCommand } from './commands.ts';
import { sessionReducer, SessionEffect, ReducerContext } from './sessionReducer.ts';
import { createStore, Store } from './sessionStore.ts';
import { loadPersistedSession, savePersistedSession } from './persistence.ts';
import {
  openSessionChannel,
  ChannelEndpoint,
  ChannelMessage,
  PeerRole,
  HEARTBEAT_MS,
  PEER_TIMEOUT_MS
} from './sessionChannel.ts';

export interface SessionRuntime {
  role: PeerRole;
  store: Store<SessionState>;
  /** Stage: is a controller window connected? Controller: is the stage connected? */
  peerConnected: Store<boolean>;
  dispatch: (command: SessionCommand) => void;
  start: () => void;
  stop: () => void;
}

const TIMER_TICK_MS = 100;
const newId = (role: PeerRole) => `${role}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function reducerContext(): ReducerContext {
  return {
    now: Date.now(),
    loadQuestions,
    loadWords,
    loadContestants,
    loadTimerSoundSettings,
    loadStageDisplaySettings
  };
}

function runEffect(effect: SessionEffect): void {
  switch (effect.type) {
    case 'NOTIFY':
      notifyOperator(effect.level, effect.message);
      break;
    case 'RECORD_HISTORY':
      appendHistoryRecord(createHistoryRecord(effect.params));
      break;
    case 'PERSIST_APPEARANCE':
      saveAppearanceSettings(effect.settings);
      break;
    case 'PERSIST_TIMER_SOUND':
      saveTimerSoundSettings(effect.settings);
      break;
    case 'PERSIST_STAGE_DISPLAY':
      saveStageDisplaySettings(effect.settings);
      break;
    case 'PLAY_FINISH_SOUND':
      audioEngine.playTimerFinish();
      break;
  }
}

/** Should the current phase advance on its own after STAGE_DURATION? */
function autoAdvanceDelay(s: SessionState): number | null {
  if (s.isPaused || s.currentState === 'idle' || s.currentState === 'question' || s.currentState === 'answered') return null;
  // In manual spin stop mode, do not auto-progress past word-spin
  if (s.currentState === 'word-spin' && s.appearanceSettings?.spinStopMode === 'manual') return null;
  const duration = STAGE_DURATION[s.currentState];
  return duration && duration > 0 ? duration : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage host
// ─────────────────────────────────────────────────────────────────────────────

export function createStageHost(): SessionRuntime {
  const id = newId('stage');
  const store = createStore<SessionState>(loadPersistedSession());
  const peerConnected = createStore(false);

  let endpoint: ChannelEndpoint | null = null;
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let lastControllerSeen = 0;

  let advanceTimer: ReturnType<typeof setTimeout> | null = null;
  let advanceKey: string | null = null;
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let timerKey: string | null = null;
  let lastTickSecond: number | null = null;
  let audioKey: string | null = null;

  const apply = (command: AnyCommand) => {
    const { state, effects } = sessionReducer(store.getState(), command, reducerContext());
    store.setState(state);
    effects.forEach(runEffect);
  };

  /** Phase timeouts: restart when the phase, pause flag or stop mode changes. */
  const scheduleAdvance = (s: SessionState) => {
    const delay = autoAdvanceDelay(s);
    const key = delay === null ? null : `${s.seed}|${s.currentState}|${s.appearanceSettings?.spinStopMode}`;
    if (key === advanceKey) return;
    if (advanceTimer) clearTimeout(advanceTimer);
    advanceTimer = null;
    advanceKey = key;
    if (delay === null) return;
    const from = s.currentState;
    advanceTimer = setTimeout(() => {
      advanceTimer = null;
      advanceKey = null;
      apply({ type: 'ADVANCE_PHASE', from });
    }, delay);
  };

  /** Countdown: per-second tick sound and expiry, without touching React state per tick (PF1). */
  const scheduleTimer = (s: SessionState) => {
    const t = s.timerState;
    const key = t.status === 'running' && t.startTimestamp ? `${t.startTimestamp}|${t.durationMs}` : null;
    if (key === timerKey) return;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    timerKey = key;
    lastTickSecond = null;
    if (key === null) return;

    const interval = setInterval(() => {
      const current = store.getState().timerState;
      if (current.status !== 'running' || !current.startTimestamp) return;
      const remaining = calculateRemainingMs(current.startTimestamp, current.durationMs, Date.now());
      const secondsLeft = Math.ceil(remaining / 1000);
      if (remaining <= 0) {
        clearInterval(interval);
        if (timerInterval === interval) {
          timerInterval = null;
          timerKey = null;
        }
        lastTickSecond = null;
        apply({ type: 'TIMER_EXPIRED' });
      } else if (lastTickSecond !== secondsLeft) {
        lastTickSecond = secondsLeft;
        audioEngine.playTickSound(secondsLeft);
      }
    }, TIMER_TICK_MS);
    timerInterval = interval;
  };

  /** Push volume / mute / timer sound settings to the audio engines only when they change. */
  const applyAudio = (s: SessionState) => {
    const key = JSON.stringify([s.volume, s.isMuted, s.timerSoundSettings]);
    if (key === audioKey) return;
    audioKey = key;
    audioEngine.setVolume(s.volume);
    audioEngine.setMuted(s.isMuted);
    musicPlayer.setMasterVolume(s.volume);
    musicPlayer.setMuted(s.isMuted);
    if (s.timerSoundSettings) {
      audioEngine.setTickSoundEnabled(s.timerSoundSettings.tickSoundEnabled);
      audioEngine.setWarningSoundEnabled(s.timerSoundSettings.warningSoundEnabled);
      audioEngine.setFinishSoundEnabled(s.timerSoundSettings.finishSoundEnabled);
      audioEngine.setTickVolume(s.timerSoundSettings.tickVolume);
    }
  };

  const postSnapshot = () => endpoint?.post({ kind: 'SNAPSHOT', from: id, state: store.getState() });

  const onStateChange = () => {
    const s = store.getState();
    savePersistedSession(s);
    postSnapshot();
    scheduleAdvance(s);
    scheduleTimer(s);
    applyAudio(s);
  };

  const sawController = () => {
    lastControllerSeen = Date.now();
    peerConnected.setState(true);
  };

  // The host owns every timer, and browsers throttle timers in hidden tabs. Warn the operator
  // (shown in the remote window) if the stage ends up in a background tab.
  const onVisibilityChange = () => {
    if (document.hidden) {
      notifyOperator('warning', 'หน้าจอเวทีถูกซ่อนอยู่ (อยู่ในแท็บพื้นหลัง) เบราว์เซอร์อาจหน่วงการเปลี่ยนช่วงและตัวจับเวลา ควรเปิดหน้าเวทีไว้ในหน้าต่างแยกที่มองเห็นได้');
    }
  };

  const onMessage = (message: ChannelMessage) => {
    switch (message.kind) {
      case 'COMMAND':
        sawController();
        apply(message.command);
        break;
      case 'HELLO':
        if (message.role === 'controller') {
          sawController();
          postSnapshot();
        }
        break;
      case 'HEARTBEAT':
        if (message.role === 'controller') sawController();
        break;
      case 'SNAPSHOT':
        // Another stage window is open; this host stays authoritative for its own window.
        break;
    }
  };

  return {
    role: 'stage',
    store,
    peerConnected,
    dispatch: apply,
    start() {
      if (endpoint) return;
      endpoint = openSessionChannel(id, onMessage);
      unsubscribe = store.subscribe(onStateChange);
      endpoint.post({ kind: 'HELLO', from: id, role: 'stage' });
      postSnapshot();
      document.addEventListener('visibilitychange', onVisibilityChange);
      heartbeat = setInterval(() => {
        endpoint?.post({ kind: 'HEARTBEAT', from: id, role: 'stage' });
        peerConnected.setState(Date.now() - lastControllerSeen < PEER_TIMEOUT_MS);
      }, HEARTBEAT_MS);
      const s = store.getState();
      scheduleAdvance(s);
      scheduleTimer(s);
      applyAudio(s);
    },
    stop() {
      unsubscribe?.();
      unsubscribe = null;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (heartbeat) clearInterval(heartbeat);
      if (advanceTimer) clearTimeout(advanceTimer);
      if (timerInterval) clearInterval(timerInterval);
      heartbeat = advanceTimer = timerInterval = null;
      advanceKey = timerKey = audioKey = null;
      lastTickSecond = null;
      endpoint?.close();
      endpoint = null;
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Controller mirror
// ─────────────────────────────────────────────────────────────────────────────

export function createControllerMirror(): SessionRuntime {
  const id = newId('controller');
  const store = createStore<SessionState>(loadPersistedSession());
  const peerConnected = createStore(false);

  let endpoint: ChannelEndpoint | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let lastStageSeen = 0;

  const sawStage = () => {
    lastStageSeen = Date.now();
    peerConnected.setState(true);
  };

  const onMessage = (message: ChannelMessage) => {
    switch (message.kind) {
      case 'SNAPSHOT':
        sawStage();
        store.setState(message.state);
        break;
      case 'HELLO':
      case 'HEARTBEAT':
        if (message.role === 'stage') sawStage();
        break;
      case 'COMMAND':
        // Commands are for the stage host only.
        break;
    }
  };

  // Fallback: another window wrote the session (e.g. BroadcastChannel unavailable).
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEYS.SESSION || !e.newValue) return;
    try {
      store.setState(JSON.parse(e.newValue));
    } catch {
      // ignore
    }
  };

  return {
    role: 'controller',
    store,
    peerConnected,
    dispatch(command) {
      endpoint?.post({ kind: 'COMMAND', from: id, command });
    },
    start() {
      if (endpoint) return;
      // The controller window never plays stage audio.
      audioEngine.setMuted(true);
      musicPlayer.setMuted(true);
      endpoint = openSessionChannel(id, onMessage);
      endpoint.post({ kind: 'HELLO', from: id, role: 'controller' });
      window.addEventListener('storage', onStorage);
      heartbeat = setInterval(() => {
        endpoint?.post({ kind: 'HEARTBEAT', from: id, role: 'controller' });
        peerConnected.setState(Date.now() - lastStageSeen < PEER_TIMEOUT_MS);
      }, HEARTBEAT_MS);
    },
    stop() {
      if (heartbeat) clearInterval(heartbeat);
      heartbeat = null;
      window.removeEventListener('storage', onStorage);
      endpoint?.close();
      endpoint = null;
    }
  };
}
