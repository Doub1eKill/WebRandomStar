# Task 3: Stage UI & Keyboard Controller Integration

**Plan File**: `docs/superpowers/plans/2026-09-19-word-spin-stop-modes.md`

## Requirements
1. In `src/components/Stage/StageOverlay.tsx`:
   - Add `onStopSpin?: () => void` to `StageOverlayProps`.
   - When `isSpinning && session.currentState === 'word-spin' && session.appearanceSettings?.spinStopMode === 'manual'`, render the interactive "⏹️ STOP SPIN" button centered below the Word Carousel:
     ```tsx
     <div className="stage-stop-spin-container animate-fade-in">
       <button className="btn-royal-stop-spin" onClick={onStopSpin}>
         <span className="btn-stop-icon">⏹</span>
         <span className="btn-stop-text">STOP SPIN</span>
       </button>
     </div>
     ```
2. In `src/App.tsx`:
   - Pass `onStopSpin={stopWordSpin}` to `StageOverlay`.
   - Update `handleStartOrPause` and `handleProceed`:
     - If `session.currentState === 'word-spin'`, call `stopWordSpin()`.
3. In `src/index.css`:
   - Add styling for `.stage-stop-spin-container` and `.btn-royal-stop-spin` with crystal glass neon glow, pulsing hover, and smooth click effects.
4. Write test `tests/stageOverlayStopBtn.test.tsx`.
5. Run tests and verify they pass.
6. Commit changes.
