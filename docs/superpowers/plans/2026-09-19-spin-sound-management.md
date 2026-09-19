# Spin Sound & Music Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to upload, preview, select, and delete custom audio/music for the Word Spin phase directly from Appearance Settings, Control Drawer, and Music Panel.

**Architecture:** Connect `musicState.phaseTrackMapping.spin` and `musicStorage.ts` to `AppearanceSettings.tsx` and `ControlDrawer.tsx`. Add direct file upload handler for spin phase, track selector, preview play/stop toggle, and delete action.

**Tech Stack:** React 19, TypeScript, Lucide React, IndexedDB (`musicStorage.ts`), Web Audio API (`musicPlayerEngine.ts`), Vitest.

---

### Task 1: Storage and Phase Mapping Enhancements

**Files:**
- Modify: `src/services/musicStorage.ts`
- Modify: `src/engine/musicPlayerEngine.ts`
- Test: `tests/musicStorage.test.ts`

**Interfaces:**
- Consumes: `MusicTrack`, `MusicState`, `deleteTrackFromStorage`
- Produces: Safe deletion that automatically resets `phaseTrackMapping.spin` when the assigned spin track is deleted.

- [ ] **Step 1: Write test in `tests/musicStorage.test.ts`**

```typescript
it('unassigns spin phase when the assigned custom track is deleted', async () => {
  const customTrack: MusicTrack = {
    id: 'custom-spin-123',
    title: 'Custom Tension Spin',
    sourceType: 'local_blob',
    duration: 60,
    defaultVolume: 0.8,
    loop: true,
    targetPhase: 'spin',
    createdAt: Date.now()
  };
  await saveTrackToStorage(customTrack);
  const state = loadMusicStateFromStorage();
  state.phaseTrackMapping.spin = 'custom-spin-123';
  saveMusicStateToStorage(state);

  await deleteTrackFromStorage('custom-spin-123');
  const updatedState = loadMusicStateFromStorage();
  expect(updatedState.phaseTrackMapping.spin).not.toBe('custom-spin-123');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/musicStorage.test.ts`
Expected: FAIL

- [ ] **Step 3: Update `src/services/musicStorage.ts`**

Ensure `deleteTrackFromStorage` checks and clears `phaseTrackMapping` across all phases if the deleted track was assigned.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/musicStorage.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/musicStorage.ts tests/musicStorage.test.ts
git commit -m "feat(music): auto unassign deleted tracks from phase mappings in storage"
```

---

### Task 2: Spin Audio Selector & Upload in Appearance Settings

**Files:**
- Modify: `src/components/Control/AppearanceSettings.tsx`
- Modify: `src/components/Control/ControlCenter.tsx`
- Create: `tests/spinSoundManagement.test.tsx`

**Interfaces:**
- Consumes: `tracks: MusicTrack[]`, `musicState: MusicState`, `onAssignPhaseTrack`, `onAddTrack`, `onDeleteTrack`, `onPlayTrack`, `onStopMusic`
- Produces: Word Spin Audio card with track dropdown, upload button, preview button, and delete button.

- [ ] **Step 1: Write test in `tests/spinSoundManagement.test.tsx`**

```tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AppearanceSettingsPanel } from '../src/components/Control/AppearanceSettings.tsx';
import { DEFAULT_APPEARANCE_SETTINGS } from '../src/types/appearance.ts';
import { DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS } from '../src/types/music.ts';

describe('Spin Sound Management in AppearanceSettingsPanel', () => {
  it('renders spin audio selector and upload button', () => {
    const html = renderToString(
      React.createElement(AppearanceSettingsPanel, {
        settings: DEFAULT_APPEARANCE_SETTINGS,
        onChange: () => {},
        tracks: PRESET_MUSIC_TRACKS,
        musicState: DEFAULT_MUSIC_STATE
      })
    );

    expect(html).toContain('เพลงประกอบช่วงสุ่มคำ');
    expect(html).toContain('อัปโหลดเสียงสุ่ม');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/spinSoundManagement.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement Spin Audio Selector in `AppearanceSettings.tsx` & pass props in `ControlCenter.tsx`**

In `AppearanceSettings.tsx`:
- Accept optional `tracks`, `musicState`, `onAssignPhaseTrack`, `onAddTrack`, `onDeleteTrack`, `onPlayTrack`, `onStopMusic`.
- Render the spin audio selector, upload button, preview play/pause button, and delete button.

In `ControlCenter.tsx`:
- Pass `tracks`, `musicState`, and audio handlers to `<AppearanceSettingsPanel>`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/spinSoundManagement.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Control/AppearanceSettings.tsx src/components/Control/ControlCenter.tsx tests/spinSoundManagement.test.tsx
git commit -m "feat(ui): add spin audio selector and direct upload in Appearance settings"
```

---

### Task 3: Spin Audio Quick Selector in Control Drawer

**Files:**
- Modify: `src/components/Control/ControlDrawer.tsx`
- Modify: `src/App.tsx`
- Test: `tests/spinSoundManagement.test.tsx`

**Interfaces:**
- Consumes: `tracks`, `musicState`, `onAssignPhaseTrack`, `onAddTrack`, `onDeleteTrack`
- Produces: Spin audio controls in slide-over `ControlDrawer`.

- [ ] **Step 1: Write test for ControlDrawer in `tests/spinSoundManagement.test.tsx`**

Verify that `ControlDrawer` renders the spin audio section with available tracks.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/spinSoundManagement.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement Spin Audio controls in `ControlDrawer.tsx` & pass in `App.tsx`**

Add audio track selector, upload button, and preview toggle to `ControlDrawer.tsx` and connect in `App.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/spinSoundManagement.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Control/ControlDrawer.tsx src/App.tsx tests/spinSoundManagement.test.tsx
git commit -m "feat(ui): add spin audio controls to Control Drawer"
```

---

### Task 4: Verification and Build

- [ ] **Step 1: Run entire Vitest test suite**

Run: `npx vitest run`
Expected: All test suites PASS

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Build succeeds with code 0
