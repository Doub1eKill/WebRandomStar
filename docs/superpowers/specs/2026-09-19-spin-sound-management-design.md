# Spin Sound & Music Management Design Specification

## Overview
This specification details the architecture, UI controls, and data flow for managing and customizing the Word Spin audio track (BGM/SFX). Users can upload custom audio files (MP3/WAV), preview them, assign them to the spin phase, and delete unwanted custom audio directly from the backstage settings and control drawer.

---

## 1. Requirements & User Stories

1. **Upload Spin Sound**: Users can upload audio files (`.mp3`, `.wav`, `.aac`, `.ogg`) directly from the Word Spin settings panel, Control Drawer, or Music Panel.
2. **Assign to Spin Phase**: Uploaded audio is automatically registered in the track library and assigned as the active track for the `spin` phase (`phaseTrackMapping.spin`).
3. **Delete Custom Spin Tracks**: Custom tracks can be deleted from IndexedDB with 1-click. If the deleted track was assigned to `spin`, the system safely falls back to standard preset or none.
4. **Preview Audio**: Users can play/stop a quick audio preview before starting the live quiz round.
5. **Stage Real-Time Sync**: When the stage enters `word-spin`, `useMusicStageRouter` triggers the assigned track and smoothly fades out on stage completion.

---

## 2. Architecture & Data Flow

```
[User File Upload]
       │
       ▼
[IndexedDB: musicStorage.ts] ──► [MusicState.phaseTrackMapping.spin]
       │                                     │
       ▼                                     ▼
[MusicPlayer Engine] ◄────────────── [useMusicStageRouter]
       │                                     │
       ▼                                     ▼
[Web Audio Output]                   [Stage: word-spin phase]
```

### 2.1 State & Types (`src/types/music.ts`)
- `MusicTrack`: Contains `id`, `title`, `sourceType` (`'local_blob' | 'url' | 'preset'`), `blob`, `url`, `duration`, `targetPhase`.
- `MusicState.phaseTrackMapping`: Holds `{ spin: string | null, ... }`.

### 2.2 Storage & Persistence (`src/services/musicStorage.ts`)
- `saveTrackToStorage(track, blob)`: Saves audio Blob to IndexedDB `music_tracks_db`.
- `deleteTrackFromStorage(id)`: Removes track from IndexedDB and cleans up state references.
- `getAllTracksFromStorage()`: Loads all custom + preset tracks.

---

## 3. UI Component Specifications

### 3.1 Backstage Appearance Settings & Control Drawer
- Location: Under "👑 รูปแบบการหมุนคำสำคัญ (Word Spin Mode)" in `AppearanceSettings.tsx` and `ControlDrawer.tsx`.
- Components:
  - **Track Selector Dropdown**: Select between available preset tracks and user-uploaded custom tracks.
  - **Upload Button (`+ อัปโหลดเสียงสุ่ม`)**: Triggers file input, converts to track, saves to IndexedDB, and assigns to spin.
  - **Preview Button (`▶️ / ⏸️`)**: Allows instant audition of the selected spin track.
  - **Delete Button (`🗑️`)**: Appears next to custom uploaded tracks to delete them with confirmation.

### 3.2 Music Management Panel (`MusicPanel.tsx`)
- Enhance the `⚡ 2. ช่วงหมุนคำสุ่ม (Word Spin)` card with:
  - Quick upload button for direct spin phase assignment.
  - Quick delete button for custom assigned tracks.
  - Live preview controls.

---

## 4. Verification Plan

### Automated Tests:
- `tests/musicStorage.test.ts`: Verify saving and deleting custom tracks for spin phase.
- `tests/musicPlayerEngine.test.ts`: Verify loading, playing, and stopping spin tracks.
- `tests/musicStageRouter.test.ts`: Verify stage transitions trigger correct spin track.
- `tests/spinSoundManagement.test.tsx`: UI component tests for spin audio selector, upload, preview, and delete.

### Manual Verification:
1. Open Backstage Settings / Appearance panel.
2. Select standard preset spin audio ➔ start spin ➔ hear audio.
3. Upload custom MP3 ➔ verify auto-selected ➔ click preview to test.
4. Delete custom track ➔ verify state falls back gracefully without errors.
