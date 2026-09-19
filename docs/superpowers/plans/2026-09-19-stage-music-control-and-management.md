# Stage Music Control & Audio Library Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a comprehensive Backstage Music Control Tab (`🎵 เพลงประกอบ / BGM`), dual-slot smooth crossfading audio engine, IndexedDB persistent audio storage (for local MP3/WAV uploads and URLs), and real-time stage phase auto-synchronization.

**Architecture:** 
- `src/types/music.ts`: TypeScript data models and default states.
- `src/storage/musicStorage.ts`: Client-side IndexedDB database for binary audio Blobs and track metadata.
- `src/engine/musicPlayerEngine.ts`: Dual-slot HTML5 Audio / Web Audio API engine with smooth crossfade and volume ramping.
- `src/components/Control/MusicPanel.tsx`: Full-featured backstage control panel with Now Playing deck, phase assignment matrix, and upload/delete management table.
- `src/components/Control/ControlCenter.tsx`: Backstage navigation integration with real-time stage sync.

**Tech Stack:** React 19, TypeScript, Web Audio API / HTML5 Audio, IndexedDB, Lucide React, Vitest, Vite.

## Global Constraints
- Must preserve 100% offline functionality with built-in procedural synthesis / synthesized presets.
- Zero TypeScript errors (`tsc -b`).
- 100% test pass rate across all test suites.
- Dual-slot crossfading must guarantee zero audio pop/click or sudden cutoffs during stage state transitions.

---

### Task 1: Music Types & Data Models

**Files:**
- Create: `src/types/music.ts`
- Modify: `src/types/session.ts`
- Test: `tests/musicTypes.test.ts`

**Interfaces:**
- Produces: `MusicTrack`, `MusicState`, `PhaseTrackMapping`, `AudioSourceType`, `StagePhaseTarget`, `DEFAULT_MUSIC_STATE`, `PRESET_MUSIC_TRACKS`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/musicTypes.test.ts
import { describe, it, expect } from 'vitest';
import { DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS, MusicTrack } from '../src/types/music.ts';

