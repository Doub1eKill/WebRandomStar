# Task 2: State Machine & Stage Synchronization Logic

**Plan File**: `docs/superpowers/plans/2026-09-19-word-spin-stop-modes.md`

## Requirements
1. In `src/hooks/useStageSync.ts`:
   - Implement `stopWordSpin()`:
     ```typescript
     const stopWordSpin = useCallback(() => {
       if (session.currentState === 'word-spin') {
         broadcastState({
           ...session,
           currentState: 'word-decelerate'
         }, 'STAGE_STOP_WORD_SPIN');
       }
     }, [session, broadcastState]);
     ```
   - In automated sequence timer `useEffect`:
     ```typescript
     // If manual spin stop mode, bypass auto-progression timer during word-spin
     if (session.currentState === 'word-spin' && session.appearanceSettings?.spinStopMode === 'manual') {
       return;
     }
     ```
   - Return `stopWordSpin` from `useStageSync`.
2. Write integration tests in `tests/wordSpinStopModeSync.test.ts`.
3. Run tests and verify they pass.
4. Commit changes.
