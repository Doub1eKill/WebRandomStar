export type AudioSourceType = 'local_blob' | 'url' | 'preset';

export type StagePhaseTarget = 'ambient' | 'spin' | 'question' | 'answered' | 'none';

export interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  sourceType: AudioSourceType;
  url?: string;
  blob?: Blob;
  duration: number; // in seconds
  defaultVolume: number; // 0.0 - 1.0
  loop: boolean;
  targetPhase?: StagePhaseTarget;
  createdAt: number;
  isPreset?: boolean;
}

export interface PhaseTrackMapping {
  ambient: string | null;   // Track ID for Stage Idle / Ambient
  spin: string | null;      // Track ID for Word Spin tension
  question: string | null;  // Track ID for Question thinking / Timer
  answered: string | null;  // Track ID for Victory / Celebration
}

export interface MusicState {
  currentTrackId: string | null;
  isPlaying: boolean;
  volume: number; // Master volume 0.0 - 1.0
  isMuted: boolean;
  currentTime: number;
  duration: number;
  autoSyncWithStage: boolean;
  phaseTrackMapping: PhaseTrackMapping;
}

export const PRESET_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'preset-ambient-luxury',
    title: 'Royalty Ambient Pad (ประกายแสงราตรี)',
    artist: 'Antigravity Sound System',
    sourceType: 'preset',
    url: '',
    duration: 180,
    defaultVolume: 0.6,
    loop: true,
    targetPhase: 'ambient',
    createdAt: 1700000000000,
    isPreset: true
  },
  {
    id: 'preset-spin-tension',
    title: 'Suspense Pulse (ลุ้นระทึกหมุนคำ)',
    artist: 'Antigravity Sound System',
    sourceType: 'preset',
    url: '',
    duration: 60,
    defaultVolume: 0.75,
    loop: true,
    targetPhase: 'spin',
    createdAt: 1700000000000,
    isPreset: true
  },
  {
    id: 'preset-question-focus',
    title: 'Focus Chrono Flow (สมาธิคิดคำตอบ)',
    artist: 'Antigravity Sound System',
    sourceType: 'preset',
    url: '',
    duration: 120,
    defaultVolume: 0.65,
    loop: true,
    targetPhase: 'question',
    createdAt: 1700000000000,
    isPreset: true
  },
  {
    id: 'preset-fanfare-royal',
    title: 'Victory Crown Fanfare (เฉลิมฉลองชัยชนะ)',
    artist: 'Antigravity Sound System',
    sourceType: 'preset',
    url: '',
    duration: 15,
    defaultVolume: 0.85,
    loop: false,
    targetPhase: 'answered',
    createdAt: 1700000000000,
    isPreset: true
  }
];

export const DEFAULT_MUSIC_STATE: MusicState = {
  currentTrackId: null,
  isPlaying: false,
  volume: 0.75,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  autoSyncWithStage: true,
  phaseTrackMapping: {
    ambient: 'preset-ambient-luxury',
    spin: 'preset-spin-tension',
    question: 'preset-question-focus',
    answered: 'preset-fanfare-royal'
  }
};