describe('Music Types & Default Presets', () => {
  it('has valid default music state with autoSync enabled', () => {
    expect(DEFAULT_MUSIC_STATE.autoSyncWithStage).toBe(true);
    expect(DEFAULT_MUSIC_STATE.volume).toBeGreaterThan(0);
    expect(DEFAULT_MUSIC_STATE.phaseTrackMapping).toBeDefined();
    expect(DEFAULT_MUSIC_STATE.phaseTrackMapping.ambient).toBeDefined();
    expect(DEFAULT_MUSIC_STATE.phaseTrackMapping.spin).toBeDefined();
    expect(DEFAULT_MUSIC_STATE.phaseTrackMapping.question).toBeDefined();
    expect(DEFAULT_MUSIC_STATE.phaseTrackMapping.answered).toBeDefined();
  });

  it('contains pre-configured synthesized tracks', () => {
    expect(PRESET_MUSIC_TRACKS.length).toBeGreaterThanOrEqual(4);
    const ambient = PRESET_MUSIC_TRACKS.find(t => t.id === 'preset-ambient-luxury');
    expect(ambient).toBeDefined();
    expect(ambient?.targetPhase).toBe('ambient');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/musicTypes.test.ts`
Expected: FAIL with module `../src/types/music.ts` not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/types/music.ts`:
```typescript
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
```

Update `src/types/session.ts` to include optional `musicState?: MusicState;`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/musicTypes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/music.ts src/types/session.ts tests/musicTypes.test.ts
git commit -m "feat(music): add music track data models and types"
```

---

### Task 2: IndexedDB Persistent Storage for Audio Files

**Files:**
- Create: `src/storage/musicStorage.ts`
- Test: `tests/musicStorage.test.ts`

**Interfaces:**
- Produces: `initMusicDB()`, `getAllTracks()`, `saveTrack(track, fileBlob?)`, `deleteTrack(id)`, `getTrackById(id)`, `loadMusicState()`, `saveMusicState(state)`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/musicStorage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveTrackToStorage,
  getAllTracksFromStorage,
  deleteTrackFromStorage,
  saveMusicStateToStorage,
  loadMusicStateFromStorage
} from '../src/storage/musicStorage.ts';
import { MusicTrack, DEFAULT_MUSIC_STATE } from '../src/types/music.ts';

describe('IndexedDB & LocalStorage Music Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads music state preferences in localStorage', () => {
    const customState = { ...DEFAULT_MUSIC_STATE, volume: 0.45, isMuted: true };
    saveMusicStateToStorage(customState);
    const loaded = loadMusicStateFromStorage();
    expect(loaded.volume).toBe(0.45);
    expect(loaded.isMuted).toBe(true);
  });

  it('saves and retrieves custom tracks', async () => {
    const newTrack: MusicTrack = {
      id: 'custom-1',
      title: 'My Custom Song',
      artist: 'Local Artist',
      sourceType: 'url',
      url: 'https://example.com/song.mp3',
      duration: 150,
      defaultVolume: 0.8,
      loop: true,
      createdAt: Date.now()
    };

    await saveTrackToStorage(newTrack);
    const all = await getAllTracksFromStorage();
    expect(all.some(t => t.id === 'custom-1')).toBe(true);

    await deleteTrackFromStorage('custom-1');
    const afterDelete = await getAllTracksFromStorage();
    expect(afterDelete.some(t => t.id === 'custom-1')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/musicStorage.test.ts`
Expected: FAIL with module `../src/storage/musicStorage.ts` not found.

- [ ] **Step 3: Write implementation**

Create `src/storage/musicStorage.ts` supporting IndexedDB for binary Blobs with in-memory / localStorage fallback when running in non-browser / mock test environments.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/musicStorage.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/storage/musicStorage.ts tests/musicStorage.test.ts
git commit -m "feat(music): add indexedDB audio storage and state persistence"
```

---

### Task 3: Dual-Slot Audio Player Engine with Crossfade

**Files:**
- Create: `src/engine/musicPlayerEngine.ts`
- Test: `tests/musicPlayerEngine.test.ts`

**Interfaces:**
- Produces: `MusicPlayerEngine`, `musicPlayer` singleton instance.
- Methods: `playTrack(track, options)`, `pause()`, `resume()`, `stop(options)`, `seek(seconds)`, `setMasterVolume(vol)`, `setMuted(muted)`, `getState()`, `subscribe(cb)`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/musicPlayerEngine.test.ts
import { describe, it, expect, vi } from 'vitest';
import { MusicPlayerEngine } from '../src/engine/musicPlayerEngine.ts';
import { PRESET_MUSIC_TRACKS } from '../src/types/music.ts';

describe('MusicPlayerEngine Dual-Slot Crossfade', () => {
  it('initializes in idle non-playing state', () => {
    const engine = new MusicPlayerEngine();
    const state = engine.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.currentTrackId).toBeNull();
  });

  it('updates master volume and mute states', () => {
    const engine = new MusicPlayerEngine();
    engine.setMasterVolume(0.5);
    expect(engine.getState().volume).toBe(0.5);
    engine.setMuted(true);
    expect(engine.getState().isMuted).toBe(true);
  });

  it('accepts track playback request and emits state update', async () => {
    const engine = new MusicPlayerEngine();
    const listener = vi.fn();
    const unsubscribe = engine.subscribe(listener);

    const track = PRESET_MUSIC_TRACKS[0];
    await engine.playTrack(track, { fadeInDuration: 0.1 });
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/musicPlayerEngine.test.ts`
Expected: FAIL with module not found.

- [ ] **Step 3: Write implementation**

Create `src/engine/musicPlayerEngine.ts`:
- Dual slot (Slot A & Slot B) HTML5 Audio & Web Audio API Gain nodes.
- Procedural audio synthesis fallback for preset tracks (`preset-ambient-luxury`, `preset-spin-tension`, `preset-question-focus`, `preset-fanfare-royal`) when no external audio file is provided.
- Smooth crossfading logic on track transitions.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/musicPlayerEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/musicPlayerEngine.ts tests/musicPlayerEngine.test.ts
git commit -m "feat(music): implement dual-slot crossfade audio player engine"
```

---

### Task 4: Stage Synchronization & Auto-Sync Hook

**Files:**
- Create: `src/hooks/useMusicStageRouter.ts`
- Modify: `src/hooks/useStageSync.ts`
- Test: `tests/musicStageRouter.test.ts`

**Interfaces:**
- Produces: `useMusicStageRouter(sessionState, musicState, tracks, onStateChange)`
- Automatically maps `session.currentState` (`idle`, `pre-spin`, `word-spin`, `question`, `answered`) to assigned tracks when `autoSyncWithStage === true`.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/musicStageRouter.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getTargetTrackForStagePhase } from '../src/hooks/useMusicStageRouter.ts';
import { DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS } from '../src/types/music.ts';

describe('Music Stage Router', () => {
  it('resolves ambient track for idle state', () => {
    const track = getTargetTrackForStagePhase('idle', DEFAULT_MUSIC_STATE.phaseTrackMapping, PRESET_MUSIC_TRACKS);
    expect(track?.id).toBe('preset-ambient-luxury');
  });

  it('resolves spin track for word-spin state', () => {
    const track = getTargetTrackForStagePhase('word-spin', DEFAULT_MUSIC_STATE.phaseTrackMapping, PRESET_MUSIC_TRACKS);
    expect(track?.id).toBe('preset-spin-tension');
  });

  it('resolves question track for question state', () => {
    const track = getTargetTrackForStagePhase('question', DEFAULT_MUSIC_STATE.phaseTrackMapping, PRESET_MUSIC_TRACKS);
    expect(track?.id).toBe('preset-question-focus');
  });

  it('resolves answered track for answered state', () => {
    const track = getTargetTrackForStagePhase('answered', DEFAULT_MUSIC_STATE.phaseTrackMapping, PRESET_MUSIC_TRACKS);
    expect(track?.id).toBe('preset-fanfare-royal');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/musicStageRouter.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write implementation**

Create `src/hooks/useMusicStageRouter.ts` and export `getTargetTrackForStagePhase` along with the hook.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/musicStageRouter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useMusicStageRouter.ts src/hooks/useStageSync.ts tests/musicStageRouter.test.ts
git commit -m "feat(music): add stage state to music auto-sync router hook"
```

---

### Task 5: Backstage Music Panel UI & Track Library Management

**Files:**
- Create: `src/components/Control/MusicPanel.tsx`
- Test: `tests/musicPanel.test.tsx`

**Interfaces:**
- Produces: `<MusicPanel />` component with:
  - Master Control & Auto-Sync Banner
  - Now Playing Audio Deck
  - Stage Phase Assignment Matrix (4 Phase Cards)
  - Drag & Drop Audio Upload zone + URL Input Modal
  - Track Table with Preview Play, Phase Badges, and Safe Delete Dialog

- [ ] **Step 1: Write the failing test**

```typescript
// tests/musicPanel.test.tsx
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MusicPanel } from '../src/components/Control/MusicPanel.tsx';
import { DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS } from '../src/types/music.ts';

describe('MusicPanel Backstage Component', () => {
  it('renders master control banner, now playing deck, and track library', () => {
    const html = renderToString(
      React.createElement(MusicPanel, {
        musicState: DEFAULT_MUSIC_STATE,
        tracks: PRESET_MUSIC_TRACKS,
        onPlayTrack: vi.fn(),
        onPauseTrack: vi.fn(),
        onResumeTrack: vi.fn(),
        onStopMusic: vi.fn(),
        onSeekMusic: vi.fn(),
        onSetVolume: vi.fn(),
        onToggleMute: vi.fn(),
        onToggleAutoSync: vi.fn(),
        onAssignPhaseTrack: vi.fn(),
        onAddTrack: vi.fn(),
        onDeleteTrack: vi.fn(),
        onResetPresets: vi.fn()
      })
    );

    expect(html).toContain('ระบบควบคุมเพลง');
    expect(html).toContain('เล่นเพลงตามสถานะเวทีอัตโนมัติ');
    expect(html).toContain('คลังเพลงทั้งหมด');
    expect(html).toContain('Royalty Ambient Pad');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/musicPanel.test.tsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Write implementation**

Create `src/components/Control/MusicPanel.tsx` with luxury crystal glassmorphic styling matching the application design system.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/musicPanel.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Control/MusicPanel.tsx tests/musicPanel.test.tsx
git commit -m "feat(music): create backstage music control panel and library UI"
```

---

### Task 6: Control Center & App Integration

**Files:**
- Modify: `src/components/Control/ControlCenter.tsx`
- Modify: `src/App.tsx`
- Test: `tests/musicIntegration.test.tsx`

**Interfaces:**
- Updates `ControlTab` type to include `'music'`.
- Adds `🎵 เพลง / BGM` navigation tab to `ControlCenter.tsx`.
- Connects `MusicPanel` to persistent storage and audio player in `App.tsx`.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/musicIntegration.test.tsx
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('ControlCenter Music Tab Integration', () => {
  it('contains music tab in ControlCenter.tsx', () => {
    const file = fs.readFileSync(path.resolve(__dirname, '../src/components/Control/ControlCenter.tsx'), 'utf-8');
    expect(file).toContain("'music'");
    expect(file).toContain('เพลงประกอบ');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/musicIntegration.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write implementation**

Update `ControlCenter.tsx` and `App.tsx` with the new tab and music state handlers.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/musicIntegration.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Control/ControlCenter.tsx src/App.tsx tests/musicIntegration.test.tsx
git commit -m "feat(music): integrate music panel into backstage control center"
```

---

### Task 7: Full System Verification & Production Build

**Files:**
- Test: All 24+ test suites

- [ ] **Step 1: Run complete test suite**

Run: `npm test`
Expected: 100% tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Exit code 0, bundle output generated.

- [ ] **Step 3: Commit and update documentation**

```bash
git add -A
git commit -m "chore: complete stage music control and management system"
```
