# Task 2 Brief: Spin Audio Selector & Upload in Appearance Settings

**Files:**
- Modify: `src/components/Control/AppearanceSettings.tsx`
- Modify: `src/components/Control/ControlCenter.tsx`
- Create: `tests/spinSoundManagement.test.tsx`

**Requirements:**
1. In `src/components/Control/AppearanceSettings.tsx`:
   - Accept optional props:
     - `tracks?: MusicTrack[]`
     - `musicState?: MusicState`
     - `onAssignPhaseTrack?: (phase: keyof MusicState['phaseTrackMapping'], trackId: string | null) => void`
     - `onAddTrack?: (track: MusicTrack, fileBlob?: Blob) => void`
     - `onDeleteTrack?: (id: string) => void`
     - `onPlayTrack?: (track: MusicTrack) => void`
     - `onStopMusic?: () => void`
   - Under "2. Word Spin Mode Section" (around line 330), add a dedicated section:
     `🎵 เพลง/เสียงประกอบช่วงสุ่มคำ (Word Spin Audio Track)`:
     - Track Selector Dropdown (shows all preset and custom tracks from `tracks`, or `-- ไม่เปิดเพลง (ปิดเสียง) --`).
     - Selected track state matches `musicState?.phaseTrackMapping.spin`.
     - "+ อัปโหลดเสียงสุ่ม (MP3/WAV)" button connected to a hidden file input. When user selects audio file(s):
       - Parse metadata/duration
       - Construct new `MusicTrack` with `targetPhase: 'spin'`
       - Call `onAddTrack(newTrack, file)`
       - Call `onAssignPhaseTrack('spin', newTrack.id)`
     - Preview Play/Pause button ("▶️ ฟังตัวอย่าง" / "⏸️ หยุดฟัง").
     - Delete button ("🗑️ ลบเพลง") if the currently selected track is a custom track (`!selectedTrack.isPreset`).
2. In `src/components/Control/ControlCenter.tsx`:
   - Pass `tracks`, `musicState`, `onAssignPhaseTrack`, `onAddTrack`, `onDeleteTrack`, `onPlayTrack`, `onStopMusic` to `<AppearanceSettingsPanel>`.
3. Create `tests/spinSoundManagement.test.tsx`:
   - Render `AppearanceSettingsPanel` with `tracks` and `musicState`.
   - Verify that it renders "เพลง/เสียงประกอบช่วงสุ่มคำ", "+ อัปโหลดเสียงสุ่ม", and dropdown options.
4. Run `npx vitest run tests/spinSoundManagement.test.tsx` and ensure all tests pass.
5. Commit with message: `feat(ui): add spin audio selector and direct upload in Appearance settings`
