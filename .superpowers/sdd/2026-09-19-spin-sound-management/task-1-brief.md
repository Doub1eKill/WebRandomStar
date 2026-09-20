# Task 1 Brief: Storage and Phase Mapping Enhancements

**Files:**
- Modify: `src/services/musicStorage.ts`
- Modify: `src/engine/musicPlayerEngine.ts`
- Test: `tests/musicStorage.test.ts`

**Requirements:**
1. In `src/services/musicStorage.ts`:
   - When `deleteTrackFromStorage(id)` is called, check `musicState.phaseTrackMapping`.
   - If any phase (ambient, spin, question, answered) was mapped to the deleted `id`, reset that mapping to `null` (or fallback preset) and persist via `saveMusicStateToStorage`.
2. In `src/engine/musicPlayerEngine.ts`:
   - If the currently playing track ID is deleted or unassigned, handle cleanup properly.
3. Add a test in `tests/musicStorage.test.ts`:
   - Verify that deleting a custom track unassigns it from `phaseTrackMapping.spin`.
4. Run `npx vitest run tests/musicStorage.test.ts` and ensure it passes.
5. Commit with message: `feat(music): auto unassign deleted tracks from phase mappings in storage`
