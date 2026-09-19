# Task 1: Data Models & Storage Updates

**Plan File**: `docs/superpowers/plans/2026-09-19-word-spin-stop-modes.md`

## Requirements
1. In `src/types/appearance.ts`:
   - Define and export `WordSpinStopMode`: `'auto' | 'manual'`
   - Add `spinStopMode: WordSpinStopMode` to `AppearanceSettings`
   - Set `spinStopMode: 'auto'` in `DEFAULT_APPEARANCE_SETTINGS`
2. In `src/types/session.ts`:
   - Add `'STAGE_STOP_WORD_SPIN'` to `SyncEventType`
3. In `src/utils/storage.ts`:
   - Ensure `loadAppearanceSettings()` safely hydrates `spinStopMode` with `'auto'` default.
4. Write test `tests/appearanceSpinStopMode.test.ts`.
5. Run test and verify it passes.
6. Commit changes.
