# Task 3 Brief: Spin Audio Quick Selector in Control Drawer

**Files:**
- Modify: `src/components/Control/ControlDrawer.tsx`
- Modify: `src/App.tsx`
- Test: `tests/spinSoundManagement.test.tsx`

**Requirements:**
1. In `src/components/Control/ControlDrawer.tsx`:
   - Extend `ControlDrawerProps` to accept optional:
     - `tracks?: MusicTrack[]`
     - `musicState?: MusicState`
     - `onAssignPhaseTrack?: (phase: keyof MusicState['phaseTrackMapping'], trackId: string | null) => void`
     - `onAddTrack?: (track: MusicTrack, fileBlob?: Blob) => void`
     - `onDeleteTrack?: (id: string) => void`
     - `onPlayTrack?: (track: MusicTrack) => void`
     - `onStopMusic?: () => void`
   - In `ControlDrawer.tsx`, under audio controls / stage section, add a sleek card for:
     `🎵 เสียงเพลงช่วงสุ่มคำ (Word Spin Audio)`
     - Dropdown listing all tracks in `tracks`.
     - File input & "+ อัปโหลดเสียงสุ่ม" button.
     - Preview play button.
2. In `src/App.tsx`:
   - Pass `tracks`, `musicState`, and audio handlers (`musicPlayer.assignPhaseTrack`, `saveTrackToStorage`, `deleteTrackFromStorage`, `musicPlayer.play`, `musicPlayer.stop`) to `<ControlDrawer>`.
3. Add a test in `tests/spinSoundManagement.test.tsx` verifying that `ControlDrawer` renders the spin audio selector when open.
4. Run `npx vitest run tests/spinSoundManagement.test.tsx` and ensure it passes.
5. Commit with message: `feat(ui): add spin audio controls to Control Drawer`
