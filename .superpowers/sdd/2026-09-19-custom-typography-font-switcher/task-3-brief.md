# Task 3: Stage UI Typography Integration

**Plan File**: `docs/superpowers/plans/2026-09-19-custom-typography-font-switcher.md`

## Requirements
1. In `src/App.tsx`:
   - Import `applyTypography` from `./utils/typography.ts`.
   - Call `applyTypography(session.appearanceSettings)` inside a `useEffect` whenever `session.appearanceSettings?.fontPreset` or `session.appearanceSettings?.customFont` changes, and on initial mount.
2. In `src/components/Stage/StageOverlay.tsx`:
   - Verify that Stage Header, Question Card, Contestant Badge, and Word Spin correctly inherit the typography CSS variables (`--font-display`, `--font-serif`).
3. Write integration test `tests/stageTypographyIntegration.test.ts`.
4. Run test and verify it passes.
5. Commit changes.
