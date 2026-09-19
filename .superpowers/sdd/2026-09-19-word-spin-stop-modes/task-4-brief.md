# Task 4: Backstage Control Center & Appearance Settings Panel

**Plan File**: `docs/superpowers/plans/2026-09-19-word-spin-stop-modes.md`

## Requirements
1. In `src/components/Control/AppearanceSettings.tsx`:
   - Add a dedicated **"รูปแบบการหยุดสุ่มคำ (Word Spin Stop Mode)"** section:
     - ⏳ **หยุดอัตโนมัติ (Auto-Stop)**: หมุนตามเวลาที่กำหนดแล้วชะลอหยุดล็อกคำอัตโนมัติ (ค่าเริ่มต้น)
     - 🛑 **หยุดด้วยตนเอง (Manual Stop)**: หมุนต่อเนื่องไปเรื่อยๆ จนกว่าพิธีกร/แอดมินจะกดปุ่ม STOP หรือ Spacebar
     - Active indicator, testids (`spin-stop-card-auto`, `spin-stop-card-manual`), and seamless onChange handling.
2. In `src/components/Control/ControlCenter.tsx` & `src/components/Control/ControlDrawer.tsx` & `src/components/Control/RemoteController.tsx`:
   - When `session.currentState === 'word-spin'`, the main action button updates dynamically to **"🛑 STOP SPIN (หยุดการหมุนคำ) [Space]"** and triggers `stopWordSpin()`.
3. Write test `tests/appearanceStopModePanel.test.tsx`.
4. Run tests and verify they pass.
5. Commit changes.
